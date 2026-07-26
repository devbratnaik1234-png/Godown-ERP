import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";

import PaymentCards from "../../components/Payments/PaymentCards";
import PaymentTable from "../../components/Payments/PaymentTable";
import PaymentSummary from "../../components/Payments/PaymentSummary";
import PaymentChart from "../../components/Payments/PaymentChart";
import RecentTransactions from "../../components/Payments/RecentTransactions";
import AddPaymentModal from "../../components/Payments/AddPaymentModal";

import { Plus } from "lucide-react";

const defaultPayments = [
  {
    id: 1,
    farmer: "Ramesh Kumar",
    amount: "₹45,000",
    method: "UPI",
    date: "26 Jul 2026",
    status: "Paid",
  },
  {
    id: 2,
    farmer: "Suresh Singh",
    amount: "₹32,000",
    method: "Bank Transfer",
    date: "25 Jul 2026",
    status: "Pending",
  },
  {
    id: 3,
    farmer: "Amit Yadav",
    amount: "₹18,500",
    method: "Cash",
    date: "24 Jul 2026",
    status: "Paid",
  },
];

function Payments() {
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Load payments from Local Storage
  const [payments, setPayments] = useState(() => {
    const savedPayments = localStorage.getItem("payments");
    return savedPayments
      ? JSON.parse(savedPayments)
      : defaultPayments;
  });

  // Save payments to Local Storage
  useEffect(() => {
    localStorage.setItem("payments", JSON.stringify(payments));
  }, [payments]);

  // Add OR Update Payment
  const savePayment = (payment) => {
    if (editingPayment) {
      setPayments((prev) =>
        prev.map((item) =>
          item.id === editingPayment.id
            ? {
                ...item,
                ...payment,
                id: editingPayment.id,
              }
            : item
        )
      );
    } else {
      setPayments((prev) => [
        {
          id: Date.now(),
          ...payment,
        },
        ...prev,
      ]);
    }

    setShowModal(false);
    setEditingPayment(null);
  };

  // Edit Payment
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setShowModal(true);
  };

  // Delete Payment
  const handleDelete = (id) => {
    if (window.confirm("Delete this payment?")) {
      setPayments((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-8">

        {/* Header */}
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

        {/* Cards */}
        <PaymentCards />

        {/* Payment Table */}
        <div className="mt-8">
          <PaymentTable
            payments={payments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Chart + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <PaymentChart payments={payments} />
          </div>

          <PaymentSummary payments={payments} />
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <RecentTransactions payments={payments} />
        </div>
      </div>

      {/* Add/Edit Modal */}
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