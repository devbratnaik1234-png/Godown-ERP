function AddPaymentModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-8">

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          ➕ Add New Payment
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Farmer Name"
            className="w-full border rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Amount"
            className="w-full border rounded-xl p-3"
          />

          <select className="w-full border rounded-xl p-3">
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>NEFT</option>
          </select>

          <input
            type="date"
            className="w-full border rounded-xl p-3"
          />

          <select className="w-full border rounded-xl p-3">
            <option>Paid</option>
            <option>Pending</option>
          </select>

          <textarea
            rows="3"
            placeholder="Remarks"
            className="w-full border rounded-xl p-3"
          ></textarea>

        </div>

        <div className="flex justify-end gap-4 mt-6">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition">
            Save Payment
          </button>

        </div>

      </div>
    </div>
  );
}

export default AddPaymentModal;