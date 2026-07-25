import { useState } from "react";

export default function Stock() {
  const [stocks] = useState([
    {
      id: 1,
      rice: "Swarna",
      godown: "Godown A",
      quantity: 250,
      rate: 2400,
    },
    {
      id: 2,
      rice: "Miniket",
      godown: "Godown B",
      quantity: 180,
      rate: 2800,
    },
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">📦 Stock Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
        <div className="bg-blue-600 text-white p-5 rounded-xl">
          <p>Total Stocks</p>
          <h2 className="text-3xl font-bold">{stocks.length}</h2>
        </div>

        <div className="bg-green-600 text-white p-5 rounded-xl">
          <p>Total Quantity</p>
          <h2 className="text-3xl font-bold">
            {stocks.reduce((sum, s) => sum + s.quantity, 0)} Qt
          </h2>
        </div>

        <div className="bg-yellow-500 text-white p-5 rounded-xl">
          <p>Total Value</p>
          <h2 className="text-3xl font-bold">
            ₹
            {stocks.reduce(
              (sum, s) => sum + s.quantity * s.rate,
              0
            )}
          </h2>
        </div>

        <div className="bg-red-600 text-white p-5 rounded-xl">
          <p>Low Stock</p>
          <h2 className="text-3xl font-bold">
            {stocks.filter((s) => s.quantity < 100).length}
          </h2>
        </div>
      </div>
    </div>
  );
}