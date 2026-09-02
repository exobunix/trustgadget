'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode, Plus, Search, Smartphone, Laptop, Edit, Trash2, Upload, ExternalLink } from 'lucide-react';

export default function AdminModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [series, setSeries] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [releaseYear, setReleaseYear] = useState('2024');
  const [basePrice, setBasePrice] = useState('45000');
  const [isPopular, setIsPopular] = useState(true);
  const [variantsList, setVariantsList] = useState<any[]>([
    { name: '128 GB', storage: '128GB', ram: '8GB', basePrice: 45000 },
    { name: '256 GB', storage: '256GB', ram: '8GB', basePrice: 49000 },
  ]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const [mRes, bRes, cRes] = await Promise.all([
        fetch('/api/admin/catalog/models'),
        fetch('/api/admin/catalog/brands'),
        fetch('/api/catalog/categories'),
      ]);
      const mData = await mRes.json();
      const bData = await bRes.json();
      const cData = await cRes.json();

      if (mData.success) setModels(mData.data);
      if (bData.success) {
        setBrands(bData.data);
        if (!brandId && bData.data.length > 0) setBrandId(bData.data[0].id);
      }
      if (cData.success) {
        setCategories(cData.data);
        if (!categoryId && cData.data.length > 0) setCategoryId(cData.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const openAddModal = () => {
    setEditingModel(null);
    setName('');
    setSlug('');
    setSeries('');
    setImageUrl('');
    setReleaseYear('2024');
    setBasePrice('45000');
    setIsPopular(true);
    setVariantsList([
      { name: '128 GB', storage: '128GB', ram: '8GB', basePrice: 45000 },
      { name: '256 GB', storage: '256GB', ram: '8GB', basePrice: 49000 },
    ]);
    setShowModal(true);
  };

  const openEditModal = (m: any) => {
    setEditingModel(m);
    setName(m.name);
    setSlug(m.slug);
    setBrandId(m.brandId);
    setCategoryId(m.categoryId);
    setSeries(m.series || '');
    setImageUrl(m.imageUrl || '');
    setReleaseYear(String(m.releaseYear || 2024));
    setBasePrice(String(m.basePrice || 45000));
    setIsPopular(m.isPopular === 1);
    setVariantsList(m.variants?.length > 0 ? m.variants : [{ name: 'Standard', storage: '128GB', ram: '8GB', basePrice: m.basePrice }]);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'devices');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brandId || !categoryId || !basePrice) return;
    setSubmitting(true);

    try {
      const selectedBrand = brands.find((b) => b.id === brandId);
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brandId,
        categoryId: selectedBrand?.categoryId || categoryId,
        series,
        imageUrl,
        releaseYear: Number(releaseYear),
        basePrice: Number(basePrice),
        isPopular,
        variants: variantsList,
        adminName: 'Super Admin',
      };

      if (editingModel) {
        await fetch('/api/admin/catalog/models', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingModel.id, ...payload }),
        });
      } else {
        await fetch('/api/admin/catalog/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchModels();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device model and all its variants?')) return;
    try {
      await fetch(`/api/admin/catalog/models?id=${id}`, { method: 'DELETE' });
      fetchModels();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.brandName?.toLowerCase().includes(search.toLowerCase()) ||
    (m.series && m.series.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Hardware Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Device Models & Base Pricing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage device models, storage/RAM variants, base quotes, and upload device images.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Device Model</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model, brand, series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredModels.length} models total</span>
      </div>

      {/* Models Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Device</th>
                <th className="py-3.5 px-4 font-semibold">Brand & Series</th>
                <th className="py-3.5 px-4 font-semibold">Base Buyback Price</th>
                <th className="py-3.5 px-4 font-semibold">Configured Variants</th>
                <th className="py-3.5 px-4 font-semibold">Badges</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredModels.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {m.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-cyan-400">{m.brandName}</div>
                    <div className="text-slate-500 text-[10px]">{m.series || m.categoryName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-extrabold text-sm text-emerald-400">
                      ₹{m.basePrice.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-300">
                      {m.variants?.length || 1} Variant(s)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {m.isPopular === 1 && (
                      <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                        POPULAR
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 transition-colors"
                      title="Edit Model"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Delete Model"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Model Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingModel ? 'Edit Device Model' : 'Add New Device Model'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Manufacturer Brand *</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Series / Sub-brand</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 16 Series"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Base Buyback Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Device Image (URL or Upload)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white mb-2 text-xs"
                />
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:border-cyan-500 cursor-pointer text-slate-400 hover:text-cyan-300 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Device Image'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded border-slate-700 text-cyan-400"
              />
              <span className="text-slate-300 font-semibold">Mark as Popular Flagship (Featured on homepage)</span>
            </label>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingModel ? 'Update Model' : 'Publish Model'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
