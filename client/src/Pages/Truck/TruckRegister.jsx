import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import TruckCards from "../../components/Trucks/TruckCards";
import TruckTable from "../../components/Trucks/TruckTable";
import AddTruckModal from "../../components/Trucks/AddTruckModal";

function TruckRegister() {
  const [showModal, setShowModal] = useState(false);

  const [trucks, setTrucks] = useState(() => {
    const saved = localStorage.getItem("truckRegister");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return parsed.map((truck) => ({
          ...truck,
          type:
            truck.type ||
            truck.truckType ||
            "Incoming",
        }));
      } catch (error) {
        console.error(
          "Error loading truck data:",
          error
        );
      }
    }

    return [
      {
        id: 1,
        truckNo: "OD-02-AB-1234",
        driver: "Rakesh Kumar",
        mobile: "9876543210",
        farmer: "Ramesh Kumar",
        quantity: "120",
        date: "2026-07-26",
        status: "Completed",
        type: "Incoming",
        purpose: "Paddy Purchase",
        remarks: "",
      },
      {
        id: 2,
        truckNo: "OD-05-CD-4567",
        driver: "Suresh Singh",
        mobile: "9876543211",
        farmer: "Amit Yadav",
        quantity: "150",
        date: "2026-07-26",
        status: "In Transit",
        type: "Incoming",
        purpose: "Paddy Purchase",
        remarks: "",
      },
      {
        id: 3,
        truckNo: "OD-33-EF-7890",
        driver: "Mahesh Patel",
        mobile: "9876543212",
        farmer: "Suresh Singh",
        quantity: "100",
        date: "2026-07-25",
        status: "Completed",
        type: "Outgoing",
        purpose: "Paddy Delivery",
        remarks: "",
      },
    ];
  });

  const [editingTruck, setEditingTruck] =
    useState(null);

  const [viewTruck, setViewTruck] =
    useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  // Save data to LocalStorage
  useEffect(() => {
    localStorage.setItem(
      "truckRegister",
      JSON.stringify(trucks)
    );
  }, [trucks]);

  // Add / Edit Truck
  const handleSaveTruck = (truckData) => {
    const truckNumber = truckData.truckNo
      .trim()
      .toUpperCase();

    // Duplicate Truck Number Check
    const duplicateTruck = trucks.find(
      (truck) =>
        truck.truckNo
          ?.trim()
          .toUpperCase() === truckNumber &&
        (!editingTruck ||
          truck.id !== editingTruck.id)
    );

    if (duplicateTruck) {
      alert(
        `Truck number ${truckNumber} already exists!`
      );
      return;
    }

    const cleanedTruckData = {
      ...truckData,

      truckNo: truckNumber,

      type:
        truckData.type ||
        truckData.truckType ||
        "Incoming",

      quantity: String(
        Number(truckData.quantity)
      ),
    };

    // Edit existing truck
    if (editingTruck) {
      setTrucks((prev) =>
        prev.map((truck) =>
          truck.id === editingTruck.id
            ? {
                ...truck,
                ...cleanedTruckData,
              }
            : truck
        )
      );

      setEditingTruck(null);
    }

    // Add new truck
    else {
      setTrucks((prev) => [
        ...prev,
        {
          ...cleanedTruckData,
          id: Date.now(),
        },
      ]);
    }

    setShowModal(false);
  };

  // Edit
  const handleEdit = (truck) => {
    setEditingTruck(truck);
    setShowModal(true);
  };

  // Delete
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this truck?"
    );

    if (!confirmDelete) return;

    setTrucks((prev) =>
      prev.filter(
        (truck) => truck.id !== id
      )
    );
  };

  // Search + Filters
  const filteredTrucks = trucks.filter(
    (truck) => {
      const searchText =
        search.toLowerCase().trim();

      const truckNumber = String(
        truck.truckNo || ""
      ).toLowerCase();

      const driverName = String(
        truck.driver || ""
      ).toLowerCase();

      const farmerName = String(
        truck.farmer || ""
      ).toLowerCase();

      const truckType = String(
        truck.type ||
          truck.truckType ||
          ""
      ).trim();

      const truckStatus = String(
        truck.status || ""
      ).trim();

      // Search
      const matchesSearch =
        truckNumber.includes(searchText) ||
        driverName.includes(searchText) ||
        farmerName.includes(searchText);

      // Status Filter
      const matchesStatus =
        statusFilter === "All" ||
        truckStatus.toLowerCase() ===
          statusFilter.toLowerCase();

      // Type Filter
      const matchesType =
        typeFilter === "All" ||
        truckType.toLowerCase() ===
          typeFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    }
  );

  return (
    <div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            🚚 Truck Register
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all incoming and outgoing trucks.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTruck(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 font-semibold"
        >
          <Plus size={20} />
          Add Truck
        </button>

      </div>

      {/* Dynamic Cards */}
      <TruckCards trucks={trucks} />

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mt-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search truck, driver or farmer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">
              All Status
            </option>

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

          {/* Truck Type */}
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            className="border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">
              All Truck Type
            </option>

            <option value="Incoming">
              Incoming
            </option>

            <option value="Outgoing">
              Outgoing
            </option>
          </select>

        </div>

      </div>

      {/* Table */}
      <TruckTable
        trucks={filteredTrucks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={setViewTruck}
      />

      {/* Add / Edit Modal */}
      {showModal && (
        <AddTruckModal
          truck={editingTruck}
          onClose={() => {
            setShowModal(false);
            setEditingTruck(null);
          }}
          onSave={handleSaveTruck}
        />
      )}

      {/* View Modal */}
      {viewTruck && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold text-slate-800">
                🚚 Truck Details
              </h2>

              <button
                onClick={() =>
                  setViewTruck(null)
                }
                className="text-gray-500 hover:text-red-500 text-2xl"
              >
                ×
              </button>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <Detail
                label="Truck Number"
                value={viewTruck.truckNo}
              />

              <Detail
                label="Driver"
                value={viewTruck.driver}
              />

              <Detail
                label="Mobile"
                value={viewTruck.mobile}
              />

              <Detail
                label="Farmer"
                value={viewTruck.farmer}
              />

              <Detail
                label="Quantity"
                value={`${viewTruck.quantity} Qt`}
              />

              <Detail
                label="Date"
                value={viewTruck.date}
              />

              <Detail
                label="Type"
                value={
                  viewTruck.type ||
                  viewTruck.truckType ||
                  "Incoming"
                }
              />

              <Detail
                label="Purpose"
                value={viewTruck.purpose}
              />

              <Detail
                label="Status"
                value={viewTruck.status}
              />

            </div>

            {viewTruck.remarks && (
              <div className="mt-5 bg-gray-50 rounded-xl p-4">

                <p className="text-sm text-gray-500">
                  Remarks
                </p>

                <p className="font-medium mt-1">
                  {viewTruck.remarks}
                </p>

              </div>
            )}

            <button
              onClick={() =>
                setViewTruck(null)
              }
              className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-semibold text-slate-800 mt-1">
        {value}
      </p>

    </div>
  );
}

export default TruckRegister;