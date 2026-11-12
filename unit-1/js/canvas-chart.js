/**
 * ExpenseSync - HTML5 Canvas Charts & Theme Switcher
 * Unit 1: HTML & CSS Foundation
 * Pure Vanilla JavaScript & Canvas 2D Context (No external libraries required)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initCategoryPieChart();
  initMonthlyTrendBarChart();
});

/**
 * Theme toggle handler with localStorage persistence
 */
function initThemeToggle() {
  const savedTheme = localStorage.getItem('expensesync-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('expensesync-theme', nextTheme);
      updateThemeIcon(nextTheme);

      // Re-render canvas charts to adapt to dark/light text colors
      initCategoryPieChart();
      initMonthlyTrendBarChart();
    });
  }
}

function updateThemeIcon(theme) {
  const iconSpan = document.getElementById('themeIcon');
  const labelSpan = document.getElementById('themeLabel');
  if (iconSpan) {
    iconSpan.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  if (labelSpan) {
    labelSpan.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }
}

/**
 * Draws an interactive Donut / Pie Chart using HTML5 Canvas API
 */
function initCategoryPieChart() {
  const canvas = document.getElementById('categoryPieChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // Sample Category Breakdown Data
  const data = [
    { label: 'Food & Dining', value: 4200, color: '#ef4444' },
    { label: 'Rent & Living', value: 9500, color: '#f59e0b' },
    { label: 'Travel & Cab', value: 2100, color: '#4f46e5' },
    { label: 'Bills & Utilities', value: 1800, color: '#0ea5e9' },
    { label: 'Entertainment', value: 1400, color: '#a855f7' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;
  const innerRadius = radius * 0.55; // Donut style

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let startAngle = -Math.PI / 2;

  data.forEach((item) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;

    // Draw donut slice
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();

    startAngle += sliceAngle;
  });

  // Center Text: Total Spending
  ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`₹${total.toLocaleString()}`, centerX, centerY - 6);

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('Total Spent', centerX, centerY + 14);
}

/**
 * Draws a Monthly Trend Bar Chart using HTML5 Canvas API
 */
function initMonthlyTrendBarChart() {
  const canvas = document.getElementById('monthlyBarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const values = [12400, 15800, 14200, 18500, 16900, 19000];
  const maxVal = 25000;

  const width = canvas.width;
  const height = canvas.height;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = height - paddingBottom - paddingTop;

  ctx.clearRect(0, 0, width, height);

  const barWidth = 32;
  const spacing = (width - 40) / months.length;

  // Grid lines
  ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, height - paddingBottom);
  ctx.lineTo(width - 20, height - paddingBottom);
  ctx.stroke();

  // Draw Bars
  months.forEach((month, idx) => {
    const x = 30 + idx * spacing;
    const barH = (values[idx] / maxVal) * chartHeight;
    const y = height - paddingBottom - barH;

    // Bar gradient
    const gradient = ctx.createLinearGradient(0, y, 0, height - paddingBottom);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#818cf8');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Month label
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(month, x + barWidth / 2, height - 10);

    // Value label
    ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${(values[idx] / 1000).toFixed(1)}k`, x + barWidth / 2, y - 6);
  });
}

