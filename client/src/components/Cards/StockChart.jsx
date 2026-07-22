import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  datasets: [
    {
      label: "Purchase (Qt)",
      data: [120, 180, 150, 220, 170, 250],
      backgroundColor: "#15803d",
      borderRadius: 8,
      barThickness: 28,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#334155",
        font: {
          size: 13,
          weight: "600",
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#64748b",
      },
    },
    y: {
      grid: {
        color: "#e2e8f0",
      },
      ticks: {
        color: "#64748b",
      },
    },
  },
};

function StockChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-slate-800">
        Weekly Purchase
      </h2>

      <div className="h-56">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default StockChart;