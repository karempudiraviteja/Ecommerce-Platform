import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageSpinner, StatCard, StatusBadge } from '../../components/shared/UI';
import { formatCurrency, formatDate, getImageUrl } from '../../utils/helpers';
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import api from '../../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const chartData = data?.monthlySales?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    Revenue: Math.round(m.revenue),
    Orders: m.orders,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(data?.totalRevenue || 0)} icon={<FiDollarSign />} color="accent" />
        <StatCard label="Total Orders" value={data?.totalOrders || 0} icon={<FiShoppingBag />} color="blue" />
        <StatCard label="Customers" value={data?.totalCustomers || 0} icon={<FiUsers />} color="green" />
        <StatCard label="Products" value={data?.totalProducts || 0} icon={<FiPackage />} color="purple" />
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-gray-900 mb-4">Monthly Revenue (Last 12 Months)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e94560" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v, n) => [n === 'Revenue' ? formatCurrency(v) : v, n]} />
            <Area type="monotone" dataKey="Revenue" stroke="#e94560" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold text-gray-900">Top Selling Products</h2>
            <Link to="/admin/products" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data?.topProducts?.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <img src={getImageUrl(p.images?.[0])} alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.sold} sold · {formatCurrency(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-bold text-gray-900 flex items-center gap-2">
              <FiAlertTriangle className="text-orange-500" size={16} /> Low Stock Alert
            </h2>
          </div>
          <div className="space-y-3">
            {data?.lowStock?.length === 0 && <p className="text-sm text-gray-500">All products are well stocked!</p>}
            {data?.lowStock?.map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <img src={getImageUrl(p.images?.[0])} alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(p.price)}</p>
                </div>
                <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-gray-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-accent hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Customer', 'Date', 'Amount', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map((o) => (
                <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <Link to={`/admin/orders/${o._id}`} className="text-accent font-medium hover:underline text-xs">{o.orderNumber}</Link>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-700">{o.user?.name || o.customerSnapshot?.name}</td>
                  <td className="py-2.5 pr-4 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                  <td className="py-2.5 pr-4 font-semibold text-gray-900">{formatCurrency(o.totalAmount)}</td>
                  <td className="py-2.5"><StatusBadge status={o.orderStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
