import {
  FaWarehouse,
  FaShoppingCart,
  FaRupeeSign,
  FaTruck,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";

const cards = [
  {
    title: "Total Capital",
    value: "₹25.0 Lakh",
    icon: <FaRupeeSign size={28} />,
    color: "bg-slate-700",
  },
  {
    title: "Liquid Cash",
    value: "₹5.5 Lakh",
    icon: <FaRupeeSign size={28} />,
    color: "bg-emerald-700",
  },
  {
    title: "Stock (Quintal)",
    value: "1850 Qt",
    icon: <FaWarehouse size={28} />,
    color: "bg-blue-700",
  },
  {
    title: "Pending Payment",
    value: "₹3.2 Lakh",
    icon: <FaShoppingCart size={28} />,
    color: "bg-violet-700",
  },
  {
    title: "Today Trucks",
    value: "12",
    icon: <FaTruck size={28} />,
    color: "bg-rose-700",
  },
  {
    title: "Total Farmers",
    value: "250",
    icon: <FaUsers size={28} />,
    color: "bg-teal-700",
  },
  {
    title: "Today Profit",
    value: "₹45,000",
    icon: <FaChartLine size={28} />,
    color: "bg-indigo-700",
  },
];

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
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