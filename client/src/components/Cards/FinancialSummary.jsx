export default function FinancialSummary({ data = {} }) {
  const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const items = [
    {
      title: "Total Purchase Value",
      value: formatCurrency(data.totalPurchaseValue),
      color: "text-blue-600",
    },
    {
      title: "Paid Amount",
      value: formatCurrency(data.totalPaid),
      color: "text-green-600",
    },
    {
      title: "Pending Payment",
      value: formatCurrency(data.pendingPayments),
      color: "text-red-600",
    },
    {
      title: "Current Stock Value",
      value: formatCurrency(data.stockValue),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Financial Summary
        </h2>
        <span className="text-sm text-slate-500">Live Database</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition"
          >
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className={`text-2xl font-bold mt-2 ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
