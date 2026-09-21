import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { AppError, assert, money } from "./domain.js";
// Capability errors are explicit. An unavailable adapter never pretends a transfer succeeded.
export class PaymentProvider {
  capabilities = [];
  manual = false;
  supportedMethods = [];
  createOrderReference() {
    return `ps_${randomUUID()}`;
  }
  preflight() {
    this.unsupported();
  }
  unsupported() {
    throw new AppError("PROVIDER_CAPABILITY_UNAVAILABLE", 503);
  }
  createPayment() {
    return this.unsupported();
  }
  getPaymentStatus() {
    return this.unsupported();
  }
  verifyPayment() {
    return this.unsupported();
  }
  refundPayment() {
    return this.unsupported();
  }
  getRefundStatus() {
    return this.unsupported();
  }
  handleWebhook() {
    return this.unsupported();
  }
  generatePaymentLink() {
    return this.unsupported();
  }
  generateUPIRequest() {
    return this.unsupported();
  }
}
export class ManualPaymentProvider extends PaymentProvider {
  capabilities = ["manual-record"];
  manual = true;
  supportedMethods = ["CASH", "MANUAL_BANK", "CHEQUE"];
  createOrderReference() {
    return undefined;
  }
  preflight() {}
  async createPayment() {
    return { status: "PENDING" };
  }
}
export class PayoutProvider {
  async initiatePayout() {
    throw new AppError("PAYOUT_PROVIDER_NOT_CONFIGURED", 503);
  }
  async getPayoutStatus() {
    throw new AppError("PAYOUT_PROVIDER_NOT_CONFIGURED", 503);
  }
}
export class CashfreeProvider extends PaymentProvider {
  capabilities = ["hosted-checkout", "status", "webhook"];
  supportedMethods = ["PAYMENT_LINK"];
  preflight(input, party) {
    assert(
      this.config.clientId && this.config.secret,
      "PROVIDER_NOT_CONFIGURED",
      503,
    );
    assert(
      input.amountMinor >= 100 && /^\d{10}$/.test(party?.phone || ""),
      "INVALID_PAYMENT_CUSTOMER",
    );
  }
  constructor(config, transport = fetch) {
    super();
    this.config = config;
    this.transport = transport;
  }
  async request(path, method = "GET", body, key) {
    assert(
      this.config.clientId && this.config.secret,
      "PROVIDER_NOT_CONFIGURED",
      503,
    );
    const base =
      this.config.mode === "live"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";
    let result;
    try {
      result = await this.transport(`${base}${path}`, {
        method,
        signal: AbortSignal.timeout(15000),
        headers: {
          "content-type": "application/json",
          "x-client-id": this.config.clientId,
          "x-client-secret": this.config.secret,
          "x-api-version": "2026-01-01",
          ...(key ? { "x-idempotency-key": key } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      throw new AppError("PROVIDER_TIMEOUT", 503);
    }
    assert(
      result.ok,
      result.status === 404
        ? "PROVIDER_ORDER_NOT_FOUND"
        : "PROVIDER_UNAVAILABLE",
      503,
    );
    return result.json();
  }
  async createPayment(tx, party) {
    assert(
      tx.amountMinor >= 100 && /^\d{10}$/.test(party.phone || ""),
      "INVALID_PAYMENT_CUSTOMER",
    );
    const data = await this.request(
      "/orders",
      "POST",
      {
        order_id: tx.providerOrderId,
        order_amount: tx.amountMinor / 100,
        order_currency: tx.currency,
        customer_details: {
          customer_id: String(party._id),
          customer_phone: party.phone,
        },
      },
      tx.providerOrderId.slice(3),
    );
    assert(
      data.order_id === tx.providerOrderId && data.payment_session_id,
      "INVALID_PROVIDER_RESPONSE",
      502,
    );
    return { status: "PENDING", paymentSessionId: data.payment_session_id };
  }
  async getPaymentStatus(tx) {
    return this.request(
      `/orders/${encodeURIComponent(tx.providerOrderId)}/payments`,
    );
  }
  handleWebhook(raw, headers) {
    assert(
      Buffer.isBuffer(raw) && raw.length && this.config.secret,
      "INVALID_SIGNATURE",
      401,
    );
    const timestamp = headers["x-webhook-timestamp"];
    const signature = headers["x-webhook-signature"];
    assert(
      typeof timestamp === "string" &&
        /^\d+$/.test(timestamp) &&
        typeof signature === "string",
      "INVALID_SIGNATURE",
      401,
    );
    const expected = createHmac("sha256", this.config.secret)
      .update(timestamp)
      .update(raw)
      .digest();
    const actual = Buffer.from(signature, "base64");
    assert(
      expected.length === actual.length && timingSafeEqual(expected, actual),
      "INVALID_SIGNATURE",
      401,
    );
    // Do not reject delayed signed delivery by an arbitrary age; durable event IDs prevent re-posting.
    let data;
    try {
      data = JSON.parse(raw.toString("utf8"));
    } catch {
      throw new AppError("INVALID_INPUT");
    }
    const order = data.data?.order;
    const payment = data.data?.payment;
    assert(
      order?.order_id && payment?.cf_payment_id && payment?.payment_status,
      "INVALID_INPUT",
    );
    return {
      orderId: order.order_id,
      paymentId: String(payment.cf_payment_id),
      eventId: `${payment.cf_payment_id}:${payment.payment_status}`,
      amountMinor: money(String(payment.payment_amount)),
      currency: payment.payment_currency,
      status: payment.payment_status,
    };
  }
}
// Credentials are supplied only by deployment secret infrastructure, namespaced by organization AND mode.
export const providerRegistry = {
  manual: () => new ManualPaymentProvider(),
  cashfree: (organizationId, mode) => {
    const prefix = `CASHFREE_${String(organizationId).toUpperCase()}_${mode.toUpperCase()}`;
    return new CashfreeProvider({
      mode,
      clientId: process.env[`${prefix}_CLIENT_ID`],
      secret: process.env[`${prefix}_SECRET`],
    });
  },
};
export const providerNames = Object.keys(providerRegistry);
export function providerFor(name, organizationId, mode) {
  assert(["test", "live"].includes(mode), "INVALID_INPUT");
  assert(Object.hasOwn(providerRegistry, name), "PROVIDER_NOT_CONFIGURED", 503);
  return providerRegistry[name](organizationId, mode);
}
