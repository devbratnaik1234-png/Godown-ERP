import {
  FaHome,
  FaUsers,
  FaWarehouse,
  FaTruck,
  FaFileInvoiceDollar,
} from "react-icons/fa";

function Sidebar() {
  return (
    <div className="w-64 bg-green-800 text-white min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-10">🌾 Godown ERP</h1>

      <ul className="space-y-5">
        <li className="flex items-center gap-3 cursor-pointer hover:text-yellow-300">
          <FaHome />
          Dashboard
        </li>

        <li className="flex items-center gap-3 cursor-pointer hover:text-yellow-300">
          <FaUsers />
          Farmers
        </li>

        <li className="flex items-center gap-3 cursor-pointer hover:text-yellow-300">
          <FaTruck />
          Trucks
        </li>

        <li className="flex items-center gap-3 cursor-pointer hover:text-yellow-300">
          <FaWarehouse />
          Stock
        </li>

        <li className="flex items-center gap-3 cursor-pointer hover:text-yellow-300">
          <FaFileInvoiceDollar />
          Reports
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;