function PaymentSummary({ payments }) {
  const totalPayments = payments.length;

  const paidPayments = payments.filter(
    (payment) => payment.status === "Paid"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "Pending"
  );

  const totalPaidAmount = paidPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount.replace(/[₹,]/g, "")),
    0
  );

  const totalPendingAmount = pendingPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount.replace(/[₹,]/g, "")),
    0
  );

  const averagePayment =
    totalPayments === 0
      ? 0
      : Math.round(
          (totalPaidAmount + totalPendingAmount) / totalPayments
        );

  const paidPercentage =
    totalPayments === 0
      ? 0
      : Math.round((paidPayments.length / totalPayments) * 100);

  const pendingPercentage =
    totalPayments === 0
      ? 0
      : Math.round((pendingPayments.length / totalPayments) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-xl font-bold text-slate-800 mb-6">
        📊 Payment Summary
      </h2>

      <div className="space-y-5">

        <div className="flex justify-between">
          <span>Total Paid</span>
          <span className="font-bold text-green-600">
            ₹{totalPaidAmount.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Pending Amount</span>
          <span className="font-bold text-orange-500">
            ₹{totalPendingAmount.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Payments</span>
          <span className="font-bold">
            {totalPayments}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Average Payment</span>
          <span className="font-bold text-blue-600">
            ₹{averagePayment.toLocaleString()}
          </span>
        </div>

        <hr />

        <div className="flex justify-between">
          <span>Paid</span>
          <span className="font-bold text-green-600">
            {paidPercentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: `${paidPercentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between">
          <span>Pending</span>
          <span className="font-bold text-orange-500">
            {pendingPercentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-orange-500 h-3 rounded-full"
            style={{ width: `${pendingPercentage}%` }}
          ></div>
        </div>

      </div>

    </div>
  );
}

export default PaymentSummary;