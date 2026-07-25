import { useState } from "react";
import PurchaseCards from "../../components/Cards/PurchaseCards";
import PurchaseSearch from "../../components/Search/PurchaseSearch";
import PurchaseForm from "../../components/Forms/PurchaseForm";
import PurchaseTable from "../../components/Tables/PurchaseTable";

export default function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
  purchaseId: "",
  date: "",
  farmer: "",
  paddyType: "",
  quantity: "",
  rate: "",
  total: "",
  truck: "",
  moisture: "",
  remarks: "",
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

  setPurchases([...purchases, formData]);

  console.log(formData);
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