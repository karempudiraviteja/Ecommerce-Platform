import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { placeOrder } from '../../features/orders/orderSlice';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { FiMapPin, FiPlus, FiCheckCircle } from 'react-icons/fi';

const emptyAddr = { label: 'Home', street: '', city: '', state: '', zip: '', country: 'India' };

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const { loading } = useSelector((s) => s.orders);

  const shippingCharge = totalPrice > 500 ? 0 : 50;
  const total = totalPrice + shippingCharge;

  const [selectedAddr, setSelectedAddr] = useState(
    user?.addresses?.find((a) => a.isDefault)?._id || user?.addresses?.[0]?._id || 'new'
  );
  const [newAddr, setNewAddr] = useState(emptyAddr);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const setA = (k) => (e) => setNewAddr({ ...newAddr, [k]: e.target.value });

  const handleOrder = async () => {
    let shippingAddress;
    if (selectedAddr === 'new') {
      if (!newAddr.street || !newAddr.city || !newAddr.state || !newAddr.zip)
        return alert('Please fill in the complete address.');
      shippingAddress = newAddr;
    } else {
      const addr = user.addresses.find((a) => a._id === selectedAddr);
      if (!addr) return alert('Select a delivery address.');
      shippingAddress = addr;
    }

    const result = await dispatch(placeOrder({ shippingAddress, paymentMethod }));
    if (!result.error) navigate(`/orders/${result.payload._id}`);
  };

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin className="text-accent" /> Delivery Address
            </h2>
            <div className="space-y-3">
              {user?.addresses?.map((addr) => (
                <label key={addr._id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedAddr === addr._id ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="address" value={addr._id} checked={selectedAddr === addr._id}
                    onChange={() => setSelectedAddr(addr._id)} className="mt-0.5 accent-accent" />
                  <div>
                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium mr-2">{addr.label}</span>
                    {addr.isDefault && <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Default</span>}
                    <p className="text-sm text-gray-700 mt-1">{addr.street}, {addr.city}, {addr.state} – {addr.zip}</p>
                    <p className="text-xs text-gray-500">{addr.country}</p>
                  </div>
                </label>
              ))}

              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedAddr === 'new' ? 'border-accent bg-accent/5' : 'border-dashed border-gray-300 hover:border-gray-400'}`}>
                <input type="radio" name="address" value="new" checked={selectedAddr === 'new'}
                  onChange={() => setSelectedAddr('new')} className="accent-accent" />
                <FiPlus size={14} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Use a new address</span>
              </label>

              {selectedAddr === 'new' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { key: 'label', label: 'Label', placeholder: 'Home / Office', full: false },
                    { key: 'street', label: 'Street Address', placeholder: '123 Main St', full: true },
                    { key: 'city', label: 'City', placeholder: 'Mumbai', full: false },
                    { key: 'state', label: 'State', placeholder: 'Maharashtra', full: false },
                    { key: 'zip', label: 'PIN Code', placeholder: '400001', full: false },
                    { key: 'country', label: 'Country', placeholder: 'India', full: false },
                  ].map(({ key, label, placeholder, full }) => (
                    <div key={key} className={full ? 'col-span-2' : ''}>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
                      <input value={newAddr[key]} onChange={setA(key)} placeholder={placeholder} className="input text-sm py-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="flex gap-3">
              {['COD', 'Online'].map((method) => (
                <label key={method}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all flex-1
                    ${paymentMethod === method ? 'border-accent bg-accent/5' : 'border-gray-200'}`}>
                  <input type="radio" value={method} checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)} className="accent-accent" />
                  <span className="text-sm font-medium text-gray-700">
                    {method === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                  </span>
                </label>
              ))}
            </div>
            {paymentMethod === 'Online' && (
              <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-3 rounded-lg">
                Online payment integration can be added with Razorpay/Stripe. For now this is a demo.
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scrollbar-thin">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={getImageUrl(item.image)} alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shippingCharge === 0 ? 'text-green-600' : ''}>{shippingCharge === 0 ? 'FREE' : formatCurrency(shippingCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-accent">{formatCurrency(total)}</span>
              </div>
            </div>
            <button onClick={handleOrder} disabled={loading}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              <FiCheckCircle size={16} />
              {loading ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
