import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Purchase from "./Pages/Purchases/Purchase";
import Farmers from "./Pages/Farmers/Farmers";
import Stock from "./Pages/Stock/Stock";
import Payments from "./Pages/Payments/Payments";
import TruckRegister from "./Pages/Truck/TruckRegister";
import Labours from "./Pages/Labours/Labours";
import Reports from "./Pages/Reports/Reports";
import Settings from "./Pages/Settings/Settings";
import Login from "./Pages/Login/Login";
import { api } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(Boolean(api.getToken()));

  useEffect(() => {
    const restoreSession = async () => {
      if (!api.getToken()) {
        setCheckingSession(false);
        return;
      }

      try {
        const currentUser = await api.me();
        setUser(currentUser);
      } catch (error) {
        api.logout();
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("godown-erp-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("godown-erp-unauthorized", handleUnauthorized);
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-600">
        Checking secure session...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar user={user} onLogout={handleLogout} />

        <div className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/purchase" element={<Purchase />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/truck" element={<TruckRegister />} />
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
