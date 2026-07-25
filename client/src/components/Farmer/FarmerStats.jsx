export default function FarmerStats({ farmers }) {
  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      <div className="bg-blue-600 text-white rounded-lg p-4">
        <h2>Total Farmers</h2>
        <p className="text-3xl font-bold">{farmers.length}</p>
      </div>

      <div className="bg-green-600 text-white rounded-lg p-4">
        <h2>Paid Farmers</h2>
        <p className="text-3xl font-bold">
          {farmers.filter((f) => f.status === "Paid").length}
        </p>
      </div>

      <div className="bg-red-500 text-white rounded-lg p-4">
        <h2>Pending</h2>
        <p className="text-3xl font-bold">
          {farmers.filter((f) => f.status === "Pending").length}
        </p>
      </div>

      <div className="bg-orange-500 text-white rounded-lg p-4">
        <h2>Total Purchase</h2>
        <p className="text-3xl font-bold">1850 Qt</p>
      </div>
    </div>
  );
}