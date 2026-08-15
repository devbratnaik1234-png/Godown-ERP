// Purchase Entry Form Component
// Notun Paddy Purchase Record collect korar jonno ei form use kora hoyeche
export default function PurchaseForm({
  formData, // Current Purchase Form Data
  handleChange, // Input Value Update Function
  handleSubmit, // Form Submit Function
}) {
  return (

    // Main Form Container
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">

      {/* Form Heading */}
      <h2 className="text-2xl font-bold mb-6">
        Paddy Purchase Entry
      </h2>

      {/* Form Start
          Submit korle handleSubmit() Function call hobe */}
      <form onSubmit={handleSubmit}>

        {/* Responsive Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Purchase ID */}
          <input
            type="text"
            name="purchaseId"
            value={formData.purchaseId}
            onChange={handleChange}
            placeholder="Purchase ID"
            className="border rounded-lg p-3"
          />

          {/* Purchase Date */}
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          {/* Farmer Selection */}
          <select
            name="farmer"
            value={formData.farmer}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option value="">Select Farmer</option>
            <option value="Samarjit Chatterjee">Samarjit Chatterjee</option>
            <option value="Sreya Rana">Sreya Rana</option>
            <option value="Devrat Naik">Devrat Naik</option>
          </select>

          {/* Paddy Type Selection */}
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

          {/* Purchase Quantity */}
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Quantity (Qt)"
            className="border rounded-lg p-3"
          />

          {/* Purchase Rate */}
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            placeholder="Rate per Qt"
            className="border rounded-lg p-3"
          />

          {/* Auto Calculated Total Amount
              Quantity × Rate onujayi automatically calculate hobe */}
          <input
            type="number"
            name="total"
            value={formData.total}
            readOnly
            placeholder="Total Amount"
            className="border rounded-lg p-3 bg-gray-100 cursor-not-allowed font-semibold text-green-700"
          />

          {/* Truck Number */}
          <input
            type="text"
            name="truck"
            value={formData.truck}
            onChange={handleChange}
            placeholder="Truck Number"
            className="border rounded-lg p-3"
          />

          {/* Moisture Percentage */}
          <input
            type="number"
            name="moisture"
            value={formData.moisture}
            onChange={handleChange}
            placeholder="Moisture (%)"
            className="border rounded-lg p-3"
          />

        </div>

        {/* Additional Remarks */}
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Remarks..."
          className="border rounded-lg p-3 w-full mt-5 h-24"
        />

        {/* Save Purchase Button
            Click korle Purchase Record save hobe */}
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