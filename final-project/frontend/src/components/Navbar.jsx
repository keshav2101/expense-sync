import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfile, logout } = useAuth();
  const location = useLocation();

  const handleCurrencyChange = (e) => {
    updateProfile({ currency: e.target.value });
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">₹</span>
          <span>ExpenseSync</span>
        </Link>

        <div className="nav-actions">
          {/* Currency Selector */}
          <select 
            value={user.currency} 
            onChange={handleCurrencyChange}
            className="currency-select"
            title="Choose default display currency"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>

          {/* Dark / Light Mode Switcher */}
          <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle theme">
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* User Profile Pill */}
          <div className="user-profile-badge">
            <div className="avatar-circle">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span className="user-name">{user.name}</span>
          </div>

          <button onClick={logout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
