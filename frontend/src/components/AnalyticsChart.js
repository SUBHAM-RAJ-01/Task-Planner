import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./AnalyticsChart.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function AnalyticsChart({ analytics }) {
  if (!analytics) return null;
  const { typeCounts, completionRate } = analytics;
  const barData = {
    labels: Object.keys(typeCounts || {}),
    datasets: [
      {
        label: "Task Types",
        data: Object.values(typeCounts || {}),
        backgroundColor: "#1976d2",
      },
    ],
  };
  const doughnutData = {
    labels: ["Completed", "Incomplete"],
    datasets: [
      {
        data: [completionRate * 100, 100 - completionRate * 100],
        backgroundColor: ["#43a047", "#e0e0e0"],
      },
    ],
  };
  return (
    <div className={styles.charts}>
      <div className={styles.barChart}>
        <Bar data={barData} options={{ plugins: { legend: { display: false } } }} />
      </div>
      <div className={styles.doughnutChart}>
        <Doughnut data={doughnutData} options={{ plugins: { legend: { display: true } } }} />
      </div>
    </div>
  );
}

export default AnalyticsChart; 