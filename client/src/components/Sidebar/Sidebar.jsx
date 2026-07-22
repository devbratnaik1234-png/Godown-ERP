import {
  LayoutDashboard,
  Users,
  Wheat,
  Boxes,
  Truck,
  Briefcase,
  IndianRupee,
  FileBarChart2,
  Settings,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Farmers", icon: Users },
  { name: "Paddy Purchase", icon: Wheat },
  { name: "Stock", icon: Boxes },
  { name: "Truck Register", icon: Truck },
  { name: "Labours", icon: Briefcase },
  { name: "Payments", icon: IndianRupee },
  { name: "Reports", icon: FileBarChart2 },
  { name: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-[#1E293B] text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-green-400">
          🌾 Godown ERP
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Paddy Management System
        </p>
      </div>

      {/* Menu */}
      <div className="flex-1 mt-4 px-3">
        {menu.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-xl cursor-pointer transition-all duration-300 ${
              index === 0
                ? "bg-green-500 text-white shadow-lg scale-[1.02]"
                : "text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1 hover:shadow-md"
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40"
            alt="Admin"
            className="w-10 h-10 rounded-full border-2 border-green-400"
          />
          <div>
            <h2 className="font-semibold">Godown Owner</h2>
            <p className="text-xs text-green-400">● Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}