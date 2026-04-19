import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder } from '../../features/orders/orderSlice';
import { PageSpinner, StatusBadge } from '../../components/shared/UI';
import { formatCurrency, formatDate, formatDateTime, getImageUrl } from '../../utils/helpers';
import { FiDownload, FiX, FiChevronLeft, FiMapPin, FiCreditCard } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id]);

  if (loading || !order) return <PageSpinner />;

  const canCancel = ['Placed', 'Confirmed'].includes(order.orderStatus);

  const handleDownloadInvoice = async () => {
    try {
      const res = await api.get(`/orders/${id}/invoice/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div className="page-container py-8">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <FiChevronLeft /> My Orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <button onClick={handleDownloadInvoice}
            className="btn-outline text-sm py-2 flex items-center gap-2">
            <FiDownload size={14} /> Invoice
          </button>
          {canCancel && (
            <button onClick={() => dispatch(cancelOrder(id))}
              className="btn-outline border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-sm py-2 flex items-center gap-2">
              <FiX size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-4">Items Ordered</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <img src={getImageUrl(item.image)} alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shippingCharge === 0 ? 'FREE' : formatCurrency(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total</span><span className="text-accent">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.statusHistory?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-base font-bold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => (
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

        {/* Right panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiMapPin size={14} className="text-accent" /> Delivery Address
            </h2>
            <p className="text-sm text-gray-700">{order.shippingAddress?.street}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p className="text-sm text-gray-700">{order.shippingAddress?.zip}, {order.shippingAddress?.country}</p>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FiCreditCard size={14} className="text-accent" /> Payment
            </h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium text-gray-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
