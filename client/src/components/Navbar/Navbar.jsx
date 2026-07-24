import { Bell, Search, UserCircle, Menu } from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-80">
          <Search className="text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search farmer, truck, stock..."
            className="bg-transparent outline-none ml-2 w-full text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-500">Today</p>
          <p className="font-semibold text-gray-800 text-sm md:text-base">
            {today} | {time}
          </p>
        </div>

        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="text-gray-700" size={22} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2">
          <UserCircle className="text-gray-700" size={36} />
          <div className="hidden sm:block">
            <p className="font-semibold text-gray-800">Admin</p>
            <p className="text-xs text-gray-500">Godown Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}