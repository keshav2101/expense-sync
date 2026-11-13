import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import api from '../api/axiosConfig';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { formatCurrency, user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('TRIP');
  const [memberEmails, setMemberEmails] = useState('');
  const [toast, setToast] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/groups');
      if (Array.isArray(res.data)) {
        setGroups(res.data);
      } else {
        setGroups([]);
      }
    } catch (err) {
      console.warn('Backend /api/groups call failed:', err.message);
      setError(err.message || 'Failed to fetch groups from server');
      setGroups([]); // Zero/empty state on failure, not cached data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const emails = memberEmails
      .split(',')
      .map((em) => em.trim())
      .filter((em) => em.length > 0);

    try {
      const payload = {
        name: newGroupName.trim(),
        type: newGroupType,
        memberEmails: emails
      };

      const res = await api.post('/groups', payload);
      setIsCreateOpen(false);
      setNewGroupName('');
      setMemberEmails('');
      setToast({ message: `Group "${res.data.name || newGroupName}" created successfully!`, type: 'success' });
      fetchGroups();
    } catch (err) {
      setToast({ message: `Failed to create group: ${err.message}`, type: 'error' });
    }
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

      {error && (
        <div className="alert alert-danger animate-slide-up" style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.25rem' }}>❌</span>
          <div>
            <strong>Error loading groups:</strong> {error}. Ensure core-service is running on Port 8080.
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading groups from backend...
        </div>
      ) : groups.length === 0 ? (
        <div className="card empty-state" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <span style={{ fontSize: '2.5rem' }}>👥</span>
          <h3>No groups found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            You haven't joined or created any groups yet. Create a group to start splitting expenses!
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary btn-sm">
            ➕ Create Your First Group
          </button>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => {
            const userBalance = (group.netBalances && user?.id ? group.netBalances[user.id] : null) 
              ?? (group.balances && user?.id ? group.balances[user.id] : 0);
            return (
              <div key={group.id} className="card group-card interactive-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>{group.name}</h3>
                    <span className="badge badge-travel">{group.type}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    👥 {group.members ? group.members.length : 0} members
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
      )}

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
