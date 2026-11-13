import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Full-Stack Dev', badge: '👨‍💻' },
  { name: 'Priya Nair', email: 'priya@example.com', role: 'UI/UX Designer', badge: '🎨' },
  { name: 'Amit Patel', email: 'amit@example.com', role: 'Backend Dev', badge: '⚙️' },
  { name: 'Sneha Rao', email: 'sneha@example.com', role: 'Product Lead', badge: '💼' },
  { name: 'Vikram Malhotra', email: 'vikram@example.com', role: 'Data & Travel', badge: '🏔️' },
  { name: 'Ananya Iyer', email: 'ananya@example.com', role: 'Freelance Creator', badge: '📸' },
  { name: 'Rohan Verma', email: 'rohan@example.com', role: 'SRM Student', badge: '🎓' }
];

export default function Login() {
  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('Password@123');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.error || 'Failed to authenticate. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--border-radius-lg)', margin: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            ₹
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Sign In to ExpenseSync</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Smart bill splitting and personal expense tracker</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', background: 'var(--danger-bg)', border: '1px solid var(--danger)', borderRadius: 'var(--border-radius)', color: '#b91c1c', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Email Address *</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="form-control"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Password *</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Quick Demo Accounts
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to fill</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword('Password@123');
                }}
                className={`btn btn-sm ${email === acc.email ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  padding: '0.5rem 0.6rem',
                  textAlign: 'left',
                  borderRadius: 'var(--border-radius-sm)',
                  border: email === acc.email ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={`${acc.name} (${acc.role}) - ${acc.email}`}
              >
                <span>{acc.badge}</span>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600 }}>{acc.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{acc.role}</div>
                </div>
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
