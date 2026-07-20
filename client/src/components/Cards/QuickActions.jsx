function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-5">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-700 text-white p-3 rounded-lg">
          + Purchase
        </button>

        <button className="bg-blue-600 text-white p-3 rounded-lg">
          + Farmer
        </button>

        <button className="bg-orange-500 text-white p-3 rounded-lg">
          + Truck
        </button>

        <button className="bg-purple-600 text-white p-3 rounded-lg">
          Reports
        </button>
      </div>
    </div>
  );
}

export default QuickActions;