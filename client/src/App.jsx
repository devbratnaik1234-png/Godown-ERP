import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import DashboardCards from "./components/Cards/DashboardCards";
import QuickActions from "./components/Cards/QuickActions";
import RecentPurchases from "./components/Tables/RecentPurchases";
import StockSummary from "./components/Cards/StockSummary";
import RecentActivities from "./components/Tables/RecentActivities";
import StockChart from "./components/Cards/StockChart";

function App() {
  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">

            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Dashboard
              </h1>

              <p className="text-gray-500 mt-1">
                Welcome back, Admin 👋
              </p>

              <div className="mt-3 h-1 w-28 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            </div>

          </div>

          {/* Dashboard Cards */}
          <DashboardCards />

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

            {/* Recent Purchases */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 p-6">

              <RecentPurchases />

            </div>

            {/* Right Side */}
            <div className="space-y-6">

              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
                <QuickActions />
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
                <StockSummary />
              </div>

            </div>

          </div>

          {/* Chart */}
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 p-6">

            <StockChart />

          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 p-6">

            <RecentActivities />

          </div>

        </main>

      </div>

    </div>
  );
}

export default App;