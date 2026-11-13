import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('expensesync-jwt') || null;
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem('expensesync-jwt'));
  });
  const [authError, setAuthError] = useState(null);

  // Synchronize JWT token strictly in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('expensesync-jwt', token);
    } else {
      localStorage.removeItem('expensesync-jwt');
    }
  }, [token]);

  // Load user profile from backend API /api/auth/me using token
  const loadCurrentUser = useCallback(async () => {
    const activeToken = token || localStorage.getItem('expensesync-jwt');
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.id) {
        setUser({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          currency: res.data.currency || 'INR'
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Backend /api/auth/me validation failed:', err.message);
      // If 401 or invalid token, clear session
      if (err.response && err.response.status === 401) {
        setToken(null);
        localStorage.removeItem('expensesync-jwt');
        setUser(null);
      } else if (!err.response) {
        // Network error / backend server offline
        setAuthError('Backend core-service is offline (Port 8080).');
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid email or password');
      }

      const data = await response.json();
      const authenticatedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        currency: data.currency || 'INR'
      };

      localStorage.setItem('expensesync-jwt', data.token);
      setToken(data.token);
      setUser(authenticatedUser);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, currency = 'INR') => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, currency })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      const newUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        currency: data.currency || currency
      };

      localStorage.setItem('expensesync-jwt', data.token);
      setToken(data.token);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('expensesync-jwt');
  };

  const updateProfile = (updated) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const formatCurrency = (amount) => {
    const val = Number(amount) || 0;
    const sign = val < 0 ? '-' : '';
    const absVal = Math.abs(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const curr = user?.currency || 'INR';
    switch (curr) {
      case 'USD': return `${sign}$${absVal}`;
      case 'EUR': return `${sign}€${absVal}`;
      case 'INR':
      default:
        return `${sign}₹${absVal}`;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        authError,
        login,
        register,
        logout,
        updateProfile,
        formatCurrency,
        reloadUser: loadCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
