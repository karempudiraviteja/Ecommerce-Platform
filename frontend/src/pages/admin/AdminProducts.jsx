import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../features/products/productSlice';
import { PageSpinner, Pagination, ConfirmDialog } from '../../components/shared/UI';
import { formatCurrency, getImageUrl } from '../../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertTriangle } from 'react-icons/fi';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { items, loading, pagination } = useSelector((s) => s.products);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const params = { page, limit: 15 };
    if (search) params.search = search;
    dispatch(fetchProducts(params));
  }, [page, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{pagination?.total || 0} total products</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 mb-4">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…" className="input pl-10 py-2 text-sm" />
        </div>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={getImageUrl(p.images?.[0])} alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate max-w-xs">{p.name}</p>
                        {p.brand && <p className="text-xs text-gray-500">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{formatCurrency(p.discountPrice > 0 ? p.discountPrice : p.price)}</div>
                    {p.discountPrice > 0 && <div className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock <= 10 && p.stock > 0 && <FiAlertTriangle size={10} className="mr-1" />}
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.sold}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${p._id}/edit`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 size={14} />
                      </Link>
                      <button onClick={() => setDeleteId(p._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmDialog open={!!deleteId} title="Delete Product"
        message="This product will be hidden from the store. This action cannot be undone."
        danger onConfirm={() => { dispatch(deleteProduct(deleteId)); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} />
    </div>
  );
}
