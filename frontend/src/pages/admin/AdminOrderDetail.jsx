import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../features/orders/orderSlice';
import { PageSpinner, StatusBadge } from '../../components/shared/UI';
import { formatCurrency, formatDate, formatDateTime, getImageUrl } from '../../utils/helpers';
import { FiChevronLeft, FiDownload, FiMapPin, FiCreditCard, FiRefreshCw } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Fetch the specific order
    api.get(`/admin/orders/${id}`).then((res) => {
      // We'll put it in Redux manually via a thunk or just keep local state
      setOrderData(res.data.data);
    }).catch(() => toast.error('Failed to load order'));
  }, [id]);

  const [orderData, setOrderData] = useState(null);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    const result = await dispatch(updateOrderStatus({ id, status: newStatus, note: statusNote }));
    if (!result.error) {
      setOrderData(result.payload);
      setNewStatus('');
      setStatusNote('');
    }
    setUpdating(false);
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.get(`/admin/orders/${id}/invoice/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderData?.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download invoice'); }
  };

  if (!orderData) return <PageSpinner />;
  const o = orderData;

  return (
    <div>
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <FiChevronLeft /> Orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{o.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(o.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={o.orderStatus} />
          <button onClick={handleDownloadInvoice} className="btn-outline text-sm py-2 flex items-center gap-2">
            <FiDownload size={14} /> Invoice PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {o.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <img src={getImageUrl(item.image)} alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(o.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span><span>{o.shippingCharge === 0 ? 'FREE' : formatCurrency(o.shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total</span><span className="text-accent">{formatCurrency(o.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiRefreshCw size={14} className="text-accent" /> Update Status
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">New Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input text-sm py-2">
                  <option value="">Select status…</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s} disabled={s === o.orderStatus}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Note (optional)</label>
                <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Dispatched via BlueDart" className="input text-sm py-2" />
              </div>
            </div>
            <button onClick={handleStatusUpdate} disabled={!newStatus || updating}
              className="btn-primary text-sm py-2">
              {updating ? 'Updating…' : 'Update Status'}
            </button>
          </div>

          {/* Timeline */}
          {o.statusHistory?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-gray-900 mb-4">Status History</h2>
              <div className="space-y-3">
                {[...o.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-accent' : 'bg-gray-300'}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{h.status}</p>
                      <p className="text-xs text-gray-500">{h.note}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(h.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-3">Customer</h2>
            <p className="text-sm font-semibold text-gray-800">{o.customerSnapshot?.name}</p>
            <p className="text-xs text-gray-500">{o.customerSnapshot?.email}</p>
            {o.customerSnapshot?.phone && <p className="text-xs text-gray-500">{o.customerSnapshot.phone}</p>}
          </div>

          {/* Address */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <FiMapPin size={13} className="text-accent" /> Delivery Address
            </h2>
            <p className="text-sm text-gray-700">{o.shippingAddress?.street}</p>
            <p className="text-sm text-gray-700">{o.shippingAddress?.city}, {o.shippingAddress?.state}</p>
            <p className="text-sm text-gray-700">{o.shippingAddress?.zip}, {o.shippingAddress?.country}</p>
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <FiCreditCard size={13} className="text-accent" /> Payment
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium">{o.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${o.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {o.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
