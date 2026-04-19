import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItem, removeCartItem } from '../../features/cart/cartSlice';
import { EmptyState } from '../../components/shared/UI';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems } = useSelector((s) => s.cart);

  const shippingCharge = totalPrice > 500 ? 0 : 50;
  const total = totalPrice + shippingCharge;

  if (items.length === 0)
    return (
      <div className="page-container py-16">
        <EmptyState icon={<FiShoppingCart />} title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>} />
      </div>
    );

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">Shopping Cart <span className="text-gray-400 font-sans text-lg">({totalItems} items)</span></h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4 items-center">
              <Link to={`/products/${item.product}`}>
                <img src={getImageUrl(item.image)} alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product}`}>
                  <h3 className="font-semibold text-gray-800 text-sm hover:text-accent transition-colors truncate">{item.name}</h3>
                </Link>
                <p className="text-accent font-bold mt-1">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: Math.max(1, item.quantity - 1) }))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200">{item.quantity}</span>
                <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors">+</button>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                <button onClick={() => dispatch(removeCartItem(item._id))}
                  className="text-gray-400 hover:text-red-500 transition-colors mt-1">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingCharge === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingCharge === 0 ? 'FREE' : formatCurrency(shippingCharge)}
                </span>
              </div>
              {shippingCharge > 0 && (
                <p className="text-xs text-gray-400">Add ₹{500 - totalPrice} more for free shipping</p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-accent">{formatCurrency(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              Proceed to Checkout <FiArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-accent mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
