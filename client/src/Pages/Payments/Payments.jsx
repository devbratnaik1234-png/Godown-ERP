import Navbar from "../../components/Navbar/Navbar";
import PaymentCards from "../../components/Payments/PaymentCards";
import PaymentTable from "../../components/Payments/PaymentTable";
import PaymentSummary from "../../components/Payments/PaymentSummary";
import PaymentChart from "../../components/Payments/PaymentChart";
import RecentTransactions from "../../components/Payments/RecentTransactions";

function Payments() {
  return (
    <div className="flex-1 bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-8">

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            💳 Payment Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all farmer payments from one place.
          </p>
        </div>

        {/* Cards */}
        <PaymentCards />

        {/* Table + Summary */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">

          <div className="lg:col-span-2">
            <PaymentTable />
          </div>

          <PaymentSummary />

        </div>

        {/* Chart */}
        <PaymentChart />

        {/* Recent Transactions */}
        <RecentTransactions />

      </div>
    </div>
  );
}

export default Payments;