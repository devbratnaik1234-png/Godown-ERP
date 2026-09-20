import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  Organization,
  Party,
  Document,
  Transaction,
  Ledger,
  WebhookEvent,
  Notification,
} from "./models.js";
import { assert, fingerprint, validateConfirmation } from "./domain.js";
import { atomic, audit, objectId, keySchema } from "./operations.js";
import { providerFor, providerNames } from "./providers.js";
export const paymentInput = z
  .object({
    documentId: objectId,
    amountMinor: z.number().int().positive().max(1000000000000),
    provider: z.enum(providerNames),
    method: z.enum([
      "CASH",
      "MANUAL_BANK",
      "CHEQUE",
      "UPI",
      "CARD",
      "NET_BANKING",
      "WALLET",
      "PAYMENT_LINK",
    ]),
  })
  .strict();
export async function createPayment(ctx, body, key) {
  const input = paymentInput.parse(body);
  keySchema.parse(key);
  const hash = fingerprint(input);
  const findOld = async () => {
    const tx = await Transaction.findOne({
      organizationId: ctx.organizationId,
      idempotencyKey: key,
    });
    if (tx) assert(tx.fingerprint === hash, "IDEMPOTENCY_CONFLICT", 409);
    return tx;
  };
  const old = await findOld();
  if (old) return old;
  const org = await Organization.findById(ctx.organizationId);
  assert(
    org.enabledProviders.includes(input.provider),
    "PROVIDER_DISABLED",
    409,
  );
  const adapter = providerFor(
    input.provider,
    ctx.organizationId,
    org.paymentMode,
  );
  assert(
    adapter.manual ||
      org.paymentMode === "test" ||
      process.env.ENABLE_LIVE_PAYMENTS === "true",
    "LIVE_PAYMENTS_DISABLED",
    409,
  );
  assert(adapter.supportedMethods.includes(input.method), "INVALID_METHOD");
  const document = await Document.findOne({
    _id: input.documentId,
    organizationId: ctx.organizationId,
  });
  assert(document, "NOT_FOUND", 404);
  assert(
    document.kind === "SALE" || adapter.manual,
    "PAYOUT_PROVIDER_REQUIRED",
  );
  const party = await Party.findOne({
    _id: document.partyId,
    organizationId: ctx.organizationId,
  });
  adapter.preflight(input, party);
  let tx;
  try {
    tx = await atomic(async (session) => {
      const doc = await Document.findOne({
        _id: input.documentId,
        organizationId: ctx.organizationId,
      }).session(session);
      assert(doc, "NOT_FOUND", 404);
      assert(doc.kind === "SALE" || adapter.manual, "PAYOUT_PROVIDER_REQUIRED");
      assert(
        input.amountMinor <=
          doc.amountMinor - doc.paidMinor - doc.reservedMinor,
        "EXCEEDS_OUTSTANDING",
        409,
      );
      // Updating the document serializes concurrent payment reservations inside the transaction.
      doc.reservedMinor += input.amountMinor;
      await doc.save({ session });
      const [created] = await Transaction.create(
        [
          {
            ...input,
            organizationId: ctx.organizationId,
            reference: `PAY-${randomUUID().slice(0, 8).toUpperCase()}`,
            direction: doc.kind === "SALE" ? "IN" : "OUT",
            mode: adapter.manual ? "live" : org.paymentMode,
            providerOrderId: adapter.createOrderReference(),
            initiatedBy: ctx.userId,
            status: "CREATED",
            fingerprint: hash,
            idempotencyKey: key,
          },
        ],
        { session },
      );
      await audit(
        ctx,
        "PAYMENT_INITIATED",
        created._id,
        { amountMinor: created.amountMinor, provider: created.provider },
        session,
      );
      return created;
    });
  } catch (error) {
    if (error.code === 11000) {
      const old = await findOld();
      if (old) return old;
    }
    throw error;
  }
  try {
    const doc = await Document.findById(tx.documentId);
    const party = await Party.findOne({
      _id: doc.partyId,
      organizationId: ctx.organizationId,
    });
    const result = await providerFor(
      tx.provider,
      ctx.organizationId,
      tx.mode,
    ).createPayment(tx, party);
    // A fast webhook may already have completed it. Never downgrade SUCCESS.
    await Transaction.updateOne(
      { _id: tx._id, status: "CREATED" },
      { $set: result },
    );
  } catch (error) {
    // Unknown outcome remains reserved. No new charge, no provider fallback.
    await Transaction.updateOne(
      { _id: tx._id, status: "CREATED" },
      {
        $set: {
          status: "PROCESSING",
          failureCode: error.code || "PROVIDER_UNAVAILABLE",
          reconciliationStatus: "REQUIRES_REVIEW",
        },
      },
    );
  }
  return Transaction.findById(tx._id);
}
export async function postVerified(ctx, transactionId, evidence, session) {
  const tx = await Transaction.findOne({
    _id: transactionId,
    organizationId: ctx.organizationId,
  }).session(session);
  assert(tx, "NOT_FOUND", 404);
  if (tx.status === "SUCCESS") return tx;
  assert(
    !tx.reservationReleased &&
      ["CREATED", "PENDING", "PROCESSING", "AUTHORIZED"].includes(tx.status),
    "INVALID_PAYMENT_STATE",
    409,
  );
  const doc = await Document.findOne({
    _id: tx.documentId,
    organizationId: ctx.organizationId,
  }).session(session);
  assert(
    doc &&
      doc.reservedMinor >= tx.amountMinor &&
      doc.paidMinor + tx.amountMinor <= doc.amountMinor,
    "EXCEEDS_OUTSTANDING",
    409,
  );
  // Test gateways never alter live accounting. They release their reservation and retain test history.
  if (tx.mode === "live") doc.paidMinor += tx.amountMinor;
  doc.reservedMinor -= tx.amountMinor;
  await doc.save({ session });
  tx.status = "SUCCESS";
  tx.reservationReleased = true;
  tx.confirmedAt = new Date();
  tx.confirmedBy = ctx.userId;
  tx.providerPaymentId = evidence.paymentId;
  tx.evidenceReference = evidence.reference;
  tx.settlementStatus = tx.provider === "manual" ? "NOT_APPLICABLE" : "PENDING";
  tx.reconciliationStatus = "MATCHED";
  tx.failureCode = undefined;
  await tx.save({ session });
  if (tx.mode === "live")
    await Ledger.create(
      [
        {
          organizationId: ctx.organizationId,
          transactionId: tx._id,
          documentId: doc._id,
          reference: tx.reference,
          currency: tx.currency,
          amountMinor: tx.amountMinor,
          debitAccount: tx.direction === "IN" ? "CASH_BANK" : "PAYABLES",
          creditAccount: tx.direction === "IN" ? "RECEIVABLES" : "CASH_BANK",
        },
      ],
      { session },
    );
  await audit(
    ctx,
    tx.provider === "manual"
      ? "PAYMENT_MANUALLY_CONFIRMED"
      : "PAYMENT_COMPLETED",
    tx._id,
    { mode: tx.mode, amountMinor: tx.amountMinor },
    session,
  );
  await Notification.create(
    [
      {
        organizationId: ctx.organizationId,
        event:
          tx.mode === "test" ? "TEST_PAYMENT_COMPLETED" : "PAYMENT_COMPLETED",
        referenceId: tx._id,
      },
    ],
    { session },
  );
  return tx;
}
export async function confirmManual(ctx, id, evidence) {
  assert(
    typeof evidence === "string" &&
      evidence.trim().length >= 5 &&
      evidence.length <= 300,
    "EVIDENCE_REQUIRED",
  );
  return atomic(async (session) => {
    const tx = await Transaction.findOne({
      _id: id,
      organizationId: ctx.organizationId,
      provider: "manual",
    }).session(session);
    assert(tx, "NOT_FOUND", 404);
    // Every outbound confirmation requires a second authorized person in this first release.
    if (tx.direction === "OUT")
      assert(
        ["admin", "manager"].includes(ctx.role) &&
          String(tx.initiatedBy) !== String(ctx.userId),
        "SECOND_APPROVER_REQUIRED",
        403,
      );
    return postVerified(ctx, tx._id, { reference: evidence.trim() }, session);
  });
}
export async function cancelManual(ctx, id) {
  return atomic(async (session) => {
    const tx = await Transaction.findOne({
      _id: id,
      organizationId: ctx.organizationId,
      provider: "manual",
    }).session(session);
    assert(tx, "NOT_FOUND", 404);
    if (tx.status === "CANCELLED") return tx;
    assert(
      ["CREATED", "PENDING"].includes(tx.status),
      "INVALID_PAYMENT_STATE",
      409,
    );
    await Document.updateOne(
      {
        _id: tx.documentId,
        organizationId: ctx.organizationId,
        reservedMinor: { $gte: tx.amountMinor },
      },
      { $inc: { reservedMinor: -tx.amountMinor } },
      { session },
    );
    tx.status = "CANCELLED";
    tx.reservationReleased = true;
    await tx.save({ session });
    await audit(ctx, "PAYMENT_CANCELLED", tx._id, {}, session);
    return tx;
  });
}
export async function handleWebhook(
  organizationId,
  provider,
  mode,
  raw,
  headers,
) {
  const event = providerFor(provider, organizationId, mode).handleWebhook(
    raw,
    headers,
  );
  const filter = {
    organizationId,
    provider,
    mode,
    providerOrderId: event.orderId,
  };
  const tx = await Transaction.findOne(filter);
  assert(tx, "NOT_FOUND", 404);
  // Keep failed attempts separate from the order; Cashfree may send success on a later attempt.
  return atomic(async (session) => {
    if (
      await WebhookEvent.exists({
        organizationId,
        provider,
        mode,
        eventId: event.eventId,
      }).session(session)
    )
      return { duplicate: true };
    const current = await Transaction.findOne(filter).session(session);
    assert(current, "NOT_FOUND", 404);
    if (event.status === "SUCCESS") {
      validateConfirmation(current, event);
      if (current.status === "SUCCESS")
        assert(
          current.providerPaymentId === event.paymentId,
          "MULTIPLE_SUCCESSFUL_PAYMENTS",
          409,
        );
      await postVerified({ organizationId }, current._id, event, session);
    } else {
      assert(
        current.amountMinor === event.amountMinor &&
          current.currency === event.currency,
        "AMOUNT_MISMATCH",
      );
      if (current.status !== "SUCCESS")
        await Transaction.updateOne(
          { _id: current._id },
          {
            $set: {
              failureCode: `ATTEMPT_${event.status}`,
              reconciliationStatus: "REQUIRES_REVIEW",
            },
          },
          { session },
        );
      await audit(
        { organizationId },
        "PAYMENT_ATTEMPT_UPDATED",
        current._id,
        { paymentId: event.paymentId, status: event.status },
        session,
      );
    }
    await WebhookEvent.create(
      [
        {
          organizationId,
          provider,
          mode,
          eventId: event.eventId,
          transactionId: current._id,
        },
      ],
      { session },
    );
    return { accepted: true };
  });
}
export async function reconcile(ctx, id) {
  const tx = await Transaction.findOne({
    _id: id,
    organizationId: ctx.organizationId,
  });
  assert(tx, "NOT_FOUND", 404);
  if (tx.provider === "manual") return tx;
  const payments = await providerFor(
    tx.provider,
    ctx.organizationId,
    tx.mode,
  ).getPaymentStatus(tx);
  const matches = payments.filter((p) => p.payment_status === "SUCCESS");
  const match = matches.find(
    (p) =>
      Math.round(p.payment_amount * 100) === tx.amountMinor &&
      p.payment_currency === tx.currency,
  );
  tx.reconciliationStatus =
    matches.length > 1
      ? "REQUIRES_REVIEW"
      : match
        ? tx.status === "SUCCESS" &&
          tx.providerPaymentId === String(match.cf_payment_id)
          ? "MATCHED"
          : "MISSING_IN_ERP"
        : matches.length
          ? "AMOUNT_MISMATCH"
          : "UNMATCHED";
  // Status checks never post accounting or recreate a charge; verified webhook is authoritative.
  await tx.save();
  await audit(ctx, "PAYMENT_RECONCILED", tx._id, {
    status: tx.reconciliationStatus,
  });
  return tx;
}
