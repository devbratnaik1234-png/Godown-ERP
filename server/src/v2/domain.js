import { createHash } from "node:crypto";
export class AppError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
export function assert(condition, code, status = 400) {
  if (!condition) throw new AppError(code, status);
}
export const money = (value) => {
  assert(
    typeof value === "string" && /^\d{1,12}(\.\d{1,2})?$/.test(value),
    "INVALID_AMOUNT",
  );
  const [whole, fraction = ""] = value.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  assert(Number.isSafeInteger(amount) && amount > 0, "INVALID_AMOUNT");
  return amount;
};
export const fingerprint = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function calculateTotal(grams, rateMinor) {
  const total = (BigInt(grams) * BigInt(rateMinor) + 500n) / 1000n;
  assert(
    total > 0n && total <= BigInt(Number.MAX_SAFE_INTEGER),
    "INVALID_AMOUNT",
  );
  return Number(total);
}
export function validateConfirmation(tx, event) {
  assert(tx.providerOrderId === event.orderId, "ORDER_MISMATCH");
  assert(tx.amountMinor === event.amountMinor, "AMOUNT_MISMATCH");
  assert(tx.currency === event.currency, "CURRENCY_MISMATCH");
  assert(event.status === "SUCCESS" && event.paymentId, "PAYMENT_NOT_VERIFIED");
}
export const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
export function allow(...roles) {
  return (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(new AppError("FORBIDDEN", 403));
}
export const financeRoles = ["admin", "manager", "accountant"];
export const operationalRoles = ["admin", "manager", "operator"];
export function indiaDayRange(day) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(day), "INVALID_DATE");
  const start = new Date(`${day}T00:00:00+05:30`);
  assert(
    !Number.isNaN(+start) &&
      new Date(+start + 19800000).toISOString().slice(0, 10) === day,
    "INVALID_DATE",
  );
  return { $gte: start, $lt: new Date(+start + 86400000) };
}
