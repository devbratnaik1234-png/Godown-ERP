export default function PurchaseTable({ purchases }) {

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">

      <h2 className="text-2xl font-bold mb-5">
        Purchase History
      </h2>

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

          {purchases.map((purchase) => (

            <tr
              key={purchase.purchaseId}
              className="border-b text-center"
            >

              <td className="p-3">{purchase.purchaseId}</td>
              <td>{purchase.farmer}</td>
              <td>{purchase.date}</td>
              <td>{purchase.paddyType}</td>
              <td>{purchase.quantity}</td>
              <td>{purchase.rate}</td>
              <td>{purchase.total}</td>

              <td>

              <span className="px-3 py-1 rounded bg-yellow-500 text-white">
                Pending
              </span>

              </td>

              <td>

                <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
                  Edit
                </button>

                <button className="bg-red-600 text-white px-3 py-1 rounded">
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}