import { Users, UserCheck, IndianRupee, UserX } from "lucide-react";

export default function LabourCards({ labours = [] }) {
  const activeLabours = labours.filter((item) => item.status === "Active");
  const inactiveLabours = labours.filter((item) => item.status === "Inactive");
  const activeDailyWage = activeLabours.reduce(
    (sum, item) => sum + Number(item.dailyWage || 0),
    0
  );

  const cards = [
    {
      title: "Total Labourers",
      value: labours.length.toString(),
      icon: <Users size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Active Labourers",
      value: activeLabours.length.toString(),
      icon: <UserCheck size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Active Daily Wages",
      value: `₹${activeDailyWage.toLocaleString("en-IN")}`,
      icon: <IndianRupee size={28} />,
      color: "bg-yellow-500",
    },
    {
      title: "Inactive Labourers",
      value: inactiveLabours.length.toString(),
      icon: <UserX size={28} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center hover:shadow-xl transition"
        >
          <div>
            <h3 className="text-gray-500 text-sm">{card.title}</h3>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
          <div className={`${card.color} text-white p-4 rounded-full`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
