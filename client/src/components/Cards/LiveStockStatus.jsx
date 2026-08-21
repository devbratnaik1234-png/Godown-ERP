export default function LiveStockStatus({ stocks = [] }) {
  const total = stocks.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Live Stock Status
        </h2>
        <span className="text-sm text-green-600 font-medium">
          Database Live
        </span>
      </div>

      <div className="space-y-5">
        {stocks.length === 0 ? (
          <p className="text-sm text-gray-500">No stock records yet</p>
        ) : (
          stocks.slice(0, 6).map((stock) => {
            const quantity = Number(stock.quantity || 0);
            const percentage = total > 0 ? Math.round((quantity / total) * 100) : 0;

            return (
              <div key={stock.name}>
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-700">{stock.name}</p>
                    <p className="text-sm text-slate-500">
                      {quantity.toLocaleString("en-IN")} Quintal
                    </p>
                  </div>
                  <span className="font-semibold text-slate-700">
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
