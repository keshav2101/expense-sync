import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import SettleUp from './pages/SettleUp';
import ExpenseModal from './components/ExpenseModal';
import { useExpenses } from './hooks/useExpenses';
import Toast from './components/Toast';

function AppContent() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const { addExpense } = useExpenses();

  const handleQuickAddExpense = (data) => {
    addExpense(data);
    setToast({ message: 'Expense added to personal tracker!', type: 'success' });
  };

  return (
    <div className="app-root">
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard onOpenAddExpense={() => setIsAddExpenseOpen(true)} />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetail />} />
            <Route path="/settle" element={<SettleUp />} />
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

