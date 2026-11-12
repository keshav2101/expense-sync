import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/expenses"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>💳</span> Personal Expenses
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/groups"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>👥</span> Splitwise Groups
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/settle-up"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>🤝</span> Settle Up
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span>📈</span> Analytics & Reports
          </NavLink>
        </li>
      </ul>

      <div className="academic-badge">
        <strong>SRMIST 21CSE354T</strong>
        <p>Full Stack Web Development</p>
        <span className="unit-tag">Unit 5: Microservices</span>
      </div>
    </aside>
  );
}
