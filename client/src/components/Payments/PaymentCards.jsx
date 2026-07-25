import {
  FaMoneyBillWave,
  FaClock,
  FaWallet,
  FaUsers,
} from "react-icons/fa";

const cards = [
  {
    title: "Total Paid",
    value: "₹18.5 Lakh",
    icon: <FaMoneyBillWave size={28} />,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Pending Payment",
    value: "₹3.2 Lakh",
    icon: <FaClock size={28} />,
    color: "from-orange-400 to-orange-600",
  },
  {
    title: "Today's Collection",
    value: "₹85,000",
    icon: <FaWallet size={28} />,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Farmers Paid",
    value: "185",
    icon: <FaUsers size={28} />,
    color: "from-violet-500 to-purple-600",
  },
];

function PaymentCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${card.color} rounded-2xl p-6 shadow-lg text-white flex justify-between items-center`}
        >
          <div>
            <h3 className="text-sm">{card.title}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>

          <div>{card.icon}</div>
        </div>
      ))}
    </div>
  );
}

export default PaymentCards;