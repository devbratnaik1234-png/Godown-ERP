import { useState } from "react";
import PurchaseCards from "../../components/Cards/PurchaseCards";
import PurchaseSearch from "../../components/Search/PurchaseSearch";
import PurchaseForm from "../../components/Forms/PurchaseForm";
import PurchaseTable from "../../components/Tables/PurchaseTable";

export default function Purchase() {

  // Today's Date
  const today = new Date().toISOString().split("T")[0];

  // Purchase Counter
  const [purchaseCount, setPurchaseCount] = useState(1);

  const [purchases, setPurchases] = useState([]);

  const [formData, setFormData] = useState({
    purchaseId: `PUR${String(purchaseCount).padStart(3, "0")}`,
    date: today,
    farmer: "",
    paddyType: "",
    quantity: "",
    rate: "",
    total: "",
    truck: "",
    moisture: "",
    remarks: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    // Auto Calculate Total
    const quantity = Number(updatedData.quantity) || 0;
    const rate = Number(updatedData.rate) || 0;

    updatedData.total = quantity * rate;

    setFormData(updatedData);
  };

  // Save Purchase
  const handleSubmit = (e) => {
    e.preventDefault();

    setPurchases([...purchases, formData]);

    const nextCount = purchaseCount + 1;
    setPurchaseCount(nextCount);

    // Reset Form
    setFormData({
      purchaseId: `PUR${String(nextCount).padStart(3, "0")}`,
      date: today,
      farmer: "",
      paddyType: "",
      quantity: "",
      rate: "",
      total: "",
      truck: "",
      moisture: "",
      remarks: "",
    });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-4xl font-bold mb-2">
        Paddy Purchase
      </h1>

      <p className="text-gray-500 mb-8">
        Manage all paddy purchases from farmers.
      </p>

      <PurchaseCards />

      <div className="mt-8">
        <PurchaseSearch />
      </div>

      <PurchaseForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <PurchaseTable purchases={purchases} />

    </div>
  );
}