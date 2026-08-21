import {
  FaMoneyBillWave,
  FaClock,
  FaWallet,
  FaUsers,
} from "react-icons/fa";

function PaymentCards({ payments = [] }) {
  const parseAmount = (value) => Number(String(value || 0).replace(/[^0-9.]/g, "")) || 0;
  const today = new Date().toISOString().split("T")[0];

  const totalPaid = payments
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const pending = payments
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const todayPaid = payments
    .filter((item) => item.status === "Paid" && item.date === today)
    .reduce((sum, item) => sum + parseAmount(item.amount), 0);

  const farmersPaid = new Set(
    payments
      .filter((item) => item.status === "Paid")
      .map((item) => String(item.farmer || "").trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const cards = [
    {
      title: "Total Paid",
      value: formatMoney(totalPaid),
      icon: <FaMoneyBillWave size={28} />,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Pending Payment",
      value: formatMoney(pending),
      icon: <FaClock size={28} />,
      color: "from-orange-400 to-orange-600",
    },
    {
      title: "Today's Paid",
      value: formatMoney(todayPaid),
      icon: <FaWallet size={28} />,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Farmers Paid",
      value: farmersPaid.toString(),
      icon: <FaUsers size={28} />,
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
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
