import { useState } from "react";

import {
  LineChart,
  Line,
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
  TrendingUp,
  FileText,
  Download,
  Printer,
  RotateCcw,
  CalendarDays,
  BarChart3,
} from "lucide-react";

function Reports() {
  // =====================================================
  // SAMPLE REPORT DATA
  // Later this will come from backend/database
  // =====================================================

  const reportData = [
    {
      date: "2026-08-01",
      displayDate: "01 Aug 2026",
      purchase: 120000,
      sales: 145000,
      labour: 8000,
      transport: 5000,
      profit: 12000,
    },

    {
      date: "2026-08-05",
      displayDate: "05 Aug 2026",
      purchase: 175000,
      sales: 210000,
      labour: 10000,
      transport: 6000,
      profit: 19000,
    },

    {
      date: "2026-08-10",
      displayDate: "10 Aug 2026",
      purchase: 210000,
      sales: 255000,
      labour: 12000,
      transport: 7000,
      profit: 26000,
    },

    {
      date: "2026-08-15",
      displayDate: "15 Aug 2026",
      purchase: 160000,
      sales: 195000,
      labour: 9000,
      transport: 8000,
      profit: 18000,
    },

    {
      date: "2026-08-20",
      displayDate: "20 Aug 2026",
      purchase: 230000,
      sales: 278000,
      labour: 10000,
      transport: 7000,
      profit: 31000,
    },

    {
      date: "2026-08-25",
      displayDate: "25 Aug 2026",
      purchase: 200000,
      sales: 245000,
      labour: 9000,
      transport: 8000,
      profit: 28000,
    },
  ];

  // =====================================================
  // STATES
  // =====================================================

  const [reportType, setReportType] = useState("Overall Report");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [filteredData, setFilteredData] = useState(reportData);

  // =====================================================
  // MONEY FORMATTER
  // =====================================================

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // =====================================================
  // GENERATE REPORT
  // =====================================================

  const generateReport = () => {
    if (fromDate && toDate && fromDate > toDate) {
      alert("From Date cannot be greater than To Date.");
      return;
    }

    let data = [...reportData];

    if (fromDate) {
      data = data.filter((item) => item.date >= fromDate);
    }

    if (toDate) {
      data = data.filter((item) => item.date <= toDate);
    }

    setFilteredData(data);
  };

  // =====================================================
  // RESET FILTER
  // =====================================================

  const resetReport = () => {
    setReportType("Overall Report");

    setFromDate("");

    setToDate("");

    setFilteredData(reportData);
  };

  // =====================================================
  // KPI CALCULATIONS
  // =====================================================

  const totalPurchase = filteredData.reduce(
    (total, item) => total + item.purchase,
    0
  );

  const totalSales = filteredData.reduce(
    (total, item) => total + item.sales,
    0
  );

  const totalLabour = filteredData.reduce(
    (total, item) => total + item.labour,
    0
  );

  const totalTransport = filteredData.reduce(
    (total, item) => total + item.transport,
    0
  );

  const totalExpenses = totalLabour + totalTransport;

  const totalProfit = filteredData.reduce(
    (total, item) => total + item.profit,
    0
  );

  const profitMargin =
    totalSales > 0
      ? ((totalProfit / totalSales) * 100).toFixed(1)
      : 0;

  // =====================================================
  // KPI CARDS
  // =====================================================

  const reportCards = [
    {
      title: "Total Purchase",
      value: formatMoney(totalPurchase),
      subtitle: "Paddy purchase value",
      icon: ShoppingCart,
      iconStyle: "bg-blue-100 text-blue-600",
    },

    {
      title: "Total Sales",
      value: formatMoney(totalSales),
      subtitle: "Total sales revenue",
      icon: BadgeIndianRupee,
      iconStyle: "bg-purple-100 text-purple-600",
    },

    {
      title: "Total Expenses",
      value: formatMoney(totalExpenses),
      subtitle: "Labour + Transport",
      icon: Wallet,
      iconStyle: "bg-orange-100 text-orange-600",
    },

    {
      title: "Net Profit",
      value: formatMoney(totalProfit),
      subtitle: `${profitMargin}% profit margin`,
      icon: TrendingUp,
      iconStyle: "bg-green-100 text-green-600",
    },
  ];

  // =====================================================
  // LINE CHART DATA
  // =====================================================

  const profitData = filteredData.map((item) => ({
    date: item.displayDate.substring(0, 6),
    profit: item.profit,
  }));

  // =====================================================
  // PURCHASE VS SALES CHART DATA
  // =====================================================

  const comparisonData = filteredData.map((item) => ({
    date: item.displayDate.substring(0, 6),
    purchase: item.purchase,
    sales: item.sales,
  }));

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const exportCSV = () => {
    if (filteredData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Date",
      "Purchase",
      "Sales",
      "Labour Cost",
      "Transport Cost",
      "Profit",
    ];

    const rows = filteredData.map((item) => [
      item.displayDate,
      item.purchase,
      item.sales,
      item.labour,
      item.transport,
      item.profit,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "PaddySync-Report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // PRINT / SAVE PDF
  // =====================================================

  const downloadPDF = () => {
    if (filteredData.length === 0) {
      alert("No report data available.");
      return;
    }

    const rows = filteredData
      .map(
        (item) => `
          <tr>
            <td>${item.displayDate}</td>
            <td>${formatMoney(item.purchase)}</td>
            <td>${formatMoney(item.sales)}</td>
            <td>${formatMoney(item.labour)}</td>
            <td>${formatMoney(item.transport)}</td>
            <td>${formatMoney(item.profit)}</td>
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

          <title>PaddySync Report</title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #1e293b;
            }

            h1 {
              margin-bottom: 4px;
              color: #166534;
            }

            .subtitle {
              color: #64748b;
              margin-bottom: 25px;
            }

            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 30px;
            }

            .card {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
            }

            .card-title {
              font-size: 12px;
              color: #64748b;
            }

            .card-value {
              font-size: 19px;
              font-weight: bold;
              margin-top: 7px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              background: #f1f5f9;
            }

            th,
            td {
              border: 1px solid #e2e8f0;
              padding: 10px;
              text-align: left;
              font-size: 13px;
            }

            .footer {
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 12px;
              color: #64748b;
            }

            @media print {

              body {
                padding: 10px;
              }

            }

          </style>

        </head>

        <body>

          <h1>PaddySync</h1>

          <div class="subtitle">

            Paddy Management System • ${reportType}

          </div>

          <div class="summary">

            <div class="card">

              <div class="card-title">
                Total Purchase
              </div>

              <div class="card-value">
                ${formatMoney(totalPurchase)}
              </div>

            </div>

            <div class="card">

              <div class="card-title">
                Total Sales
              </div>

              <div class="card-value">
                ${formatMoney(totalSales)}
              </div>

            </div>

            <div class="card">

              <div class="card-title">
                Total Expenses
              </div>

              <div class="card-value">
                ${formatMoney(totalExpenses)}
              </div>

            </div>

            <div class="card">

              <div class="card-title">
                Net Profit
              </div>

              <div class="card-value">
                ${formatMoney(totalProfit)}
              </div>

            </div>

          </div>

          <h2>Transaction Summary</h2>

          <table>

            <thead>

              <tr>

                <th>Date</th>

                <th>Purchase</th>

                <th>Sales</th>

                <th>Labour</th>

                <th>Transport</th>

                <th>Profit</th>

              </tr>

            </thead>

            <tbody>

              ${rows}

            </tbody>

          </table>

          <div class="footer">

            Generated from PaddySync ERP

          </div>

          <script>

            window.onload = () => {
              window.print();
            };

          </script>

        </body>

      </html>
    `);

    printWindow.document.close();
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="pb-10">

      {/* ================================================= */}
      {/* PAGE HEADING */}
      {/* ================================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Reports & Analytics
          </h1>

          <p className="text-slate-500 mt-1">
            Monitor your godown's financial performance and business activity.
          </p>

        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-lg">

          <CalendarDays size={18} />

          August 2026

        </div>

      </div>

      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

        {reportCards.map((card, index) => {

          const Icon = card.icon;

          return (

            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="text-2xl font-bold text-slate-800 mt-3">
                    {card.value}
                  </h2>

                </div>

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconStyle}`}
                >

                  <Icon size={22} />

                </div>

              </div>

              <p className="text-xs text-slate-400 mt-4">
                {card.subtitle}
              </p>

            </div>

          );

        })}

      </div>

      {/* ================================================= */}
      {/* FILTER */}
      {/* ================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

          <div>

            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">

              <FileText size={21} />

              Generate Report

            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Filter your financial report by date and category.
            </p>

          </div>

          <button
            onClick={resetReport}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition"
          >

            <RotateCcw size={16} />

            Reset Filters

          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Report Type
            </label>

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            >

              <option>Overall Report</option>

              <option>Purchase Report</option>

              <option>Sales Report</option>

              <option>Expense Report</option>

              <option>Profit Report</option>

            </select>

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              To Date
            </label>

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

      {/* ================================================= */}
      {/* TABLE */}
      {/* ================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              {reportType}
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              {filteredData.length} transaction records
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition"
            >

              <Download size={17} />

              Export CSV

            </button>

            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
            >

              <Printer size={17} />

              Print / PDF

            </button>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b border-slate-200 text-sm text-slate-500">

                <th className="py-3 px-3">
                  Date
                </th>

                <th className="py-3 px-3">
                  Purchase
                </th>

                <th className="py-3 px-3">
                  Sales
                </th>

                <th className="py-3 px-3">
                  Labour
                </th>

                <th className="py-3 px-3">
                  Transport
                </th>

                <th className="py-3 px-3">
                  Profit
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.length > 0 ? (

                filteredData.map((item, index) => (

                  <tr
                    key={index}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >

                    <td className="py-4 px-3 font-medium text-slate-700">
                      {item.displayDate}
                    </td>

                    <td className="py-4 px-3 text-slate-600">
                      {formatMoney(item.purchase)}
                    </td>

                    <td className="py-4 px-3 text-slate-600">
                      {formatMoney(item.sales)}
                    </td>

                    <td className="py-4 px-3 text-slate-600">
                      {formatMoney(item.labour)}
                    </td>

                    <td className="py-4 px-3 text-slate-600">
                      {formatMoney(item.transport)}
                    </td>

                    <td className="py-4 px-3 font-semibold text-green-600">
                      {formatMoney(item.profit)}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="py-14 text-center text-slate-400"
                  >

                    No report data found for the selected date range.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================================================= */}
      {/* CHART GRID */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">

        {/* PROFIT CHART */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">

              <TrendingUp size={21} />

              Profit Overview

            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Profit trend for selected period.
            </p>

          </div>

          {profitData.length > 0 ? (

            <div className="w-full h-80">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={profitData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) => [
                      formatMoney(value),
                      "Profit",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 7 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="h-80 flex items-center justify-center text-slate-400">
              No chart data available.
            </div>

          )}

        </div>

        {/* PURCHASE VS SALES */}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">

              <BarChart3 size={21} />

              Purchase vs Sales

            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Compare purchase cost against sales revenue.
            </p>

          </div>

          {comparisonData.length > 0 ? (

            <div className="w-full h-80">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={comparisonData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatMoney(value)
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="purchase"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="sales"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="h-80 flex items-center justify-center text-slate-400">
              No chart data available.
            </div>

          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* EXPENSE BREAKDOWN */}
      {/* ================================================= */}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">

        <h2 className="text-xl font-semibold text-slate-800">
          Expense Breakdown
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Breakdown of major operational expenses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

          <div className="border border-slate-200 rounded-xl p-5">

            <p className="text-sm text-slate-500">
              Labour Cost
            </p>

            <h3 className="text-xl font-bold text-slate-800 mt-2">
              {formatMoney(totalLabour)}
            </h3>

          </div>

          <div className="border border-slate-200 rounded-xl p-5">

            <p className="text-sm text-slate-500">
              Transport Cost
            </p>

            <h3 className="text-xl font-bold text-slate-800 mt-2">
              {formatMoney(totalTransport)}
            </h3>

          </div>

          <div className="border border-slate-200 rounded-xl p-5">

            <p className="text-sm text-slate-500">
              Total Operating Expense
            </p>

            <h3 className="text-xl font-bold text-slate-800 mt-2">
              {formatMoney(totalExpenses)}
            </h3>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Reports;