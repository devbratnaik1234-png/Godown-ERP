export default function FinancialSummary() {
  const data = [
    {
      title: "Total Purchase",
      value: "₹12.5 Lakh",
      color: "text-blue-600",
    },
    {
      title: "Total Sales",
      value: "₹15.8 Lakh",
      color: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: "₹2.1 Lakh",
      color: "text-red-600",
    },
    {
      title: "Net Profit",
      value: "₹3.3 Lakh",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Financial Summary
        </h2>
        <span className="text-sm text-slate-500">This Month</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
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