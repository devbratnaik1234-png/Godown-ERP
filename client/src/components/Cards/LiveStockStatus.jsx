export default function LiveStockStatus() {
  const stocks = [
    { item: "Paddy", qty: 1850, percentage: 90, color: "bg-green-500" },
    { item: "Rice", qty: 920, percentage: 65, color: "bg-blue-500" },
    { item: "Broken Rice", qty: 210, percentage: 25, color: "bg-orange-500" },
    { item: "Bran", qty: 145, percentage: 18, color: "bg-red-500" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Live Stock Status
        </h2>
        <span className="text-sm text-green-600 font-medium">
          Updated Now
        </span>
      </div>

      <div className="space-y-5">
        {stocks.map((stock, index) => (
          <div key={index}>
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-700">{stock.item}</p>
                <p className="text-sm text-slate-500">
                  {stock.qty} Quintal
                </p>
              </div>
              <span className="font-semibold text-slate-700">
                {stock.percentage}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`${stock.color} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${stock.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}