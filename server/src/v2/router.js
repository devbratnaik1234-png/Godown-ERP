import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "express-rate-limit";
import { createCipheriv, randomBytes } from "node:crypto";
import { User } from "../models.js";
import {
  Organization,
  Party,
  Product,
  Warehouse,
  Document,
  Processing,
  Transaction,
  Audit,
  Movement,
  Ledger,
  Notification,
  Refund,
  Beneficiary,
  PayoutRequest,
  LANGUAGES,
} from "./models.js";
import {
  asyncRoute,
  allow,
  assert,
  financeRoles,
  operationalRoles,
} from "./domain.js";
import {
  createDocument,
  processBatch,
  atomic,
  audit,
  objectId,
  keySchema,
} from "./operations.js";
import {
  createPayment,
  confirmManual,
  cancelManual,
  reconcile,
} from "./payments.js";
import { summary, stockQuery } from "./queries.js";
import { askPaddyPal } from "./paddypal.js";
import { providerNames, providerFor } from "./providers.js";
const router = express.Router();
router.get(
  "/providers",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    const org = await Organization.findById(req.user.organizationId);
    res.json({
      items: providerNames.map((name) => {
        const p = providerFor(name, org._id, org.paymentMode);
        return {
          name,
          enabled: org.enabledProviders.includes(name),
          capabilities: p.capabilities,
          methods: p.supportedMethods,
          mode: p.manual ? "live" : org.paymentMode,
        };
      }),
    });
  }),
);
const text = z.string().trim().min(1).max(150);
const masterSchemas = {
  parties: z
    .object({
      name: text,
      kind: z.enum(["FARMER", "CUSTOMER", "VENDOR", "LABOUR", "TRANSPORTER"]),
      village: z.string().max(150).optional(),
      phone: z
        .string()
        .regex(/^\+?[\d -]{6,20}$/)
        .or(z.literal(""))
        .optional(),
    })
    .strict(),
  products: z
    .object({
      code: text,
      name: text,
      kind: z.enum(["PADDY", "RICE", "BYPRODUCT"]),
    })
    .strict(),
  warehouses: z
    .object({ name: text, location: z.string().max(150).optional() })
    .strict(),
};
const masterModels = {
  parties: Party,
  products: Product,
  warehouses: Warehouse,
};
const scoped = (req) => ({ organizationId: req.user.organizationId });
const paging = (req) => ({
  limit: Math.min(100, Math.max(1, Math.floor(Number(req.query.limit)) || 50)),
  page: Math.max(1, Math.min(10000, Math.floor(Number(req.query.page)) || 1)),
});
for (const [resource, Model] of Object.entries(masterModels)) {
  router.get(
    `/${resource}`,
    asyncRoute(async (req, res) => {
      const filter = scoped(req);
      const { page, limit } = paging(req);
      if (typeof req.query.q === "string" && req.query.q.trim())
        filter.name = {
          $regex: req.query.q
            .normalize("NFC")
            .slice(0, 100)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        };
      const [items, total] = await Promise.all([
        Model.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Model.countDocuments(filter),
      ]);
      res.json({ items, total, page, limit });
    }),
  );
  router.post(
    `/${resource}`,
    allow(...operationalRoles),
    asyncRoute(async (req, res) => {
      const data = masterSchemas[resource].parse(req.body);
      const result = await atomic(async (session) => {
        const [item] = await Model.create([{ ...data, ...scoped(req) }], {
          session,
        });
        await audit(
          req.user,
          "MASTER_CREATED",
          item._id,
          { resource },
          session,
        );
        return item;
      });
      res.status(201).json(result);
    }),
  );
  router.put(
    `/${resource}/:id`,
    allow(...operationalRoles),
    asyncRoute(async (req, res) => {
      const data = masterSchemas[resource].parse(req.body);
      objectId.parse(req.params.id);
      const result = await atomic(async (session) => {
        const item = await Model.findOneAndUpdate(
          { _id: req.params.id, ...scoped(req) },
          data,
          { new: true, runValidators: true, session },
        );
        assert(item, "RECORD_NOT_FOUND", 404);
        await audit(
          req.user,
          "MASTER_UPDATED",
          item._id,
          { resource },
          session,
        );
        return item;
      });
      res.json(result);
    }),
  );
  router.delete(
    `/${resource}/:id`,
    allow(...operationalRoles),
    asyncRoute(async (req, res) => {
      objectId.parse(req.params.id);
      const result = await atomic(async (session) => {
        const item = await Model.findOneAndDelete(
          { _id: req.params.id, ...scoped(req) },
          { session },
        );
        assert(item, "RECORD_NOT_FOUND", 404);
        await audit(
          req.user,
          "MASTER_DELETED",
          item._id,
          { resource },
          session,
        );
        return item;
      });
      res.json({ message: "Deleted successfully", id: result._id });
    }),
  );
}
router.get(
  "/summary",
  asyncRoute(async (req, res) =>
    res.json(await summary(req.user, req.query.day)),
  ),
);
router.get(
  "/inventory",
  asyncRoute(async (req, res) =>
    res.json({ items: await stockQuery(req.user), limit: 200 }),
  ),
);
const listModels = {
  documents: Document,
  processing: Processing,
  transactions: Transaction,
  audit: Audit,
  movements: Movement,
  ledger: Ledger,
  notifications: Notification,
  refunds: Refund,
  beneficiaries: Beneficiary,
  payouts: PayoutRequest,
};
for (const [resource, Model] of Object.entries(listModels)) {
  router.get(
    `/${resource}`,
    ...([
      "transactions",
      "audit",
      "ledger",
      "refunds",
      "beneficiaries",
      "payouts",
    ].includes(resource)
      ? [allow(...financeRoles)]
      : []),
    asyncRoute(async (req, res) => {
      const filter = scoped(req);
      const { page, limit } = paging(req);
      if (typeof req.query.q === "string" && req.query.q.trim())
        filter[resource === "audit" ? "action" : "reference"] = {
          $regex: req.query.q
            .normalize("NFC")
            .slice(0, 100)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          $options: "i",
        };
      if (
        resource === "documents" &&
        ["PURCHASE", "SALE"].includes(req.query.kind)
      )
        filter.kind = req.query.kind;
      const [items, total] = await Promise.all([
        Model.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Model.countDocuments(filter),
      ]);
      res.json({ items, total, page, limit });
    }),
  );
}
router.post(
  "/documents",
  allow(...operationalRoles),
  asyncRoute(async (req, res) =>
    res
      .status(201)
      .json(
        await createDocument(req.user, req.body, req.get("Idempotency-Key")),
      ),
  ),
);
router.post(
  "/processing",
  allow(...operationalRoles),
  asyncRoute(async (req, res) =>
    res
      .status(201)
      .json(await processBatch(req.user, req.body, req.get("Idempotency-Key"))),
  ),
);
router.post(
  "/transactions",
  allow(...financeRoles),
  asyncRoute(async (req, res) =>
    res
      .status(201)
      .json(
        await createPayment(req.user, req.body, req.get("Idempotency-Key")),
      ),
  ),
);
router.post(
  "/transactions/:id/confirm",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    objectId.parse(req.params.id);
    assert(req.body.confirmed === true, "CONFIRMATION_REQUIRED");
    res.json(
      await confirmManual(req.user, req.params.id, req.body.evidenceReference),
    );
  }),
);
router.post(
  "/transactions/:id/cancel",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    objectId.parse(req.params.id);
    res.json(await cancelManual(req.user, req.params.id));
  }),
);
router.post(
  "/transactions/:id/reconcile",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    objectId.parse(req.params.id);
    res.json(await reconcile(req.user, req.params.id));
  }),
);
router.get(
  "/transactions/:id/receipt",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    objectId.parse(req.params.id);
    const tx = await Transaction.findOne({
      _id: req.params.id,
      ...scoped(req),
      status: "SUCCESS",
    }).lean();
    assert(tx, "RECEIPT_UNAVAILABLE", 409);
    const [org, doc] = await Promise.all([
      Organization.findById(req.user.organizationId).lean(),
      Document.findOne({ _id: tx.documentId, ...scoped(req) }).lean(),
    ]);
    res.json({
      transaction: tx,
      organization: {
        name: org.name,
        defaultLanguage: org.defaultLanguage,
        secondaryLanguage: org.secondaryLanguage,
      },
      document: doc,
    });
  }),
);
router.get(
  "/settings",
  asyncRoute(async (req, res) =>
    res.json(await Organization.findById(req.user.organizationId).lean()),
  ),
);
router.patch(
  "/settings",
  allow("admin"),
  asyncRoute(async (req, res) => {
    const input = z
      .object({
        name: text.optional(),
        defaultLanguage: z.enum(LANGUAGES).optional(),
        secondaryLanguage: z.enum([...LANGUAGES, ""]).optional(),
        aiEnabled: z.boolean().optional(),
        enabledProviders: z.array(z.enum(providerNames)).min(1).optional(),
        defaultProvider: z.enum(providerNames).optional(),
        paymentMode: z.enum(["test", "live"]).optional(),
      })
      .strict()
      .parse(req.body);
    const org = await atomic(async (session) => {
      const current = await Organization.findById(
        req.user.organizationId,
      ).session(session);
      Object.assign(current, input);
      assert(
        current.enabledProviders.includes(current.defaultProvider),
        "INVALID_PROVIDER_SETTINGS",
      );
      assert(
        current.paymentMode !== "live" ||
          process.env.ENABLE_LIVE_PAYMENTS === "true",
        "LIVE_PAYMENTS_DISABLED",
        409,
      );
      await current.save({ session });
      await audit(
        req.user,
        "ORGANIZATION_SETTINGS_CHANGED",
        current._id,
        { fields: Object.keys(input) },
        session,
      );
      return current;
    });
    res.json(org);
  }),
);
router.get(
  "/users",
  allow("admin"),
  asyncRoute(async (req, res) =>
    res.json({
      items: await User.find(scoped(req))
        .select("name email role active preferredLanguage")
        .limit(100)
        .lean(),
    }),
  ),
);
router.post(
  "/users",
  allow("admin"),
  asyncRoute(async (req, res) => {
    const input = z
      .object({
        name: text,
        email: z.email(),
        password: z.string().min(12).max(200),
        role: z.enum(["admin", "manager", "accountant", "operator", "viewer"]),
        preferredLanguage: z.enum(LANGUAGES).optional(),
      })
      .strict()
      .parse(req.body);
    const { password, ...fields } = input;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await atomic(async (session) => {
      const [user] = await User.create(
        [{ ...fields, passwordHash, ...scoped(req) }],
        { session },
      );
      await audit(
        req.user,
        "USER_CREATED",
        user._id,
        { role: user.role },
        session,
      );
      return user;
    });
    res.status(201).json({ id: user._id, name: user.name, role: user.role });
  }),
);
router.post(
  "/refunds",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    const input = z
      .object({
        transactionId: objectId,
        amountMinor: z.number().int().positive(),
        reason: text,
      })
      .strict()
      .parse(req.body);
    const key = keySchema.parse(req.get("Idempotency-Key"));
    const result = await atomic(async (session) => {
      const existing = await Refund.findOne({
        ...scoped(req),
        idempotencyKey: key,
      }).session(session);
      if (existing) {
        assert(
          String(existing.transactionId) === input.transactionId &&
            existing.amountMinor === input.amountMinor &&
            existing.reason === input.reason,
          "IDEMPOTENCY_CONFLICT",
          409,
        );
        return existing;
      }
      const tx = await Transaction.findOne({
        _id: input.transactionId,
        ...scoped(req),
        direction: "IN",
        status: "SUCCESS",
        mode: "live",
      }).session(session);
      assert(tx, "INVALID_PAYMENT_STATE", 409);
      const reserved = await Refund.find({
        ...scoped(req),
        transactionId: tx._id,
        status: { $nin: ["REJECTED", "FAILED"] },
      }).session(session);
      assert(
        reserved.reduce((n, r) => n + r.amountMinor, 0) + input.amountMinor <=
          tx.amountMinor,
        "EXCEEDS_OUTSTANDING",
        409,
      );
      // Force a write to serialize concurrent refund requests on this payment.
      tx.markModified("updatedAt");
      tx.updatedAt = new Date();
      await tx.save({ session });
      const [refund] = await Refund.create(
        [
          {
            ...input,
            ...scoped(req),
            requestedBy: req.user.userId,
            idempotencyKey: key,
          },
        ],
        { session },
      );
      await audit(req.user, "REFUND_REQUESTED", refund._id, {}, session);
      return refund;
    });
    res.status(201).json(result);
  }),
);
router.post(
  "/beneficiaries",
  allow(...financeRoles),
  asyncRoute(async (req, res) => {
    const input = z
      .object({
        partyId: objectId,
        account: z.string().regex(/^\d{8,20}$/),
        ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
        name: text,
      })
      .strict()
      .parse(req.body);
    assert(
      await Party.exists({ _id: input.partyId, ...scoped(req) }),
      "INVALID_PARTY",
    );
    const key = Buffer.from(
      process.env.BENEFICIARY_ENCRYPTION_KEY || "",
      "base64",
    );
    assert(key.length === 32, "ENCRYPTION_NOT_CONFIGURED", 503);
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(input), "utf8"),
      cipher.final(),
    ]);
    const encryptedDetails = [iv, cipher.getAuthTag(), encrypted]
      .map((b) => b.toString("base64"))
      .join(".");
    const b = await atomic(async (session) => {
      const [b] = await Beneficiary.create(
        [
          {
            ...scoped(req),
            partyId: input.partyId,
            encryptedDetails,
            maskedAccount: `••••${input.account.slice(-4)}`,
            createdBy: req.user.userId,
          },
        ],
        { session },
      );
      await audit(req.user, "BENEFICIARY_CREATED", b._id, {}, session);
      return b;
    });
    res.status(201).json({
      id: b._id,
      maskedAccount: b.maskedAccount,
      verificationStatus: b.verificationStatus,
    });
  }),
);
// Provider execution is intentionally unavailable until an independently verified payout adapter is configured.
router.post(
  "/payouts/:id/execute",
  allow("admin", "manager"),
  asyncRoute(async () => {
    assert(false, "PAYOUT_PROVIDER_NOT_CONFIGURED", 503);
  }),
);
router.post(
  "/paddypal",
  rateLimit({
    windowMs: 60000,
    limit: 10,
    keyGenerator: (req) => String(req.user.userId),
    message: { code: "RATE_LIMITED" },
  }),
  asyncRoute(async (req, res) =>
    res.json(await askPaddyPal(req.user, req.account, req.body)),
  ),
);
export default router;
