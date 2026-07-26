export default function PurchaseForm({
  formData,
  handleChange,
  handleSubmit,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">
        Paddy Purchase Entry
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          <input
            type="text"
            name="purchaseId"
            value={formData.purchaseId}
            onChange={handleChange}
            placeholder="Purchase ID"
            className="border rounded-lg p-3"
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <select
            name="farmer"
            value={formData.farmer}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option value="">Select Farmer</option>
            <option value="Ramesh Kumar">Ramesh Kumar</option>
            <option value="Suresh Singh">Suresh Singh</option>
            <option value="Mahesh Patel">Mahesh Patel</option>
          </select>

          <select
            name="paddyType"
            value={formData.paddyType}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option value="">Select Paddy Type</option>
            <option value="Swarna">Swarna</option>
            <option value="MTU-1010">MTU-1010</option>
            <option value="BPT-5204">BPT-5204</option>
            <option value="IR-64">IR-64</option>
          </select>

          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity (Qt)"
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            placeholder="Rate per Qt"
            className="border rounded-lg p-3"
          />

          {/* Auto Calculated Total Amount */}
          <input
            type="number"
            name="total"
            value={formData.total}
            readOnly
            placeholder="Total Amount"
            className="border rounded-lg p-3 bg-gray-100 cursor-not-allowed font-semibold text-green-700"
          />

          <input
            type="text"
            name="truck"
            value={formData.truck}
            onChange={handleChange}
            placeholder="Truck Number"
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="moisture"
            value={formData.moisture}
            onChange={handleChange}
            placeholder="Moisture (%)"
            className="border rounded-lg p-3"
          />

        </div>

        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Remarks..."
          className="border rounded-lg p-3 w-full mt-5 h-24"
        />

        <button
          type="submit"
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Save Purchase
        </button>
      </form>
    </div>
  );
}