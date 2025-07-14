import React from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import styles from "./AnalyticsChart.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement);

function getStreak(weeklyData) {
  let streak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].completedCount > 0) streak++;
    else break;
  }
  return streak;
}

function getBestDay(weeklyData) {
  if (!weeklyData.length) return null;
  const best = weeklyData.reduce((a, b) => (a.completedCount > b.completedCount ? a : b));
  return best;
}

function getAverage(weeklyData) {
  if (!weeklyData.length) return 0;
  return (
    weeklyData.reduce((sum, d) => sum + d.completedCount, 0) / weeklyData.length
  ).toFixed(1);
}

function AnalyticsChart({ analytics, weeklyData = [] }) {
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

  // Weekly progress bar chart
  const weekLabels = weeklyData.map(d => d.date);
  const weekCounts = weeklyData.map(d => d.completedCount);
  const weeklyLineData = {
    labels: weekLabels,
    datasets: [
      {
        label: "Tasks Completed",
        data: weekCounts,
        borderColor: "#764ba2",
        backgroundColor: "#764ba2",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#764ba2",
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.4,
      },
    ],
  };
  const weeklyLineOptions = {
    plugins: { legend: { display: false } },
    animation: { duration: 300 },
    interaction: { mode: 'nearest', intersect: false },
    hover: { mode: 'nearest', intersect: false, animationDuration: 150 },
    responsive: true,
    maintainAspectRatio: false,
    title: { display: true, text: "Weekly Progress" },
    scales: { y: { beginAtZero: true, stepSize: 1 } },
  };

  // Weekly summary
  const streak = getStreak(weeklyData);
  const bestDay = getBestDay(weeklyData);
  const avg = getAverage(weeklyData);

  const barOptions = {
    plugins: { legend: { display: false } },
    animation: { duration: 300 },
    interaction: { mode: 'nearest', intersect: false },
    hover: { mode: 'nearest', intersect: false, animationDuration: 150 },
    responsive: true,
    maintainAspectRatio: false,
  };
  const doughnutOptions = {
    plugins: { legend: { display: true } },
    animation: { duration: 300 },
    interaction: { mode: 'nearest', intersect: false },
    hover: { mode: 'nearest', intersect: false, animationDuration: 150 },
    responsive: true,
    maintainAspectRatio: false,
  };
  const weeklyBarOptions = {
    plugins: { legend: { display: false } },
    animation: { duration: 300 },
    interaction: { mode: 'nearest', intersect: false },
    hover: { mode: 'nearest', intersect: false, animationDuration: 150 },
    responsive: true,
    maintainAspectRatio: false,
    title: { display: true, text: "Weekly Progress" },
    scales: { y: { beginAtZero: true, stepSize: 1 } },
  };

  return (
    <div className={styles.analyticsCard}>
      <div className={styles.analyticsGrid}>
        <div className={styles.chartItem}>
          <Bar data={barData} options={barOptions} />
        </div>
        <div className={styles.chartItem}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
        {weeklyData.length > 0 && (
          <div className={styles.chartItem} style={{ minWidth: 0, flex: 2 }}>
            <div style={{ width: '100%', height: 260 }}>
              <Line
                data={weeklyLineData}
                options={weeklyLineOptions}
              />
            </div>
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <strong>Streak:</strong> {streak} day{streak !== 1 ? "s" : ""} &nbsp;|&nbsp;
              <strong>Best Day:</strong> {bestDay ? `${bestDay.date} (${bestDay.completedCount})` : "-"} &nbsp;|&nbsp;
              <strong>Avg/Day:</strong> {avg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsChart; 