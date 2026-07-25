import { useState } from "react";
import FarmerForm from "../../components/Farmer/FarmerForm";
import FarmerSearch from "../../components/Farmer/FarmerSearch";
import FarmerTable from "../../components/Farmer/FarmerTable";
import FarmerStats from "../../components/Farmer/FarmerStats";

export default function Farmers() {
  const [farmers, setFarmers] = useState([
    {
      id: 1,
      name: "Ramesh Kumar",
      village: "Bargarh",
      mobile: "9876543210",
      bank: "SBI",
      account: "123456789",
      status: "Paid",
    },
    {
      id: 2,
      name: "Suresh Singh",
      village: "Sambalpur",
      mobile: "9123456780",
      bank: "PNB",
      account: "987654321",
      status: "Pending",
    },
  ]);

  const [newFarmer, setNewFarmer] = useState({
    name: "",
    village: "",
    mobile: "",
    bank: "",
    account: "",
  });

  const [search, setSearch] = useState("");

  const addFarmer = () => {
    if (newFarmer.name.trim() === "") {
      alert("Please enter farmer name");
      return;
    }

    setFarmers([
      ...farmers,
      {
        id: Date.now(),
        ...newFarmer,
        status: "Pending",
      },
    ]);

    setNewFarmer({
      name: "",
      village: "",
      mobile: "",
      bank: "",
      account: "",
    });
  };

  const deleteFarmer = (id) => {
    if (window.confirm("Delete this farmer?")) {
      setFarmers(farmers.filter((farmer) => farmer.id !== id));
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Farmer Management</h1>

        <FarmerSearch
          search={search}
          setSearch={setSearch}
        />
      </div>

      <FarmerForm
        newFarmer={newFarmer}
        setNewFarmer={setNewFarmer}
        addFarmer={addFarmer}
      />

      <FarmerTable
        farmers={farmers}
        search={search}
        deleteFarmer={deleteFarmer}
      />

      <FarmerStats
        farmers={farmers}
      />
    </div>
  );
}