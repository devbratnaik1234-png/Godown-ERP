import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Purchase from "./Pages/Purchases/Purchase";
import Farmers from "./Pages/Farmers/Farmers";
import Stock from "./Pages/Stock/Stock";
import Payments from "./Pages/Payments/Payments";
import Labours from "./Pages/Labours/Labours";
import Reports from "./Pages/Reports/Reports";
import Settings from "./Pages/Settings/Settings";
function App() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/labours" element={<Labours />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;