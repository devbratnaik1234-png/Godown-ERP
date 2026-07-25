import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Purchase from "./Pages/Purchases/Purchase";

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
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;