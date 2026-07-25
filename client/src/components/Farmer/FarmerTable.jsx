export default function FarmerTable({
  farmers,
  search,
  deleteFarmer,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-green-700 text-white">
          <tr>
            <th className="p-3">Name</th>
            <th>Village</th>
            <th>Mobile</th>
            <th>Bank</th>
            <th>Account</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {farmers
            .filter((farmer) =>
              farmer.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((farmer) => (
              <tr key={farmer.id} className="border-b text-center">
                <td className="p-3">{farmer.name}</td>
                <td>{farmer.village}</td>
                <td>{farmer.mobile}</td>
                <td>{farmer.bank}</td>
                <td>{farmer.account}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded text-white ${
                      farmer.status === "Paid"
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  >
                    {farmer.status}
                  </span>
                </td>

                <td>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">
                    Edit
                  </button>

                  <button
                    onClick={() => deleteFarmer(farmer.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
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