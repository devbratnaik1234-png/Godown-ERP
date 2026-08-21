import express from "express";

export default function crudRouter(Model, { beforeCreate, beforeUpdate } = {}) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ message: "Record not found" });
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const payload = beforeCreate ? await beforeCreate({ ...req.body }) : req.body;
      const item = await Model.create(payload);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const payload = beforeUpdate ? await beforeUpdate({ ...req.body }) : req.body;
      const item = await Model.findByIdAndUpdate(req.params.id, payload, {
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
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: "Record not found" });
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
