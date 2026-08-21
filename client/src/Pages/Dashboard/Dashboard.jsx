import { useEffect, useState } from "react";
import DashboardCards from "../../components/Cards/DashboardCards";
import QuickActions from "../../components/Cards/QuickActions";
import StockSummary from "../../components/Cards/StockSummary";
import StockChart from "../../components/Cards/StockChart";
import RecentPurchases from "../../components/Tables/RecentPurchases";
import FinancialSummary from "../../components/Cards/FinancialSummary";
import LiveStockStatus from "../../components/Cards/LiveStockStatus";
import { api } from "../../api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");
        const data = await api.dashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDashboard();
  }, []);

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <DashboardCards data={dashboardData} />

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <RecentPurchases />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <StockSummary />
        </div>
      </div>

      <StockChart />
      <FinancialSummary />
      <LiveStockStatus />
    </>
  );
}

export default Dashboard;
