import { useState, useEffect, useMemo, useDebugValue, useCallback } from 'react';
import initialExpenses from '../data/mockExpenses.json';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

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
  const { user, token } = useAuth();
  const userId = user?.id || 1;
  const storageKey = `expensesync-expenses-u${userId}`;
  const budgetKey = `expensesync-budgets-u${userId}`;

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
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

  // Fetch real expenses from Spring Boot backend API
  const refreshExpensesFromApi = useCallback(async () => {
    const activeToken = token || localStorage.getItem('expensesync-jwt');
    if (!activeToken) return;

    try {
      const res = await api.get('/expenses');
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((exp) => ({
          id: exp.id,
          title: exp.title,
          amount: parseFloat(exp.amount) || 0,
          category: exp.category || 'OTHER',
          date: exp.date ? exp.date.toString() : new Date().toISOString().slice(0, 10),
          paymentMethod: exp.paymentMethod || 'UPI',
          notes: exp.notes || '',
          isRecurring: Boolean(exp.isRecurring),
          groupId: exp.groupId || null
        }));
        setExpenses(mapped);
        localStorage.setItem(storageKey, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Backend /api/expenses fetch failed or offline; using local cached state:', err.message);
    }
  }, [storageKey, token]);

  useEffect(() => {
    refreshExpensesFromApi();
  }, [refreshExpensesFromApi, userId]);

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

  // CRUD Operations with Spring Boot REST API calls
  const addExpense = async (newExp) => {
    const payload = {
      title: newExp.title,
      amount: parseFloat(newExp.amount) || 0,
      category: newExp.category || 'OTHER',
      date: newExp.date || new Date().toISOString().slice(0, 10),
      paymentMethod: newExp.paymentMethod || 'UPI',
      notes: newExp.notes || '',
      isRecurring: Boolean(newExp.isRecurring),
      groupId: newExp.groupId || null
    };

    let created = {
      ...payload,
      id: Date.now()
    };

    try {
      const res = await api.post('/expenses', payload);
      if (res.data && res.data.id) {
        created = {
          ...payload,
          id: res.data.id,
          title: res.data.title || payload.title,
          amount: parseFloat(res.data.amount) || payload.amount,
          category: res.data.category || payload.category
        };
      }
    } catch (err) {
      console.warn('POST /api/expenses call failed; fallback to local state:', err.message);
    }

    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const editExpense = async (id, updatedFields) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? { ...exp, ...updatedFields, amount: parseFloat(updatedFields.amount) || exp.amount }
          : exp
      )
    );

    try {
      await api.put(`/expenses/${id}`, updatedFields);
    } catch (err) {
      console.warn(`PUT /api/expenses/${id} call failed; updated locally:`, err.message);
    }
  };

  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));

    try {
      await api.delete(`/expenses/${id}`);
    } catch (err) {
      console.warn(`DELETE /api/expenses/${id} call failed; deleted locally:`, err.message);
    }
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
