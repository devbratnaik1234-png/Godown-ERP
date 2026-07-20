const purchases = [
  {
    id: 1,
    farmer: "Ramesh Kumar",
    quantity: "120 Qt",
    price: "₹2,310",
    date: "20 Jul 2026",
  },
  {
    id: 2,
    farmer: "Suresh Singh",
    quantity: "95 Qt",
    price: "₹2,310",
    date: "20 Jul 2026",
  },
  {
    id: 3,
    farmer: "Amit Yadav",
    quantity: "150 Qt",
    price: "₹2,310",
    date: "20 Jul 2026",
  },
  {
    id: 4,
    farmer: "Mahesh Patel",
    quantity: "80 Qt",
    price: "₹2,310",
    date: "19 Jul 2026",
  },
];

function RecentPurchases() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-5">Recent Purchases</h2>

      <table className="w-full">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="p-3 text-left">Farmer</th>
            <th className="p-3 text-left">Quantity</th>
            <th className="p-3 text-left">Rate</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>

        <tbody>
          {purchases.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-gray-100"
            >
              <td className="p-3">{item.farmer}</td>
              <td className="p-3">{item.quantity}</td>
              <td className="p-3">{item.price}</td>
              <td className="p-3">{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentPurchases;