import React from 'react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-confirm">
        <h3>{title || 'Confirm Action'}</h3>
        <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>
          {message || 'Are you sure you want to proceed? This cannot be undone.'}
        </p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

