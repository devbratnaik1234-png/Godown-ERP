import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";

import PaymentCards from "../../components/Payments/PaymentCards";
import PaymentTable from "../../components/Payments/PaymentTable";
import PaymentSummary from "../../components/Payments/PaymentSummary";
import PaymentChart from "../../components/Payments/PaymentChart";
import RecentTransactions from "../../components/Payments/RecentTransactions";
import AddPaymentModal from "../../components/Payments/AddPaymentModal";

import { Plus } from "lucide-react";

function Payments() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-8">

        {/* Page Title + Add Payment Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              💳 Payment Management
            </h1>

            <p className="text-gray-500 mt-1">
              Manage all farmer payments from one place.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <Plus size={20} />
            Add Payment
          </button>

        </div>

        {/* Payment Cards */}
        <PaymentCards />

        {/* Full Width Payment Table */}
        <div className="mt-8">
          <PaymentTable />
        </div>

        {/* Chart + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

          <div className="lg:col-span-2">
            <PaymentChart />
          </div>

          <PaymentSummary />

        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <RecentTransactions />
        </div>

      </div>

      {/* Add Payment Modal */}
     {showModal && (
  <AddPaymentModal
    onClose={() => setShowModal(false)}
  />
)}

    </div>
  );
}

export default Payments;