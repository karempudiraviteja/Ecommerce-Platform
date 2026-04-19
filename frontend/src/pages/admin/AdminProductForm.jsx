import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, createProduct, updateProduct } from '../../features/products/productSlice';
import { PageSpinner } from '../../components/shared/UI';
import { getImageUrl } from '../../utils/helpers';
import { FiUpload, FiX, FiChevronLeft } from 'react-icons/fi';

export default function AdminProductForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading } = useSelector((s) => s.products);
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', category: '',
    brand: '', price: '', discountPrice: '', stock: '', tags: '',
    isFeatured: false, isActive: true, weight: '',
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (isEdit) dispatch(fetchProduct(id));
  }, [id]);

  useEffect(() => {
    if (isEdit && currentProduct && currentProduct._id === id) {
      setForm({
        name: currentProduct.name || '',
        description: currentProduct.description || '',
        shortDescription: currentProduct.shortDescription || '',
        category: currentProduct.category || '',
        brand: currentProduct.brand || '',
        price: currentProduct.price || '',
        discountPrice: currentProduct.discountPrice || '',
        stock: currentProduct.stock || '',
        tags: currentProduct.tags?.join(', ') || '',
        isFeatured: currentProduct.isFeatured || false,
        isActive: currentProduct.isActive !== undefined ? currentProduct.isActive : true,
        weight: currentProduct.weight || '',
      });
      setExistingImages(currentProduct.images || []);
    }
  }, [currentProduct]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (img) => setExistingImages((prev) => prev.filter((i) => i !== img));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('keepImages', JSON.stringify(existingImages));
    images.forEach((img) => fd.append('images', img));

    let result;
    if (isEdit) {
      result = await dispatch(updateProduct({ id, formData: fd }));
    } else {
      result = await dispatch(createProduct(fd));
    }
    if (!result.error) navigate('/admin/products');
  };

  if (isEdit && loading && !currentProduct) return <PageSpinner />;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/admin/products')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-6">
        <FiChevronLeft /> Products
      </button>

      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                required className="input" placeholder="e.g. Wireless Headphones" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category *</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                required className="input" placeholder="e.g. Electronics" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Brand</label>
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="input" placeholder="Brand name" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                required rows={4} className="input resize-none" placeholder="Detailed product description" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Short Description</label>
              <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="input" placeholder="One-line summary" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="input" placeholder="wireless, audio, bluetooth" />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Pricing & Inventory</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Price (₹) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                required min="0" step="0.01" className="input" placeholder="999" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Discount Price (₹)</label>
              <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                min="0" step="0.01" className="input" placeholder="0 = no discount" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required min="0" className="input" placeholder="100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Weight (g)</label>
              <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })}
                min="0" className="input" placeholder="0" />
            </div>
          </div>
          <div className="flex gap-6">
            {[['isFeatured', 'Featured Product'], ['isActive', 'Active (visible)']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="w-4 h-4 accent-accent" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Product Images</h2>

          {existingImages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Current Images</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={getImageUrl(img)} alt="" className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                    <button type="button" onClick={() => removeExistingImage(img)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
              <FiUpload className="text-gray-400 text-2xl mb-2" />
              <span className="text-sm text-gray-600 font-medium">Click to upload images</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB each (max 5)</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previews.map((p, i) => (
                  <img key={i} src={p} alt="" className="w-20 h-20 rounded-xl object-cover ring-2 ring-accent/30" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}
