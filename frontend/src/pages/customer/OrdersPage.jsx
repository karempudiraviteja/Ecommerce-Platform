import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../features/orders/orderSlice';
import { EmptyState, PageSpinner, StatusBadge, Pagination } from '../../components/shared/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <PageSpinner />;

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">My Orders</h1>

      {!items?.length ? (
        <EmptyState icon={<FiPackage />} title="No orders yet"
          description="Place your first order to see it here."
          action={<Link to="/products" className="btn-primary">Shop Now</Link>} />
      ) : (
        <>
          <div className="space-y-4">
            {items.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`}
                className="card p-5 flex items-center justify-between hover:shadow-card-hover transition-all duration-200 group block">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <FiPackage className="text-accent" size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.orderStatus} />
                  <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  <FiChevronRight className="text-gray-400 group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => dispatch(fetchMyOrders({ page: p }))} />
        </>
      )}
    </div>
  );
}
