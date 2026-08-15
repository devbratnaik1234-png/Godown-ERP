import { useState } from "react";

import {
  User,
  Warehouse,
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  DatabaseBackup,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

function Settings() {
  const [showPassword, setShowPassword] = useState(false);

  const [profile, setProfile] = useState({
    ownerName: "Samarjit Chatterjee",
    phone: "9876543210",
    email: "admin@godownerp.com",
  });

  const [godown, setGodown] = useState({
    godownName: "Godown ERP",
    location: "Jangipara, Hooghly",
    gst: "",
    pan: "",
  });

  const [business, setBusiness] = useState({
    defaultVariety: "Swarna",
    unit: "Quintal",
    currency: "INR",
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    pendingPayment: true,
    purchaseAlert: false,
    truckAlert: true,
  });

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleGodownChange = (e) => {
    setGodown({
      ...godown,
      [e.target.name]: e.target.value,
    });
  };

  const handleBusinessChange = (e) => {
    setBusiness({
      ...business,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (name) => {
    setNotifications({
      ...notifications,
      [name]: !notifications[name],
    });
  };

  const saveSettings = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="pb-10">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Settings
        </h1>

        <p className="text-slate-500 mt-1">
          Manage your profile, godown information and system preferences.
        </p>
      </div>

      {/* PROFILE SETTINGS */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <User size={20} />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Profile Settings
            </h2>

            <p className="text-sm text-slate-400">
              Manage godown owner information.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Owner Name
            </label>

            <input
              type="text"
              name="ownerName"
              value={profile.ownerName}
              onChange={handleProfileChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

        </div>

      </div>

      {/* GODOWN DETAILS */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <Warehouse size={20} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              Godown Details
            </h2>

            <p className="text-sm text-slate-400">
              Configure business and warehouse details.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Godown Name
            </label>

            <input
              type="text"
              name="godownName"
              value={godown.godownName}
              onChange={handleGodownChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Location
            </label>

            <input
              type="text"
              name="location"
              value={godown.location}
              onChange={handleGodownChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              GST Number
            </label>

            <input
              type="text"
              name="gst"
              value={godown.gst}
              onChange={handleGodownChange}
              placeholder="Enter GST number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              PAN Number
            </label>

            <input
              type="text"
              name="pan"
              value={godown.pan}
              onChange={handleGodownChange}
              placeholder="Enter PAN number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

        </div>

      </div>

      {/* BUSINESS SETTINGS */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              Business Preferences
            </h2>

            <p className="text-sm text-slate-400">
              Configure default business values.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Default Paddy Variety
            </label>

            <select
              name="defaultVariety"
              value={business.defaultVariety}
              onChange={handleBusinessChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            >

              <option>Swarna</option>
              <option>Miniket</option>
              <option>IR-36</option>
              <option>Basmati</option>
              <option>Other</option>

            </select>

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Default Unit
            </label>

            <select
              name="unit"
              value={business.unit}
              onChange={handleBusinessChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            >

              <option>Quintal</option>
              <option>Kg</option>
              <option>Bag</option>
              <option>Ton</option>

            </select>

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Currency
            </label>

            <select
              name="currency"
              value={business.currency}
              onChange={handleBusinessChange}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            >

              <option value="INR">
                INR - Indian Rupee
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* NOTIFICATIONS */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Bell size={20} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              Notifications
            </h2>

            <p className="text-sm text-slate-400">
              Choose alerts you want to receive.
            </p>

          </div>

        </div>

        <div className="space-y-4">

          {[
            {
              key: "lowStock",
              title: "Low Stock Alert",
              description:
                "Notify when paddy stock falls below minimum level.",
            },

            {
              key: "pendingPayment",
              title: "Pending Payment Alert",
              description:
                "Receive alerts for pending farmer and labour payments.",
            },

            {
              key: "purchaseAlert",
              title: "New Purchase Alert",
              description:
                "Notify when a new paddy purchase entry is created.",
            },

            {
              key: "truckAlert",
              title: "Truck Dispatch Alert",
              description:
                "Receive alerts when a truck is dispatched.",
            },
          ].map((item) => (

            <div
              key={item.key}
              className="flex items-center justify-between border border-slate-200 rounded-xl p-4"
            >

              <div>

                <h3 className="font-medium text-slate-700">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  {item.description}
                </p>

              </div>

              <button
                onClick={() =>
                  handleNotificationChange(item.key)
                }
                className={`w-12 h-6 rounded-full transition relative ${
                  notifications[item.key]
                    ? "bg-green-600"
                    : "bg-slate-300"
                }`}
              >

                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    notifications[item.key]
                      ? "left-7"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          ))}

        </div>

      </div>

      {/* SECURITY */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              Security
            </h2>

            <p className="text-sm text-slate-400">
              Manage administrator password.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Current Password
            </label>

            <input
              type="password"
              placeholder="Current password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              New Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-3 text-slate-400"
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500"
            />

          </div>

        </div>

        <button className="mt-5 px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition">
          Change Password
        </button>

      </div>

      {/* SYSTEM / BACKUP */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <DatabaseBackup size={20} />
          </div>

          <div>

            <h2 className="text-xl font-semibold text-slate-800">
              System & Backup
            </h2>

            <p className="text-sm text-slate-400">
              Backup and maintain your ERP data.
            </p>

          </div>

        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-slate-200 rounded-xl p-5">

          <div>

            <h3 className="font-semibold text-slate-700">
              Database Backup
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              Create a backup of purchases, farmers, stock, payments and reports.
            </p>

          </div>

          <button className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition">
            Create Backup
          </button>

        </div>

      </div>

      {/* SAVE BUTTON */}

      <div className="flex justify-end mt-8">

        <button
          onClick={saveSettings}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3 rounded-lg shadow-sm transition"
        >

          <Save size={18} />

          Save Changes

        </button>

      </div>

    </div>
  );
}

export default Settings;