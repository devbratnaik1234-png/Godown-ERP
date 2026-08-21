import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";
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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Godown ERP API" });
});

app.use("/api/auth", authRouter);
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

app.get("/api/dashboard", requireAuth, async (req, res, next) => {
  try {
    const [farmers, labours, purchases, payments, stocks, trucks] = await Promise.all([
      Farmer.countDocuments(),
      Labour.countDocuments(),
      Purchase.find().sort({ date: -1, createdAt: -1 }),
      Payment.find(),
      Stock.find(),
      Truck.countDocuments()
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
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with this ID already exists" });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid record ID" });
  }
  res.status(500).json({ message: "Internal server error" });
});

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing. Copy .env.example to .env and configure MongoDB.");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add a strong secret to server/.env.");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await ensureAdminUser();
    app.listen(PORT, () => console.log(`Godown ERP API running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
