import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";

export default function Stock() {
  const [stocks, setStocks] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeStock = (stock) => ({
    ...stock,
    id: stock._id,
    date: stock.date
      ? new Date(stock.date).toLocaleDateString("en-IN")
      : "",
  });

  const loadStocks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.list("stocks");
      setStocks(data.map(normalizeStock));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const saveStock = async () => {
    if (!newStock.rice || !newStock.godown || !newStock.quantity || !newStock.rate) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      rice: newStock.rice,
      godown: newStock.godown,
      quantity: Number(newStock.quantity),
      rate: Number(newStock.rate),
      date: new Date().toISOString(),
    };

    try {
      setError("");
      if (editId) {
        const updated = await api.update("stocks", editId, payload);
        setStocks((prev) =>
          prev.map((stock) => (stock.id === editId ? normalizeStock(updated) : stock))
        );
      } else {
        const created = await api.create("stocks", payload);
        setStocks((prev) => [normalizeStock(created), ...prev]);
      }
      setEditId(null);
      setNewStock({ rice: "", godown: "", quantity: "", rate: "", date: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (stock) => {
    setEditId(stock.id);
    setNewStock({
      rice: stock.rice,
      godown: stock.godown,
      quantity: String(stock.quantity),
      rate: String(stock.rate),
      date: stock.date,
    });
  };

  const deleteStock = async (id) => {
    if (!window.confirm("Delete this stock record?")) return;
    try {
      setError("");
      await api.remove("stocks", id);
      setStocks((prev) => prev.filter((stock) => stock.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredStocks = useMemo(
    () =>
      stocks.filter((stock) => {
        const matchesSearch = stock.rice.toLowerCase().includes(search.toLowerCase());
        const matchesGodown = godownFilter === "All" || stock.godown === godownFilter;
        return matchesSearch && matchesGodown;
      }),
    [stocks, search, godownFilter]
  );

  const godowns = [...new Set(stocks.map((stock) => stock.godown).filter(Boolean))];
  const totalQuantity = stocks.reduce((sum, stock) => sum + Number(stock.quantity || 0), 0);
  const totalValue = stocks.reduce(
    (sum, stock) => sum + Number(stock.quantity || 0) * Number(stock.rate || 0),
    0
  );
  const lowStock = stocks.filter((stock) => Number(stock.quantity || 0) < 100).length;

  return (
    <div className="p-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
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
            {godowns.map((godown) => (
              <option key={godown}>{godown}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-blue-600 text-white rounded-xl p-5 shadow-lg">
          <p>Total Stocks</p><h2 className="text-3xl font-bold">{stocks.length}</h2>
        </div>
        <div className="bg-green-600 text-white rounded-xl p-5 shadow-lg">
          <p>Total Quantity</p><h2 className="text-3xl font-bold">{totalQuantity} Qt</h2>
        </div>
        <div className="bg-yellow-500 text-white rounded-xl p-5 shadow-lg">
          <p>Total Value</p><h2 className="text-3xl font-bold">₹{totalValue.toLocaleString("en-IN")}</h2>
        </div>
        <div className="bg-red-600 text-white rounded-xl p-5 shadow-lg">
          <p>Low Stock</p><h2 className="text-3xl font-bold">{lowStock}</h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-5">{editId ? "✏️ Update Stock" : "➕ Add New Stock"}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Rice Type" value={newStock.rice} onChange={(e) => setNewStock({ ...newStock, rice: e.target.value })} className="border rounded-lg p-3" />
          <input type="text" placeholder="Godown" value={newStock.godown} onChange={(e) => setNewStock({ ...newStock, godown: e.target.value })} className="border rounded-lg p-3" />
          <input type="number" placeholder="Quantity" value={newStock.quantity} onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })} className="border rounded-lg p-3" />
          <input type="number" placeholder="Rate" value={newStock.rate} onChange={(e) => setNewStock({ ...newStock, rate: e.target.value })} className="border rounded-lg p-3" />
        </div>
        <button onClick={saveStock} className="mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
          {editId ? "Update Stock" : "Save Stock"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto mt-8">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading stocks...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-green-600 text-white">
              <tr><th className="p-4">Rice Type</th><th>Godown</th><th>Quantity</th><th>Rate</th><th>Date</th><th>Total Value</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredStocks.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500 text-lg">📦 No Stock Found</td></tr>
              ) : (
                filteredStocks.map((stock) => (
                  <tr key={stock.id} className="text-center border-b hover:bg-green-50">
                    <td className="p-4">{stock.rice}</td><td>{stock.godown}</td><td>{stock.quantity} Qt</td><td>₹{stock.rate}</td><td>{stock.date}</td><td>₹{(stock.quantity * stock.rate).toLocaleString("en-IN")}</td>
                    <td className="space-x-2"><button onClick={() => startEdit(stock)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button><button onClick={() => deleteStock(stock.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
