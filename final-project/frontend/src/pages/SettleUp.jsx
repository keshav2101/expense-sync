import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../api/axiosConfig';

export default function SettleUp() {
  const { formatCurrency, user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [payerId, setPayerId] = useState('');
  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('1250');
  const [method, setMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [settlementLog, setSettlementLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, settlementsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/settlements').catch(() => ({ data: [] }))
      ]);

      if (Array.isArray(groupsRes.data) && groupsRes.data.length > 0) {
        setGroups(groupsRes.data);
        const firstGroup = groupsRes.data[0];
        setSelectedGroup(firstGroup.id.toString());
        if (firstGroup.members && firstGroup.members.length >= 2) {
          setPayerId(firstGroup.members[0].id.toString());
          setPayeeId(firstGroup.members[1].id.toString());
        }
      } else {
        setGroups([]);
      }

      if (Array.isArray(settlementsRes.data)) {
        setSettlementLog(settlementsRes.data);
      } else {
        setSettlementLog([]);
      }
    } catch (err) {
      console.warn('Backend API call failed in SettleUp:', err.message);
      setError(err.message || 'Failed to load data from core-service');
      setGroups([]);
      setSettlementLog([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  const activeGroup = groups.find((g) => g.id.toString() === selectedGroup.toString()) || groups[0];

  const handleGroupChange = (e) => {
    const gId = e.target.value;
    setSelectedGroup(gId);
    const grp = groups.find((g) => g.id.toString() === gId);
    if (grp?.members && grp.members.length >= 2) {
      setPayerId(grp.members[0].id.toString());
      setPayeeId(grp.members[1].id.toString());
    }
  };

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const amt = parseFloat(amount);
    const pId = Number(payerId || user?.id || 1);
    const recId = Number(payeeId || 2);

    try {
      await api.post('/settlements', {
        groupId: activeGroup?.id || Number(selectedGroup),
        payerId: pId,
        payeeId: recId,
        amount: amt,
        paymentMethod: method,
        notes: notes || `Settled via ${method}`
      });

      setToast({
        message: `Settled ${formatCurrency(amt)} via ${method} recorded on server!`,
        type: 'success'
      });

      // Refresh settlement history from core-service
      const settlementsRes = await api.get('/settlements').catch(() => ({ data: [] }));
      if (Array.isArray(settlementsRes.data)) {
        setSettlementLog(settlementsRes.data);
      }
    } catch (err) {
      setToast({ message: `Settlement failed: ${err.message}`, type: 'error' });
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header">
        <div>
          <h2>Settle Up Balances</h2>
          <p>Record debt payments and clear member balances across groups via backend API.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger animate-slide-up" style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          <div>
            <strong>Error loading settlement data:</strong> {error}. Ensure core-service is active on port 8080.
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading groups and settlements from backend...
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No groups available to settle</h3>
          <p style={{ color: 'var(--text-muted)' }}>Create a group and add expenses to begin recording settlements.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Settle Up Payment Form */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem' }}>Record a Settlement</h3>
            <form onSubmit={handleSettle}>
              <div className="form-group">
                <label>Select Group</label>
                <select
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className="form-select"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payer (Who Paid)</label>
                  <select
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className="form-select"
                  >
                    {activeGroup?.members && activeGroup.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} {m.id === user?.id ? '(You)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payee (Who Received)</label>
                  <select
                    value={payeeId}
                    onChange={(e) => setPayeeId(e.target.value)}
                    className="form-select"
                  >
                    {activeGroup?.members && activeGroup.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} {m.id === user?.id ? '(You)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="form-select"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="BANK">Bank Transfer (IMPS/NEFT)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared Goa hotel share"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '0.5rem' }}>
                ✓ Save Settlement & Clear Balance
              </button>
            </form>
          </div>

          {/* Min-Cash-Flow Suggestions & History */}
          <div>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h3>Simplification Suggestion</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Based on active debts in <strong>{activeGroup?.name || 'Group'}</strong>:
              </p>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                {activeGroup?.simplifiedDebts && activeGroup.simplifiedDebts.length > 0 ? (
                  activeGroup.simplifiedDebts.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span>{d.fromUserName || `User #${d.fromUserId}`} &rarr; {d.toUserName || `User #${d.toUserId}`}:</span>
                      <strong style={{ color: 'var(--danger)' }}>{formatCurrency(d.amount)}</strong>
                    </div>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>All balances in this group are settled up!</span>
                )}
              </div>
            </div>

            <div className="card">
              <h3>Settlement Payment History</h3>
              {settlementLog.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  No settlements recorded on server yet.
                </p>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {settlementLog.map((s) => (
                    <li key={s.id} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.88rem' }}>
                      <strong>{s.payer} paid {s.payee} {formatCurrency(s.amount)}</strong> via {s.method}
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {s.date} • {s.group}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
