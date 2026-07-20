import {
  FaUsers,
  FaWarehouse,
  FaShoppingCart,
  FaRupeeSign,
} from "react-icons/fa";

const cards = [
  {
    title: "Total Farmers",
    value: 250,
    icon: <FaUsers size={28} />,
    color: "bg-blue-500",
  },
  {
    title: "Stock (Quintal)",
    value: 1850,
    icon: <FaWarehouse size={28} />,
    color: "bg-green-600",
  },
  {
    title: "Today's Purchase",
    value: 125,
    icon: <FaShoppingCart size={28} />,
    color: "bg-orange-500",
  },
  {
    title: "Total Payment",
    value: "₹12.5 Lakh",
    icon: <FaRupeeSign size={28} />,
    color: "bg-purple-600",
  },
];

function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} text-white rounded-xl p-6 shadow-lg flex justify-between items-center`}
        >
          <div>
            <h3 className="text-lg">{card.title}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>

          <div>{card.icon}</div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;