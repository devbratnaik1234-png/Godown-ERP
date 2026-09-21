import mongoose from "mongoose";
export const LANGUAGES = ["en", "hi", "bn", "or"];
export const PAYMENT_STATES = [
  "CREATED",
  "PENDING",
  "PROCESSING",
  "AUTHORIZED",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
  "REFUND_PENDING",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "DISPUTED",
];
const id = { type: mongoose.Schema.Types.ObjectId, required: true };
const integer = {
  type: Number,
  required: true,
  min: 0,
  max: Number.MAX_SAFE_INTEGER,
  validate: Number.isSafeInteger,
};
const text = { type: String, trim: true, maxlength: 300 };
function model(name, fields, indexes = []) {
  const schema = new mongoose.Schema(
    { organizationId: id, ...fields },
    { timestamps: true, strict: "throw" },
  );
  schema.index({ organizationId: 1, createdAt: -1 });
  for (const [keys, options] of indexes) schema.index(keys, options);
  return mongoose.model(name, schema);
}
export const Organization = mongoose.model(
  "Organization",
  new mongoose.Schema(
    {
      name: { ...text, required: true },
      defaultLanguage: { type: String, enum: LANGUAGES, default: "en" },
      currency: { type: String, enum: ["INR"], default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      secondaryLanguage: {
        type: String,
        enum: [...LANGUAGES, ""],
        default: "",
      },
      aiEnabled: { type: Boolean, default: false },
      paymentMode: { type: String, enum: ["test", "live"], default: "test" },
      enabledProviders: { type: [String], default: ["manual"] },
      defaultProvider: { type: String, default: "manual" },
      payoutApprovalThresholdMinor: { ...integer, default: 5000000 },
    },
    { timestamps: true, strict: "throw" },
  ),
);
export const Party = model("Party", {
  name: { ...text, required: true },
  kind: {
    type: String,
    enum: ["FARMER", "CUSTOMER", "VENDOR", "LABOUR", "TRANSPORTER"],
    required: true,
  },
  village: text,
  phone: text,
  legacyId: text,
});
export const Product = model(
  "Product",
  {
    code: { ...text, required: true },
    name: { ...text, required: true },
    names: { type: Map, of: String },
    kind: {
      type: String,
      enum: ["PADDY", "RICE", "BYPRODUCT"],
      default: "PADDY",
    },
  },
  [[{ organizationId: 1, code: 1 }, { unique: true }]],
);
export const Warehouse = model("Warehouse", {
  name: { ...text, required: true },
  location: text,
});
export const Balance = model(
  "InventoryBalance",
  { productId: id, warehouseId: id, quantityGrams: { ...integer, default: 0 } },
  [[{ organizationId: 1, productId: 1, warehouseId: 1 }, { unique: true }]],
);
export const Movement = model("StockMovement", {
  productId: id,
  warehouseId: id,
  referenceId: id,
  kind: {
    type: String,
    enum: ["PURCHASE", "SALE", "PROCESS_INPUT", "PROCESS_OUTPUT", "OPENING"],
    required: true,
  },
  quantityGrams: {
    type: Number,
    required: true,
    validate: Number.isSafeInteger,
  },
  createdBy: id,
});
export const Document = model(
  "BusinessDocument",
  {
    reference: { ...text, required: true },
    kind: { type: String, enum: ["PURCHASE", "SALE"], required: true },
    partyId: id,
    productId: id,
    warehouseId: id,
    quantityGrams: integer,
    rateMinorPerKg: integer,
    amountMinor: integer,
    paidMinor: { ...integer, default: 0 },
    reservedMinor: { ...integer, default: 0 },
    currency: { type: String, default: "INR" },
    date: { type: Date, required: true },
    createdBy: id,
    idempotencyKey: { ...text, required: true },
    fingerprint: text,
  },
  [
    [{ organizationId: 1, idempotencyKey: 1 }, { unique: true }],
    [{ organizationId: 1, reference: 1 }, { unique: true }],
  ],
);
export const Processing = model(
  "ProcessingBatch",
  {
    reference: text,
    inputProductId: id,
    outputProductId: id,
    warehouseId: id,
    inputGrams: integer,
    outputGrams: integer,
    lossGrams: integer,
    createdBy: id,
    idempotencyKey: text,
    fingerprint: text,
  },
  [[{ organizationId: 1, idempotencyKey: 1 }, { unique: true }]],
);
export const Transaction = model(
  "PaymentTransaction",
  {
    reference: text,
    documentId: id,
    direction: { type: String, enum: ["IN", "OUT"], required: true },
    provider: { type: String, required: true },
    mode: { type: String, enum: ["test", "live"], required: true },
    providerOrderId: String,
    providerPaymentId: String,
    paymentSessionId: String,
    amountMinor: integer,
    currency: { type: String, default: "INR" },
    method: { type: String, required: true },
    status: { type: String, enum: PAYMENT_STATES, default: "CREATED" },
    settlementStatus: {
      type: String,
      enum: ["NOT_APPLICABLE", "PENDING", "PROCESSED", "BANK_RECONCILED"],
      default: "NOT_APPLICABLE",
    },
    reconciliationStatus: {
      type: String,
      enum: [
        "MATCHED",
        "UNMATCHED",
        "PARTIAL",
        "AMOUNT_MISMATCH",
        "MISSING_IN_ERP",
        "MISSING_IN_GATEWAY",
        "REQUIRES_REVIEW",
      ],
      default: "UNMATCHED",
    },
    initiatedBy: id,
    confirmedBy: mongoose.Schema.Types.ObjectId,
    confirmedAt: Date,
    failureCode: String,
    evidenceReference: text,
    idempotencyKey: { ...text, required: true },
    fingerprint: text,
    reservationReleased: { type: Boolean, default: false },
  },
  [
    [{ organizationId: 1, idempotencyKey: 1 }, { unique: true }],
    [
      { organizationId: 1, provider: 1, mode: 1, providerOrderId: 1 },
      {
        unique: true,
        partialFilterExpression: { providerOrderId: { $type: "string" } },
      },
    ],
  ],
);
export const Ledger = model(
  "LedgerEntry",
  {
    transactionId: id,
    documentId: id,
    amountMinor: integer,
    currency: String,
    debitAccount: String,
    creditAccount: String,
    reference: text,
  },
  [[{ transactionId: 1 }, { unique: true }]],
);
export const WebhookEvent = model(
  "WebhookEvent",
  { provider: String, mode: String, eventId: String, transactionId: id },
  [[{ organizationId: 1, provider: 1, mode: 1, eventId: 1 }, { unique: true }]],
);
export const Audit = model("AuditEvent", {
  actorId: mongoose.Schema.Types.ObjectId,
  action: { type: String, required: true },
  referenceId: mongoose.Schema.Types.ObjectId,
  details: { type: mongoose.Schema.Types.Mixed },
});
export const Notification = model("Notification", {
  event: String,
  referenceId: id,
  readBy: [mongoose.Schema.Types.ObjectId],
});
export const Refund = model(
  "RefundRequest",
  {
    transactionId: id,
    amountMinor: integer,
    reason: text,
    requestedBy: id,
    approvedBy: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "PROCESSING",
        "SUCCESS",
        "FAILED",
      ],
      default: "REQUESTED",
    },
    providerRefundId: String,
    idempotencyKey: text,
  },
  [[{ organizationId: 1, idempotencyKey: 1 }, { unique: true }]],
);
export const Beneficiary = model("Beneficiary", {
  partyId: id,
  encryptedDetails: { type: String, select: false },
  maskedAccount: String,
  verificationStatus: {
    type: String,
    enum: ["PENDING", "VERIFIED", "REJECTED"],
    default: "PENDING",
  },
  createdBy: id,
});
export const PayoutRequest = model(
  "PayoutRequest",
  {
    documentId: id,
    beneficiaryId: id,
    amountMinor: integer,
    requestedBy: id,
    approvedBy: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "PROCESSING",
        "SUCCESS",
        "FAILED",
        "REVERSED",
      ],
      default: "REQUESTED",
    },
    idempotencyKey: text,
  },
  [[{ organizationId: 1, idempotencyKey: 1 }, { unique: true }]],
);
export const allModels = [
  Organization,
  Party,
  Product,
  Warehouse,
  Balance,
  Movement,
  Document,
  Processing,
  Transaction,
  Ledger,
  WebhookEvent,
  Audit,
  Notification,
  Refund,
  Beneficiary,
  PayoutRequest,
];
