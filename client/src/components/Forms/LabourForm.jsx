export default function LabourForm({
  formData,
  handleChange,
  handleSubmit,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">

      <h2 className="text-2xl font-bold mb-6">
        Labour Registration
      </h2>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          <input
            type="text"
            name="labourId"
            value={formData.labourId}
            readOnly
            className="border rounded-lg p-3 bg-gray-100 cursor-not-allowed"
          />

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Labour Name"
            className="border rounded-lg p-3"
            required
          />

          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="border rounded-lg p-3"
            required
          />

          <input
            type="text"
            name="village"
            value={formData.village}
            onChange={handleChange}
            placeholder="Village"
            className="border rounded-lg p-3"
            required
          />

          <select
            name="workType"
            value={formData.workType}
            onChange={handleChange}
            className="border rounded-lg p-3"
            required
          >
            <option value="">Select Work Type</option>
            <option value="Loading">Loading</option>
            <option value="Unloading">Unloading</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Packing">Packing</option>
            <option value="Sorting">Sorting</option>
          </select>

          <input
            type="number"
            name="dailyWage"
            value={formData.dailyWage}
            onChange={handleChange}
            placeholder="Daily Wage (₹)"
            className="border rounded-lg p-3"
            required
          />

          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border rounded-lg p-3"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

        </div>

        <button
          type="submit"
          className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Save Labour
        </button>

      </form>

    </div>
  );
}