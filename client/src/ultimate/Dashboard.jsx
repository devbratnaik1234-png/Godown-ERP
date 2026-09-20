import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Warehouse,
  ShoppingBag,
  IndianRupee,
  Users,
  Sparkles,
} from "lucide-react";
import { v2 } from "./api";
import { formatMoney, formatNumber, formatDate } from "../i18n";
import { Loading, ErrorNotice, Empty, LanguageSelect } from "./components";
export default function Dashboard({ report = false }) {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null),
    [stock, setStock] = useState([]),
    [error, setError] = useState(null),
    [language, setLanguage] = useState(i18n.language),
    [day, setDay] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([v2(`/summary${day ? "?day=" + day : ""}`), v2("/inventory")])
      .then(([d, s]) => {
        if (active) {
          setData(d);
          setStock(s.items);
        }
      })
      .catch((e) => active && setError(e));
    return () => {
      active = false;
    };
  }, [day]);
  const lang = report ? language : i18n.language;
  const translate = i18n.getFixedT(lang);
  if (error) return <ErrorNotice error={error} />;
  if (!data) return <Loading />;
  const purchase = data.documents.find((d) => d._id === "PURCHASE");
  const sale = data.documents.find((d) => d._id === "SALE");
  const cards = [
    {
      label: "dashboard.stock",
      value: formatNumber(data.stockGrams / 1000, lang) + " kg",
      icon: Warehouse,
    },
    {
      label: "dashboard.procured",
      value: formatNumber((purchase?.quantityGrams || 0) / 1000, lang) + " kg",
      icon: ShoppingBag,
    },
    ...(data.financialAccess
      ? [
          {
            label: "dashboard.payable",
            value: formatMoney(purchase?.outstandingMinor || 0, lang),
            icon: IndianRupee,
          },
          {
            label: "dashboard.receivable",
            value: formatMoney(sale?.outstandingMinor || 0, lang),
            icon: IndianRupee,
          },
        ]
      : [
          {
            label: "kinds.FARMER",
            value: formatNumber(data.farmers, lang),
            icon: Users,
          },
        ]),
  ];
  return (
    <section className={`page ${report ? "report-page" : ""}`}>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {t(report ? "nav.reports" : "nav.workspace")}
          </p>
          <h1>{t(report ? "reports.summary" : "dashboard.title")}</h1>
          <p className="subtle">{t("dashboard.subtitle")}</p>
        </div>
        <div className="print-controls">
          {report && (
            <>
              <LanguageSelect value={language} onChange={setLanguage} />
              <button
                className="primary"
                onClick={async () => {
                  await document.fonts.ready;
                  window.print();
                }}
              >
                {t("common.print")}
              </button>
            </>
          )}
          <label className="date-filter">
            {t("fields.date")}
            <input
              type="date"
              value={day}
              onChange={(e) => {
                setData(null);
                setError(null);
                setDay(e.target.value);
              }}
            />
          </label>
          <button
            onClick={() => {
              if (day) {
                setData(null);
                setError(null);
                setDay("");
              }
            }}
          >
            {t("common.allTime")}
          </button>
        </div>
      </div>
      <div className={report ? "printable" : ""} lang={lang}>
        {report && <h2>PaddySync · {translate("reports.summary")}</h2>}
        <p className="subtle small">
          {day
            ? formatDate(day + "T12:00:00+05:30", lang)
            : translate("common.allTime")}{" "}
          · {translate("dashboard.asOf", { time: formatDate(data.asOf, lang) })}
        </p>
        <div className="metrics">
          {cards.map(({ label, value, icon: Icon }) => (
            <article className="metric" key={label}>
              <div>
                <span>{translate(label)}</span>
                <Icon size={20} />
              </div>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <div className="dashboard-grid">
          <article className="panel stock-panel">
            <div className="panel-heading">
              <h2>{translate("dashboard.stockMix")}</h2>
              <Link to="/inventory" aria-label={t("nav.inventory")}>
                <ArrowUpRight size={20} />
              </Link>
            </div>
            {stock.length ? (
              <div className="stock-bars">
                {stock.slice(0, 8).map((row) => (
                  <div key={row._id}>
                    <div>
                      <span>{row.productName}</span>
                      <strong>
                        {formatNumber(row.quantityGrams / 1000, lang)} kg
                      </strong>
                    </div>
                    <div className="bar-track">
                      <div
                        style={{
                          width: `${Math.max(1, (100 * row.quantityGrams) / Math.max(...stock.map((s) => s.quantityGrams), 1))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </article>
          <article className="panel collections">
            <h2>{translate("dashboard.collections")}</h2>
            <strong>
              {data.financialAccess
                ? formatMoney(
                    data.payments
                      .filter((p) => p._id.direction === "IN")
                      .reduce((n, p) => n + p.amountMinor, 0),
                    lang,
                  )
                : "—"}
            </strong>
            <div className="collection-list">
              {data.payments.map((p) => (
                <div key={p._id.direction + p._id.method}>
                  <span>
                    {translate(`payment.${p._id.direction}`)} ·{" "}
                    {translate(`payment.${p._id.method}`)}
                  </span>
                  <b>{formatMoney(p.amountMinor, lang)}</b>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
      {!report && (
        <>
          <div className="quick-grid">
            <div>
              <h2>{t("dashboard.quick")}</h2>
              <p className="subtle">{t("dashboard.setup")}</p>
              <div className="quick-links">
                {[
                  "parties",
                  "products",
                  "warehouses",
                  "purchases",
                  "sales",
                ].map((path) => (
                  <Link to={"/" + path} key={path}>
                    {t(`nav.${path}`)}
                    <ArrowUpRight size={16} />
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/paddypal" className="pal-card">
              <Sparkles />
              <div>
                <h2>PaddyPal</h2>
                <p>{t("ai.greeting")}</p>
              </div>
              <ArrowUpRight />
            </Link>
          </div>
          <p className="notice small">{t("dashboard.newCore")}</p>
        </>
      )}
    </section>
  );
}
export function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState(null),
    [warehouses, setWarehouses] = useState([]),
    [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    Promise.all([v2("/inventory"), v2("/warehouses?limit=100")])
      .then(([s, w]) => {
        if (active) {
          setItems(s.items);
          setWarehouses(w.items);
        }
      })
      .catch((e) => active && setError(e));
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="page">
      <div className="page-heading">
        <h1>{t("nav.inventory")}</h1>
        <Link className="primary" to="/purchases">
          {t("nav.purchases")}
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <ErrorNotice error={error} />
      <div className="panel">
        {!items ? (
          <Loading />
        ) : !items.length ? (
          <Empty />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {["productId", "warehouseId", "quantityKg"].map((k) => (
                    <th key={k}>{t("fields." + k)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row._id}>
                    <td>{row.productName}</td>
                    <td>
                      {warehouses.find((w) => w._id === row.warehouseId)
                        ?.name || row.warehouseId}
                    </td>
                    <td>{formatNumber(row.quantityGrams / 1000)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
