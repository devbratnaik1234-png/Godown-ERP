export default function DashboardWidgets() {
  const pendingPayments = [
    { farmer: "Ramesh Kumar", amount: "₹45,000" },
    { farmer: "Suresh Singh", amount: "₹32,500" },
    { farmer: "Amit Yadav", amount: "₹28,000" },
  ];

  const lowStock = [
    { item: "Broken Rice", qty: "210 Qt" },
    { item: "Bran", qty: "145 Qt" },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6 mt-8">
      {/* Today Trucks */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">🚚 Today's Trucks</h2>
        <div className="text-center py-4">
          <p className="text-4xl font-bold text-green-600">12</p>
          <p className="text-slate-500 mt-1">Trucks arrived today</p>
        </div>
      </div>

      {/* Pending Payments */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">💰 Pending Payments</h2>
        <div className="space-y-3">
          {pendingPayments.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-slate-700">{item.farmer}</span>
              <span className="font-semibold text-red-600">
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">⚠️ Low Stock Alert</h2>
        <div className="space-y-3">
          {lowStock.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-slate-700">{item.item}</span>
              <span className="font-semibold text-orange-600">
                {item.qty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}