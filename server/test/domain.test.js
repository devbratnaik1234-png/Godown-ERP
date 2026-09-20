import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  money,
  calculateTotal,
  indiaDayRange,
  validateConfirmation,
} from "../src/v2/domain.js";
import {
  CashfreeProvider,
  ManualPaymentProvider,
  PayoutProvider,
  providerFor,
} from "../src/v2/providers.js";
import { toolsFor, toolSchemas } from "../src/v2/paddypal.js";
import { documentInput, processingInput } from "../src/v2/operations.js";
import { paymentInput } from "../src/v2/payments.js";
import { Transaction } from "../src/v2/models.js";
test("money converts exact paise and rejects ambiguous, negative, excessive precision", () => {
  assert.equal(money("125000.01"), 12500001);
  for (const v of ["-2", "1,000", "1.001", "1e3", "Infinity", "0", 1])
    assert.throws(() => money(v));
});
test("weight and rate calculation uses exact integer arithmetic, half-up rounding", () => {
  assert.equal(calculateTotal(1250500, 2245), 2807373);
  assert.equal(calculateTotal(1, 500), 1);
  assert.throws(() => calculateTotal(1, 1));
});
test("India day crosses UTC calendar boundaries correctly", () => {
  const range = indiaDayRange("2026-09-20");
  assert.equal(range.$gte.toISOString(), "2026-09-19T18:30:00.000Z");
  assert.equal(range.$lt.toISOString(), "2026-09-20T18:30:00.000Z");
  assert.throws(() => indiaDayRange("2026-02-30"));
});
const tx = { providerOrderId: "order-1", amountMinor: 125001, currency: "INR" };
const event = {
  orderId: "order-1",
  amountMinor: 125001,
  currency: "INR",
  paymentId: "pay-1",
  status: "SUCCESS",
};
test("confirmation rejects wrong amount, currency, order, and non-success states", () => {
  validateConfirmation(tx, event);
  for (const change of [
    { amountMinor: 1 },
    { currency: "USD" },
    { orderId: "other" },
    { status: "PENDING" },
    { paymentId: "" },
  ])
    assert.throws(() => validateConfirmation(tx, { ...event, ...change }));
});
const provider = new CashfreeProvider({
  secret: "test-signature-secret",
  mode: "test",
  clientId: "test",
});
const body = Buffer.from(
  JSON.stringify({
    data: {
      order: { order_id: "order-1" },
      payment: {
        cf_payment_id: 42,
        payment_status: "SUCCESS",
        payment_amount: 1250.01,
        payment_currency: "INR",
      },
    },
  }),
);
const signed = (body, ts = "1726819200000") => ({
  "x-webhook-timestamp": ts,
  "x-webhook-signature": createHmac("sha256", "test-signature-secret")
    .update(ts)
    .update(body)
    .digest("base64"),
});
test("Cashfree signature verifies raw bytes, extracts stable event identifier", () => {
  const e = provider.handleWebhook(body, signed(body));
  assert.equal(e.eventId, "42:SUCCESS");
  assert.equal(e.amountMinor, 125001);
});
test("forged, missing and altered webhook signatures are rejected", () => {
  assert.throws(() => provider.handleWebhook(body, {}));
  assert.throws(() =>
    provider.handleWebhook(
      Buffer.concat([body, Buffer.from(" ")]),
      signed(body),
    ),
  );
  assert.throws(() =>
    provider.handleWebhook(body, {
      ...signed(body),
      "x-webhook-signature": "bad",
    }),
  );
});
test("old signed webhook is accepted for durable database deduplication", () => {
  assert.equal(
    provider.handleWebhook(body, signed(body, "1000")).status,
    "SUCCESS",
  );
});
test("manual provider only creates pending records", async () => {
  const p = new ManualPaymentProvider();
  assert.equal((await p.createPayment()).status, "PENDING");
  assert.throws(() => p.verifyPayment());
});
test("payout execution is unavailable instead of simulating success", async () => {
  await assert.rejects(new PayoutProvider().initiatePayout(), {
    code: "PAYOUT_PROVIDER_NOT_CONFIGURED",
  });
  assert.throws(() => providerFor("unknown", "org", "test"));
});
test("Cashfree order requests use sandbox, stable idempotency and server credentials", async () => {
  let captured;
  const p = new CashfreeProvider(
    { mode: "test", clientId: "test", secret: "secret" },
    async (url, options) => {
      captured = { url, options };
      return {
        ok: true,
        json: async () => ({
          order_id: "ps_550e8400-e29b-41d4-a716-446655440000",
          payment_session_id: "session",
        }),
      };
    },
  );
  const result = await p.createPayment(
    {
      providerOrderId: "ps_550e8400-e29b-41d4-a716-446655440000",
      amountMinor: 12345,
      currency: "INR",
    },
    { _id: "party", phone: "9999999999" },
  );
  assert.equal(captured.url, "https://sandbox.cashfree.com/pg/orders");
  assert.equal(
    captured.options.headers["x-idempotency-key"],
    "550e8400-e29b-41d4-a716-446655440000",
  );
  assert.equal(JSON.parse(captured.options.body).order_amount, 123.45);
  assert.equal(result.status, "PENDING");
});
test("gateway timeout does not retry create-payment call", async () => {
  let calls = 0;
  const p = new CashfreeProvider(
    { mode: "test", clientId: "test", secret: "secret" },
    async () => {
      calls++;
      throw new Error("timeout");
    },
  );
  await assert.rejects(p.request("/orders", "POST", {}), {
    code: "PROVIDER_TIMEOUT",
  });
  assert.equal(calls, 1);
});
test("PaddyPal exposes no write, approval, transfer, SQL or arbitrary query tools", () => {
  for (const role of ["admin", "manager", "accountant", "operator", "viewer"]) {
    const tools = toolsFor(role);
    assert.ok(tools.every((t) => t.name.startsWith("get_")));
    assert.ok(tools.every((t) => t.parameters.additionalProperties === false));
  }
  assert.equal(toolsFor("operator").length, 2);
  assert.equal(toolsFor("accountant").length, 4);
});
test("PaddyPal tool arguments cannot choose another tenant", () => {
  assert.equal(
    toolSchemas.get_stock.safeParse({ organizationId: "other" }).success,
    false,
  );
  assert.equal(
    toolSchemas.get_business_summary.safeParse({ day: "yesterday" }).success,
    false,
  );
});
test("business request schemas reject tenant injection and negative quantities", () => {
  const valid = {
    kind: "PURCHASE",
    partyId: "a".repeat(24),
    productId: "b".repeat(24),
    warehouseId: "c".repeat(24),
    quantityGrams: 1,
    rateMinorPerKg: 1000,
    date: "2026-09-20T00:00:00.000Z",
  };
  assert.equal(documentInput.safeParse(valid).success, true);
  assert.equal(
    documentInput.safeParse({ ...valid, organizationId: "x" }).success,
    false,
  );
  assert.equal(
    documentInput.safeParse({ ...valid, quantityGrams: -1 }).success,
    false,
  );
  assert.equal(processingInput.safeParse({}).success, false);
});
test("payments cannot inject success, tenant, fractional paise or card credentials", () => {
  const valid = {
    documentId: "a".repeat(24),
    amountMinor: 100,
    provider: "manual",
    method: "CASH",
  };
  assert.equal(paymentInput.safeParse(valid).success, true);
  for (const change of [
    { status: "SUCCESS" },
    { organizationId: "x" },
    { amountMinor: 1.5 },
    { cvv: "123" },
  ])
    assert.equal(
      paymentInput.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("database transaction schema has tenant-scoped request and order uniqueness", () => {
  const indexes = Transaction.schema.indexes();
  assert.ok(
    indexes.some(
      ([keys, options]) =>
        keys.organizationId && keys.idempotencyKey && options.unique,
    ),
  );
  assert.ok(
    indexes.some(
      ([keys, options]) =>
        keys.organizationId &&
        keys.mode &&
        keys.providerOrderId &&
        options.unique,
    ),
  );
});
