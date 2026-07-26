function RecentTransactions({ payments }) {
  const recentPayments = [...payments].slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        🧾 Recent Transactions
      </h2>

      {recentPayments.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No Recent Transactions
        </p>
      ) : (
        <div className="space-y-4">
          {recentPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between items-center border-b pb-4 last:border-none"
            >
              <div>
                <h3 className="font-semibold text-slate-800">
                  {payment.farmer}
                </h3>

                <p className="text-sm text-gray-500">
                  {payment.method}
                </p>

                <p className="text-sm text-gray-400">
                  {payment.date}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">
                  {payment.amount}
                </p>

                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${
                    payment.status === "Paid"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentTransactions;