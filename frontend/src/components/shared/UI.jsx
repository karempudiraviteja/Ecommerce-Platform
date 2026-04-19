import React from 'react';
import { FiLoader, FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ORDER_STATUS_COLORS } from '../../utils/helpers';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <FiLoader className={`${sizes[size]} text-accent animate-spin`} />
    </div>
  );
};

export const PageSpinner = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <Spinner size="lg" />
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="text-5xl text-gray-200 mb-4">{icon || <FiInbox />}</div>
    <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">{title}</h3>
    {description && <p className="text-gray-500 text-sm mb-6 max-w-xs">{description}</p>}
    {action}
  </div>
);

export const StatusBadge = ({ status }) => (
  <span className={ORDER_STATUS_COLORS[status] || 'badge bg-gray-100 text-gray-600'}>{status}</span>
);

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <FiChevronLeft size={16} />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
            ${p === page ? 'bg-accent text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, danger = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 max-w-sm w-full">
        <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost">Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-primary bg-red-500 hover:bg-red-600' : 'btn-primary'}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const StatCard = ({ label, value, icon, color = 'accent', trend }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl
      ${color === 'accent' ? 'bg-accent/10 text-accent' :
        color === 'green' ? 'bg-green-100 text-green-600' :
        color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-display font-bold text-gray-900 mt-0.5">{value}</p>
      {trend && <p className="text-xs text-green-600 mt-0.5">{trend}</p>}
    </div>
  </div>
);
