// Dashboard Widgets Component
// Dashboard-er niche additional business information show korar jonno use kora hoyeche
export default function DashboardWidgets() {

  // Pending Payment Data
  // Farmer-der pending payment temporarily array-te store kora hoyeche
  const pendingPayments = [
    { farmer: "Samarjit Chatterjee", amount: "₹45,000" },
    { farmer: "Sreya Rana", amount: "₹32,500" },
    { farmer: "Devrat Naik", amount: "₹28,000" },
  ];

  // Low Stock Data
  // Je stock-gulo kom ache segulo display korar jonno use kora hoyeche
  const lowStock = [
    { item: "Broken Rice", qty: "210 Qt" },
    { item: "Bran", qty: "145 Qt" },
  ];

  return (

    // Responsive Grid Layout
    // 3 ta widget side by side display korbe
    <div className="grid lg:grid-cols-3 gap-6 mt-8">

      {/* Today Trucks Widget
          Ajker total truck arrival display korar jonno */}
      <div className="bg-white rounded-xl shadow p-6">

        {/* Widget Heading */}
        <h2 className="text-xl font-bold mb-4">
          🚚 Today's Trucks
        </h2>

        {/* Truck Summary */}
        <div className="text-center py-4">

          {/* Total Truck Count */}
          <p className="text-4xl font-bold text-green-600">
            12
          </p>

          {/* Description */}
          <p className="text-slate-500 mt-1">
            Trucks arrived today
          </p>

        </div>
      </div>

      {/* Pending Payments Widget
          Pending farmer payment list show korar jonno */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          💰 Pending Payments
        </h2>

        {/* Dynamic Pending Payment Rendering */}
        <div className="space-y-3">

          {pendingPayments.map((item, index) => (

            <div
              key={index} // React Unique Key
              className="flex justify-between items-center"
            >

              {/* Farmer Name */}
              <span className="text-slate-700">
                {item.farmer}
              </span>

              {/* Pending Amount */}
              <span className="font-semibold text-red-600">
                {item.amount}
              </span>

            </div>

          ))}

        </div>
      </div>

      {/* Low Stock Alert Widget
          Kom quantity thaka stock-gulo display korar jonno */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          ⚠️ Low Stock Alert
        </h2>

        {/* Dynamic Low Stock Rendering */}
        <div className="space-y-3">

          {lowStock.map((item, index) => (

            <div
              key={index} // React Unique Key
              className="flex justify-between items-center"
            >

              {/* Item Name */}
              <span className="text-slate-700">
                {item.item}
              </span>

              {/* Remaining Quantity */}
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