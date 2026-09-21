import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Download,
  Check,
  Receipt,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";
import { request, v2 } from "./api";
import { resources, payload } from "./resources";
import { formatMoney, formatNumber, formatDate } from "../i18n";
import {
  ErrorNotice,
  Loading,
  Empty,
  Modal,
  Badge,
  LanguageSelect,
} from "./components";
const labelKey = (key) =>
  ["email", "password"].includes(key) ? `login.${key}` : `fields.${key}`;
const sourceFor = {
  partyId: "parties",
  productId: "products",
  warehouseId: "warehouses",
  inputProductId: "products",
  outputProductId: "products",
  documentId: "documents",
  transactionId: "transactions",
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
export default function ResourcePage({ resource, user }) {
  const config = resources[resource];
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]),
    [refs, setRefs] = useState({}),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [query, setQuery] = useState(""),
    [error, setError] = useState(null),
    [loading, setLoading] = useState(true),
    [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState(null),
    [editId, setEditId] = useState(null),
    [key, setKey] = useState(null),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(null),
    [removeTarget, setRemoveTarget] = useState(null),
    [evidence, setEvidence] = useState(""),
    [receipt, setReceipt] = useState(null),
    [reportLanguage, setReportLanguage] = useState(i18n.language);
  const masterResource = ["parties", "products", "warehouses"].includes(resource);
  const canWrite =
    !config.readonly &&
    (config.admin
      ? user.role === "admin"
      : config.finance
        ? ["admin", "manager", "accountant"].includes(user.role)
        : ["admin", "manager", "operator"].includes(user.role));
  useEffect(() => {
    let active = true;
    const fetcher = config.legacy ? request : v2;
    fetcher(
      `${config.path}?page=${page}&limit=25&q=${encodeURIComponent(query)}${config.query || ""}`,
    )
      .then((result) => {
        if (active) {
          setItems(Array.isArray(result) ? result : result.items);
          setTotal(
            Array.isArray(result)
              ? result.length
              : result.total || result.items.length,
          );
        }
      })
      .catch((e) => active && setError(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [config, page, query, refresh]);
  useEffect(() => {
    let active = true;
    const sources = [
      ...new Set(
        (config.fields || [])
          .filter(
            (f) =>
              ![
                "text",
                "tel",
                "email",
                "password",
                "number",
                "date",
                "select",
              ].includes(f.type),
          )
          .map((f) => f.type),
      ),
    ];
    Promise.all(
      sources.map(async (source) => [
        source,
        (await v2(`/${source}?limit=100`)).items,
      ]),
    )
      .then((results) => active && setRefs(Object.fromEntries(results)))
      .catch((e) => active && setError(e));
    return () => {
      active = false;
    };
  }, [config, refresh]);
  const checkout = async (row) => {
    setError(null);
    try {
      const { load } = await import("@cashfreepayments/cashfree-js");
      const gateway = await load({
        mode: row.mode === "test" ? "sandbox" : "production",
      });
      await gateway.checkout({
        paymentSessionId: row.paymentSessionId,
        redirectTarget: "_modal",
      });
      setRefresh((x) => x + 1);
    } catch {
      setError({ code: "PROVIDER_UNAVAILABLE" });
    }
  };
  const openForm = (row = null) => {
    setError(null);
    setEditId(row?._id || null);
    setForm(
      Object.fromEntries(
        config.fields.map((f) => [
          f.key,
          row?.[f.key] ??
            (f.type === "select" ? f.options[0] : f.type === "date" ? today() : ""),
        ]),
      ),
    );
    setKey(crypto.randomUUID());
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (config.legacy ? request : v2)(
        editId ? `${config.path}/${editId}` : config.path,
        {
          method: editId ? "PUT" : "POST",
          body: payload(resource, form),
          ...(!editId ? { key } : {}),
        },
      );
      setForm(null);
      setEditId(null);
      setRefresh((x) => x + 1);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const cell = (row, column, lang = i18n.language) => {
    if (column === "amount") return formatMoney(row.amountMinor, lang);
    if (column === "outstanding")
      return formatMoney(row.amountMinor - row.paidMinor, lang);
    if (column === "quantityKg")
      return formatNumber(row.quantityGrams / 1000, lang);
    if (column === "inputKg") return formatNumber(row.inputGrams / 1000, lang);
    if (column === "outputKg")
      return formatNumber(row.outputGrams / 1000, lang);
    if (column === "loss") return formatNumber(row.lossGrams / 1000, lang);
    if (column === "dailyWage") return formatMoney(row.dailyWage * 100, lang);
    if (["date", "createdAt"].includes(column))
      return row[column] ? formatDate(row[column], lang) : "—";
    if (sourceFor[column]) {
      const match = refs[sourceFor[column]]?.find((x) => x._id === row[column]);
      return match?.name || match?.reference || row[column];
    }
    const value =
      column === "reconciliation"
        ? row.reconciliationStatus
        : column === "settlement"
          ? row.settlementStatus
          : column === "type" && row.direction
            ? row.direction
            : row[column];
    const ns =
      ["provider", "method", "mode"].includes(column) ||
      ["IN", "OUT"].includes(value)
        ? "payment"
        : ["kind", "role", "type"].includes(column) || config.legacy
          ? "kinds"
          : "status";
    return i18n.exists(`${ns}.${value}`)
      ? i18n.getFixedT(lang)(`${ns}.${value}`)
      : (value ?? "—");
  };
  const csv = () => {
    const escape = (x) =>
      `"${String(x ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const data = [
      config.columns.map((c) => t(labelKey(c))),
      ...items.map((row) => config.columns.map((c) => cell(row, c))),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + data], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `paddysync-${resource}-${i18n.language}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const act = async (path, body) => {
    setBusy(true);
    setError(null);
    try {
      await v2(path, { method: "POST", body });
      setConfirm(null);
      setRefresh((x) => x + 1);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const loadReceipt = async (row) => {
    setError(null);
    try {
      setReceipt(await v2(`/transactions/${row._id}/receipt`));
      setReportLanguage(i18n.language);
    } catch (e) {
      setError(e);
    }
  };
  const rt = i18n.getFixedT(reportLanguage);
  const second = receipt?.organization.secondaryLanguage;
  const bi = (key) =>
    `${rt(key)}${second && second !== reportLanguage ? " / " + i18n.getFixedT(second)(key) : ""}`;
  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{t("nav.operations")}</p>
          <h1>{t(config.title)}</h1>
        </div>
        {canWrite && (
          <button className="primary" onClick={openForm}>
            <Plus size={18} />
            {t("common.add")}
          </button>
        )}
      </div>
      {config.help && <p className="notice">{t(config.help)}</p>}
      <ErrorNotice error={error} />
      <div className="panel">
        <div className="table-toolbar">
          <label className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t("common.search")}
              aria-label={t("common.search")}
            />
          </label>
          <button className="secondary" onClick={csv} disabled={!items.length}>
            <Download size={16} />
            {t("common.export")}
          </button>
        </div>
        <p className="subtle small toolbar-note">{t("reports.scope")}</p>
        {loading ? (
          <Loading />
        ) : !items.length ? (
          <Empty />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {config.columns.map((c) => (
                    <th key={c}>{t(labelKey(c), { defaultValue: c })}</th>
                  ))}
                  {(resource === "payments" || masterResource) && (
                    <th>{t("common.actions")}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row._id}>
                    {config.columns.map((c) => (
                      <td key={c}>
                        {c === "status" ? (
                          <Badge
                            value={row[c]}
                            namespace={config.legacy ? "kinds" : "status"}
                          />
                        ) : (
                          cell(row, c)
                        )}
                      </td>
                    ))}
                    {(resource === "payments" || masterResource) && (
                      <td>
                        <div className="row-actions">
                          {masterResource && canWrite && (
                            <>
                              <button
                                className="secondary"
                                onClick={() => openForm(row)}
                              >
                                <Pencil size={14} />
                                {t("common.edit")}
                              </button>
                              <button
                                className="text-button danger"
                                disabled={busy}
                                onClick={() => setRemoveTarget(row)}
                              >
                                <Trash2 size={14} />
                                {t("common.delete")}
                              </button>
                            </>
                          )}
                          {resource === "payments" &&
                          {row.provider === "manual" &&
                            ["CREATED", "PENDING"].includes(row.status) &&
                            canWrite && (
                              <>
                                <button
                                  className="secondary"
                                  onClick={() => {
                                    setConfirm(row);
                                    setEvidence("");
                                  }}
                                >
                                  <Check size={14} />
                                  {t("common.confirm")}
                                </button>
                                <button
                                  className="text-button"
                                  disabled={busy}
                                  onClick={() =>
                                    act(`/transactions/${row._id}/cancel`)
                                  }
                                >
                                  {t("common.cancel")}
                                </button>
                              </>
                            )}
                          {row.status === "SUCCESS" && (
                            <button
                              className="secondary"
                              onClick={() => loadReceipt(row)}
                            >
                              <Receipt size={14} />
                              {t("payment.receipt")}
                            </button>
                          )}
                          {row.paymentSessionId &&
                            ["CREATED", "PENDING", "PROCESSING"].includes(
                              row.status,
                            ) && (
                              <button
                                className="primary"
                                onClick={() => checkout(row)}
                              >
                                {t("payment.checkout")}
                              </button>
                            )}
                          {row.provider !== "manual" && (
                            <button
                              className="secondary"
                              disabled={busy}
                              onClick={() =>
                                act(`/transactions/${row._id}/reconcile`)
                              }
                            >
                              <RefreshCw size={14} />
                              {t("payment.reconcile")}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span>{t("common.page", { page, total })}</span>
          <div>
            <button
              disabled={page === 1 || config.legacy}
              onClick={() => setPage((x) => x - 1)}
            >
              {t("common.previous")}
            </button>
            <button
              disabled={page * 25 >= total || config.legacy}
              onClick={() => setPage((x) => x + 1)}
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      </div>
      {form && (
        <Modal
          title={t(editId ? "common.edit" : "common.add")}
          onClose={() => !busy && (setForm(null), setEditId(null))}
        >
          <form onSubmit={submit}>
            <ErrorNotice error={error} />
            <div className="form-grid">
              {config.fields.map((f) => (
                <label key={f.key}>
                  {t(labelKey(f.key))}
                  {f.type === "select" ? (
                    <select
                      required
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    >
                      {f.options.map((value) => (
                        <option key={value} value={value}>
                          {t(
                            `${["provider", "method"].includes(f.key) ? "payment" : "kinds"}.${value}`,
                          )}
                        </option>
                      ))}
                    </select>
                  ) : refs[f.type] ? (
                    <select
                      required
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {refs[f.type]
                        .filter(
                          (row) =>
                            f.key !== "partyId" ||
                            (config.kind === "SALE"
                              ? row.kind === "CUSTOMER"
                              : ["FARMER", "VENDOR"].includes(row.kind)),
                        )
                        .filter(
                          (row) =>
                            f.key !== "inputProductId" || row.kind === "PADDY",
                        )
                        .filter(
                          (row) =>
                            f.key !== "outputProductId" || row.kind === "RICE",
                        )
                        .map((row) => (
                          <option key={row._id} value={row._id}>
                            {row.name || row.reference || row._id}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      required={f.required}
                      type={
                        [
                          "parties",
                          "products",
                          "warehouses",
                          "documents",
                          "transactions",
                        ].includes(f.type)
                          ? "text"
                          : f.type
                      }
                      min={f.type === "number" ? "0" : undefined}
                      step={
                        ["quantityKg", "inputKg", "outputKg"].includes(f.key)
                          ? "0.001"
                          : "0.01"
                      }
                      maxLength={f.type === "password" ? 200 : 150}
                      autoComplete={
                        f.type === "password" ? "new-password" : "off"
                      }
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setForm(null)}
                disabled={busy}
              >
                {t("common.cancel")}
              </button>
              <button className="primary" disabled={busy}>
                {t(busy ? "common.loading" : "common.save")}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {removeTarget && (
        <Modal
          title={t("common.delete")}
          onClose={() => !busy && setRemoveTarget(null)}
        >
          <ErrorNotice error={error} />
          <p>{t("common.deleteConfirm")}</p>
          <div className="modal-footer">
            <button
              type="button"
              disabled={busy}
              onClick={() => setRemoveTarget(null)}
            >
              {t("common.cancel")}
            </button>
            <button
              className="primary danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await v2(`${config.path}/${removeTarget._id}`, { method: "DELETE" });
                  setRemoveTarget(null);
                  setRefresh((x) => x + 1);
                } catch (e) {
                  setError(e);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t("common.delete")}
            </button>
          </div>
        </Modal>
      )}
      {confirm && (
        <Modal
          title={t("payment.confirm")}
          onClose={() => !busy && setConfirm(null)}
        >
          <ErrorNotice error={error} />
          <p>{t("payment.confirmHelp")}</p>
          <div className="confirm-amount">
            {formatMoney(confirm.amountMinor)}
            <small>
              {confirm.reference} · {t(`payment.${confirm.direction}`)}
            </small>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(`/transactions/${confirm._id}/confirm`, {
                confirmed: true,
                evidenceReference: evidence,
              });
            }}
          >
            <label>
              {t("fields.evidenceReference")}
              <input
                required
                minLength={5}
                maxLength={300}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </label>
            <div className="modal-footer">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm(null)}
              >
                {t("common.cancel")}
              </button>
              <button className="primary" disabled={busy}>
                {t("common.confirm")}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {receipt && (
        <Modal title={t("payment.receipt")} onClose={() => setReceipt(null)}>
          <div className="print-controls">
            <LanguageSelect
              value={reportLanguage}
              onChange={setReportLanguage}
            />
            <button
              className="primary"
              onClick={async () => {
                await document.fonts.ready;
                window.print();
              }}
            >
              {t("common.print")}
            </button>
          </div>
          <article className="printable" lang={reportLanguage}>
            <p className="brand">PaddySync</p>
            <h2>{bi("payment.receipt")}</h2>
            <h3>{receipt.organization.name}</h3>
            {receipt.transaction.mode === "test" && (
              <p className="notice warning">{rt("payment.testWarning")}</p>
            )}
            <dl>
              {[
                ["fields.reference", receipt.transaction.reference],
                [
                  "fields.transactionId",
                  receipt.transaction.providerPaymentId ||
                    receipt.transaction.evidenceReference,
                ],
                [
                  "fields.amount",
                  formatMoney(receipt.transaction.amountMinor, reportLanguage),
                ],
                [
                  "fields.date",
                  formatDate(receipt.transaction.confirmedAt, reportLanguage),
                ],
                ["fields.method", rt(`payment.${receipt.transaction.method}`)],
                ["fields.documentId", receipt.document.reference],
                ["fields.status", rt("status.SUCCESS")],
              ].map(([key, value]) => (
                <div key={key}>
                  <dt>{bi(key)}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </Modal>
      )}
    </section>
  );
}
