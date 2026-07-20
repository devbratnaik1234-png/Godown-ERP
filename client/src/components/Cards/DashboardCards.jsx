import {
  FaUsers,
  FaWarehouse,
  FaShoppingCart,
  FaRupeeSign,
} from "react-icons/fa";

const cards = [
  {
    title: "Total Farmers",
    value: "250",
    icon: <FaUsers size={34} />,
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "Stock (Qt)",
    value: "1850",
    icon: <FaWarehouse size={34} />,
    color: "from-green-500 to-green-700",
  },
  {
    title: "Today's Purchase",
    value: "125 Qt",
    icon: <FaShoppingCart size={34} />,
    color: "from-orange-400 to-orange-600",
  },
  {
    title: "Total Payment",
    value: "₹12.5 L",
    icon: <FaRupeeSign size={34} />,
    color: "from-purple-500 to-pink-600",
  },
];

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${card.color} rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-white p-6 flex justify-between items-center`}
        >
          <div>
            <p className="text-sm opacity-90">{card.title}</p>

            <h2 className="text-4xl font-bold mt-3">
              {card.value}
            </h2>
          </div>

          <div className="bg-white/20 p-4 rounded-full">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;