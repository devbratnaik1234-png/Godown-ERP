export default function PurchaseTable({ purchases, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-2xl font-bold mb-5">Purchase History</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="p-3">ID</th>
              <th>Farmer</th>
              <th>Date</th>
              <th>Paddy</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500">
                  No Purchase Records Found
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b text-center">
                  <td className="p-3">{purchase.purchaseId}</td>
                  <td>{purchase.farmer}</td>
                  <td>{purchase.date}</td>
                  <td>{purchase.paddyType}</td>
                  <td>{purchase.quantity}</td>
                  <td>₹{purchase.rate}</td>
                  <td>₹{purchase.total}</td>
                  <td>
                    <span className="px-3 py-1 rounded bg-yellow-500 text-white">
                      Recorded
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                      title="Edit support will be added next"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(purchase.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
