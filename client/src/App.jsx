import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import DashboardCards from "./components/Cards/DashboardCards";
import QuickActions from "./components/Cards/QuickActions";
import StockSummary from "./components/Cards/StockSummary";
import StockChart from "./components/Cards/StockChart";
import RecentPurchases from "./components/Tables/RecentPurchases";
import FinancialSummary from "./components/Cards/FinancialSummary";
import LiveStockStatus from "./components/Cards/LiveStockStatus";

function App() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">
          <DashboardCards />

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
        </div>
      </div>
    </div>
  );
}

export default App;