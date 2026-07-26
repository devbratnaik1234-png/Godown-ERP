function PaymentChart({ payments }) {
  const paidAmount = payments
    .filter((p) => p.status === "Paid")
    .reduce(
      (sum, p) => sum + Number(p.amount.replace(/[₹,]/g, "")),
      0
    );

  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce(
      (sum, p) => sum + Number(p.amount.replace(/[₹,]/g, "")),
      0
    );

  const total = paidAmount + pendingAmount;

  const paidPercent =
    total === 0 ? 0 : Math.round((paidAmount / total) * 100);

  const pendingPercent =
    total === 0 ? 0 : Math.round((pendingAmount / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        📊 Payment Analytics
      </h2>

      <div className="space-y-8">

        {/* Paid */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium text-green-600">
              Paid Amount
            </span>

            <span className="font-bold">
              ₹{paidAmount.toLocaleString()}
            </span>
          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full">
            <div
              className="h-4 bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${paidPercent}%` }}
            ></div>
          </div>

          <p className="text-right text-sm text-gray-500 mt-1">
            {paidPercent}%
          </p>
        </div>

        {/* Pending */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium text-orange-500">
              Pending Amount
            </span>

            <span className="font-bold">
              ₹{pendingAmount.toLocaleString()}
            </span>
          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full">
            <div
              className="h-4 bg-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${pendingPercent}%` }}
            ></div>
          </div>

          <p className="text-right text-sm text-gray-500 mt-1">
            {pendingPercent}%
          </p>
        </div>

      </div>
    </div>
  );
}

export default PaymentChart;