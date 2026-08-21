import {
  FaWarehouse,
  FaShoppingCart,
  FaRupeeSign,
  FaTruck,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function DashboardCards({ data = {} }) {
  const cards = [
    {
      title: "Purchase Value",
      value: formatMoney(data.totalPurchaseValue),
      icon: <FaRupeeSign size={28} />,
      color: "bg-slate-700",
    },
    {
      title: "Total Paid",
      value: formatMoney(data.totalPaid),
      icon: <FaRupeeSign size={28} />,
      color: "bg-emerald-700",
    },
    {
      title: "Stock (Quintal)",
      value: `${Number(data.stockQuantity || 0).toLocaleString("en-IN")} Qt`,
      icon: <FaWarehouse size={28} />,
      color: "bg-blue-700",
    },
    {
      title: "Pending Payment",
      value: formatMoney(data.pendingPayments),
      icon: <FaShoppingCart size={28} />,
      color: "bg-violet-700",
    },
    {
      title: "Total Trucks",
      value: String(data.trucks || 0),
      icon: <FaTruck size={28} />,
      color: "bg-rose-700",
    },
    {
      title: "Total Farmers",
      value: String(data.farmers || 0),
      icon: <FaUsers size={28} />,
      color: "bg-teal-700",
    },
    {
      title: "Purchase Quantity",
      value: `${Number(data.totalPurchasedQuantity || 0).toLocaleString("en-IN")} Qt`,
      icon: <FaChartLine size={28} />,
      color: "bg-indigo-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} text-white rounded-xl p-6 shadow-lg flex justify-between items-center transition-transform duration-300 hover:scale-[1.02]`}
        >
          <div>
            <h3 className="text-sm font-medium opacity-90">{card.title}</h3>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
          <div className="opacity-90">{card.icon}</div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
