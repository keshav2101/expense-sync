import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

export default function Reports() {
  const { user, token, formatCurrency } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [user]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8080/api/reports/analytics?userId=${user?.id || 1}`, {
        headers
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch analytics from microservice`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.warn('Analytics API error:', err.message);
      setError(err.message || 'Unable to contact Analytics Microservice on Port 8082');
      setData(null); // Never show mock fallback data
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:8080/api/reports/export-csv?userId=${user?.id || 1}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to export CSV`);
      const text = await res.text();

      const blob = new Blob([text], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ExpenseSync_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert('Failed to download CSV: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <p>Loading analytics from microservice...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container animate-fade-in">
        <div className="content-header">
          <div>
            <h2>Analytics & Financial Reports</h2>
            <p>Real-time insights aggregated by the dedicated Spring Boot microservice (Port 8082).</p>
          </div>
        </div>
        <div className="alert alert-danger">
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          <div>
            <strong>Analytics Microservice Error:</strong> {error || 'No analytics data available.'}
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              Ensure both core-service (8080) and analytics-service (8082) are running.
            </div>
          </div>
        </div>
        <button onClick={fetchReport} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          🔄 Retry Fetching Analytics
        </button>
      </div>
    );
  }

  const breakdown = data.categoryBreakdown || {};
  const categories = Object.keys(breakdown);

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Analytics & Financial Reports</h2>
          <p>Real-time insights aggregated by the dedicated Spring Boot microservice (Port 8082).</p>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge badge-travel" style={{ fontSize: '0.75rem' }}>
              Microservice: {data.serviceName || 'Active'}
            </span>
          </div>
        </div>
        <button onClick={downloadCSV} className="btn btn-primary btn-sm">
          📥 Download CSV Report
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Total Monthly Spent"
          value={formatCurrency(data.totalMonthlySpent || 0)}
          subtitle={`For ${data.monthYear || 'Current Month'}`}
          icon="💳"
          trend="Real-Time Database Sync"
          trendType="neutral"
        />
        <StatCard
          title="Monthly Budget Limit"
          value={formatCurrency(data.budgetLimit || 25000)}
          subtitle="Configured spending ceiling"
          icon="🎯"
          trend="Active Cap"
          trendType="positive"
        />
        <StatCard
          title="Budget Used"
          value={`${data.budgetUsedPercentage || 0}%`}
          subtitle="Of monthly total allowance"
          icon="📊"
          trend={data.overspendWarning ? 'Warning: High' : 'Within Budget'}
          trendType={data.overspendWarning ? 'negative' : 'positive'}
        />
        <StatCard
          title="Microservice Health"
          value="Port 8082 OK"
          subtitle="REST Client Connection"
          icon="⚡"
          trend="Spring Boot 3.2"
          trendType="positive"
        />
      </div>

      {/* Breakdown and Insights Grid */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Category Spending Breakdown
          </h3>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No category data recorded for this month.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categories.map((cat) => {
                const amt = breakdown[cat];
                const pct = data.totalMonthlySpent > 0 ? Math.round((amt / data.totalMonthlySpent) * 100) : 0;
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{cat}</span>
                      <span>{formatCurrency(amt)} ({pct}%)</span>
                    </div>
                    <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          background: 'var(--primary)',
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Automated Insights & Recommendations
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.insights && data.insights.length > 0 ? (
              data.insights.map((ins, idx) => (
                <li
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}
                >
                  <span>💡</span>
                  <span>{ins}</span>
                </li>
              ))
            ) : (
              <li style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No automated insights available yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
