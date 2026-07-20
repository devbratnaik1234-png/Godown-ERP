const activities = [
  "🌾 120 Qt Paddy purchased from Ramesh Kumar",
  "💰 Payment of ₹1,25,000 completed",
  "🚚 Truck OD-02-AB-1234 entered",
  "📦 Stock updated automatically",
  "🏪 Sale invoice generated",
];

function RecentActivities() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-5">Recent Activities</h2>

      <ul className="space-y-3">
        {activities.map((item, index) => (
          <li
            key={index}
            className="border-b pb-2 text-gray-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentActivities;