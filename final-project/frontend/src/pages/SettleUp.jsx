import React, { useState } from 'react';
import initialGroups from '../data/mockGroups.json';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function SettleUp() {
  const { formatCurrency } = useAuth();
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('expensesync-groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });

  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || 1);
  const [payer, setPayer] = useState('Rahul Sharma (You)');
  const [payee, setPayee] = useState('Priya Nair');
  const [amount, setAmount] = useState('1250');
  const [method, setMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [toast, setToast] = useState(null);

  const [settlementLog, setSettlementLog] = useState([
    {
      id: 1,
      payer: 'Amit Patel',
      payee: 'Rahul Sharma',
      amount: 1200.0,
      method: 'UPI',
      date: '2026-11-08',
      group: 'Goa Trip 2026'
    },
    {
      id: 2,
      payer: 'Sneha Rao',
      payee: 'Priya Nair',
      amount: 800.0,
      method: 'CASH',
      date: '2026-11-04',
      group: 'Flatmates B-302'
    }
  ]);

  const activeGroup = groups.find((g) => g.id === Number(selectedGroup)) || groups[0];

  const handleSettle = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const amt = parseFloat(amount);
    const newEntry = {
      id: Date.now(),
      payer,
      payee,
      amount: amt,
      method,
      date,
      group: activeGroup.name
    };

    setSettlementLog([newEntry, ...settlementLog]);
    setToast({
      message: `Settled ${formatCurrency(amt)} from ${payer.split(' ')[0]} to ${payee.split(' ')[0]} via ${method}!`,
      type: 'success'
    });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header">
        <div>
          <h2>Settle Up Balances</h2>
          <p>Record debt payments and clear member balances across groups.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Settle Up Payment Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem' }}>Record a Settlement</h3>
          <form onSubmit={handleSettle}>
            <div className="form-group">
              <label>Select Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
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
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  className="form-select"
                >
                  {activeGroup.members.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Payee (Who Received)</label>
                <select
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  className="form-select"
                >
                  {activeGroup.members.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
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
              <label>Date of Settlement</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
              Based on active debts in <strong>{activeGroup.name}</strong>:
            </p>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span>Rahul $\rightarrow$ Priya:</span>
                <strong style={{ color: 'var(--danger)' }}>₹1,250.00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Amit $\rightarrow$ Priya:</span>
                <strong style={{ color: 'var(--danger)' }}>₹2,150.00</strong>
              </div>
            </div>
            <button
              onClick={() => { setPayer('Rahul Sharma (You)'); setPayee('Priya Nair'); setAmount('1250'); }}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              Fill: Pay ₹1,250 to Priya (Full Settlement)
            </button>
          </div>

          <div className="card">
            <h3>Settlement Payment History</h3>
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
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
