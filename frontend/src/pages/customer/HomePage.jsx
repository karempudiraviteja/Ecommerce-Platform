import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../../features/products/productSlice';
import ProductCard from '../../components/customer/ProductCard';
import { PageSpinner } from '../../components/shared/UI';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const features = [
  { icon: <FiTruck />, title: 'Free Shipping', desc: 'On orders over ₹500' },
  { icon: <FiShield />, title: 'Secure Payment', desc: '100% protected' },
  { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '30-day returns' },
  { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Always here' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, categories, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, limit: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-surface to-primary text-white">
        <div className="page-container py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-accent/20 text-accent text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              New Collection 2026
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Shop What<br />
              <span className="text-accent">You Love</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto lg:mx-0">
              Discover curated products at great prices. Quality you can trust, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/products?featured=true" className="btn-outline border-white text-white hover:bg-white hover:text-primary inline-flex items-center gap-2 text-base px-8 py-3">
                Featured
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {['🎧', '👟', '📱', '🏠'].map((emoji, i) => (
                <div key={i} className={`bg-white/10 backdrop-blur rounded-2xl p-6 text-center text-4xl
                  ${i === 1 ? 'translate-y-4' : ''}`}>
                  {emoji}
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    {['Electronics', 'Sports', 'Gadgets', 'Home'][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="page-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-accent text-xl flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="page-container py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Browse Categories</h2>
            <Link to="/products" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
              All Products <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
                className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700
                  hover:border-accent hover:text-accent transition-all duration-150">
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="page-container pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="text-accent text-sm font-semibold hover:underline flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        {loading ? <PageSpinner /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
