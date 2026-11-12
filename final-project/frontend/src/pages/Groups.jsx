import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import initialGroups from '../data/mockGroups.json';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Groups() {
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('expensesync-groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });

  const { formatCurrency } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('TRIP');
  const [memberEmails, setMemberEmails] = useState('');
  const [toast, setToast] = useState(null);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const emails = memberEmails
      .split(',')
      .map((em) => em.trim())
      .filter((em) => em.length > 0);

    const newGroup = {
      id: Date.now(),
      name: newGroupName.trim(),
      type: newGroupType,
      members: [
        { id: 1, name: 'Rahul Sharma (You)', email: 'rahul@example.com' },
        ...emails.map((em, idx) => ({
          id: Date.now() + idx + 1,
          name: em.split('@')[0],
          email: em
        }))
      ],
      balances: { "1": 0.00 },
      simplifiedDebts: [],
      activity: [
        {
          id: Date.now(),
          text: `Rahul created the group "${newGroupName}"`,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
        }
      ]
    };

    const updated = [newGroup, ...groups];
    setGroups(updated);
    localStorage.setItem('expensesync-groups', JSON.stringify(updated));
    setIsCreateOpen(false);
    setNewGroupName('');
    setMemberEmails('');
    setToast({ message: `Group "${newGroup.name}" created successfully!`, type: 'success' });
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header">
        <div>
          <h2>Splitwise-Style Groups</h2>
          <p>Organize shared expenses for roommates, trips, and projects.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary btn-sm">
          ➕ Create New Group
        </button>
      </div>

      <div className="groups-grid">
        {groups.map((group) => {
          const userBalance = group.balances["1"] || 0;
          return (
            <div key={group.id} className="card group-card interactive-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>{group.name}</h3>
                  <span className="badge badge-travel">{group.type}</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  👥 {group.members.length} members
                </span>
              </div>

              <div style={{ margin: '1.25rem 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Net Balance:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                  {userBalance > 0 ? (
                    <span style={{ color: 'var(--success)' }}>+ {formatCurrency(userBalance)} (You are owed)</span>
                  ) : userBalance < 0 ? (
                    <span style={{ color: 'var(--danger)' }}>- {formatCurrency(Math.abs(userBalance))} (You owe)</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Settled Up (₹0.00)</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <Link to={`/groups/${group.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  View Group & Balances &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {isCreateOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create New Group</h3>
              <button onClick={() => setIsCreateOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manali Trek 2026"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Group Category / Type</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value)}
                  className="form-select"
                >
                  <option value="TRIP">✈️ Trip & Travel</option>
                  <option value="HOME">🏠 Home / Roommates</option>
                  <option value="COUPLE">❤️ Couple</option>
                  <option value="OTHER">📁 Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Add Members by Email (comma-separated)</label>
                <input
                  type="text"
                  placeholder="priya@example.com, amit@example.com"
                  value={memberEmails}
                  onChange={(e) => setMemberEmails(e.target.value)}
                  className="form-control"
                />
                <span className="form-hint">You will automatically be added as the group creator.</span>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Group
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
