export default function PurchaseCards({ purchases = [] }) {
  const today = new Date().toISOString().split("T")[0];

  const todayQuantity = purchases
    .filter((item) => item.date === today)
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const totalQuantity = purchases.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalAmount = purchases.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const cards = [
    {
      title: "Today's Purchase",
      value: `${todayQuantity.toLocaleString("en-IN")} Qt`,
      color: "bg-green-600",
    },
    {
      title: "Total Purchase",
      value: `${totalQuantity.toLocaleString("en-IN")} Qt`,
      color: "bg-blue-600",
    },
    {
      title: "Total Amount",
      value: `₹${totalAmount.toLocaleString("en-IN")}`,
      color: "bg-orange-500",
    },
    {
      title: "Purchase Records",
      value: purchases.length.toString(),
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`${card.color} text-white rounded-xl shadow-lg p-6`}
        >
          <h2 className="text-lg font-semibold">{card.title}</h2>
          <p className="text-3xl font-bold mt-3">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
