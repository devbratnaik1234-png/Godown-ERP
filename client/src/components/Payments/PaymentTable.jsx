function PaymentTable() {
  const payments = [
    {
      id: 1,
      farmer: "Ramesh Kumar",
      amount: "₹45,000",
      method: "UPI",
      date: "26 Jul 2026",
      status: "Paid",
    },
    {
      id: 2,
      farmer: "Suresh Singh",
      amount: "₹32,000",
      method: "Bank Transfer",
      date: "25 Jul 2026",
      status: "Pending",
    },
    {
      id: 3,
      farmer: "Amit Yadav",
      amount: "₹18,500",
      method: "Cash",
      date: "24 Jul 2026",
      status: "Paid",
    },
    {
      id: 4,
      farmer: "Mahesh Patel",
      amount: "₹22,300",
      method: "NEFT",
      date: "23 Jul 2026",
      status: "Pending",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-5">Payment Table</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3 text-left">Farmer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3">{item.farmer}</td>
                <td className="p-3 font-semibold">{item.amount}</td>
                <td className="p-3">{item.method}</td>
                <td className="p-3">{item.date}</td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      item.status === "Paid"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentTable;