import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../features/orders/orderSlice';
import { PageSpinner, StatusBadge, Pagination } from '../../components/shared/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FiSearch, FiChevronRight } from 'react-icons/fi';

const STATUS_FILTERS = ['All', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((s) => s.orders);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (status !== 'All') params.status = status;
    dispatch(fetchAllOrders(params));
  }, [page, status, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order number…" className="input pl-9 py-2 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${status === s ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Order #', 'Customer', 'Date', 'Items', 'Amount', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-gray-700">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.user?.name || order.customerSnapshot?.name}</p>
                    <p className="text-xs text-gray-500">{order.user?.email || order.customerSnapshot?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.orderStatus} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${order._id}`}
                      className="text-accent hover:text-accent-600 transition-colors">
                      <FiChevronRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No orders found</div>
          )}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
}
