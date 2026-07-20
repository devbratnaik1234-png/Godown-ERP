import {
  LayoutDashboard,
  Users,
  Truck,
  Warehouse,
  FileText,
  IndianRupee,
  UserCheck,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const menus = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Farmers", icon: Users },
    { name: "Purchases", icon: Warehouse },
    { name: "Stock", icon: Warehouse },
    { name: "Trucks", icon: Truck },
    { name: "Labours", icon: UserCheck },
    { name: "Payments", icon: IndianRupee },
    { name: "Reports", icon: FileText },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="w-64 min-h-screen bg-[#111827] text-white shadow-2xl">

      <div className="px-6 py-7 border-b border-gray-700">

        <h1 className="text-3xl font-bold text-blue-400">
          Godown ERP
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          Warehouse Management
        </p>

      </div>

      <div className="mt-5 px-3">

        {menus.map((menu, index) => {
          const Icon = menu.icon;

          return (
            <div
              key={menu.name}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl mb-2 cursor-pointer transition-all duration-300
              ${
                index === 0
                  ? "bg-blue-600 text-white shadow-lg"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Icon size={21} />

              <span className="font-medium">
                {menu.name}
              </span>
            </div>
          );
        })}

      </div>

    </div>
  );
}