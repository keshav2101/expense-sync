import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import ExpenseModal from '../components/ExpenseModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function Expenses() {
  const {
    paginatedExpenses,
    filteredExpenses,
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
    exportToCSV
  } = useExpenses();

  const { formatCurrency } = useAuth();

  // Debounced search display indicator
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Modal & Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setIsModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingExpense) {
      editExpense(editingExpense.id, data);
      setToast({ message: 'Expense updated successfully!', type: 'success' });
    } else {
      addExpense(data);
      setToast({ message: 'New expense added successfully!', type: 'success' });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteExpense(deletingId);
      setDeletingId(null);
      setToast({ message: 'Expense deleted successfully!', type: 'success' });
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="content-header">
        <div>
          <h2>Personal Expenses</h2>
          <p>Search, filter, paginate, and track all your transactions.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportToCSV} className="btn btn-secondary btn-sm">
            📥 Export CSV
          </button>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            ➕ Add Expense
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Tray */}
      <div className="card filter-tray">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-controls">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="form-select"
          >
            <option value="ALL">All Categories</option>
            <option value="FOOD">Food & Dining</option>
            <option value="TRAVEL">Travel</option>
            <option value="RENT">Rent</option>
            <option value="SHOPPING">Shopping</option>
            <option value="BILLS">Bills</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="HEALTH">Health</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            className="form-select"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK">Net Banking</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
            <h3>No expenses found</h3>
            <p>Try clearing your search or adjust filter parameters.</p>
            <button onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setPaymentFilter('ALL'); }} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title & Notes</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Recurring</th>
                    <th>Amount</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.date}</td>
                      <td>
                        <strong>{exp.title}</strong>
                        {exp.notes && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.notes}</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${exp.category.toLowerCase()}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td>{exp.paymentMethod}</td>
                      <td>
                        {exp.isRecurring ? (
                          <span className="badge badge-warning">Monthly</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                      <td className="amt-negative">- {formatCurrency(exp.amount)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeletingId(exp.id)}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-bar">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing page {currentPage} of {totalPages} ({filteredExpenses.length} total)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="btn btn-secondary btn-sm"
                >
                  &larr; Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="btn btn-secondary btn-sm"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingExpense}
      />

      {/* Delete Confirmation Modal (Requirement F) */}
      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action will update your monthly budget calculations."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Toast Notification (Requirement F) */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
