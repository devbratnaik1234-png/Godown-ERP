import express from "express";
import { allow } from "./v2/domain.js";

export default function crudRouter(Model, { beforeCreate, beforeUpdate } = {}) {
  const router = express.Router();

  router.use(allow("admin", "manager", "accountant", "operator"));
  router.use((req, res, next) => {
    if (!["GET", "HEAD"].includes(req.method) && !["Truck", "Labour"].includes(Model.modelName)) return res.status(409).json({ code: "LEGACY_READ_ONLY" });
    if (!["GET", "HEAD"].includes(req.method) && req.user.role === "accountant") return res.status(403).json({ code: "FORBIDDEN" });
    next();
  });
  router.get("/", async (req, res, next) => {
    try {
      const items = await Model.find({ organizationId: req.user.organizationId }).sort({ createdAt: -1 }).limit(500);
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await Model.findOne({ _id: req.params.id, organizationId: req.user.organizationId });
      if (!item) return res.status(404).json({ message: "Record not found" });
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const payload = beforeCreate ? await beforeCreate({ ...req.body }) : req.body;
      const safe = Object.fromEntries(Object.entries(payload).filter(([key]) => !key.startsWith("$") && !["_id", "organizationId", "createdAt", "updatedAt"].includes(key)));
      const item = await Model.create({ ...safe, organizationId: req.user.organizationId });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const payload = beforeUpdate ? await beforeUpdate({ ...req.body }) : req.body;
      const item = await Model.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.organizationId }, { $set: Object.fromEntries(Object.entries(payload).filter(([key]) => !key.startsWith("$") && !["_id", "organizationId", "createdAt", "updatedAt"].includes(key))) }, {
        new: true,
        runValidators: true
      });
      if (!item) return res.status(404).json({ message: "Record not found" });
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const item = await Model.findOneAndDelete({ _id: req.params.id, organizationId: req.user.organizationId });
      if (!item) return res.status(404).json({ message: "Record not found" });
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

