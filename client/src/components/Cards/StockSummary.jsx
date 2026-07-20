function StockSummary() {
  const stocks = [
    { name: "Paddy", qty: "1850 Qt", color: "bg-green-600" },
    { name: "Rice", qty: "920 Qt", color: "bg-blue-600" },
    { name: "Broken Rice", qty: "210 Qt", color: "bg-orange-500" },
    { name: "Bran", qty: "145 Qt", color: "bg-purple-600" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">📦 Stock Summary</h2>

      <div className="space-y-4">
        {stocks.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span>{item.name}</span>
              <span>{item.qty}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${item.color} h-3 rounded-full`}
                style={{ width: `${80 - index * 15}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockSummary;