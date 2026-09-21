import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { fileURLToPath } from "node:url";
import v2Router from "./v2/router.js";
import { handleWebhook } from "./v2/payments.js";
import { asyncRoute, allow } from "./v2/domain.js";
import { allModels } from "./v2/models.js";
import crudRouter from "./crudRouter.js";
import authRouter, { ensureAdminUser, requireAuth } from "./auth.js";
import { Farmer, Labour, Purchase, Payment, Stock, Truck } from "./models.js";

dotenv.config();

const configuredDnsServers = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (configuredDnsServers.length > 0) {
  dns.setServers(configuredDnsServers);
  console.log(`Using configured DNS servers: ${configuredDnsServers.join(", ")}`);
}

export const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS) app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
app.use(helmet());
app.use(rateLimit({ windowMs: 60000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false, message: { code: "RATE_LIMITED" } }));
const PORT = process.env.PORT || 5000;

const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin, credentials: true }));
app.post("/api/webhooks/:organizationId/:provider/:mode", express.raw({ type: "application/json", limit: "256kb" }), asyncRoute(async (req, res) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.organizationId) || req.params.provider !== "cashfree" || !["test","live"].includes(req.params.mode)) return res.status(400).json({code:"INVALID_INPUT"});
  res.json(await handleWebhook(req.params.organizationId, req.params.provider, req.params.mode, req.body, req.headers));
}));
app.use((req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const suppliedOrigin = req.get("Origin");
    if (suppliedOrigin !== origin && !(process.env.LEGACY_BEARER_LOGIN === "true" && !suppliedOrigin && req.get("Authorization"))) return res.status(403).json({ code: "INVALID_ORIGIN" });
  }
  next();
});
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Godown ERP API" });
});

app.use("/api/auth", authRouter);
app.use("/api/v2", requireAuth, v2Router);
app.use("/api/farmers", requireAuth, crudRouter(Farmer));
app.use("/api/labours", requireAuth, crudRouter(Labour));
app.use("/api/purchases", requireAuth, crudRouter(Purchase, {
  beforeCreate: (data) => ({ ...data, total: Number(data.quantity || 0) * Number(data.rate || 0) }),
  beforeUpdate: (data) => ({ ...data, total: Number(data.quantity || 0) * Number(data.rate || 0) })
}));
app.use("/api/payments", requireAuth, crudRouter(Payment, {
  beforeCreate: (data) => ({ ...data, amount: Number(String(data.amount ?? 0).replace(/[^0-9.]/g, "")) }),
  beforeUpdate: (data) => ({ ...data, amount: Number(String(data.amount ?? 0).replace(/[^0-9.]/g, "")) })
}));
app.use("/api/stocks", requireAuth, crudRouter(Stock));
app.use("/api/trucks", requireAuth, crudRouter(Truck));

app.get("/api/dashboard", requireAuth, allow("admin", "manager", "accountant"), async (req, res, next) => {
  try {
    const [farmers, labours, purchases, payments, stocks, trucks] = await Promise.all([
      Farmer.countDocuments({ organizationId: req.user.organizationId }),
      Labour.countDocuments({ organizationId: req.user.organizationId }),
      Purchase.find({ organizationId: req.user.organizationId }).sort({ date: -1, createdAt: -1 }),
      Payment.find({ organizationId: req.user.organizationId }),
      Stock.find({ organizationId: req.user.organizationId }),
      Truck.countDocuments({ organizationId: req.user.organizationId })
    ]);

    const totalPurchasedQuantity = purchases.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPurchaseValue = purchases.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalPaid = payments
      .filter((item) => item.status === "Paid")
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const pendingPayments = payments
      .filter((item) => item.status === "Pending")
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const stockQuantity = stocks.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const stockValue = stocks.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );

    const stockMap = stocks.reduce((acc, item) => {
      const key = item.rice || "Unknown";
      acc[key] = (acc[key] || 0) + (item.quantity || 0);
      return acc;
    }, {});

    const stockBreakdown = Object.entries(stockMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    const today = new Date();
    const weeklyPurchases = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setHours(0, 0, 0, 0);
      day.setDate(today.getDate() - (6 - index));
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const quantity = purchases
        .filter((item) => {
          const date = new Date(item.date);
          return date >= day && date < nextDay;
        })
        .reduce((sum, item) => sum + (item.quantity || 0), 0);

      return {
        label: day.toLocaleDateString("en-IN", { weekday: "short" }),
        date: day.toISOString().split("T")[0],
        quantity
      };
    });

    const recentPurchases = purchases.slice(0, 5).map((item) => ({
      id: item._id,
      purchaseId: item.purchaseId,
      farmer: item.farmer,
      quantity: item.quantity,
      rate: item.rate,
      total: item.total,
      date: item.date
    }));

    res.json({
      farmers,
      labours,
      trucks,
      purchases: purchases.length,
      totalPurchasedQuantity,
      totalPurchaseValue,
      totalPaid,
      pendingPayments,
      stocks: stocks.length,
      stockQuantity,
      stockValue,
      recentPurchases,
      stockBreakdown,
      weeklyPurchases
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.name === "ZodError") return res.status(400).json({ code: "INVALID_INPUT" });
  if (error.status && typeof error.code === "string") return res.status(error.status).json({ code: error.code });
  console.error({ name: error.name, code: error.code });
  if (error.name === "ValidationError") {
    return res.status(400).json({ code: "INVALID_INPUT" });
  }
  if (error.code === 11000) {
    return res.status(409).json({ code: "DUPLICATE_RECORD" });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ code: "INVALID_INPUT" });
  }
  res.status(500).json({ code: "INTERNAL_ERROR" });
});

export async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters");
  await mongoose.connect(process.env.MONGODB_URI);
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!topology.setName && topology.msg !== "isdbgrid") throw new Error("MongoDB replica set or sharded cluster is required for atomic ledger transactions");
  for (const Model of allModels) await Model.init();
  await ensureAdminUser();
  const server = app.listen(PORT, () => console.log(`PaddySync API listening on ${PORT}`));
  process.once('SIGTERM', () => server.close(() => mongoose.disconnect()));
  return server;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) start().catch(error => { console.error("Startup failed:", error.message); process.exit(1); });
