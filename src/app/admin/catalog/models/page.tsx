'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode, Plus, Search, Smartphone, Laptop, Edit, Trash2, Upload, ExternalLink, Download } from 'lucide-react';

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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantsList, setVariantsList] = useState<any[]>([
    { name: '128 GB', storage: '128GB', ram: '8GB', basePrice: 45000 },
    { name: '256 GB', storage: '256GB', ram: '8GB', basePrice: 49000 },
  ]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const cacheBust = `?_t=${Date.now()}`;
      const [mRes, bRes, cRes] = await Promise.all([
        fetch(`/api/admin/catalog/models${cacheBust}`, { cache: 'no-store' }),
        fetch(`/api/admin/catalog/brands${cacheBust}`, { cache: 'no-store' }),
        fetch(`/api/catalog/categories${cacheBust}`, { cache: 'no-store' }),
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
    setSelectedVariantId(null);
    setName('');
    setSlug('');
    const defaultBrand = brands[0];
    if (defaultBrand) {
      setBrandId(defaultBrand.id);
      setCategoryId(defaultBrand.categoryId);
    }
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

  const openEditModal = (m: any, targetVariantId?: string) => {
    setEditingModel(m);
    setSelectedVariantId(targetVariantId || null);
    setName(m.name || '');
    setSlug(m.slug || '');
    const matchedBrand = brands.find((b) => b.id === m.brandId) || brands[0];
    setBrandId(m.brandId || matchedBrand?.id || '');
    setCategoryId(m.categoryId || matchedBrand?.categoryId || categories[0]?.id || 'cat_smartphone');
    setSeries(m.series || '');
    setImageUrl(m.imageUrl || '');
    setReleaseYear(String(m.releaseYear || 2024));

    const targetVar = targetVariantId ? m.variants?.find((v: any) => v.id === targetVariantId) : null;
    const initialPrice = targetVar?.basePrice || m.basePrice || 45000;
    setBasePrice(String(initialPrice));
    setIsPopular(m.isPopular === 1);

    const initialVariants = m.variants && m.variants.length > 0
      ? m.variants.map((v: any) => ({
          ...v,
          basePrice: v.basePrice !== undefined && v.basePrice !== null ? Number(v.basePrice) : Number(initialPrice),
        }))
      : [{ name: 'Standard', storage: '128GB', ram: '8GB', basePrice: Number(initialPrice) }];

    setVariantsList(initialVariants);
    setShowModal(true);
  };

  const handleBasePriceChange = (newVal: string) => {
    setBasePrice(newVal);
    const num = Number(newVal);
    if (!isNaN(num) && num > 0) {
      setVariantsList((prev) =>
        prev.map((v, idx) => {
          // If single variant or if this variant was explicitly targeted, or if all variants had same price, or first variant:
          if (prev.length === 1 || v.id === selectedVariantId || idx === 0) {
            return { ...v, basePrice: num };
          }
          return v;
        })
      );
    }
  };

  const applyBasePriceToAllVariants = () => {
    const num = Number(basePrice) || 0;
    if (num > 0) {
      setVariantsList((prev) => prev.map((v) => ({ ...v, basePrice: num })));
    }
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
      const effectiveCategoryId = selectedBrand?.categoryId || categoryId || categories[0]?.id || 'cat_smartphone';
      const parsedBasePrice = Number(basePrice) || 0;

      // Ensure every variant has a positive valid basePrice and unique disambiguated slug
      const seenSlugs = new Set<string>();
      const normalizedVariants = variantsList.map((v, idx) => {
        const variantName = v.name || `${v.ram ? v.ram + ' / ' : ''}${v.storage || 'Standard'}`.trim();
        const rawSlug = (v.slug || variantName || `v-${idx + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `v-${idx + 1}`;
        let uniqueSlug = rawSlug;
        let counter = 2;
        while (seenSlugs.has(uniqueSlug)) {
          uniqueSlug = `${rawSlug}-${counter}`;
          counter++;
        }
        seenSlugs.add(uniqueSlug);

        return {
          ...v,
          name: variantName,
          slug: uniqueSlug,
          basePrice: v.basePrice && !isNaN(Number(v.basePrice)) && Number(v.basePrice) > 0
            ? Number(v.basePrice)
            : parsedBasePrice,
        };
      });

      const payload = {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        brandId,
        categoryId: effectiveCategoryId,
        series,
        imageUrl,
        releaseYear: Number(releaseYear),
        basePrice: parsedBasePrice,
        isPopular,
        variants: normalizedVariants,
        adminName: 'Super Admin',
      };

      if (editingModel) {
        const res = await fetch('/api/admin/catalog/models', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingModel.id, ...payload }),
        });
        const data = await res.json();
        if (!data.success) {
          alert('Failed to update model: ' + (data.error || 'Server error'));
          return;
        }
      } else {
        const res = await fetch('/api/admin/catalog/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) {
          alert('Failed to create model: ' + (data.error || 'Server error'));
          return;
        }
      }

      setShowModal(false);
      await fetchModels();
    } catch (e: any) {
      console.error(e);
      alert('Error updating model: ' + e.message);
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

  const [viewMode, setViewMode] = useState<'variants' | 'models'>('variants');

  // Flatten all variants so admin can inspect all 550+ models & variants
  const allVariants = React.useMemo(() => {
    return models.flatMap((m) =>
      m.variants && m.variants.length > 0
        ? m.variants.map((v: any) => ({
            ...v,
            parentModel: m,
            modelName: m.name,
            modelSlug: m.slug,
            modelId: m.id,
            brandName: m.brandName,
            categoryName: m.categoryName,
            imageUrl: m.imageUrl,
            series: m.series,
            releaseYear: m.releaseYear,
            isPopular: m.isPopular,
          }))
        : [
            {
              id: `${m.id}_def`,
              name: 'Standard Variant',
              basePrice: m.basePrice,
              parentModel: m,
              modelName: m.name,
              modelSlug: m.slug,
              modelId: m.id,
              brandName: m.brandName,
              categoryName: m.categoryName,
              imageUrl: m.imageUrl,
              series: m.series,
              releaseYear: m.releaseYear,
              isPopular: m.isPopular,
            },
          ]
    );
  }, [models]);

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brandName?.toLowerCase().includes(search.toLowerCase()) ||
      (m.series && m.series.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVariants = allVariants.filter(
    (v) =>
      v.modelName?.toLowerCase().includes(search.toLowerCase()) ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.brandName?.toLowerCase().includes(search.toLowerCase()) ||
      (v.storage && v.storage.toLowerCase().includes(search.toLowerCase())) ||
      (v.ram && v.ram.toLowerCase().includes(search.toLowerCase())) ||
      (v.series && v.series.toLowerCase().includes(search.toLowerCase()))
  );

  const exportCatalogJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(models, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `trustmygadget_catalog_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Hardware Catalog Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Device Models & Base Pricing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full database inventory with all base models, RAM/storage configurations, and algorithmic quotes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <button
            type="button"
            onClick={exportCatalogJson}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            title="Download full catalog backup with all models and variants as JSON"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Catalog Backup</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Device Model</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Strip (Highlighting >500 Devices in Database) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            Total Hardware Configurations
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {allVariants.length} Devices
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            ✓ Complete database inventory (&gt;500 models active)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Base Hardware Series
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {models.length} Model Series
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Grouped parent device families
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Manufacturer Brands
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {brands.length} Brands
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Apple, Samsung, OnePlus, Google, etc.
          </div>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Toggle Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('variants')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'variants'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Device Models & Variants ({allVariants.length})
          </button>
          <button
            onClick={() => setViewMode('models')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'models'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Base Model Series ({models.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search device, storage, brand, RAM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Models Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          {viewMode === 'variants' ? (
            /* Flattened Variants View (550 Total Items) */
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Device Configuration</th>
                  <th className="py-3.5 px-4 font-semibold">Manufacturer Brand</th>
                  <th className="py-3.5 px-4 font-semibold">Storage / RAM</th>
                  <th className="py-3.5 px-4 font-semibold">Base Price</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredVariants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No models matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((v: any, idx: number) => (
                    <tr key={`${v.id}_${idx}`} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                            {v.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.imageUrl} alt={v.modelName} className="w-full h-full object-cover rounded" />
                            ) : (
                              <Smartphone className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white">{v.modelName}</div>
                            <div className="text-[11px] text-cyan-400 font-semibold">{v.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{v.brandName}</div>
                        <div className="text-slate-500 text-[10px]">{v.categoryName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                          {v.storage || v.name} {v.ram ? `• ${v.ram}` : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-sm text-emerald-400">
                          ₹{Number(v.basePrice).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(v.parentModel, v.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 transition-colors text-[11px] font-medium inline-flex items-center gap-1"
                          title="Edit Model & Variants"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v.modelId || v.parentModel?.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors text-[11px] font-medium inline-flex items-center gap-1"
                          title="Delete Device Model"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* Grouped Base Models View (244 Items) */
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Device Family</th>
                  <th className="py-3.5 px-4 font-semibold">Manufacturer Brand</th>
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
                      <div className="text-slate-500 text-[10px]">{m.categoryName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-sm text-emerald-400">
                        ₹{m.basePrice.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
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
          )}
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
                  onChange={(e) => {
                    const newBrandId = e.target.value;
                    setBrandId(newBrandId);
                    const b = brands.find((brand) => brand.id === newBrandId);
                    if (b?.categoryId) {
                      setCategoryId(b.categoryId);
                    }
                  }}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Base Buyback Price (₹) *</label>
                  <button
                    type="button"
                    onClick={applyBasePriceToAllVariants}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    title="Apply this base price to all RAM/Storage variants below"
                  >
                    Sync to all variants
                  </button>
                </div>
                <input
                  type="number"
                  required
                  value={basePrice}
                  onChange={(e) => handleBasePriceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-bold focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Updates model & base variant quote. Click "Sync to all variants" to overwrite all variants below.
                </p>
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

            {/* RAM & Storage Configurations Section */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>RAM & Storage Configurations</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
                      {variantsList.length} Option(s)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Add RAM & Storage options with individual buyback prices for this model.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const presets = [
                      { ram: '6GB', storage: '128GB' },
                      { ram: '8GB', storage: '128GB' },
                      { ram: '8GB', storage: '256GB' },
                      { ram: '12GB', storage: '256GB' },
                      { ram: '12GB', storage: '512GB' },
                      { ram: '16GB', storage: '512GB' },
                      { ram: '16GB', storage: '1TB' },
                    ];
                    const nextPreset = presets.find(
                      (p) => !variantsList.some(
                        (v) => (v.ram || '').trim().toLowerCase() === p.ram.toLowerCase() && (v.storage || '').trim().toLowerCase() === p.storage.toLowerCase()
                      )
                    ) || {
                      ram: '8GB',
                      storage: `${128 * (variantsList.length + 1)}GB`,
                    };

                    setVariantsList([
                      ...variantsList,
                      {
                        name: `${nextPreset.ram} / ${nextPreset.storage}`,
                        ram: nextPreset.ram,
                        storage: nextPreset.storage,
                        basePrice: Number(basePrice) || 45000,
                      },
                    ]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-400/30 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add RAM / Storage</span>
                </button>
              </div>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Add:</span>
                {[
                  { ram: '6GB', storage: '128GB' },
                  { ram: '8GB', storage: '128GB' },
                  { ram: '8GB', storage: '256GB' },
                  { ram: '12GB', storage: '256GB' },
                  { ram: '12GB', storage: '512GB' },
                  { ram: '16GB', storage: '512GB' },
                  { ram: '16GB', storage: '1TB' },
                ].map((preset) => (
                  <button
                    key={`${preset.ram}-${preset.storage}`}
                    type="button"
                    onClick={() => {
                      const exists = variantsList.some(
                        (v) => (v.ram || '').toLowerCase() === preset.ram.toLowerCase() && (v.storage || '').toLowerCase() === preset.storage.toLowerCase()
                      );
                      if (!exists) {
                        setVariantsList([
                          ...variantsList,
                          {
                            name: `${preset.ram} / ${preset.storage}`,
                            ram: preset.ram,
                            storage: preset.storage,
                            basePrice: Number(basePrice) || 45000,
                          },
                        ]);
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  >
                    + {preset.ram}/{preset.storage}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {variantsList.map((variant, idx) => {
                  const isDuplicate = variantsList.filter(
                    (v) => (v.ram || '').trim().toLowerCase() === (variant.ram || '').trim().toLowerCase() &&
                           (v.storage || '').trim().toLowerCase() === (variant.storage || '').trim().toLowerCase()
                  ).length > 1;

                  return (
                  <div
                    key={variant.id || idx}
                    className={`p-3 rounded-xl bg-slate-950 border ${isDuplicate ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'} grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center transition-colors`}
                  >
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        RAM {isDuplicate && <span className="text-[9px] text-amber-400 font-normal">!</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 8GB"
                        value={variant.ram || ''}
                        onChange={(e) => {
                          const updated = [...variantsList];
                          const newRam = e.target.value;
                          updated[idx] = {
                            ...updated[idx],
                            ram: newRam,
                            name: `${newRam ? newRam + ' / ' : ''}${updated[idx].storage || ''}`.trim(),
                          };
                          setVariantsList(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Storage</label>
                      <input
                        type="text"
                        placeholder="e.g. 128GB or 256GB"
                        value={variant.storage || ''}
                        onChange={(e) => {
                          const updated = [...variantsList];
                          const newStorage = e.target.value;
                          updated[idx] = {
                            ...updated[idx],
                            storage: newStorage,
                            name: `${updated[idx].ram ? updated[idx].ram + ' / ' : ''}${newStorage}`.trim(),
                          };
                          setVariantsList(updated);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        Variant Quote (₹) {variant.id === selectedVariantId ? '— Selected' : ''}
                      </label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={variant.basePrice ?? ''}
                        onChange={(e) => {
                          const updated = [...variantsList];
                          const newPrice = Number(e.target.value);
                          updated[idx] = {
                            ...updated[idx],
                            basePrice: isNaN(newPrice) ? 0 : newPrice,
                          };
                          setVariantsList(updated);
                          if (idx === 0 || variant.id === selectedVariantId || variantsList.length === 1) {
                            setBasePrice(String(newPrice || ''));
                          }
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border text-emerald-400 text-xs font-mono font-bold focus:outline-none ${
                          variant.id === selectedVariantId ? 'border-cyan-400 ring-1 ring-cyan-400/40' : 'border-emerald-500/40 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end self-end sm:pb-1">
                      {variantsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setVariantsList(variantsList.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Remove this RAM/Storage configuration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
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
