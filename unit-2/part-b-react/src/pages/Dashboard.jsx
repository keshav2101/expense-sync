import React from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import BudgetBar from '../components/BudgetBar';

export default function Dashboard({ onOpenAddExpense }) {
  const { 
    expenses, 
    totalMonthlySpent, 
    categoryTotals, 
    getBudgetStatus, 
    budgets,
    exportToCSV 
  } = useExpenses();
  const { formatCurrency } = useAuth();

  // Calculate Overall Budget Left
  const overallLimit = budgets.OVERALL || 30000;
  const overallLeft = Math.max(0, overallLimit - totalMonthlySpent);

  // Overspend check
  const foodStatus = getBudgetStatus('FOOD');
  const rentStatus = getBudgetStatus('RENT');
  const travelStatus = getBudgetStatus('TRAVEL');
  const billsStatus = getBudgetStatus('BILLS');

  const hasAlert = [foodStatus, rentStatus, travelStatus, billsStatus].some(
    (s) => s.status === 'ALERT' || s.status === 'WARNING'
  );

  // Category data for SVG donut chart
  const categories = Object.keys(categoryTotals);
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

      {/* Overspend warning banner (Requirement C) */}
      {hasAlert && (
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
          value={formatCurrency(totalMonthlySpent)}
          subtext={`Across ${expenses.length} transactions`}
          type="spent"
        />
        <StatCard
          label="You Owe (Group Debts)"
          value={formatCurrency(1250)}
          subtext="To Priya (Goa Trip)"
          type="owe"
        />
        <StatCard
          label="You Are Owed"
          value={formatCurrency(3850)}
          subtext="From Amit & Flatmates"
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
            <svg width="220" height="220" viewBox="0 0 100 100">
              {/* Fallback circle background */}
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-color)" strokeWidth="18" />
              {/* Dynamic SVG slices computed from proportions */}
              {(() => {
                let cumulativeAngle = 0;
                return categories.map((cat, i) => {
                  const val = categoryTotals[cat] || 0;
                  const fraction = totalMonthlySpent > 0 ? val / totalMonthlySpent : 0;
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
                {formatCurrency(totalMonthlySpent).split('.')[0]}
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
                {cat}: <strong>{formatCurrency(categoryTotals[cat])}</strong>
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
              {expenses.slice(0, 5).map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.date}</td>
                  <td><strong>{exp.title}</strong></td>
                  <td><span className={`badge badge-${exp.category.toLowerCase()}`}>{exp.category}</span></td>
                  <td>{exp.paymentMethod}</td>
                  <td>{exp.groupId ? `Group #${exp.groupId}` : 'Personal'}</td>
                  <td className="amt-negative">- {formatCurrency(exp.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

