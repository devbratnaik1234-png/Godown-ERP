<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Farmers from "./Pages/Farmers/Farmers";
import Stock from "./Pages/Stock/Stock";
=======
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Payments from "./Pages/Payments/Payments";
>>>>>>> 868a4d01607ce3698bf1d4a70a9efbd1c9763a99

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

<<<<<<< HEAD
      <div className="flex-1">
        <Navbar />

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/stock" element={<Stock />} />
        </Routes>
=======
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </div>
>>>>>>> 868a4d01607ce3698bf1d4a70a9efbd1c9763a99
      </div>
    </BrowserRouter>
  );
}

export default App;