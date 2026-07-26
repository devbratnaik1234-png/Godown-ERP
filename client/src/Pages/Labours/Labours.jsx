import { useState } from "react";
import LabourCards from "../../components/Cards/LabourCards";
import LabourForm from "../../components/Forms/LabourForm";
import LabourTable from "../../components/Tables/LabourTable";

export default function Labours() {

  const today = new Date().toISOString().split("T")[0];

  const [labourCount, setLabourCount] = useState(1);

  const [labours, setLabours] = useState([]);

  const [formData, setFormData] = useState({
    labourId: `LAB${String(labourCount).padStart(3, "0")}`,
    name: "",
    mobile: "",
    village: "",
    workType: "",
    dailyWage: "",
    joiningDate: today,
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLabours([...labours, formData]);

    const nextId = labourCount + 1;
    setLabourCount(nextId);

    setFormData({
      labourId: `LAB${String(nextId).padStart(3, "0")}`,
      name: "",
      mobile: "",
      village: "",
      workType: "",
      dailyWage: "",
      joiningDate: today,
      status: "Active",
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-4xl font-bold mb-2">
        Labour Management
      </h1>

      <p className="text-gray-500 mb-8">
        Manage labour registration, work type and daily wages.
      </p>

      <LabourCards />

      <LabourForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <LabourTable
        labours={labours}
      />

    </div>
  );
}