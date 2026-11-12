import React from 'react';

export default function StatCard({ label, value, subtext, type = 'spent' }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  );
}
