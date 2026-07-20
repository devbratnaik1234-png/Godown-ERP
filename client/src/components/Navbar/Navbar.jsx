import { Bell, Search, UserCircle } from "lucide-react";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search farmer, truck, stock..."
            className="pl-10 pr-4 py-2 w-96 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

      </div>

      <div className="flex items-center gap-6">

        <Bell className="cursor-pointer" />

        <div className="flex items-center gap-2">

          <UserCircle size={35} />

          <div>

            <h2 className="font-semibold">
              Admin
            </h2>

            <p className="text-sm text-gray-500">
              Godown Owner
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}