import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }

    const result = await register(name, email, password, currency);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMsg(result.error || 'Registration failed. Try a different email address.');
    }
  };

  const autofillNewUser = () => {
    setName('Aarav Gupta');
    setEmail(`aarav_${Date.now()}@example.com`);
    setPassword('Password@123');
    setCurrency('INR');
  };

  return (
    <div className="auth-page animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join ExpenseSync to manage budgets & split debts</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 'var(--radius)', color: '#b91c1c', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name *</label>
            <input
              type="text"
              name="name"
              required
              className="form-control"
              placeholder="e.g. Aarav Gupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address *</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="e.g. aarav@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password (8+ chars) *</label>
            <input
              type="password"
              required
              minLength={8}
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="form-select"
            >
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <button
            type="button"
            onClick={autofillNewUser}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            ⚡ Autofill New User (Aarav Gupta)
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
