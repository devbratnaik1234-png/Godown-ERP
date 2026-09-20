const field = (key, type = "text", options, required = true) => ({
  key,
  type,
  options,
  required,
});
export const resources = {
  parties: {
    title: "nav.parties",
    path: "/parties",
    fields: [
      field("name"),
      field("kind", "select", [
        "FARMER",
        "CUSTOMER",
        "VENDOR",
        "LABOUR",
        "TRANSPORTER",
      ]),
      field("phone", "tel", null, false),
      field("village", "text", null, false),
    ],
    columns: ["name", "kind", "phone", "village"],
  },
  products: {
    title: "nav.products",
    path: "/products",
    fields: [
      field("name"),
      field("code"),
      field("kind", "select", ["PADDY", "RICE", "BYPRODUCT"]),
    ],
    columns: ["code", "name", "kind"],
  },
  warehouses: {
    title: "nav.warehouses",
    path: "/warehouses",
    fields: [field("name"), field("location", "text", null, false)],
    columns: ["name", "location"],
  },
  purchases: {
    title: "nav.purchases",
    path: "/documents",
    query: "&kind=PURCHASE",
    fields: [
      field("partyId", "parties"),
      field("productId", "products"),
      field("warehouseId", "warehouses"),
      field("quantityKg", "number"),
      field("rate", "number"),
      field("date", "date"),
    ],
    columns: [
      "reference",
      "partyId",
      "productId",
      "quantityKg",
      "amount",
      "outstanding",
      "date",
    ],
    kind: "PURCHASE",
  },
  sales: {
    title: "nav.sales",
    path: "/documents",
    query: "&kind=SALE",
    fields: [
      field("partyId", "parties"),
      field("productId", "products"),
      field("warehouseId", "warehouses"),
      field("quantityKg", "number"),
      field("rate", "number"),
      field("date", "date"),
    ],
    columns: [
      "reference",
      "partyId",
      "productId",
      "quantityKg",
      "amount",
      "outstanding",
      "date",
    ],
    kind: "SALE",
  },
  processing: {
    title: "nav.processing",
    path: "/processing",
    help: "processing.help",
    fields: [
      field("inputProductId", "products"),
      field("outputProductId", "products"),
      field("warehouseId", "warehouses"),
      field("inputKg", "number"),
      field("outputKg", "number"),
    ],
    columns: [
      "reference",
      "inputProductId",
      "outputProductId",
      "inputKg",
      "outputKg",
      "loss",
    ],
  },
  payments: {
    title: "nav.payments",
    path: "/transactions",
    help: "payment.recordHelp",
    finance: true,
    fields: [
      field("documentId", "documents"),
      field("amount", "number"),
      field("provider", "select", ["manual", "cashfree"]),
      field("method", "select", [
        "CASH",
        "MANUAL_BANK",
        "CHEQUE",
        "PAYMENT_LINK",
      ]),
    ],
    columns: [
      "reference",
      "documentId",
      "amount",
      "type",
      "provider",
      "status",
      "mode",
      "reconciliation",
      "settlement",
    ],
  },
  refunds: {
    title: "nav.refunds",
    path: "/refunds",
    help: "payment.refundHelp",
    finance: true,
    fields: [
      field("transactionId", "transactions"),
      field("amount", "number"),
      field("reason"),
    ],
    columns: ["transactionId", "amount", "reason", "status"],
  },
  trucks: {
    title: "nav.trucks",
    path: "/trucks",
    legacy: true,
    fields: [
      field("truckNo"),
      field("driver"),
      field("mobile", "tel", null, false),
      field("farmer", "text", null, false),
      field("quantity", "number"),
      field("type", "select", ["Incoming", "Outgoing"]),
      field("status", "select", ["In Transit", "Completed", "Cancelled"]),
      field("purpose", "text", null, false),
      field("date", "date"),
    ],
    columns: [
      "truckNo",
      "driver",
      "mobile",
      "quantity",
      "type",
      "status",
      "date",
    ],
  },
  labours: {
    title: "nav.labours",
    path: "/labours",
    legacy: true,
    fields: [
      field("labourId"),
      field("name"),
      field("mobile", "tel", null, false),
      field("village", "text", null, false),
      field("workType"),
      field("dailyWage", "number"),
      field("joiningDate", "date"),
      field("status", "select", ["Active", "Inactive"]),
    ],
    columns: ["labourId", "name", "workType", "dailyWage", "status"],
  },
  users: {
    title: "nav.users",
    path: "/users",
    admin: true,
    fields: [
      field("name"),
      field("email", "email"),
      field("password", "password"),
      field("role", "select", [
        "operator",
        "accountant",
        "manager",
        "viewer",
        "admin",
      ]),
    ],
    columns: ["name", "email", "role"],
  },
  audit: {
    title: "nav.audit",
    path: "/audit",
    finance: true,
    readonly: true,
    columns: ["action", "referenceId", "createdAt"],
  },
};
export function decimalUnits(value, places) {
  if (!new RegExp(`^\\d{1,10}(\\.\\d{1,${places}})?$`).test(String(value)))
    throw Object.assign(new Error(), { code: "INVALID_INPUT" });
  const [whole, fraction = ""] = String(value).split(".");
  const amount =
    Number(whole) * 10 ** places + Number(fraction.padEnd(places, "0"));
  if (!Number.isSafeInteger(amount) || amount <= 0)
    throw Object.assign(new Error(), { code: "INVALID_INPUT" });
  return amount;
}
export function payload(resource, values) {
  const data = { ...values };
  if (["purchases", "sales"].includes(resource)) {
    data.kind = resources[resource].kind;
    data.quantityGrams = decimalUnits(data.quantityKg, 3);
    data.rateMinorPerKg = decimalUnits(data.rate, 2);
    delete data.quantityKg;
    delete data.rate;
  }
  if (["payments", "refunds"].includes(resource)) {
    data.amountMinor = decimalUnits(data.amount, 2);
    delete data.amount;
  }
  if (resource === "processing") {
    data.inputGrams = decimalUnits(data.inputKg, 3);
    data.outputGrams = decimalUnits(data.outputKg, 3);
    delete data.inputKg;
    delete data.outputKg;
  }
  for (const key of ["date", "joiningDate"])
    if (data[key])
      data[key] = new Date(`${data[key]}T12:00:00+05:30`).toISOString();
  for (const key of ["quantity", "dailyWage"])
    if (key in data) data[key] = Number(data[key]);
  return data;
}
