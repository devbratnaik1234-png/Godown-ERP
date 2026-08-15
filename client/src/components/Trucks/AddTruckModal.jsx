import { useEffect, useState } from "react";

function AddTruckModal({
  truck,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    truckNo: "",
    driver: "",
    mobile: "",
    farmer: "",
    quantity: "",
    date: "",
    type: "Incoming",
    purpose: "Paddy Purchase",
    status: "In Transit",
    remarks: "",
  });

  useEffect(() => {
    if (truck) {
      setFormData({
        truckNo: truck.truckNo || "",
        driver: truck.driver || "",
        mobile: truck.mobile || "",
        farmer: truck.farmer || "",
        quantity: truck.quantity || "",
        date: truck.date || "",
        type:
          truck.type ||
          truck.truckType ||
          "Incoming",
        purpose:
          truck.purpose ||
          "Paddy Purchase",
        status:
          truck.status ||
          "In Transit",
        remarks: truck.remarks || "",
      });
    }
  }, [truck]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Truck number
    const truckNumber = formData.truckNo
      .trim()
      .toUpperCase();

    const truckPattern =
      /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/;

    if (!truckPattern.test(truckNumber)) {
      alert(
        "Invalid Truck Number!\n\nExample: OD-02-AB-1234"
      );
      return;
    }

    // Mobile
    const mobile =
      formData.mobile.trim();

    if (!/^\d{10}$/.test(mobile)) {
      alert(
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    // Quantity
    const quantity =
      Number(formData.quantity);

    if (!quantity || quantity <= 0) {
      alert(
        "Quantity must be greater than 0."
      );
      return;
    }

    // Date
    if (!formData.date) {
      alert("Please select a date.");
      return;
    }

    // Final data
    const finalData = {
      ...formData,
      truckNo: truckNumber,
      mobile: mobile,
      quantity: String(quantity),
      type:
        formData.type || "Incoming",
    };

    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-slate-800">
            {truck
              ? "✏️ Edit Truck"
              : "🚚 Add New Truck"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl"
          >
            ×
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Truck Number */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Truck Number
            </label>

            <input
              type="text"
              name="truckNo"
              value={formData.truckNo}
              onChange={handleChange}
              placeholder="OD-02-AB-1234"
              required
              className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500 uppercase"
            />
          </div>

          {/* Driver + Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium text-gray-600">
                Driver Name
              </label>

              <input
                type="text"
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                placeholder="Driver Name"
                required
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Driver Mobile
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                maxLength="10"
                required
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

          </div>

          {/* Farmer + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium text-gray-600">
                Farmer Name
              </label>

              <input
                type="text"
                name="farmer"
                value={formData.farmer}
                onChange={handleChange}
                placeholder="Farmer Name"
                required
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Quantity (Quintal)
              </label>

              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="120"
                min="1"
                required
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

          </div>

          {/* Date + Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium text-gray-600">
                Date
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Truck Type
              </label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Incoming">
                  Incoming
                </option>

                <option value="Outgoing">
                  Outgoing
                </option>
              </select>
            </div>

          </div>

          {/* Purpose + Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium text-gray-600">
                Purpose
              </label>

              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Paddy Purchase">
                  Paddy Purchase
                </option>

                <option value="Paddy Delivery">
                  Paddy Delivery
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="In Transit">
                  In Transit
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

          </div>

          {/* Remarks */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Remarks
            </label>

            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="3"
              placeholder="Additional remarks..."
              className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
            >
              {truck
                ? "Update Truck"
                : "Save Truck"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddTruckModal;