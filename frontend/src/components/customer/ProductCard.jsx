import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { formatCurrency, getImageUrl, truncate } from '../../utils/helpers';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { products: wishItems } = useSelector((s) => s.wishlist);

  const isWishlisted = wishItems?.some(
    (p) => (p._id || p) === product._id
  );

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) return;
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!user) return;
    dispatch(toggleWishlist(product._id));
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {user && (
            <button onClick={handleWishlist}
              className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                shadow-md transition-all duration-200 ${isWishlisted ? 'bg-accent text-white' : 'bg-white text-gray-600 hover:bg-accent hover:text-white'}`}>
              <FiHeart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-accent font-semibold uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-800 mb-1 leading-snug">{truncate(product.name, 50)}</h3>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500">{product.rating.toFixed(1)} ({product.numReviews})</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="font-display font-bold text-gray-900 text-base">{formatCurrency(effectivePrice)}</span>
              {discount > 0 && (
                <span className="text-xs text-gray-400 line-through ml-1.5">{formatCurrency(product.price)}</span>
              )}
            </div>
            {user && product.stock > 0 && (
              <button onClick={handleAddToCart}
                className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center
                  hover:bg-accent-600 active:scale-90 transition-all duration-150 shadow-sm">
                <FiShoppingCart size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
