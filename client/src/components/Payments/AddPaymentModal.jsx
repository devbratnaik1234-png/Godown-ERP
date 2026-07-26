import { useState, useEffect } from "react";

function AddPaymentModal({ onClose, addPayment, payment }) {
  const [formData, setFormData] = useState({
    farmer: "",
    amount: "",
    method: "Cash",
    date: "",
    status: "Paid",
    remarks: "",
  });

  // Edit Mode
  useEffect(() => {
    if (payment) {
      setFormData({
        farmer: payment.farmer,
        amount: payment.amount.replace("₹", "").replace(/,/g, ""),
        method: payment.method,
        date: payment.date,
        status: payment.status,
        remarks: payment.remarks || "",
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    if (
      formData.farmer.trim() === "" ||
      formData.amount.trim() === "" ||
      formData.date === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    addPayment({
      farmer: formData.farmer,
      amount: `₹${formData.amount}`,
      method: formData.method,
      date: formData.date,
      status: formData.status,
      remarks: formData.remarks,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-8">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {payment ? "✏ Edit Payment" : "➕ Add New Payment"}
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            name="farmer"
            placeholder="Farmer Name"
            value={formData.farmer}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>NEFT</option>
          </select>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option>Paid</option>
            <option>Pending</option>
          </select>

          <textarea
            rows="3"
            name="remarks"
            placeholder="Remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

        </div>

        <div className="flex justify-end gap-4 mt-6">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white"
          >
            {payment ? "Update Payment" : "Save Payment"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default AddPaymentModal;