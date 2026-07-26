function PaymentTable({ payments, onEdit, onDelete }) {
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
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => onEdit(item)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg"
                    >
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500"
                >
                  No Payments Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentTable;