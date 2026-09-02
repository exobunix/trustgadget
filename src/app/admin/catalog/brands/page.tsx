'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, Check, X, Edit, Trash2, Upload, RefreshCw } from 'lucide-react';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch('/api/admin/catalog/brands'),
        fetch('/api/catalog/categories'),
      ]);
      const bData = await bRes.json();
      const cData = await cRes.json();
      if (bData.success) setBrands(bData.data);
      if (cData.success && cData.data.length > 0) {
        setCategories(cData.data);
        if (!categoryId) setCategoryId(cData.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogoUrl('');
    setIsPopular(false);
    setDisplayOrder('0');
    setShowModal(true);
  };

  const openEditModal = (b: any) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setCategoryId(b.categoryId);
    setLogoUrl(b.logoUrl || '');
    setIsPopular(b.isPopular === 1);
    setDisplayOrder(String(b.displayOrder || 0));
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'brands');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setLogoUrl(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return;
    setSubmitting(true);

    try {
      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId,
        logoUrl,
        isPopular,
        displayOrder: Number(displayOrder),
        adminName: 'Super Admin',
      };

      if (editingBrand) {
        await fetch('/api/admin/catalog/brands', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBrand.id, ...payload }),
        });
      } else {
        await fetch('/api/admin/catalog/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchBrands();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await fetch(`/api/admin/catalog/brands?id=${id}`, { method: 'DELETE' });
      fetchBrands();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Hardware Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Device Brands Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage manufacturer brands, upload logos, and set display priorities.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredBrands.length} brands total</span>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredBrands.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-between text-center glass-panel space-y-2 hover:border-slate-700 transition-all"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2.5 mb-1 overflow-hidden">
              {b.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="font-bold text-lg text-cyan-400">{b.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">{b.name}</div>
              <div className="text-[10px] text-slate-400">{b.categoryName}</div>
              {b.isPopular === 1 && (
                <span className="mt-1 inline-block text-[9px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  POPULAR
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 w-full flex items-center justify-center gap-2">
              <button
                onClick={() => openEditModal(b)}
                className="p-1 rounded bg-slate-800 hover:bg-cyan-950 text-slate-400 hover:text-cyan-300"
                title="Edit Brand"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                title="Delete Brand"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingBrand ? 'Edit Brand' : 'Create New Brand'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Motorola or Sony"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. motorola"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              {/* Logo URL or Upload */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Brand Logo (SVG / PNG)</label>
                <input
                  type="text"
                  placeholder="Logo URL or /brands/name.svg"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs mb-2"
                />
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950 hover:border-cyan-500 cursor-pointer text-slate-400 hover:text-cyan-300 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'Upload Logo File'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-400"
                />
                <span className="text-slate-300 font-semibold">Mark as Popular Brand (Shown in quick filters)</span>
              </label>
            </div>

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
                {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
