import { useState, useEffect, useMemo, useDebugValue, useCallback } from 'react';
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
  const userId = user?.id;

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Fetch real expenses and budgets from Spring Boot Core Service REST API
  const refreshExpensesFromApi = useCallback(async () => {
    const activeToken = token || localStorage.getItem('expensesync-jwt');
    if (!activeToken) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [expRes, budgetRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/budgets').catch(() => ({ data: DEFAULT_BUDGETS }))
      ]);

      if (Array.isArray(expRes.data)) {
        const mapped = expRes.data.map((exp) => ({
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
      } else {
        setExpenses([]);
      }

      if (budgetRes?.data && typeof budgetRes.data === 'object') {
        setBudgets({ ...DEFAULT_BUDGETS, ...budgetRes.data });
      }
    } catch (err) {
      console.warn('Backend API fetch failed:', err.message);
      setError(err.message || 'Failed to load expenses from core-service');
      setExpenses([]); // Never fall back to mock data or stale cached data
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshExpensesFromApi();
  }, [refreshExpensesFromApi, userId]);

  // CRUD Operations strictly calling Spring Boot REST API
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

    const res = await api.post('/expenses', payload);
    const created = {
      ...payload,
      id: res.data?.id || Date.now(),
      title: res.data?.title || payload.title,
      amount: parseFloat(res.data?.amount) || payload.amount,
      category: res.data?.category || payload.category
    };

    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const editExpense = async (id, updatedFields) => {
    await api.put(`/expenses/${id}`, updatedFields);
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === id
          ? { ...exp, ...updatedFields, amount: parseFloat(updatedFields.amount) || exp.amount }
          : exp
      )
    );
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
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
        if (sortBy === 'date-desc') {
          const diff = new Date(b.date) - new Date(a.date);
          return diff !== 0 ? diff : (b.id - a.id);
        }
        if (sortBy === 'date-asc') {
          const diff = new Date(a.date) - new Date(b.date);
          return diff !== 0 ? diff : (a.id - b.id);
        }
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
    const limit = budgets[category] || budgets.OTHER || 2000;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    let status = 'NORMAL';
    if (percentage >= 100) status = 'ALERT';
    else if (percentage >= 80) status = 'WARNING';

    return { spent, limit, percentage, status };
  };

  // Export to CSV Function via Core Service API
  const exportToCSV = async () => {
    try {
      const res = await api.get(`/reports/export-csv?userId=${userId || 1}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ExpenseSync_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback direct CSV export
      const headers = ['Date,Category,Description,Amount,PaymentMethod,Status'];
      const rows = expenses.map((exp) =>
        `"${exp.date}","${exp.category}","${(exp.title || '').replace(/"/g, '""')}",${(exp.amount || 0).toFixed(2)},"${exp.paymentMethod || 'UPI'}","PAID"`
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ExpenseSync_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
    exportToCSV,
    loading,
    error,
    refreshExpenses: refreshExpensesFromApi
  };
}
