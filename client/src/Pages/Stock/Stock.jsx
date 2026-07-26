import { useState } from "react";

export default function Stock() {
  const [stocks, setStocks] = useState([
   {
  id: 1,
  rice: "Swarna",
  godown: "Godown A",
  quantity: 250,
  rate: 2400,
  date: "26-07-2026",
},
    {
  id: 2,
  rice: "Miniket",
  godown: "Godown B",
  quantity: 180,
  rate: 2800,
  date: "25-07-2026",
},
  ]);

  const [search, setSearch] = useState("");
  const [godownFilter, setGodownFilter] = useState("All");

 const [newStock, setNewStock] = useState({
  rice: "",
  godown: "",
  quantity: "",
  rate: "",
  date: "",
});
  const [editId, setEditId] = useState(null);

  const addStock = () => {
  if (
    !newStock.rice ||
    !newStock.godown ||
    !newStock.quantity ||
    !newStock.rate
  ) {
    alert("Please fill all fields");
    return;
  }

  if (editId !== null) {
    setStocks(
      stocks.map((stock) =>
        stock.id === editId
          ? {
              ...stock,
              rice: newStock.rice,
              godown: newStock.godown,
              quantity: Number(newStock.quantity),
             rate: Number(newStock.rate),
date: new Date().toLocaleDateString("en-IN"),
            }
          : stock
      )
    );

    setEditId(null);
  } else {
    const stock = {
      id: Date.now(),
      rice: newStock.rice,
      godown: newStock.godown,
      quantity: Number(newStock.quantity),
      rate: Number(newStock.rate),
    };

    setStocks([...stocks, stock]);
  }

  setNewStock({
    rice: "",
    godown: "",
    quantity: "",
    rate: "",
  });
};

 const filteredStocks = stocks.filter((stock) => {
  const matchesSearch = stock.rice
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesGodown =
    godownFilter === "All" ||
    stock.godown === godownFilter;

  return matchesSearch && matchesGodown;
});

  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);

  const totalValue = stocks.reduce(
    (sum, s) => sum + s.quantity * s.rate,
    0
  );

  const lowStock = stocks.filter((s) => s.quantity < 100).length;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
  <h1 className="text-4xl font-bold">📦 Stock Management</h1>

  <div className="flex gap-3">

    <input
      type="text"
      placeholder="🔍 Search Rice..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-green-500"
    />

    <select
      value={godownFilter}
      onChange={(e) => setGodownFilter(e.target.value)}
      className="border rounded-lg px-4 py-2"
    >
      <option>All</option>
      <option>Godown A</option>
      <option>Godown B</option>
      <option>Godown C</option>
    </select>

  </div>
</div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="bg-blue-600 text-white rounded-xl p-5 shadow-lg">
          <p>Total Stocks</p>
          <h2 className="text-3xl font-bold">{stocks.length}</h2>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-5 shadow-lg">
          <p>Total Quantity</p>
          <h2 className="text-3xl font-bold">{totalQuantity} Qt</h2>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow-lg">
          <p>Total Value</p>
          <h2 className="text-3xl font-bold">₹{totalValue}</h2>
        </div>

        <div className="bg-red-600 text-white rounded-xl p-5 shadow-lg">
          <p>Low Stock</p>
          <h2 className="text-3xl font-bold">{lowStock}</h2>
        </div>

      </div>

      {/* Add Stock Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

        <h2 className="text-2xl font-bold mb-5">
  {editId ? "✏️ Update Stock" : "➕ Add New Stock"}
</h2>
        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Rice Type"
            value={newStock.rice}
            onChange={(e) =>
              setNewStock({ ...newStock, rice: e.target.value })
            }
            className="border rounded-lg p-3"
          />

          <input
            type="text"
            placeholder="Godown"
            value={newStock.godown}
            onChange={(e) =>
              setNewStock({ ...newStock, godown: e.target.value })
            }
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={newStock.quantity}
            onChange={(e) =>
              setNewStock({
                ...newStock,
                quantity: e.target.value,
              })
            }
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            placeholder="Rate"
            value={newStock.rate}
            onChange={(e) =>
              setNewStock({
                ...newStock,
                rate: e.target.value,
              })
            }
            className="border rounded-lg p-3"
          />

        </div>

       <button
  onClick={addStock}
  className="mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
>
  {editId ? "Update Stock" : "Save Stock"}
</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-8">

        <table className="w-full">

          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-4">Rice Type</th>
              <th>Godown</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Date</th>
              <th>Action</th>
              <th>Total Value</th>
            </tr>
          </thead>

          <tbody>
            
{filteredStocks.length === 0 ? (
  <tr>
    <td colSpan="7" className="text-center py-10 text-gray-500 text-lg">
      📦 No Stock Found
    </td>
  </tr>
) : (
  filteredStocks.map((stock) => (

              <tr
  key={stock.id}
  className={`text-center border-b transition-all duration-200 hover:bg-green-50 ${
    stock.id % 2 === 0 ? "bg-gray-50" : "bg-white"
  }`}
>

                <td className="p-4">{stock.rice}</td>
                <td>{stock.godown}</td>
                <td>
  <span
    className={`px-3 py-1 rounded-full text-sm font-semibold ${
      stock.quantity < 100
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {stock.quantity} Qt {stock.quantity < 100 ? "🔴 Low" : "🟢 Normal"}
  </span>
</td>
                <td>₹ {stock.rate}</td>
                <td>{stock.date}</td>
                <td>₹ {stock.quantity * stock.rate}</td>
                <td>

                  <button
  onClick={() => {
    setEditId(stock.id);
    setNewStock({
      rice: stock.rice,
      godown: stock.godown,
      quantity: stock.quantity,
      rate: stock.rate,
    });
  }}
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
>
  Edit
</button>
  <button
  onClick={() => {
    const ok = window.confirm("Are you sure you want to delete this stock?");
    if (ok) {
      setStocks(stocks.filter((s) => s.id !== stock.id));
    }
  }}
  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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