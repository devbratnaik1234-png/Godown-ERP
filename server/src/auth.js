import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { User } from "./models.js";
import { Organization, LANGUAGES } from "./v2/models.js";
import { AppError, assert, asyncRoute } from "./v2/domain.js";
const router = express.Router();
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api",
  maxAge: 8 * 3600 * 1000,
});
const publicUser = async (user) => {
  const org = await Organization.findById(user.organizationId).lean();
  assert(org, "MIGRATION_REQUIRED", 409);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    language: user.preferredLanguage || org.defaultLanguage || "en",
    aiLanguageMode: user.aiLanguageMode,
    organization: org,
  };
};
export function requireAuth(req, res, next) {
  return Promise.resolve()
    .then(async () => {
      // Retain bearer compatibility during migration; the new UI uses an HttpOnly cookie.
      const cookie = (req.headers.cookie || "")
        .split(";")
        .map((v) => v.trim())
        .find((v) => v.startsWith("paddysync_session="));
      const token =
        cookie?.slice("paddysync_session=".length) ||
        (req.headers.authorization || "").replace(/^Bearer /, "");
      let claims;
      try {
        claims = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ["HS256"],
        });
      } catch {
        throw new AppError("UNAUTHENTICATED", 401);
      }
      const user = await User.findById(claims.userId);
      assert(
        user &&
          user.active !== false &&
          (user.tokenVersion || 0) === (claims.version || 0),
        "UNAUTHENTICATED",
        401,
      );
      assert(user.organizationId, "MIGRATION_REQUIRED", 409);
      req.user = {
        userId: user._id,
        organizationId: user.organizationId,
        role: user.role,
      };
      req.account = user;
      next();
    })
    .catch(next);
}
export const authenticated = requireAuth;
router.post(
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { code: "RATE_LIMITED" },
  }),
  asyncRoute(async (req, res) => {
    assert(
      typeof req.body.email === "string" &&
        typeof req.body.password === "string" &&
        req.body.password.length <= 200,
      "INVALID_INPUT",
    );
    const user = await User.findOne({
      email: req.body.email.trim().toLowerCase(),
    });
    // Always perform a password comparison to reduce account-enumeration timing differences.
    const valid = await bcrypt.compare(
      req.body.password,
      user?.passwordHash ||
        "$2b$12$C6UzMDM.H6dfI/f/IKcEe.6QVhDSqcBJHrFM8NeAJydUm6nUQ.Y/C",
    );
    assert(user && valid && user.active !== false, "INVALID_CREDENTIALS", 401);
    const profile = await publicUser(user);
    const token = jwt.sign(
      { userId: user._id.toString(), version: user.tokenVersion || 0 },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "8h" },
    );
    res.cookie("paddysync_session", token, cookieOptions());
    res.json({
      user: profile,
      ...(process.env.LEGACY_BEARER_LOGIN === "true" ? { token } : {}),
    });
  }),
);
router.get(
  "/me",
  authenticated,
  asyncRoute(async (req, res) => res.json(await publicUser(req.account))),
);
router.patch(
  "/preferences",
  authenticated,
  asyncRoute(async (req, res) => {
    const { preferredLanguage, aiLanguageMode } = req.body;
    assert(
      preferredLanguage === null || LANGUAGES.includes(preferredLanguage),
      "INVALID_INPUT",
    );
    assert(
      !aiLanguageMode || ["selected", "question"].includes(aiLanguageMode),
      "INVALID_INPUT",
    );
    req.account.preferredLanguage = preferredLanguage || undefined;
    if (aiLanguageMode) req.account.aiLanguageMode = aiLanguageMode;
    await req.account.save();
    res.json(await publicUser(req.account));
  }),
);
router.post(
  "/logout",
  authenticated,
  asyncRoute(async (req, res) => {
    await User.updateOne(
      { _id: req.user.userId },
      { $inc: { tokenVersion: 1 } },
    );
    res.clearCookie("paddysync_session", {
      ...cookieOptions(),
      maxAge: undefined,
    });
    res.json({ ok: true });
  }),
);
export async function ensureAdminUser() {
  if (await User.exists({})) return;
  // Existing business data is never automatically assigned to a new organization.
  const collections = await User.db.db.listCollections().toArray();
  for (const { name } of collections) {
    if (
      [
        "farmers",
        "labours",
        "purchases",
        "payments",
        "stocks",
        "trucks",
      ].includes(name) &&
      (await User.db.db.collection(name).countDocuments())
    )
      throw new AppError("MIGRATION_REQUIRED", 409);
  }
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) return;
  assert(password.length >= 12, "WEAK_PASSWORD");
  const org = await Organization.create({
    name: process.env.ORGANIZATION_NAME || "PaddySync",
  });
  await User.create({
    name: process.env.ADMIN_NAME || "Administrator",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    organizationId: org._id,
  });
}
export default router;
