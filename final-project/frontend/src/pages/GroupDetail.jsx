import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../api/axiosConfig';

export default function GroupDetail() {
  const { id } = useParams();
  const { formatCurrency, user } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Group Expense Form Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [paidByUserId, setPaidByUserId] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');

  const fetchGroupDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/groups/${id}`);
      if (res.data) {
        setGroup(res.data);
        if (res.data.members && res.data.members.length > 0) {
          setPaidByUserId(user?.id ? user.id.toString() : res.data.members[0].id.toString());
        }
      }
    } catch (err) {
      console.warn(`Backend /api/groups/${id} call failed:`, err.message);
      setError(err.message || 'Failed to load group details from backend');
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchGroupDetail();
  }, [fetchGroupDetail]);

  const handleAddGroupExpense = async (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount || Number(expAmount) <= 0) return;

    const amt = parseFloat(expAmount);

    try {
      await api.post('/expenses', {
        title: expTitle,
        amount: amt,
        category: 'FOOD',
        groupId: Number(id),
        splitType: splitType
      });

      setIsAddExpenseOpen(false);
      setExpTitle('');
      setExpAmount('');
      setToast({ message: 'Group expense added & balances recalculated!', type: 'success' });
      await fetchGroupDetail();
    } catch (err) {
      setToast({ message: `Failed to add group expense: ${err.message}`, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading group #{id} details from core-service...
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error || 'Group not found.'}
        </div>
        <Link to="/groups" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
          &larr; Back to Groups
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <Link to="/groups" style={{ color: 'var(--text-muted)' }}>&larr; Groups</Link>
            <h2>{group.name}</h2>
            <span className="badge badge-travel">{group.type}</span>
          </div>
          <p>{group.members ? group.members.length : 0} Members • Live Balances & Min-Cash-Flow Simplification</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/settle" className="btn btn-success btn-sm">
            🤝 Settle Up
          </Link>
          <button onClick={() => setIsAddExpenseOpen(true)} className="btn btn-primary btn-sm">
            ➕ Add Group Expense
          </button>
        </div>
      </div>

      {/* Greedy Debt Simplification Notice (Requirement E) */}
      <div className="alert alert-success animate-slide-up">
        <span style={{ fontSize: '1.4rem' }}>⚡</span>
        <div>
          <strong>Greedy Min-Cash-Flow Simplification Active:</strong><br />
          {group.simplifiedDebts && group.simplifiedDebts.length > 0 ? (
            <ul style={{ margin: '0.4rem 0 0 1.25rem', fontSize: '0.9rem' }}>
              {group.simplifiedDebts.map((debt, idx) => (
                <li key={idx}>
                  {debt.fromUserName || debt.from || `User #${debt.fromUserId}`} pays{' '}
                  <strong>{debt.toUserName || debt.to || `User #${debt.toUserId}`}</strong>{' '}
                  {formatCurrency(debt.amount)}
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ fontSize: '0.9rem' }}>All balances in this group are settled up!</span>
          )}
        </div>
      </div>

      {/* Member Net Balances Grid */}
      <h3 style={{ marginBottom: '1rem' }}>Group Member Balances</h3>
      <div className="stat-grid">
        {group.members && group.members.map((member) => {
          const bal = (group.netBalances && group.netBalances[member.id] != null)
            ? Number(group.netBalances[member.id])
            : ((group.balances && group.balances[member.id] != null) ? Number(group.balances[member.id]) : 0);
          return (
            <div key={member.id} className="stat-card">
              <div className="stat-label">{member.name} {member.id === user?.id ? '(You)' : ''}</div>
              <div
                className="stat-value"
                style={{
                  color: bal > 0 ? 'var(--success)' : bal < 0 ? 'var(--danger)' : 'var(--text-muted)'
                }}
              >
                {bal > 0 ? `+ ${formatCurrency(bal)}` : bal < 0 ? `- ${formatCurrency(Math.abs(bal))}` : '₹0.00'}
              </div>
              <div className="stat-subtext">
                {bal > 0 ? 'Gets back' : bal < 0 ? 'Owes group' : 'Settled up'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Group Members List */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Group Members</h3>
        <ul className="activity-list">
          {group.members && group.members.map((m) => (
            <li key={m.id} className="activity-item">
              <span className="activity-icon">👤</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{m.name} {m.id === user?.id ? '(You)' : ''}</p>
                <small style={{ color: 'var(--text-muted)' }}>{m.email}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Group Expense Modal */}
      {isAddExpenseOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add Expense to {group.name}</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleAddGroupExpense}>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Scuba Diving Tickets"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Amount *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Paid By</label>
                  <select
                    value={paidByUserId}
                    onChange={(e) => setPaidByUserId(e.target.value)}
                    className="form-select"
                  >
                    {group.members && group.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} {m.id === user?.id ? '(You)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Split Type</label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="form-select"
                >
                  <option value="EQUAL">1. Equal Split among all members</option>
                  <option value="EXACT">2. Exact Amounts</option>
                  <option value="PERCENT">3. Percentages (%)</option>
                  <option value="SHARES">4. Shares (Ratio)</option>
                </select>
              </div>

              {Number(expAmount) > 0 && group.members && (
                <div className="split-preview-box">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚡ Split Preview ({formatCurrency(expAmount)} / {group.members.length} members):
                  </div>
                  <div className="split-preview-grid">
                    {group.members.map((m) => (
                      <span key={m.id} className="split-pill">
                        {m.name.split(' ')[0]}: {formatCurrency(Number(expAmount) / group.members.length)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Group Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
