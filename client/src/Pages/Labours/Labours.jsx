import { useEffect, useState } from "react";
import LabourCards from "../../components/Cards/LabourCards";
import LabourForm from "../../components/Forms/LabourForm";
import LabourTable from "../../components/Tables/LabourTable";
import { api } from "../../api";

export default function Labours() {
  const today = new Date().toISOString().split("T")[0];
  const [labours, setLabours] = useState([]);
  const [formData, setFormData] = useState({
    labourId: "LAB001",
    name: "",
    mobile: "",
    village: "",
    workType: "",
    dailyWage: "",
    joiningDate: today,
    status: "Active",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatLabour = (labour) => ({
    ...labour,
    id: labour._id,
    joiningDate: labour.joiningDate
      ? new Date(labour.joiningDate).toISOString().split("T")[0]
      : "",
  });

  const getNextLabourId = (items) => {
    const maxNumber = items.reduce((max, item) => {
      const number = Number(String(item.labourId || "").replace(/\D/g, "")) || 0;
      return Math.max(max, number);
    }, 0);
    return `LAB${String(maxNumber + 1).padStart(3, "0")}`;
  };

  const loadLabours = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.list("labours");
      const formatted = data.map(formatLabour);
      setLabours(formatted);
      setFormData((prev) => ({ ...prev, labourId: getNextLabourId(formatted) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabours();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      const created = await api.create("labours", {
        ...formData,
        dailyWage: Number(formData.dailyWage || 0),
      });
      const nextLabours = [formatLabour(created), ...labours];
      setLabours(nextLabours);
      setFormData({
        labourId: getNextLabourId(nextLabours),
        name: "",
        mobile: "",
        village: "",
        workType: "",
        dailyWage: "",
        joiningDate: today,
        status: "Active",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this labour record?")) return;

    try {
      setError("");
      await api.remove("labours", id);
      const remaining = labours.filter((labour) => labour.id !== id);
      setLabours(remaining);
      setFormData((prev) => ({ ...prev, labourId: getNextLabourId(remaining) }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-2">Labour Management</h1>
      <p className="text-gray-500 mb-8">
        Manage labour registration, work type and daily wages.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <LabourCards />

      <LabourForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          Loading labour records...
        </div>
      ) : (
        <LabourTable labours={labours} onDelete={handleDelete} />
      )}
    </div>
  );
}
