import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import BudgetBar from '../components/BudgetBar';
import api from '../api/axiosConfig';

export default function Dashboard({ onOpenAddExpense }) {
  const { 
    expenses, 
    totalMonthlySpent, 
    categoryTotals, 
    getBudgetStatus, 
    budgets,
    exportToCSV,
    error: expensesError 
  } = useExpenses();
  const { formatCurrency, user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (isMounted && res.data) {
          setDashboardData(res.data);
          setApiError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Dashboard summary API offline or failed:', err.message);
          setApiError(err.message || 'Failed to load dashboard metrics from core-service');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { isMounted = false; };
  }, [user, expenses.length]);

  // Use API dashboard data when available, fallback to live hook aggregations
  const activeTotalSpent = dashboardData?.totalMonthlySpent != null ? Number(dashboardData.totalMonthlySpent) : totalMonthlySpent;
  const activeCategories = dashboardData?.categoryTotals || categoryTotals;
  const activeBudgets = dashboardData?.budgets || budgets;
  const youOweVal = dashboardData?.youOwe != null ? Number(dashboardData.youOwe) : 0;
  const youAreOwedVal = dashboardData?.youAreOwed != null ? Number(dashboardData.youAreOwed) : 0;
  const oweSubtext = dashboardData?.oweSubtext || (youOweVal > 0 ? 'Group Debts' : 'All settled up');
  const owedSubtext = dashboardData?.owedSubtext || (youAreOwedVal > 0 ? 'Group Credits' : 'No pending dues');

  // Calculate Overall Budget Left
  const overallLimit = activeBudgets.OVERALL || 30000;
  const overallLeft = Math.max(0, overallLimit - activeTotalSpent);

  // Overspend check
  const foodStatus = getBudgetStatus('FOOD');
  const rentStatus = getBudgetStatus('RENT');
  const travelStatus = getBudgetStatus('TRAVEL');
  const billsStatus = getBudgetStatus('BILLS');

  const hasAlert = [foodStatus, rentStatus, travelStatus, billsStatus].some(
    (s) => s.status === 'ALERT' || s.status === 'WARNING'
  );

  // Category data for SVG donut chart
  const categories = Object.keys(activeCategories);
  const colorMap = {
    FOOD: '#ef4444',
    RENT: '#f59e0b',
    TRAVEL: '#4f46e5',
    BILLS: '#0ea5e9',
    ENTERTAINMENT: '#a855f7',
    SHOPPING: '#ec4899',
    HEALTH: '#10b981',
    OTHER: '#64748b'
  };

  const recentList = dashboardData?.recentExpenses && dashboardData.recentExpenses.length > 0 
    ? dashboardData.recentExpenses 
    : expenses.slice(0, 5);

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header">
        <div>
          <h2>Financial Dashboard</h2>
          <p>Track personal categories, monitor budgets, and review shared group balances.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportToCSV} className="btn btn-secondary btn-sm">
            📥 Export CSV
          </button>
          <button onClick={onOpenAddExpense} className="btn btn-primary btn-sm">
            ➕ Add Expense
          </button>
        </div>
      </div>

      {/* Backend API Error Banner */}
      {(apiError || expensesError) && (
        <div className="alert alert-danger animate-slide-up" style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          <div>
            <strong>Backend API Error:</strong> Unable to communicate with Core Service (Port 8080). {apiError || expensesError}
          </div>
        </div>
      )}

      {/* Overspend warning banner (Requirement C) */}
      {hasAlert && !apiError && (
        <div className="alert alert-warning animate-slide-up">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <strong>Budget Attention Needed:</strong> You have reached or exceeded 80% of your allocated budget on one or more categories (e.g. Food & Dining).
          </div>
        </div>
      )}

      {/* Metric Cards (Requirement F) */}
      <section className="stat-grid">
        <StatCard
          label="Total Spent (This Month)"
          value={formatCurrency(activeTotalSpent)}
          subtext={`Across ${dashboardData?.transactionCount ?? expenses.length} transactions`}
          type="spent"
        />
        <StatCard
          label="You Owe (Group Debts)"
          value={formatCurrency(youOweVal)}
          subtext={oweSubtext}
          type="owe"
        />
        <StatCard
          label="You Are Owed"
          value={formatCurrency(youAreOwedVal)}
          subtext={owedSubtext}
          type="owed"
        />
        <StatCard
          label="Monthly Budget Left"
          value={formatCurrency(overallLeft)}
          subtext={`Limit: ${formatCurrency(overallLimit)}`}
          type="budget"
        />
      </section>

      {/* Visual Analytics & Charts Section (Requirement F) */}
      <div className="dashboard-grid">
        {/* SVG Donut Chart */}
        <div className="card chart-box">
          <div className="card-title" style={{ width: '100%' }}>
            <span>Category Breakdown</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Core API Live</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
            <svg width="220" height="220" viewBox="0 0 100 100">
              {/* Fallback circle background */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-color)" strokeWidth="18" />
              {/* Dynamic SVG slices computed from proportions */}
              {(() => {
                let cumulativeAngle = 0;
                return categories.map((cat) => {
                  const val = Number(activeCategories[cat]) || 0;
                  const fraction = activeTotalSpent > 0 ? val / activeTotalSpent : 0;
                  const strokeDasharray = `${fraction * 251.2} 251.2`;
                  const strokeDashoffset = -cumulativeAngle * 251.2;
                  cumulativeAngle += fraction;
                  return (
                    <circle
                      key={cat}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={colorMap[cat] || '#64748b'}
                      strokeWidth="18"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  );
                });
              })()}
              <text x="50" y="48" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">
                {formatCurrency(activeTotalSpent).split('.')[0]}
              </text>
              <text x="50" y="58" textAnchor="middle" fontSize="5.5" fill="var(--text-muted)">
                Total Spent
              </text>
            </svg>
          </div>

          <div className="chart-legend">
            {categories.map((cat) => (
              <span key={cat} className="legend-item">
                <span className="legend-dot" style={{ background: colorMap[cat] || '#64748b' }}></span>
                {cat}: <strong>{formatCurrency(activeCategories[cat])}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Category Budget Progress Bars (Requirement C) */}
        <div className="card">
          <div className="card-title">
            <span>Monthly Category Budgets</span>
            <Link to="/expenses" style={{ fontSize: '0.85rem' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <BudgetBar category="🍔 Food & Dining" statusInfo={foodStatus} />
            <BudgetBar category="🏠 Rent & Accommodation" statusInfo={rentStatus} />
            <BudgetBar category="✈️ Travel & Commute" statusInfo={travelStatus} />
            <BudgetBar category="💡 Bills & Utilities" statusInfo={billsStatus} />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Preview */}
      <section className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-title">
          <span>Recent Transactions</span>
          <Link to="/expenses" className="btn btn-outline btn-sm">Manage All</Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Mode</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    No recent transactions recorded yet.
                  </td>
                </tr>
              ) : (
                recentList.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td><strong>{exp.title}</strong></td>
                    <td><span className={`badge badge-${(exp.category || 'other').toLowerCase()}`}>{exp.category}</span></td>
                    <td>{exp.paymentMethod || 'UPI'}</td>
                    <td>{exp.groupId ? `Group #${exp.groupId}` : 'Personal'}</td>
                    <td className="amt-negative">- {formatCurrency(exp.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
