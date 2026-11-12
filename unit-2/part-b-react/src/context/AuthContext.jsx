import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('expensesync-user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      currency: 'INR'
    };
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('expensesync-jwt') || 'mock-jwt-token-srm-fsd-2026';
  });

  useEffect(() => {
    localStorage.setItem('expensesync-user', JSON.stringify(user));
  }, [user]);

  const updateProfile = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('expensesync-jwt');
    alert('Logged out successfully. (Auto-redirecting to login)');
  };

  const formatCurrency = (amount) => {
    const val = Number(amount) || 0;
    const sign = val < 0 ? '-' : '';
    const absVal = Math.abs(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    switch (user.currency) {
      case 'USD': return `${sign}$${absVal}`;
      case 'EUR': return `${sign}€${absVal}`;
      case 'INR':
      default:
        return `${sign}₹${absVal}`;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, updateProfile, logout, formatCurrency }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

