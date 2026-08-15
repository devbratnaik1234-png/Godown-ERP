import { useState, useEffect } from "react";

function AddPaymentModal({ onClose, addPayment, payment }) {

  // Form er initial state
  // Ekhane default value set kora ache
  const [formData, setFormData] = useState({
    farmer: "",        // Farmer name
    amount: "",        // Payment amount
    method: "Cash",    // Default payment method
    date: "",          // Payment date
    status: "Paid",    // Default status
    remarks: "",       // Extra note
  });

  // ==========================
  // Edit Mode
  // Jodi payment object thake tahole existing data form e load hobe
  // ==========================
  useEffect(() => {
    if (payment) {
      setFormData({
        farmer: payment.farmer,

        // "₹" sign remove kore input e sudhu number dekhabe
        amount: payment.amount.replace("₹", "").replace(/,/g, ""),

        method: payment.method,
        date: payment.date,
        status: payment.status,

        // Remarks na thakle empty string hobe
        remarks: payment.remarks || "",
      });
    }
  }, [payment]);

  // ==========================
  // Input change hole state update hobe
  // Notun input add korle ekhane change korte hobe na
  // ==========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // Save button click korle
  // Validation + Data Save
  // ==========================
  const handleSave = () => {

    // Required field check
    // Jodi aro field mandatory korte chao ekhane add korbe
    if (
      formData.farmer.trim() === "" ||
      formData.amount.trim() === "" ||
      formData.date === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Parent component e data pathano hocche
    addPayment({
      farmer: formData.farmer,

      // Amount er age ₹ add hocche
      // Dollar ba onno currency hole ekhane change korbe
      amount: `₹${formData.amount}`,

      method: formData.method,
      date: formData.date,
      status: formData.status,
      remarks: formData.remarks,
    });
  };

  return (

    // Background Overlay
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      {/* Main Modal Box
          Width change korte chaile w-[500px] change korbe */}
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-8">

        {/* Heading
            Add/Edit text change korte ekhane modify korbe */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {payment ? "✏ Edit Payment" : "➕ Add New Payment"}
        </h2>

        <div className="space-y-4">

          {/* Farmer Name */}
          <input
            type="text"
            name="farmer"
            placeholder="Farmer Name"   // Placeholder change korte ekhane
            value={formData.farmer}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          {/* Amount */}
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          {/* Payment Method
              Notun method add korte option add korbe */}
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

          {/* Date */}
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

          {/* Payment Status
              Notun status add korte option add korbe */}
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option>Paid</option>
            <option>Pending</option>
          </select>

          {/* Remarks */}
          <textarea
            rows="3"
            name="remarks"
            placeholder="Remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">

          {/* Cancel Button
              Color change korte className modify korbe */}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          {/* Save/Update Button
              Green color change korte bg-green-600 modify korbe */}
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