function PaymentChart({ payments }) {

  // ==========================
  // Paid Amount Calculate
  // Prothome sudhu Paid payment gulo filter korche
  // Tarpor sob amount jog kore total Paid Amount ber korche
  // ==========================
  const paidAmount = payments
    .filter((p) => p.status === "Paid")
    .reduce(
      (sum, p) => sum + Number(p.amount.replace(/[₹,]/g, "")),
      0
    );

  // ==========================
  // Pending Amount Calculate
  // Sudhu Pending payment gulo niye total Pending Amount ber korche
  // ==========================
  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce(
      (sum, p) => sum + Number(p.amount.replace(/[₹,]/g, "")),
      0
    );

  // ==========================
  // Total Amount
  // Paid + Pending = Overall Total
  // ==========================
  const total = paidAmount + pendingAmount;

  // ==========================
  // Paid Percentage
  // Total jodi 0 hoy tahole percentage o 0
  // Nahole Paid Amount er percentage calculate korche
  // ==========================
  const paidPercent =
    total === 0 ? 0 : Math.round((paidAmount / total) * 100);

  // ==========================
  // Pending Percentage
  // Same logic Paid er moto
  // ==========================
  const pendingPercent =
    total === 0 ? 0 : Math.round((pendingAmount / total) * 100);

  return (

    // Main Card
    <div className="bg-white rounded-2xl shadow-lg p-6">

      {/* Chart Heading
          Heading text change korte chaile ekhane modify korbe */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        📊 Payment Analytics
      </h2>

      <div className="space-y-8">

        {/* ==========================
            Paid Section
            ========================== */}
        <div>

          {/* Paid Title & Amount */}
          <div className="flex justify-between mb-2">

            {/* Left Side Title */}
            <span className="font-medium text-green-600">
              Paid Amount
            </span>

            {/* Right Side Total Paid Amount
                Number ke comma format e dekhabe */}
            <span className="font-bold">
              ₹{paidAmount.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar Background */}
          <div className="w-full h-4 bg-gray-200 rounded-full">

            {/* Green Progress Bar
                Width Paid Percentage onujayi change hobe */}
            <div
              className="h-4 bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${paidPercent}%` }}
            ></div>

          </div>

          {/* Paid Percentage Display */}
          <p className="text-right text-sm text-gray-500 mt-1">
            {paidPercent}%
          </p>

        </div>

        {/* ==========================
            Pending Section
            ========================== */}
        <div>

          {/* Pending Title & Amount */}
          <div className="flex justify-between mb-2">

            {/* Left Side Title */}
            <span className="font-medium text-orange-500">
              Pending Amount
            </span>

            {/* Right Side Pending Amount */}
            <span className="font-bold">
              ₹{pendingAmount.toLocaleString()}
            </span>

          </div>

          {/* Progress Bar Background */}
          <div className="w-full h-4 bg-gray-200 rounded-full">

            {/* Orange Progress Bar
                Width Pending Percentage onujayi change hobe */}
            <div
              className="h-4 bg-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${pendingPercent}%` }}
            ></div>

          </div>

          {/* Pending Percentage */}
          <p className="text-right text-sm text-gray-500 mt-1">
            {pendingPercent}%
          </p>

        </div>

      </div>

    </div>
  );
}

export default PaymentChart;