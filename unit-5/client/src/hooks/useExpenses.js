import { useState, useEffect, useMemo, useDebugValue } from 'react';
import initialExpenses from '../data/mockExpenses.json';

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
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expensesync-expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('expensesync-budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('expensesync-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('expensesync-budgets', JSON.stringify(budgets));
  }, [budgets]);

  // CRUD Operations
  const addExpense = (newExp) => {
    const expenseWithId = {
      ...newExp,
      id: Date.now(),
      amount: parseFloat(newExp.amount) || 0
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
        const matchesSearch =
          exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
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
    const percentage = Math.round((spent / limit) * 100);

    let status = 'NORMAL';
    if (percentage >= 100) status = 'ALERT';
    else if (percentage >= 80) status = 'WARNING';

    return { spent, limit, percentage, status };
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const headers = ['ID,Title,Category,Amount,Date,PaymentMethod,IsRecurring,Notes'];
    const rows = expenses.map((exp) =>
      `"${exp.id}","${exp.title}","${exp.category}",${exp.amount},"${exp.date}","${exp.paymentMethod}",${exp.isRecurring},"${exp.notes || ''}"`
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

  // Expose React DevTools debug label (Syllabus requirement)
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
