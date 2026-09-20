import mongoose from "mongoose";
import {
  Document,
  Transaction,
  Balance,
  Party,
  Product,
  Audit,
} from "./models.js";
import { indiaDayRange, assert, financeRoles } from "./domain.js";
export async function summary(ctx, day) {
  const organizationId = new mongoose.Types.ObjectId(
    String(ctx.organizationId),
  );
  const date = day ? indiaDayRange(day) : undefined;
  const docs = await Document.aggregate([
    { $match: { organizationId, ...(date ? { date } : {}) } },
    {
      $group: {
        _id: "$kind",
        amountMinor: { $sum: "$amountMinor" },
        quantityGrams: { $sum: "$quantityGrams" },
        count: { $sum: 1 },
        outstandingMinor: {
          $sum: { $subtract: ["$amountMinor", "$paidMinor"] },
        },
      },
    },
  ]);
  const stock = await Balance.aggregate([
    { $match: { organizationId } },
    { $group: { _id: null, quantityGrams: { $sum: "$quantityGrams" } } },
  ]);
  const farmers = await Party.countDocuments({
    organizationId,
    kind: "FARMER",
  });
  const financial = financeRoles.includes(ctx.role);
  const payments = financial
    ? await Transaction.aggregate([
        {
          $match: {
            organizationId,
            mode: "live",
            status: "SUCCESS",
            ...(date ? { confirmedAt: date } : {}),
          },
        },
        {
          $group: {
            _id: { direction: "$direction", method: "$method" },
            amountMinor: { $sum: "$amountMinor" },
            count: { $sum: 1 },
          },
        },
      ])
    : [];
  const documents = financial
    ? docs
    : docs.map(({ _id, quantityGrams, count }) => ({
        _id,
        quantityGrams,
        count,
      }));
  return {
    asOf: new Date().toISOString(),
    timezone: "Asia/Kolkata",
    period: day || "ALL_TIME",
    farmers,
    stockGrams: stock[0]?.quantityGrams || 0,
    documents,
    payments,
    financialAccess: financial,
  };
}
export async function stockQuery(ctx) {
  const balances = await Balance.find({ organizationId: ctx.organizationId })
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();
  const products = await Product.find({
    organizationId: ctx.organizationId,
    _id: { $in: balances.map((b) => b.productId) },
  }).lean();
  return balances.map((b) => ({
    ...b,
    productName: products.find((p) => String(p._id) === String(b.productId))
      ?.name,
  }));
}
export async function aiTool(ctx, name, args) {
  let result;
  if (name === "get_business_summary")
    result = await summary(ctx, args.day || undefined);
  else if (name === "get_stock") result = await stockQuery(ctx);
  else if (name === "get_outstanding") {
    assert(financeRoles.includes(ctx.role), "FORBIDDEN", 403);
    result = await Document.find({
      organizationId: ctx.organizationId,
      kind: args.kind,
      $expr: { $gt: ["$amountMinor", "$paidMinor"] },
    })
      .select("reference partyId amountMinor paidMinor currency date")
      .sort({ date: 1 })
      .limit(100)
      .lean();
  } else if (name === "get_payment_exceptions") {
    assert(financeRoles.includes(ctx.role), "FORBIDDEN", 403);
    result = await Transaction.find({
      organizationId: ctx.organizationId,
      reconciliationStatus: { $ne: "MATCHED" },
    })
      .select(
        "reference status mode amountMinor currency reconciliationStatus failureCode",
      )
      .limit(100)
      .lean();
  } else
    throw Object.assign(new Error("FORBIDDEN_TOOL"), {
      code: "FORBIDDEN_TOOL",
      status: 403,
    });
  await Audit.create({
    organizationId: ctx.organizationId,
    actorId: ctx.userId,
    action: "PADDYPAL_TOOL_READ",
    details: { tool: name },
  });
  return result;
}
