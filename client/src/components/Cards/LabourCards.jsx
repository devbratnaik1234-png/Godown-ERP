import { Users, UserCheck, IndianRupee, Wallet } from "lucide-react";

export default function LabourCards() {
  const cards = [
    {
      title: "Total Labourers",
      value: "25",
      icon: <Users size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Present Today",
      value: "18",
      icon: <UserCheck size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Today's Wages",
      value: "₹12,500",
      icon: <IndianRupee size={28} />,
      color: "bg-yellow-500",
    },
    {
      title: "Pending Payments",
      value: "₹35,000",
      icon: <Wallet size={28} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center hover:shadow-xl transition"
        >
          <div>
            <h3 className="text-gray-500 text-sm">{card.title}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>

          <div
            className={`${card.color} text-white p-4 rounded-full`}
          >
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}