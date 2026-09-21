import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { randomUUID, createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import request from "supertest";
import {
  allModels,
  Organization,
  Party,
  Product,
  Warehouse,
  Balance,
  Document,
  Transaction,
  Ledger,
  Movement,
} from "../src/v2/models.js";
import { User } from "../src/models.js";
import { createDocument, processBatch } from "../src/v2/operations.js";
import {
  createPayment,
  confirmManual,
  handleWebhook,
  cancelManual,
} from "../src/v2/payments.js";
import { aiTool } from "../src/v2/queries.js";
import { app } from "../src/server.js";
let replica, ctx, other, farmer, customer, product, rice, warehouse;
before(async () => {
  process.env.JWT_SECRET = "integration-only-secret-with-32-characters";
  replica = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    binary: { version: "7.0.24" },
  });
  await mongoose.connect(replica.getUri());
  await Promise.all([...allModels, User].map((m) => m.init()));
  const org = await Organization.create({ name: "Test A" });
  const org2 = await Organization.create({ name: "Test B" });
  ctx = {
    organizationId: org._id,
    userId: new mongoose.Types.ObjectId(),
    role: "admin",
  };
  other = {
    organizationId: org2._id,
    userId: new mongoose.Types.ObjectId(),
    role: "admin",
  };
  farmer = await Party.create({
    organizationId: org._id,
    name: "চাষী",
    kind: "FARMER",
  });
  customer = await Party.create({
    organizationId: org._id,
    name: "Customer",
    kind: "CUSTOMER",
    phone: "9999999999",
  });
  product = await Product.create({
    organizationId: org._id,
    name: "Swarna",
    code: "SWARNA",
    kind: "PADDY",
  });
  rice = await Product.create({
    organizationId: org._id,
    name: "Rice",
    code: "RICE",
    kind: "RICE",
  });
  warehouse = await Warehouse.create({ organizationId: org._id, name: "Main" });
});
after(async () => {
  await mongoose.disconnect();
  await replica?.stop();
});
const purchase = (grams = 100000) => ({
  kind: "PURCHASE",
  partyId: String(farmer._id),
  productId: String(product._id),
  warehouseId: String(warehouse._id),
  quantityGrams: grams,
  rateMinorPerKg: 2000,
  date: "2026-09-20T00:00:00.000Z",
});
const sale = (grams) => ({
  ...purchase(grams),
  kind: "SALE",
  partyId: String(customer._id),
});
test("duplicate purchase posts one document and stock movement", async () => {
  const key = randomUUID();
  const [a, b] = await Promise.all([
    createDocument(ctx, purchase(), key),
    createDocument(ctx, purchase(), key),
  ]);
  assert.equal(String(a._id), String(b._id));
  assert.equal(await Movement.countDocuments({ referenceId: a._id }), 1);
  assert.equal(
    (await Balance.findOne({ organizationId: ctx.organizationId }))
      .quantityGrams,
    100000,
  );
});
test("cross-tenant master references cannot be posted", async () => {
  await assert.rejects(createDocument(other, purchase(), randomUUID()), {
    code: "INVALID_PARTY",
  });
});
test("concurrent sales cannot oversell", async () => {
  const results = await Promise.allSettled([
    createDocument(ctx, sale(70000), randomUUID()),
    createDocument(ctx, sale(70000), randomUUID()),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    (
      await Balance.findOne({
        organizationId: ctx.organizationId,
        productId: product._id,
      })
    ).quantityGrams,
    30000,
  );
});
test("processing consumes paddy and adds actual rice atomically", async () => {
  await processBatch(
    ctx,
    {
      inputProductId: String(product._id),
      outputProductId: String(rice._id),
      warehouseId: String(warehouse._id),
      inputGrams: 10000,
      outputGrams: 6500,
    },
    randomUUID(),
  );
  assert.equal(
    (await Balance.findOne({ productId: rice._id })).quantityGrams,
    6500,
  );
});
test("manual confirmation is idempotent and produces one ledger entry", async () => {
  const doc = await Document.findOne({ kind: "SALE" });
  const tx = await createPayment(
    ctx,
    {
      documentId: String(doc._id),
      amountMinor: 1000,
      provider: "manual",
      method: "CASH",
    },
    randomUUID(),
  );
  await Promise.all([
    confirmManual(ctx, tx._id, "RECEIPT-1"),
    confirmManual(ctx, tx._id, "RECEIPT-1"),
  ]);
  assert.equal(await Ledger.countDocuments({ transactionId: tx._id }), 1);
  assert.equal((await Document.findById(doc._id)).paidMinor, 1000);
});
test("payout maker cannot confirm own disbursement", async () => {
  const doc = await Document.findOne({ kind: "PURCHASE" });
  const tx = await createPayment(
    ctx,
    {
      documentId: String(doc._id),
      amountMinor: 500,
      provider: "manual",
      method: "MANUAL_BANK",
    },
    randomUUID(),
  );
  await assert.rejects(confirmManual(ctx, tx._id, "BANK-REFERENCE"), {
    code: "SECOND_APPROVER_REQUIRED",
  });
  await confirmManual(
    { ...ctx, userId: new mongoose.Types.ObjectId(), role: "manager" },
    tx._id,
    "BANK-REFERENCE",
  );
  assert.equal(await Ledger.countDocuments({ transactionId: tx._id }), 1);
});
test("manual cancellation releases reservation once", async () => {
  const doc = await Document.findOne({ kind: "SALE" });
  const tx = await createPayment(
    ctx,
    {
      documentId: String(doc._id),
      amountMinor: 500,
      provider: "manual",
      method: "CASH",
    },
    randomUUID(),
  );
  await cancelManual(ctx, tx._id);
  await cancelManual(ctx, tx._id);
  assert.equal((await Document.findById(doc._id)).reservedMinor, 0);
});
test("signed duplicate test webhooks do not update live accounting", async () => {
  const doc = await Document.findOne({ kind: "SALE" });
  const oldPaid = doc.paidMinor;
  const tx = await Transaction.create({
    organizationId: ctx.organizationId,
    documentId: doc._id,
    provider: "cashfree",
    providerOrderId: "test-order",
    mode: "test",
    direction: "IN",
    amountMinor: 100,
    currency: "INR",
    method: "PAYMENT_LINK",
    initiatedBy: ctx.userId,
    idempotencyKey: randomUUID(),
  });
  await Document.updateOne({ _id: doc._id }, { $inc: { reservedMinor: 100 } });
  const prefix = `CASHFREE_${String(ctx.organizationId).toUpperCase()}_TEST`;
  process.env[`${prefix}_SECRET`] = "webhook-secret";
  const raw = Buffer.from(
    JSON.stringify({
      data: {
        order: { order_id: "test-order" },
        payment: {
          cf_payment_id: "test-payment",
          payment_status: "SUCCESS",
          payment_amount: 1,
          payment_currency: "INR",
        },
      },
    }),
  );
  const headers = {
    "x-webhook-timestamp": "1000",
    "x-webhook-signature": createHmac("sha256", "webhook-secret")
      .update("1000")
      .update(raw)
      .digest("base64"),
  };
  await handleWebhook(ctx.organizationId, "cashfree", "test", raw, headers);
  assert.equal(
    (await handleWebhook(ctx.organizationId, "cashfree", "test", raw, headers))
      .duplicate,
    true,
  );
  assert.equal((await Document.findById(doc._id)).paidMinor, oldPaid);
  assert.equal(await Ledger.countDocuments({ transactionId: tx._id }), 0);
});
test("PaddyPal cannot read financial tools as operator or another organization", async () => {
  await assert.rejects(
    aiTool({ ...ctx, role: "operator" }, "get_outstanding", {
      kind: "PURCHASE",
    }),
    { code: "FORBIDDEN" },
  );
  assert.equal((await aiTool(other, "get_stock", {})).length, 0);
});
test("cookie login, language persistence, CSRF rejection, revocation", async () => {
  const user = await User.create({
    organizationId: ctx.organizationId,
    name: "Admin",
    email: "test@example.com",
    passwordHash: await bcrypt.hash("test-password-long", 4),
    role: "admin",
  });
  const agent = request.agent(app);
  let response = await agent
    .post("/api/auth/login")
    .set("Origin", "http://localhost:5173")
    .send({ email: user.email, password: "test-password-long" });
  assert.equal(response.status, 200);
  assert.match(response.headers["set-cookie"][0], /HttpOnly/);
  assert.equal(response.body.token, undefined);
  response = await agent
    .patch("/api/auth/preferences")
    .set("Origin", "https://evil.example")
    .send({ preferredLanguage: "or" });
  assert.equal(response.status, 403);
  response = await agent
    .patch("/api/auth/preferences")
    .set("Origin", "http://localhost:5173")
    .send({ preferredLanguage: "or" });
  assert.equal(response.body.language, "or");
  const cookie = response.headers["set-cookie"];
  await agent.post("/api/auth/logout").set("Origin", "http://localhost:5173");
  assert.equal((await agent.get("/api/auth/me")).status, 401);
  assert.equal(cookie, undefined);
});
