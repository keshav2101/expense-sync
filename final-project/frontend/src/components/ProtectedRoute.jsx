import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, authError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
        Authenticating session...
      </div>
    );
  }

  // If backend is offline but user has a token, allow rendering so the page displays the backend error banner
  if (!isAuthenticated && !authError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
