import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function StatusBarChart({ labels, data: values, height = 256 }) {
  const data = {
    labels,
    datasets: [{
      label: 'Total',
      data: values,
      backgroundColor: ['#2563eb', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
      borderRadius: 8,
      barThickness: 28,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false }, ticks: { font: { size: 9, weight: 600 } } },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export function StatusDonutChart({ labels, data: values, colors, height = 208 }) {
  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors || ['#10b981', '#3b82f6', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { display: false } },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
