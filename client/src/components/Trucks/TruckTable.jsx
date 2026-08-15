import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function TruckTable({
  trucks,
  onEdit,
  onDelete,
  onView,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

      <div className="flex justify-between items-center mb-5">

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Truck Register
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {trucks.length} truck(s) found
          </p>
        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-green-600 text-white">

            <tr>

              <th className="p-3 text-left">
                Truck No.
              </th>

              <th className="p-3 text-left">
                Driver
              </th>

              <th className="p-3 text-left">
                Farmer
              </th>

              <th className="p-3 text-left">
                Quantity
              </th>

              <th className="p-3 text-left">
                Type
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Status
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {trucks.length === 0 ? (

              <tr>

                <td
                  colSpan="8"
                  className="text-center py-10 text-gray-500"
                >
                  No trucks found.
                </td>

              </tr>

            ) : (

              trucks.map((truck) => (

                <tr
                  key={truck.id}
                  className="border-b hover:bg-gray-50 transition"
                >

                  <td className="p-3 font-semibold">
                    {truck.truckNo}
                  </td>

                  <td className="p-3">
                    <div>
                      <p>{truck.driver}</p>
                      <p className="text-xs text-gray-500">
                        {truck.mobile}
                      </p>
                    </div>
                  </td>

                  <td className="p-3">
                    {truck.farmer}
                  </td>

                  <td className="p-3 font-semibold">
                    {truck.quantity} Qt
                  </td>

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        truck.type === "Incoming"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {truck.type}
                    </span>

                  </td>

                  <td className="p-3">
                    {truck.date}
                  </td>

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        truck.status === "Completed"
                          ? "bg-green-500"
                          : truck.status === "Cancelled"
                          ? "bg-red-500"
                          : "bg-orange-500"
                      }`}
                    >
                      {truck.status}
                    </span>

                  </td>

                  <td className="p-3">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => onView(truck)}
                        title="View"
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() => onEdit(truck)}
                        title="Edit"
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white transition"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => onDelete(truck.id)}
                        title="Delete"
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

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

export default TruckTable;