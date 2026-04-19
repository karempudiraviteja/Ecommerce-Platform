import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { EmptyState, PageSpinner } from '../../components/shared/UI';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  if (loading) return <PageSpinner />;

  return (
    <div className="page-container py-8">
      <h1 className="section-title mb-8">My Wishlist <span className="text-gray-400 font-sans text-lg">({products?.length || 0})</span></h1>
      {!products?.length ? (
        <EmptyState icon={<FiHeart />} title="Your wishlist is empty"
          description="Save items you love here."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            return (
              <div key={product._id} className="card overflow-hidden group">
                <Link to={`/products/${product._id}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img src={getImageUrl(product.images?.[0])} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 hover:text-accent transition-colors line-clamp-2 mb-1">{product.name}</h3>
                  </Link>
                  <p className="font-bold text-accent text-sm mb-3">{formatCurrency(effectivePrice)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
                      className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1">
                      <FiShoppingCart size={12} /> Add to Cart
                    </button>
                    <button onClick={() => dispatch(removeFromWishlist(product._id))}
                      className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
