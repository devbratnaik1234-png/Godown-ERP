import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  Party,
  Product,
  Warehouse,
  Balance,
  Movement,
  Document,
  Processing,
  Audit,
} from "./models.js";
import { assert, fingerprint, calculateTotal } from "./domain.js";
export const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const keySchema = z.string().min(8).max(150);
const integer = z.number().int().positive().max(1000000000000);
export const documentInput = z
  .object({
    kind: z.enum(["PURCHASE", "SALE"]),
    partyId: objectId,
    productId: objectId,
    warehouseId: objectId,
    quantityGrams: integer,
    rateMinorPerKg: integer,
    date: z.iso.datetime(),
  })
  .strict();
export const processingInput = z
  .object({
    inputProductId: objectId,
    outputProductId: objectId,
    warehouseId: objectId,
    inputGrams: integer,
    outputGrams: integer,
  })
  .strict();
export async function atomic(fn) {
  return mongoose.connection.transaction(fn);
}
export async function audit(ctx, action, referenceId, details, session) {
  await Audit.create(
    [
      {
        organizationId: ctx.organizationId,
        actorId: ctx.userId,
        action,
        referenceId,
        details,
      },
    ],
    { session },
  );
}
export async function stockChange(
  ctx,
  productId,
  warehouseId,
  delta,
  referenceId,
  kind,
  session,
) {
  const filter = { organizationId: ctx.organizationId, productId, warehouseId };
  if (delta < 0) {
    const result = await Balance.updateOne(
      { ...filter, quantityGrams: { $gte: -delta } },
      { $inc: { quantityGrams: delta } },
      { session },
    );
    assert(result.modifiedCount === 1, "INSUFFICIENT_STOCK", 409);
  } else {
    await Balance.updateOne(
      filter,
      { $inc: { quantityGrams: delta } },
      { upsert: true, session },
    );
  }
  await Movement.create(
    [
      {
        ...filter,
        quantityGrams: delta,
        referenceId,
        kind,
        createdBy: ctx.userId,
      },
    ],
    { session },
  );
}
async function replay(Model, ctx, key, hash) {
  const existing = await Model.findOne({
    organizationId: ctx.organizationId,
    idempotencyKey: key,
  });
  if (existing)
    assert(existing.fingerprint === hash, "IDEMPOTENCY_CONFLICT", 409);
  return existing;
}
export async function createDocument(ctx, body, key) {
  const input = documentInput.parse(body);
  keySchema.parse(key);
  const hash = fingerprint(input);
  const old = await replay(Document, ctx, key, hash);
  if (old) return old;
  try {
    return await atomic(async (session) => {
      const organizationId = ctx.organizationId;
      const party = await Party.findOne({
        _id: input.partyId,
        organizationId,
      }).session(session);
      assert(
        party &&
          (input.kind === "PURCHASE"
            ? ["FARMER", "VENDOR"].includes(party.kind)
            : party.kind === "CUSTOMER"),
        "INVALID_PARTY",
      );
      assert(
        await Product.exists({ _id: input.productId, organizationId }).session(
          session,
        ),
        "INVALID_PRODUCT",
      );
      assert(
        await Warehouse.exists({
          _id: input.warehouseId,
          organizationId,
        }).session(session),
        "INVALID_WAREHOUSE",
      );
      const [doc] = await Document.create(
        [
          {
            ...input,
            organizationId,
            reference: `${input.kind === "PURCHASE" ? "PUR" : "SAL"}-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
            amountMinor: calculateTotal(
              input.quantityGrams,
              input.rateMinorPerKg,
            ),
            createdBy: ctx.userId,
            idempotencyKey: key,
            fingerprint: hash,
          },
        ],
        { session },
      );
      await stockChange(
        ctx,
        doc.productId,
        doc.warehouseId,
        doc.quantityGrams * (doc.kind === "PURCHASE" ? 1 : -1),
        doc._id,
        doc.kind,
        session,
      );
      await audit(
        ctx,
        "DOCUMENT_POSTED",
        doc._id,
        { kind: doc.kind, amountMinor: doc.amountMinor },
        session,
      );
      return doc;
    });
  } catch (error) {
    if (error.code === 11000) {
      const result = await replay(Document, ctx, key, hash);
      if (result) return result;
    }
    throw error;
  }
}
export async function processBatch(ctx, body, key) {
  const input = processingInput.parse(body);
  keySchema.parse(key);
  assert(
    input.inputProductId !== input.outputProductId &&
      input.outputGrams <= input.inputGrams,
    "INVALID_YIELD",
  );
  const hash = fingerprint(input);
  const old = await replay(Processing, ctx, key, hash);
  if (old) return old;
  try {
    return await atomic(async (session) => {
      const organizationId = ctx.organizationId;
      assert(
        await Product.exists({
          _id: input.inputProductId,
          organizationId,
          kind: "PADDY",
        }).session(session),
        "INVALID_PRODUCT",
      );
      assert(
        await Product.exists({
          _id: input.outputProductId,
          organizationId,
          kind: "RICE",
        }).session(session),
        "INVALID_PRODUCT",
      );
      assert(
        await Warehouse.exists({
          _id: input.warehouseId,
          organizationId,
        }).session(session),
        "INVALID_WAREHOUSE",
      );
      const [batch] = await Processing.create(
        [
          {
            ...input,
            organizationId,
            reference: `MIL-${randomUUID().slice(0, 8).toUpperCase()}`,
            lossGrams: input.inputGrams - input.outputGrams,
            createdBy: ctx.userId,
            idempotencyKey: key,
            fingerprint: hash,
          },
        ],
        { session },
      );
      await stockChange(
        ctx,
        input.inputProductId,
        input.warehouseId,
        -input.inputGrams,
        batch._id,
        "PROCESS_INPUT",
        session,
      );
      await stockChange(
        ctx,
        input.outputProductId,
        input.warehouseId,
        input.outputGrams,
        batch._id,
        "PROCESS_OUTPUT",
        session,
      );
      await audit(
        ctx,
        "PROCESSING_POSTED",
        batch._id,
        { lossGrams: batch.lossGrams },
        session,
      );
      return batch;
    });
  } catch (error) {
    if (error.code === 11000) {
      const old = await replay(Processing, ctx, key, hash);
      if (old) return old;
    }
    throw error;
  }
}
