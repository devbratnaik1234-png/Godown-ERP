import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import PaymentCards from "../../components/Payments/PaymentCards";
import PaymentTable from "../../components/Payments/PaymentTable";
import PaymentSummary from "../../components/Payments/PaymentSummary";
import PaymentChart from "../../components/Payments/PaymentChart";
import RecentTransactions from "../../components/Payments/RecentTransactions";
import AddPaymentModal from "../../components/Payments/AddPaymentModal";
import { Plus } from "lucide-react";
import { api } from "../../api";

function Payments() {
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizePayment = (payment) => ({
    ...payment,
    id: payment._id,
    amount: `₹${Number(payment.amount || 0).toLocaleString("en-IN")}`,
    date: payment.date
      ? new Date(payment.date).toISOString().split("T")[0]
      : "",
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.list("payments");
      setPayments(data.map(normalizePayment));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const savePayment = async (payment) => {
    try {
      setError("");
      if (editingPayment) {
        const updated = await api.update("payments", editingPayment.id, payment);
        const normalized = normalizePayment(updated);
        setPayments((prev) =>
          prev.map((item) => (item.id === editingPayment.id ? normalized : item))
        );
      } else {
        const created = await api.create("payments", payment);
        setPayments((prev) => [normalizePayment(created), ...prev]);
      }
      setShowModal(false);
      setEditingPayment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      setError("");
      await api.remove("payments", id);
      setPayments((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              💳 Payment Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all farmer payments from one place.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingPayment(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition"
          >
            <Plus size={20} />
            Add Payment
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <PaymentCards />

        <div className="mt-8">
          {loading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow">
              Loading payments...
            </div>
          ) : (
            <PaymentTable
              payments={payments}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <PaymentChart payments={payments} />
          </div>
          <PaymentSummary payments={payments} />
        </div>

        <div className="mt-8">
          <RecentTransactions payments={payments} />
        </div>
      </div>

      {showModal && (
        <AddPaymentModal
          onClose={() => {
            setShowModal(false);
            setEditingPayment(null);
          }}
          addPayment={savePayment}
          payment={editingPayment}
        />
      )}
    </div>
  );
}

export default Payments;
