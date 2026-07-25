export default function PurchaseSearch() {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6">

      <div className="flex flex-col md:flex-row gap-4">

        <input
          type="text"
          placeholder="🔍 Search by Farmer, Purchase ID or Truck Number..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <select className="border border-gray-300 rounded-lg px-4 py-3">
          <option>All</option>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>

        <select className="border border-gray-300 rounded-lg px-4 py-3">
          <option>All Status</option>
          <option>Paid</option>
          <option>Pending</option>
        </select>

      </div>

    </div>
  );
}