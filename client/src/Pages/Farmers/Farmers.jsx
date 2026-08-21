import { useEffect, useState } from "react";
import FarmerForm from "../../components/Farmer/FarmerForm";
import FarmerSearch from "../../components/Farmer/FarmerSearch";
import FarmerTable from "../../components/Farmer/FarmerTable";
import FarmerStats from "../../components/Farmer/FarmerStats";
import { api } from "../../api";

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [newFarmer, setNewFarmer] = useState({
    name: "",
    village: "",
    mobile: "",
    bank: "",
    account: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeFarmer = (farmer) => ({
    ...farmer,
    id: farmer._id,
  });

  const loadFarmers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.list("farmers");
      setFarmers(data.map(normalizeFarmer));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmers();
  }, []);

  const addFarmer = async () => {
    if (newFarmer.name.trim() === "") {
      alert("Please enter farmer name");
      return;
    }

    try {
      setError("");
      const created = await api.create("farmers", {
        ...newFarmer,
        status: "Pending",
      });
      setFarmers((prev) => [normalizeFarmer(created), ...prev]);
      setNewFarmer({
        name: "",
        village: "",
        mobile: "",
        bank: "",
        account: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteFarmer = async (id) => {
    if (!window.confirm("Delete this farmer?")) return;

    try {
      setError("");
      await api.remove("farmers", id);
      setFarmers((prev) => prev.filter((farmer) => farmer.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Farmer Management</h1>
        <FarmerSearch search={search} setSearch={setSearch} />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <FarmerForm
        newFarmer={newFarmer}
        setNewFarmer={setNewFarmer}
        addFarmer={addFarmer}
      />

      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Loading farmers...
        </div>
      ) : (
        <FarmerTable
          farmers={farmers}
          search={search}
          deleteFarmer={deleteFarmer}
        />
      )}

      <FarmerStats farmers={farmers} />
    </div>
  );
}
