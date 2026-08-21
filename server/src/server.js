import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import crudRouter from "./crudRouter.js";
import { Farmer, Labour, Purchase, Payment, Stock, Truck } from "./models.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Godown ERP API" });
});

app.use("/api/farmers", crudRouter(Farmer));
app.use("/api/labours", crudRouter(Labour));
app.use("/api/purchases", crudRouter(Purchase, {
  beforeCreate: (data) => ({ ...data, total: Number(data.quantity || 0) * Number(data.rate || 0) }),
  beforeUpdate: (data) => ({ ...data, total: Number(data.quantity || 0) * Number(data.rate || 0) })
}));
app.use("/api/payments", crudRouter(Payment, {
  beforeCreate: (data) => ({ ...data, amount: Number(String(data.amount ?? 0).replace(/[^0-9.]/g, "")) }),
  beforeUpdate: (data) => ({ ...data, amount: Number(String(data.amount ?? 0).replace(/[^0-9.]/g, "")) })
}));
app.use("/api/stocks", crudRouter(Stock));
app.use("/api/trucks", crudRouter(Truck));

app.get("/api/dashboard", async (req, res, next) => {
  try {
    const [farmers, labours, purchases, payments, stocks, trucks] = await Promise.all([
      Farmer.countDocuments(),
      Labour.countDocuments(),
      Purchase.find(),
      Payment.find(),
      Stock.find(),
      Truck.countDocuments()
    ]);

    const totalPurchasedQuantity = purchases.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPurchaseValue = purchases.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalPaid = payments.filter((item) => item.status === "Paid").reduce((sum, item) => sum + (item.amount || 0), 0);
    const pendingPayments = payments.filter((item) => item.status === "Pending").reduce((sum, item) => sum + (item.amount || 0), 0);
    const stockQuantity = stocks.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const stockValue = stocks.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);

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
      stockValue
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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Godown ERP API running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
