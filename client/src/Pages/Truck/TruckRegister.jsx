import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import TruckCards from "../../components/Trucks/TruckCards";
import TruckTable from "../../components/Trucks/TruckTable";
import AddTruckModal from "../../components/Trucks/AddTruckModal";
import { api } from "../../api";

function TruckRegister() {
  const [showModal, setShowModal] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [editingTruck, setEditingTruck] = useState(null);
  const [viewTruck, setViewTruck] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeTruck = (truck) => ({
    ...truck,
    id: truck._id,
    quantity: String(truck.quantity ?? ""),
    date: truck.date ? new Date(truck.date).toISOString().split("T")[0] : "",
  });

  const loadTrucks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.list("trucks");
      setTrucks(data.map(normalizeTruck));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrucks();
  }, []);

  const handleSaveTruck = async (truckData) => {
    const truckNumber = truckData.truckNo.trim().toUpperCase();
    const duplicateTruck = trucks.find(
      (truck) =>
        truck.truckNo?.trim().toUpperCase() === truckNumber &&
        (!editingTruck || truck.id !== editingTruck.id)
    );

    if (duplicateTruck) {
      alert(`Truck number ${truckNumber} already exists!`);
      return;
    }

    const payload = {
      ...truckData,
      truckNo: truckNumber,
      type: truckData.type || truckData.truckType || "Incoming",
      quantity: Number(truckData.quantity || 0),
    };

    try {
      setError("");
      if (editingTruck) {
        const updated = await api.update("trucks", editingTruck.id, payload);
        const normalized = normalizeTruck(updated);
        setTrucks((prev) =>
          prev.map((truck) => (truck.id === editingTruck.id ? normalized : truck))
        );
      } else {
        const created = await api.create("trucks", payload);
        setTrucks((prev) => [normalizeTruck(created), ...prev]);
      }
      setEditingTruck(null);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this truck?")) return;
    try {
      setError("");
      await api.remove("trucks", id);
      setTrucks((prev) => prev.filter((truck) => truck.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTrucks = trucks.filter((truck) => {
    const searchText = search.toLowerCase().trim();
    const truckNumber = String(truck.truckNo || "").toLowerCase();
    const driverName = String(truck.driver || "").toLowerCase();
    const farmerName = String(truck.farmer || "").toLowerCase();
    const truckType = String(truck.type || "").trim();
    const truckStatus = String(truck.status || "").trim();

    const matchesSearch =
      truckNumber.includes(searchText) ||
      driverName.includes(searchText) ||
      farmerName.includes(searchText);
    const matchesStatus =
      statusFilter === "All" || truckStatus.toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "All" || truckType.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">🚚 Truck Register</h1>
          <p className="text-gray-500 mt-1">Manage all incoming and outgoing trucks.</p>
        </div>
        <button
          onClick={() => {
            setEditingTruck(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 font-semibold"
        >
          <Plus size={20} /> Add Truck
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <TruckCards trucks={trucks} />

      <div className="bg-white rounded-2xl shadow-lg p-5 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Search truck, driver or farmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Status</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Truck Type</option>
            <option value="Incoming">Incoming</option>
            <option value="Outgoing">Outgoing</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-10 mt-8 text-center text-gray-500">
          Loading trucks...
        </div>
      ) : (
        <TruckTable
          trucks={filteredTrucks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={setViewTruck}
        />
      )}

      {showModal && (
        <AddTruckModal
          truck={editingTruck}
          onClose={() => {
            setShowModal(false);
            setEditingTruck(null);
          }}
          onSave={handleSaveTruck}
        />
      )}

      {viewTruck && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">🚚 Truck Details</h2>
              <button onClick={() => setViewTruck(null)} className="text-gray-500 hover:text-red-500 text-2xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Truck Number" value={viewTruck.truckNo} />
              <Detail label="Driver" value={viewTruck.driver} />
              <Detail label="Mobile" value={viewTruck.mobile} />
              <Detail label="Farmer" value={viewTruck.farmer} />
              <Detail label="Quantity" value={`${viewTruck.quantity} Qt`} />
              <Detail label="Date" value={viewTruck.date} />
              <Detail label="Type" value={viewTruck.type || "Incoming"} />
              <Detail label="Purpose" value={viewTruck.purpose} />
              <Detail label="Status" value={viewTruck.status} />
            </div>
            {viewTruck.remarks && (
              <div className="mt-5 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Remarks</p>
                <p className="font-medium mt-1">{viewTruck.remarks}</p>
              </div>
            )}
            <button onClick={() => setViewTruck(null)} className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

export default TruckRegister;
