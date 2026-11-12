import { useState, useEffect, useMemo, useDebugValue } from 'react';
import initialExpenses from '../data/mockExpenses.json';
import { useAuth } from '../context/AuthContext';

const DEFAULT_BUDGETS = {
  OVERALL: 30000,
  FOOD: 5000,
  RENT: 12000,
  TRAVEL: 4000,
  SHOPPING: 3000,
  BILLS: 3000,
  ENTERTAINMENT: 2000,
  HEALTH: 2000,
  OTHER: 2000
};

export function useExpenses() {
  const { user } = useAuth();
  const userId = user?.id || 1;
  const storageKey = `expensesync-expenses-u${userId}`;
  const budgetKey = `expensesync-budgets-u${userId}`;

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
      // User 1 (Rahul) gets seeded expenses; new users get empty list
      return userId === 1 ? initialExpenses : [];
    } catch {
      return userId === 1 ? initialExpenses : [];
    }
  });

  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(budgetKey);
      return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  });

  // Re-sync if user switches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setExpenses(JSON.parse(saved));
      } else {
        setExpenses(userId === 1 ? initialExpenses : []);
      }
    } catch {
      setExpenses(userId === 1 ? initialExpenses : []);
    }
  }, [userId]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(expenses));
  }, [expenses, storageKey]);

  useEffect(() => {
    localStorage.setItem(budgetKey, JSON.stringify(budgets));
  }, [budgets, budgetKey]);

  // CRUD Operations
  const addExpense = (newExp) => {
    const expenseWithId = {
      ...newExp,
      id: Date.now(),
      amount: parseFloat(newExp.amount) || 0,
      date: newExp.date || new Date().toISOString().slice(0, 10),
      paymentMethod: newExp.paymentMethod || 'UPI'
    };
    setExpenses((prev) => [expenseWithId, ...prev]);
    return expenseWithId;
  };

  const editExpense = (id, updatedFields) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? { ...exp, ...updatedFields, amount: parseFloat(updatedFields.amount) || exp.amount }
          : exp
      )
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const title = exp.title || '';
        const notes = exp.notes || '';
        const matchesSearch =
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || exp.category === categoryFilter;
        const matchesPayment = paymentFilter === 'ALL' || exp.paymentMethod === paymentFilter;
        return matchesSearch && matchesCategory && matchesPayment;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchTerm, categoryFilter, paymentFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / pageSize) || 1;
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  // Category Total Aggregations
  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
  }, [expenses]);

  // Monthly Total Spending
  const totalMonthlySpent = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  // Category Budget Health Status
  const getBudgetStatus = (category) => {
    const spent = categoryTotals[category] || 0;
    const limit = budgets[category] || budgets.OTHER;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    let status = 'NORMAL';
    if (percentage >= 100) status = 'ALERT';
    else if (percentage >= 80) status = 'WARNING';

    return { spent, limit, percentage, status };
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['Date,Category,Description,Amount,PaymentMethod,Status'];
    const rows = expenses.map((exp) =>
      `"${exp.date}","${exp.category}","${exp.title.replace(/"/g, '""')}",${exp.amount.toFixed(2)},"${exp.paymentMethod || 'UPI'}","PAID"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ExpenseSync_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useDebugValue(`Expenses: ${expenses.length} items (Total: ₹${totalMonthlySpent.toFixed(2)})`);

  return {
    expenses,
    filteredExpenses,
    paginatedExpenses,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    paymentFilter,
    setPaymentFilter,
    sortBy,
    setSortBy,
    addExpense,
    editExpense,
    deleteExpense,
    budgets,
    categoryTotals,
    totalMonthlySpent,
    getBudgetStatus,
    exportToCSV
  };
}
