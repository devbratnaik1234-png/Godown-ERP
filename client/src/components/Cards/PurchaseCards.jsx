// Purchase Summary Cards Component
// Paddy Purchase Module-er summary information dashboard-e display korar jonno use kora hoyeche
export default function PurchaseCards() {

  // Purchase Summary Data
  // Prottekta object ekta Purchase Summary Card represent korche
  const cards = [
    {
      title: "Today's Purchase", // Ajker mot purchase quantity
      value: "145 Qt",
      color: "bg-green-600",
    },
    {
      title: "Total Purchase", // Total purchase quantity
      value: "1850 Qt",
      color: "bg-blue-600",
    },
    {
      title: "Total Amount", // Total purchase amount
      value: "₹4.25 Lakh",
      color: "bg-orange-500",
    },
    {
      title: "Pending Payment", // Farmer-der pending payment
      value: "₹1.10 Lakh",
      color: "bg-purple-600",
    },
  ];

  return (

    // Responsive Grid Layout
    // Screen size onujayi card automatically arrange hobe
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {/* Dynamic Card Rendering using map() */}
      {cards.map((card, index) => (

        <div
          key={index} // React Unique Key
          className={`${card.color} text-white rounded-xl shadow-lg p-6`}
        >

          {/* Card Title */}
          <h2 className="text-lg font-semibold">
            {card.title}
          </h2>

          {/* Card Value */}
          <p className="text-3xl font-bold mt-3">
            {card.value}
          </p>

        </div>

      ))}

    </div>
  );
}