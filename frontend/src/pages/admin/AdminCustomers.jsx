import React, { useEffect, useState } from 'react';
import { PageSpinner, Pagination, ConfirmDialog } from '../../components/shared/UI';
import { formatDate } from '../../utils/helpers';
import { FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toggleTarget, setToggleTarget] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/customers?page=${page}&limit=20`);
      setCustomers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load customers'); }
    setLoading(false);
  };

  useEffect(() => { loadCustomers(); }, [page]);

  const handleToggle = async () => {
    try {
      await api.put(`/admin/customers/${toggleTarget._id}/toggle`);
      setCustomers((prev) => prev.map((c) =>
        c._id === toggleTarget._id ? { ...c, isActive: !c.isActive } : c
      ));
      toast.success(`Customer ${toggleTarget.isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update customer'); }
    setToggleTarget(null);
  };

  const filtered = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} total customers</p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…" className="input pl-9 py-2 text-sm" />
        </div>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Customer', 'Phone', 'Joined', 'Addresses', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{c.addresses?.length || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setToggleTarget(c)}
                      className={`p-1.5 rounded-lg transition-colors
                        ${c.isActive ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}>
                      {c.isActive ? <FiUserX size={15} /> : <FiUserCheck size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No customers found</div>
          )}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.isActive ? 'Deactivate Customer' : 'Activate Customer'}
        message={`Are you sure you want to ${toggleTarget?.isActive ? 'deactivate' : 'activate'} ${toggleTarget?.name}?`}
        danger={toggleTarget?.isActive}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
