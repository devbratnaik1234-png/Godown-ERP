import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Payments from "./Pages/Payments/Payments";

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;