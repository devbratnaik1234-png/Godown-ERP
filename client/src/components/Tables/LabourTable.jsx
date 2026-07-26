import { Pencil, Trash2 } from "lucide-react";

export default function LabourTable({ labours }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        Labour Records
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full border-collapse">

          <thead>

            <tr className="bg-gray-100">

              <th className="p-3 text-left">Labour ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Village</th>
              <th className="p-3 text-left">Work Type</th>
              <th className="p-3 text-left">Daily Wage</th>
              <th className="p-3 text-left">Joining Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {labours.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  className="text-center py-10 text-gray-500"
                >
                  No Labour Records Found
                </td>

              </tr>

            ) : (

              labours.map((labour, index) => (

                <tr
                  key={index}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">{labour.labourId}</td>
                  <td className="p-3">{labour.name}</td>
                  <td className="p-3">{labour.mobile}</td>
                  <td className="p-3">{labour.village}</td>
                  <td className="p-3">{labour.workType}</td>
                  <td className="p-3">₹ {labour.dailyWage}</td>
                  <td className="p-3">{labour.joiningDate}</td>

                  <td className="p-3">

                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm ${
                        labour.status === "Active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {labour.status}
                    </span>

                  </td>

                  <td className="p-3">

                    <div className="flex justify-center gap-3">

                      <button className="text-blue-600 hover:text-blue-800">
                        <Pencil size={18} />
                      </button>

                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
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