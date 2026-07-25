export default function FarmerForm({
  newFarmer,
  setNewFarmer,
  addFarmer,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Add New Farmer</h2>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Farmer Name"
          value={newFarmer.name}
          onChange={(e) =>
            setNewFarmer({ ...newFarmer, name: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Village"
          value={newFarmer.village}
          onChange={(e) =>
            setNewFarmer({ ...newFarmer, village: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Mobile"
          value={newFarmer.mobile}
          onChange={(e) =>
            setNewFarmer({ ...newFarmer, mobile: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Bank"
          value={newFarmer.bank}
          onChange={(e) =>
            setNewFarmer({ ...newFarmer, bank: e.target.value })
          }
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Account Number"
          value={newFarmer.account}
          onChange={(e) =>
            setNewFarmer({ ...newFarmer, account: e.target.value })
          }
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={addFarmer}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-4"
      >
        Save Farmer
      </button>
    </div>
  );
}