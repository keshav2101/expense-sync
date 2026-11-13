import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import SettleUp from './pages/SettleUp';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import ExpenseModal from './components/ExpenseModal';
import { useExpenses } from './hooks/useExpenses';
import Toast from './components/Toast';

function AppContent() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const { addExpense } = useExpenses();
  const { isAuthenticated } = useAuth();

  const handleQuickAddExpense = (data) => {
    addExpense(data);
    setToast({ message: 'Expense added to personal tracker!', type: 'success' });
  };

  return (
    <div className="app-root">
      <Navbar />
      <div className={`app-layout ${!isAuthenticated ? 'auth-layout' : ''}`}>
        <Sidebar />
        <main className="main-content" style={{ width: !isAuthenticated ? '100%' : undefined }}>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard onOpenAddExpense={() => setIsAddExpenseOpen(true)} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <Groups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settle"
              element={
                <ProtectedRoute>
                  <SettleUp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settle-up"
              element={
                <ProtectedRoute>
                  <SettleUp />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <ExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSave={handleQuickAddExpense}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
