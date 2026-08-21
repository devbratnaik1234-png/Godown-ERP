function RecentPurchases({ purchases = [] }) {
  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-5">Recent Purchases</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-700 text-white">
            <tr>
              <th className="p-3 text-left">Farmer</th>
              <th className="p-3 text-left">Quantity</th>
              <th className="p-3 text-left">Rate</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No purchase records yet
                </td>
              </tr>
            ) : (
              purchases.map((item) => (
                <tr
                  key={item.id || item.purchaseId}
                  className="border-b hover:bg-gray-100"
                >
                  <td className="p-3">{item.farmer}</td>
                  <td className="p-3">{Number(item.quantity || 0)} Qt</td>
                  <td className="p-3">₹{Number(item.rate || 0).toLocaleString("en-IN")}</td>
                  <td className="p-3">{formatDate(item.date)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentPurchases;
