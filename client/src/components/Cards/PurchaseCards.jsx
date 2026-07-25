export default function PurchaseCards() {
  const cards = [
    {
      title: "Today's Purchase",
      value: "145 Qt",
      color: "bg-green-600",
    },
    {
      title: "Total Purchase",
      value: "1850 Qt",
      color: "bg-blue-600",
    },
    {
      title: "Total Amount",
      value: "₹4.25 Lakh",
      color: "bg-orange-500",
    },
    {
      title: "Pending Payment",
      value: "₹1.10 Lakh",
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} text-white rounded-xl shadow-lg p-6`}
        >
          <h2 className="text-lg font-semibold">{card.title}</h2>

          <p className="text-3xl font-bold mt-3">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}