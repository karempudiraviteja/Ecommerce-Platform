import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../../features/products/productSlice';
import ProductCard from '../../components/customer/ProductCard';
import { PageSpinner, Pagination, EmptyState } from '../../components/shared/UI';
import { FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, categories, loading, pagination } = useSelector((s) => s.products);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    Object.entries(localFilters).forEach(([k, v]) => { if (v) params[k] = v; });
    dispatch(fetchProducts(params));
    setSearchParams(params);
  }, [localFilters]);

  const set = (k) => (v) => setLocalFilters((f) => ({ ...f, [k]: v, page: 1 }));
  const clearFilters = () => setLocalFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 });
  const hasFilters = localFilters.category || localFilters.minPrice || localFilters.maxPrice || localFilters.search;

  return (
    <div className="page-container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">
            {localFilters.search ? `Results for "${localFilters.search}"` :
             localFilters.category ? localFilters.category : 'All Products'}
          </h1>
          {pagination?.total !== undefined && (
            <p className="text-sm text-gray-500 mt-1">{pagination.total} products</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select value={localFilters.sort} onChange={(e) => set('sort')(e.target.value)}
            className="input w-auto py-2 text-sm">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="btn-outline py-2 flex items-center gap-2 text-sm">
            <FiFilter size={14} /> Filters
            {hasFilters && <span className="w-2 h-2 bg-accent rounded-full" />}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Filters</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-accent flex items-center gap-1 hover:underline">
                <FiX size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Category</label>
              <select value={localFilters.category} onChange={(e) => set('category')(e.target.value)}
                className="input text-sm py-2">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Min Price (₹)</label>
              <input type="number" value={localFilters.minPrice} onChange={(e) => set('minPrice')(e.target.value)}
                placeholder="0" className="input text-sm py-2" min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Max Price (₹)</label>
              <input type="number" value={localFilters.maxPrice} onChange={(e) => set('maxPrice')(e.target.value)}
                placeholder="Any" className="input text-sm py-2" min="0" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Search</label>
              <input type="text" value={localFilters.search} onChange={(e) => set('search')(e.target.value)}
                placeholder="Product name…" className="input text-sm py-2" />
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {localFilters.category && (
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full">
              {localFilters.category}
              <button onClick={() => set('category')('')}><FiX size={10} /></button>
            </span>
          )}
          {localFilters.search && (
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full">
              "{localFilters.search}"
              <button onClick={() => set('search')('')}><FiX size={10} /></button>
            </span>
          )}
          {(localFilters.minPrice || localFilters.maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full">
              ₹{localFilters.minPrice || '0'} – ₹{localFilters.maxPrice || '∞'}
              <button onClick={() => { set('minPrice')(''); set('maxPrice')(''); }}><FiX size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? <PageSpinner /> : items.length === 0 ? (
        <EmptyState icon={<FiGrid />} title="No products found" description="Try adjusting your filters or search terms." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <Pagination pagination={pagination} onPageChange={(p) => setLocalFilters((f) => ({ ...f, page: p }))} />
        </>
      )}
    </div>
  );
}
