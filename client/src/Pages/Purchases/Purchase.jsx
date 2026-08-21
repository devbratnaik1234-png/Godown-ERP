import { useEffect, useState } from "react";
import PurchaseCards from "../../components/Cards/PurchaseCards";
import PurchaseSearch from "../../components/Search/PurchaseSearch";
import PurchaseForm from "../../components/Forms/PurchaseForm";
import PurchaseTable from "../../components/Tables/PurchaseTable";
import { api } from "../../api";

export default function Purchase() {
  const today = new Date().toISOString().split("T")[0];
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
    purchaseId: "PUR001",
    date: today,
    farmer: "",
    paddyType: "",
    quantity: "",
    rate: "",
    total: "",
    truck: "",
    moisture: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatPurchase = (purchase) => ({
    ...purchase,
    id: purchase._id,
    date: purchase.date
      ? new Date(purchase.date).toISOString().split("T")[0]
      : "",
  });

  const getNextPurchaseId = (items) => {
    const maxNumber = items.reduce((max, item) => {
      const number = Number(String(item.purchaseId || "").replace(/\D/g, "")) || 0;
      return Math.max(max, number);
    }, 0);
    return `PUR${String(maxNumber + 1).padStart(3, "0")}`;
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.list("purchases");
      const formatted = data.map(formatPurchase);
      setPurchases(formatted);
      setFormData((prev) => ({ ...prev, purchaseId: getNextPurchaseId(formatted) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    const quantity = Number(updatedData.quantity) || 0;
    const rate = Number(updatedData.rate) || 0;
    updatedData.total = quantity * rate;
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      const created = await api.create("purchases", {
        ...formData,
        quantity: Number(formData.quantity || 0),
        rate: Number(formData.rate || 0),
        moisture: Number(formData.moisture || 0),
      });
      const nextPurchases = [formatPurchase(created), ...purchases];
      setPurchases(nextPurchases);
      setFormData({
        purchaseId: getNextPurchaseId(nextPurchases),
        date: today,
        farmer: "",
        paddyType: "",
        quantity: "",
        rate: "",
        total: "",
        truck: "",
        moisture: "",
        remarks: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase record?")) return;

    try {
      setError("");
      await api.remove("purchases", id);
      setPurchases((prev) => prev.filter((purchase) => purchase.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-2">Paddy Purchase</h1>
      <p className="text-gray-500 mb-8">
        Manage all paddy purchases from farmers.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <PurchaseCards />

      <div className="mt-8">
        <PurchaseSearch />
      </div>

      <PurchaseForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 mt-6 text-center text-gray-500">
          Loading purchase history...
        </div>
      ) : (
        <PurchaseTable purchases={purchases} onDelete={handleDelete} />
      )}
    </div>
  );
}
