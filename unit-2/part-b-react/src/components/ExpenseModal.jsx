import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ExpenseModal({ isOpen, onClose, onSave, initialData = null }) {
  const { formatCurrency } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'FOOD',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI',
    notes: '',
    isRecurring: false,
    groupId: ''
  });

  const [splitMode, setSplitMode] = useState('EQUAL');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || 'FOOD',
        date: initialData.date || new Date().toISOString().slice(0, 10),
        paymentMethod: initialData.paymentMethod || 'UPI',
        notes: initialData.notes || '',
        isRecurring: !!initialData.isRecurring,
        groupId: initialData.groupId || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'FOOD',
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'UPI',
        notes: '',
        isRecurring: false,
        groupId: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || Number(formData.amount) <= 0) {
      alert('Please provide a valid title and positive amount.');
      return;
    }
    onSave(formData);
    onClose();
  };

  // Live split calculation preview
  const numAmount = parseFloat(formData.amount) || 0;
  const sampleMembers = ['Rahul', 'Priya', 'Amit', 'Sneha'];
  const baseEqualShare = numAmount > 0 ? (numAmount / sampleMembers.length).toFixed(2) : '0.00';

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Expense' : 'Add New Expense'}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Title / Description *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Swiggy Lunch"
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                <option value="FOOD">🍔 Food & Dining</option>
                <option value="TRAVEL">✈️ Travel & Commute</option>
                <option value="RENT">🏠 Rent & Housing</option>
                <option value="SHOPPING">🛍️ Shopping</option>
                <option value="BILLS">💡 Bills & Utilities</option>
                <option value="ENTERTAINMENT">🎬 Entertainment</option>
                <option value="HEALTH">💊 Health & Pharmacy</option>
                <option value="OTHER">📁 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Method</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-select">
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="CASH">Cash in Hand</option>
                <option value="BANK">Net Banking / NEFT</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assign to Group (Optional)</label>
              <select name="groupId" value={formData.groupId} onChange={handleChange} className="form-select">
                <option value="">Personal Expense (No Group)</option>
                <option value="1">Group: Goa Trip 2026</option>
                <option value="2">Group: Flatmates B-302</option>
              </select>
            </div>
          </div>

          {/* Live Split Preview Box (Requirement F) */}
          {formData.groupId && numAmount > 0 && (
            <div className="split-preview-box">
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                ⚡ Live Split Preview (Equal 4-Way Division):
              </div>
              <div className="split-preview-grid">
                {sampleMembers.map((m) => (
                  <span key={m} className="split-pill">
                    {m}: <strong>{formatCurrency(baseEqualShare)}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Notes / Memo</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Shared grocery restock"
              className="form-control"
            />
          </div>

          <div className="form-group checkbox-row">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
            />
            <label htmlFor="isRecurring">
              Mark as recurring expense (Monthly rent, Netflix, WiFi bill)
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
