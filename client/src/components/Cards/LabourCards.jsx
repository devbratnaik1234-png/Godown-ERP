// Lucide React library theke required icons import kora hoyeche
import { Users, UserCheck, IndianRupee, Wallet } from "lucide-react";

// Labour Dashboard Cards Component
// Labour related summary information dashboard-e display korar jonno use kora hoyeche
export default function LabourCards() {

  // Labour Summary Data
  // Prottekta object ekta Dashboard Card represent korche
  const cards = [
    {
      title: "Total Labourers", // Total Registered Labour
      value: "25",
      icon: <Users size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Present Today", // Ajker Present Labour
      value: "18",
      icon: <UserCheck size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Today's Wages", // Ajker Total Wage
      value: "₹12,500",
      icon: <IndianRupee size={28} />,
      color: "bg-yellow-500",
    },
    {
      title: "Pending Payments", // Labour Pending Payment
      value: "₹35,000",
      icon: <Wallet size={28} />,
      color: "bg-red-500",
    },
  ];

  return (

    // Responsive Grid Layout
    // Screen size onujayi card automatically adjust hobe
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

      {/* Dynamic Card Rendering using map() */}
      {cards.map((card, index) => (

        <div
          key={index} // React Unique Key
          className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center hover:shadow-xl transition"
        >

          {/* Card Information */}
          <div>

            {/* Card Title */}
            <h3 className="text-gray-500 text-sm">
              {card.title}
            </h3>

            {/* Card Value */}
            <p className="text-3xl font-bold mt-2">
              {card.value}
            </p>

          </div>

          {/* Card Icon */}
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