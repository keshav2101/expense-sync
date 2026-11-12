import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function BudgetBar({ category, statusInfo }) {
  const { formatCurrency } = useAuth();
  const { spent, limit, percentage, status } = statusInfo;

  let fillClass = '';
  if (status === 'ALERT') fillClass = 'danger';
  else if (status === 'WARNING') fillClass = 'warning';

  return (
    <div className="budget-meter-row">
      <div className="budget-meter-header">
        <span className="cat-name">
          {category} 
          {status === 'ALERT' && <span className="budget-tag alert">Over Budget!</span>}
          {status === 'WARNING' && <span className="budget-tag warning">80% Reached</span>}
        </span>
        <span className="budget-amounts">
          <strong>{formatCurrency(spent)}</strong> / {formatCurrency(limit)} ({percentage}%)
        </span>
      </div>
      <div className="progress-bar-container">
        <div 
          className={`progress-bar-fill ${fillClass}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

