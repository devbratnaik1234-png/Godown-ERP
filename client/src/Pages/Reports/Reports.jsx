import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ShoppingCart,
  BadgeIndianRupee,
  Wallet,
  Scale,
  FileText,
  Download,
  Printer,
  RotateCcw,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { api } from "../../api";

function Reports() {
  const [purchases, setPurchases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reportType, setReportType] = useState("Overall Report");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setError("");
        const [purchaseData, paymentData] = await Promise.all([
          api.list("purchases"),
          api.list("payments"),
        ]);
        setPurchases(purchaseData);
        setPayments(paymentData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toDateKey = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const allRows = useMemo(() => {
    const purchaseRows = purchases.map((item) => ({
      id: item._id,
      date: item.date,
      dateKey: toDateKey(item.date),
      category: "Purchase",
      reference: item.purchaseId || "-",
      party: item.farmer,
      quantity: Number(item.quantity || 0),
      amount: Number(item.total || 0),
      status: "Recorded",
    }));

    const paymentRows = payments.map((item) => ({
      id: item._id,
      date: item.date,
      dateKey: toDateKey(item.date),
      category: "Payment",
      reference: item.method || "-",
      party: item.farmer,
      quantity: 0,
      amount: Number(item.amount || 0),
      status: item.status || "-",
    }));

    return [...purchaseRows, ...paymentRows].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [purchases, payments]);

  const filteredData = useMemo(() => {
    return allRows.filter((item) => {
      if (reportType === "Purchase Report" && item.category !== "Purchase") return false;
      if (reportType === "Payment Report" && item.category !== "Payment") return false;
      if (appliedFromDate && item.dateKey < appliedFromDate) return false;
      if (appliedToDate && item.dateKey > appliedToDate) return false;
      return true;
    });
  }, [allRows, reportType, appliedFromDate, appliedToDate]);

  const generateReport = () => {
    if (fromDate && toDate && fromDate > toDate) {
      alert("From Date cannot be greater than To Date.");
      return;
    }
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const resetReport = () => {
    setReportType("Overall Report");
    setFromDate("");
    setToDate("");
    setAppliedFromDate("");
    setAppliedToDate("");
  };

  const filteredPurchaseRows = filteredData.filter((item) => item.category === "Purchase");
  const filteredPaymentRows = filteredData.filter((item) => item.category === "Payment");

  const totalPurchase = filteredPurchaseRows.reduce((sum, item) => sum + item.amount, 0);
  const totalPayments = filteredPaymentRows
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingPayments = filteredPaymentRows
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = filteredPurchaseRows.reduce((sum, item) => sum + item.quantity, 0);

  const reportCards = [
    {
      title: "Purchase Value",
      value: formatMoney(totalPurchase),
      subtitle: "Recorded paddy purchases",
      icon: ShoppingCart,
      iconStyle: "bg-blue-100 text-blue-600",
    },
    {
      title: "Paid Amount",
      value: formatMoney(totalPayments),
      subtitle: "Completed farmer payments",
      icon: BadgeIndianRupee,
      iconStyle: "bg-green-100 text-green-600",
    },
    {
      title: "Pending Payment",
      value: formatMoney(pendingPayments),
      subtitle: "Amount still pending",
      icon: Wallet,
      iconStyle: "bg-orange-100 text-orange-600",
    },
    {
      title: "Purchased Quantity",
      value: `${totalQuantity.toLocaleString("en-IN")} Qt`,
      subtitle: "Total paddy quantity",
      icon: Scale,
      iconStyle: "bg-purple-100 text-purple-600",
    },
  ];

  const chartData = useMemo(() => {
    const grouped = {};

    filteredData.forEach((item) => {
      if (!item.dateKey) return;
      if (!grouped[item.dateKey]) {
        grouped[item.dateKey] = {
          date: item.dateKey,
          purchase: 0,
          payment: 0,
        };
      }

      if (item.category === "Purchase") grouped[item.dateKey].purchase += item.amount;
      if (item.category === "Payment" && item.status === "Paid") grouped[item.dateKey].payment += item.amount;
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        label: new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      }));
  }, [filteredData]);

  const exportCSV = () => {
    if (filteredData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Date", "Category", "Reference", "Farmer", "Quantity", "Amount", "Status"];
    const rows = filteredData.map((item) => [
      formatDate(item.date),
      item.category,
      item.reference,
      item.party,
      item.quantity,
      item.amount,
      item.status,
    ]);

    const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Godown-ERP-Report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (filteredData.length === 0) {
      alert("No report data available.");
      return;
    }

    const rows = filteredData
      .map(
        (item) => `
          <tr>
            <td>${formatDate(item.date)}</td>
            <td>${item.category}</td>
            <td>${item.reference}</td>
            <td>${item.party}</td>
            <td>${item.quantity ? `${item.quantity} Qt` : "-"}</td>
            <td>${formatMoney(item.amount)}</td>
            <td>${item.status}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the report.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Godown ERP Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
            h1 { color: #166534; margin-bottom: 4px; }
            p { color: #64748b; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 24px 0; }
            .card { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
            .label { color: #64748b; font-size: 12px; }
            .value { font-weight: bold; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Godown ERP</h1>
          <p>${reportType}</p>
          <div class="summary">
            <div class="card"><div class="label">Purchase Value</div><div class="value">${formatMoney(totalPurchase)}</div></div>
            <div class="card"><div class="label">Paid Amount</div><div class="value">${formatMoney(totalPayments)}</div></div>
            <div class="card"><div class="label">Pending Payment</div><div class="value">${formatMoney(pendingPayments)}</div></div>
            <div class="card"><div class="label">Purchased Quantity</div><div class="value">${totalQuantity} Qt</div></div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Reference</th><th>Farmer</th><th>Quantity</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="bg-white rounded-xl p-6 shadow">Loading reports...</div>;
  }

  return (
    <div className="pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">
            Live purchase and payment analytics from the Godown ERP database.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-lg">
          <CalendarDays size={18} />
          Live Database Report
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <h2 className="text-2xl font-bold text-slate-800 mt-3">{card.value}</h2>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconStyle}`}>
                  <Icon size={22} />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <FileText size={21} /> Generate Report
            </h2>
            <p className="text-sm text-slate-400 mt-1">Filter live records by type and date.</p>
          </div>
          <button
            onClick={resetReport}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            <RotateCcw size={16} /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option>Overall Report</option>
              <option>Purchase Report</option>
              <option>Payment Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">{reportType}</h2>
            <p className="text-sm text-slate-400 mt-1">{filteredData.length} live records</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            >
              <Download size={17} /> Export CSV
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
            >
              <Printer size={17} /> Print / PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Farmer</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={`${item.category}-${item.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-3 font-medium text-slate-700">{formatDate(item.date)}</td>
                    <td className="py-4 px-3 text-slate-600">{item.category}</td>
                    <td className="py-4 px-3 text-slate-600">{item.reference}</td>
                    <td className="py-4 px-3 text-slate-600">{item.party}</td>
                    <td className="py-4 px-3 text-slate-600">{item.quantity ? `${item.quantity} Qt` : "-"}</td>
                    <td className="py-4 px-3 font-semibold text-slate-700">{formatMoney(item.amount)}</td>
                    <td className="py-4 px-3 text-slate-600">{item.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-14 text-center text-slate-400">
                    No report data found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BarChart3 size={21} /> Purchase vs Paid Amount
          </h2>
          <p className="text-sm text-slate-400 mt-1">Daily value comparison for the selected period.</p>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(value)} />
                <Legend />
                <Bar dataKey="purchase" name="Purchase" fill="#2563eb" radius={[5, 5, 0, 0]} />
                <Bar dataKey="payment" name="Paid" fill="#16a34a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-400">No chart data available.</div>
        )}
      </div>
    </div>
  );
}

export default Reports;
