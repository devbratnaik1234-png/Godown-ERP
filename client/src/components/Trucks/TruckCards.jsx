import {
  FaTruck,
  FaRoad,
  FaCheckCircle,
  FaWeightHanging,
} from "react-icons/fa";

function TruckCards({ trucks = [] }) {

  // Total Trucks
  const totalTrucks = trucks.length;

  // In Transit
  const inTransit = trucks.filter(
    (truck) =>
      truck.status?.toLowerCase() ===
      "in transit"
  ).length;

  // Completed
  const completed = trucks.filter(
    (truck) =>
      truck.status?.toLowerCase() ===
      "completed"
  ).length;

  // Total Quantity
  const totalQuantity = trucks.reduce(
    (total, truck) => {
      return (
        total +
        Number(truck.quantity || 0)
      );
    },
    0
  );

  const cards = [
    {
      title: "Total Trucks",
      value: totalTrucks,
      icon: <FaTruck size={28} />,
      color:
        "from-blue-500 to-indigo-600",
    },

    {
      title: "In Transit",
      value: inTransit,
      icon: <FaRoad size={28} />,
      color:
        "from-orange-400 to-orange-600",
    },

    {
      title: "Completed",
      value: completed,
      icon: <FaCheckCircle size={28} />,
      color:
        "from-emerald-500 to-green-600",
    },

    {
      title: "Total Quantity",
      value: `${totalQuantity} Qt`,
      icon: (
        <FaWeightHanging size={28} />
      ),
      color:
        "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card, index) => (

        <div
          key={index}
          className={`bg-gradient-to-r ${card.color} rounded-2xl p-6 shadow-lg text-white flex justify-between items-center`}
        >

          <div>

            <h3 className="text-sm font-medium">
              {card.title}
            </h3>

            <p className="text-3xl font-bold mt-2">
              {card.value}
            </p>

          </div>

          <div>
            {card.icon}
          </div>

        </div>

      ))}

    </div>
  );
}

export default TruckCards;