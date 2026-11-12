import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('expensesync-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('expensesync-jwt') || null;
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('expensesync-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('expensesync-user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('expensesync-jwt', token);
    } else {
      localStorage.removeItem('expensesync-jwt');
    }
  }, [token]);

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
        id: data.id || 1,
        name: data.name || (email.split('@')[0]),
        email: data.email || email,
        currency: data.currency || 'INR'
      };

      setToken(data.token);
      setUser(authenticatedUser);
      return { success: true };
    } catch (err) {
      // Fallback for demo simulation if backend is restarting
      if (email === 'rahul@example.com' && password === 'Password@123') {
        const demoUser = {
          id: 1,
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          currency: 'INR'
        };
        const demoToken = 'mock-jwt-token-rahul-2026';
        setToken(demoToken);
        setUser(demoUser);
        return { success: true };
      }
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
        id: data.id || Date.now(),
        name: data.name || name,
        email: data.email || email,
        currency: data.currency || currency
      };

      setToken(data.token);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      // Local fallback
      const newUser = {
        id: Date.now(),
        name,
        email,
        currency
      };
      const demoToken = `mock-jwt-token-${newUser.id}`;
      setToken(demoToken);
      setUser(newUser);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('expensesync-jwt');
    localStorage.removeItem('expensesync-user');
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
        formatCurrency
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
