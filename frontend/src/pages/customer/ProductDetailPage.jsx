import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { PageSpinner } from '../../components/shared/UI';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const { products: wishItems } = useSelector((s) => s.wishlist);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [id]);

  if (loading || !product) return <PageSpinner />;

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const isWishlisted = wishItems?.some((p) => (p._id || p) === product._id);
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity: qty }));
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity: qty }));
    navigate('/cart');
  };

  return (
    <div className="page-container py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <FiChevronLeft /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="card overflow-hidden aspect-square mb-3">
            <img src={getImageUrl(product.images?.[activeImg])} alt={product.name}
              className="w-full h-full object-contain p-4" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-colors
                    ${i === activeImg ? 'border-accent' : 'border-gray-200'}`}>
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wide">{product.category}</span>
          {product.brand && <span className="text-xs text-gray-400 ml-2">by {product.brand}</span>}
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-2 mb-3">{product.name}</h1>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <FiStar key={s} size={16}
                    className={s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-display text-3xl font-bold text-gray-900">{formatCurrency(effectivePrice)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="badge bg-green-100 text-green-700">{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Qty + Buttons */}
          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors font-medium">−</button>
                  <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors font-medium">+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} className="btn-outline flex-1 flex items-center justify-center gap-2">
                  <FiShoppingCart size={16} /> Add to Cart
                </button>
                <button onClick={handleBuyNow} className="btn-primary flex-1">Buy Now</button>
                {user && (
                  <button onClick={() => dispatch(toggleWishlist(product._id))}
                    className={`p-3 rounded-xl border-2 transition-all ${isWishlisted ? 'border-accent bg-accent text-white' : 'border-gray-200 text-gray-600 hover:border-accent hover:text-accent'}`}>
                    <FiHeart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
            </>
          )}

          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <FiTruck size={14} className="text-green-600" />
            Free delivery on orders above ₹500
          </div>
        </div>
      </div>
    </div>
  );
}
