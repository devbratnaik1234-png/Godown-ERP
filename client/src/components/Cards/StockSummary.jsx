function StockSummary({ stocks = [] }) {
  const maxQuantity = Math.max(...stocks.map((item) => Number(item.quantity || 0)), 1);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">📦 Stock Summary</h2>

      <div className="space-y-4">
        {stocks.length === 0 ? (
          <p className="text-sm text-gray-500">No stock records yet</p>
        ) : (
          stocks.slice(0, 5).map((item) => {
            const quantity = Number(item.quantity || 0);
            const percentage = Math.max(5, Math.round((quantity / maxQuantity) * 100));

            return (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span>{item.name}</span>
                  <span>{quantity.toLocaleString("en-IN")} Qt</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
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

export default StockSummary;
