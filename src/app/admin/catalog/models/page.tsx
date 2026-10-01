'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode, Plus, Search, Smartphone, Laptop, Edit, Trash2, Upload, ExternalLink, Download, Zap, ChevronDown, ChevronRight, Check, Sparkles } from 'lucide-react';

export default function AdminModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [search, setSearch] = useState('');

  // Quick Edit State
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickModel, setQuickModel] = useState<any>(null);
  const [quickTargetVariantId, setQuickTargetVariantId] = useState<string | null>(null);
  const [quickName, setQuickName] = useState('');
  const [quickBrandId, setQuickBrandId] = useState('');
  const [quickCategoryId, setQuickCategoryId] = useState('');
  const [quickReleaseYear, setQuickReleaseYear] = useState('2024');
  const [quickBasePrice, setQuickBasePrice] = useState('0');
  const [quickIsPopular, setQuickIsPopular] = useState(false);
  const [quickIsFeatured, setQuickIsFeatured] = useState(false);
  const [quickIsActive, setQuickIsActive] = useState(true);
  const [quickVariants, setQuickVariants] = useState<any[]>([]);
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedModelIds, setExpandedModelIds] = useState<Set<string>>(new Set());

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const toggleModelExpand = (id: string) => {
    setExpandedModelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  const openQuickEdit = (m: any, targetVariantId?: string) => {
    setQuickModel(m);
    setQuickTargetVariantId(targetVariantId || null);
    setQuickName(m.name || '');
    setQuickBrandId(m.brandId || brands[0]?.id || '');
    setQuickCategoryId(m.categoryId || categories[0]?.id || 'cat_smartphone');
    setQuickReleaseYear(String(m.releaseYear || 2024));
    setQuickIsPopular(m.isPopular === 1);
    setQuickIsFeatured(m.isFeatured === 1);
    setQuickIsActive(m.isActive !== 0);

    const targetVar = targetVariantId ? m.variants?.find((v: any) => v.id === targetVariantId) : null;
    const initialPrice = targetVar ? targetVar.basePrice : (m.basePrice || 0);
    setQuickBasePrice(String(initialPrice));

    const initialVars = (m.variants && m.variants.length > 0)
      ? m.variants.map((v: any) => ({
          ...v,
          basePrice: v.basePrice !== undefined && v.basePrice !== null ? Number(v.basePrice) : Number(m.basePrice || 0),
        }))
      : [{ id: `${m.id}_def`, name: 'Standard', storage: 'Standard', ram: '', basePrice: Number(m.basePrice || 0) }];
    setQuickVariants(initialVars);
    setShowQuickModal(true);
  };

  const handleQuickPriceAdjust = (delta: number) => {
    const current = Number(quickBasePrice) || 0;
    const updated = Math.max(100, current + delta);
    setQuickBasePrice(String(updated));
    setQuickVariants((prev) =>
      prev.map((v, idx) => {
        if (quickTargetVariantId ? v.id === quickTargetVariantId : (prev.length === 1 || idx === 0)) {
          return { ...v, basePrice: updated };
        }
        return v;
      })
    );
  };

  const handleSyncQuickPriceToAll = () => {
    const p = Number(quickBasePrice) || 0;
    if (p > 0) {
      setQuickVariants((prev) => prev.map((v) => ({ ...v, basePrice: p })));
      showToast('✓ Base price applied to all variants below');
    }
  };

  const handleQuickSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickModel || !quickBasePrice) return;
    setQuickSubmitting(true);

    try {
      const numBasePrice = Number(quickBasePrice) || 0;
      const normalizedVariants = quickVariants.map((v) => ({
        ...v,
        basePrice: Number(v.basePrice) || numBasePrice,
      }));

      const payload = {
        id: quickModel.id,
        name: quickName.trim(),
        brandId: quickBrandId,
        categoryId: quickCategoryId,
        releaseYear: Number(quickReleaseYear) || 2024,
        basePrice: numBasePrice,
        isPopular: quickIsPopular,
        isFeatured: quickIsFeatured,
        isActive: quickIsActive,
        variants: normalizedVariants,
        adminName: 'Super Admin',
      };

      const res = await fetch('/api/admin/catalog/models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        showToast(data.error || 'Failed to update model', 'error');
        return;
      }

      // Optimistic update of local models state
      const brandObj = brands.find((b) => b.id === quickBrandId);
      setModels((prev) =>
        prev.map((m) => {
          if (m.id === quickModel.id) {
            return {
              ...m,
              name: quickName.trim(),
              brandId: quickBrandId,
              brandName: brandObj ? brandObj.name : m.brandName,
              releaseYear: Number(quickReleaseYear) || 2024,
              basePrice: numBasePrice,
              isPopular: quickIsPopular ? 1 : 0,
              isFeatured: quickIsFeatured ? 1 : 0,
              isActive: quickIsActive ? 1 : 0,
              variants: normalizedVariants,
            };
          }
          return m;
        })
      );

      setShowQuickModal(false);
      showToast(`✓ Price & details updated for ${quickName}!`);
      fetchModels();
    } catch (err: any) {
      showToast(err.message || 'Error updating model', 'error');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleDeleteVariant = async (variantId: string, variantName: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete the "${variantName}" variant of ${modelName}?\n\nThis will remove ONLY this variant configuration. The base model and all other variants will remain safe.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/catalog/models?variantId=${variantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Variant "${variantName}" deleted.`);
        fetchModels();
      } else {
        showToast(data.error || 'Failed to delete variant', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error deleting variant', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device model and all its variants?')) return;
    try {
      await fetch(`/api/admin/catalog/models?id=${id}`, { method: 'DELETE' });
      showToast('✓ Device model deleted.');
      fetchModels();
    } catch (e) {
      console.error(e);
    }
  };

  const [viewMode, setViewMode] = useState<'models' | 'variants'>('models');

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

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-lg transition-all ${
            notification.type === 'error'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
            ✓ Complete database inventory active
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
            onClick={() => setViewMode('models')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'models'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Base Model Series ({models.length})
          </button>
          <button
            onClick={() => setViewMode('variants')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'variants'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Device Models & Variants ({allVariants.length})
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
            /* Flattened Variants View */
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Device Configuration</th>
                  <th className="py-3.5 px-4 font-semibold">Manufacturer Brand</th>
                  <th className="py-3.5 px-4 font-semibold">Storage / RAM</th>
                  <th className="py-3.5 px-4 font-semibold">Variant Buyback Price</th>
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
                            <div className="font-bold text-white">
                              {v.modelName}{' '}
                              <span className="text-cyan-400 font-semibold text-[11px]">
                                ({v.storage || v.name})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{v.name}</div>
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
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openQuickEdit(v.parentModel, v.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Quick Edit Price & Basic Details"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Quick Edit</span>
                        </button>
                        <button
                          onClick={() => openEditModal(v.parentModel, v.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 transition-colors text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          title="Full Edit Model & Variants"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(v.id, v.name || v.storage, v.modelName)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          title="Delete only this variant"
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
            /* Grouped Base Models View */
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-8"></th>
                  <th className="py-3.5 px-4 font-semibold">Device Family</th>
                  <th className="py-3.5 px-4 font-semibold">Manufacturer Brand</th>
                  <th className="py-3.5 px-4 font-semibold">Base Buyback Price</th>
                  <th className="py-3.5 px-4 font-semibold">Configured Variants</th>
                  <th className="py-3.5 px-4 font-semibold">Badges</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No models matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((m) => (
                    <React.Fragment key={m.id}>
                      <tr className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 pl-3 pr-1 text-center">
                          {m.variants && m.variants.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleModelExpand(m.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              title={expandedModelIds.has(m.id) ? 'Collapse variants' : 'Expand variants'}
                            >
                              {expandedModelIds.has(m.id) ? (
                                <ChevronDown className="w-4 h-4 text-cyan-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          )}
                        </td>
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
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{m.name}</span>
                                {m.releaseYear && (
                                  <span className="text-[10px] text-slate-500 font-mono">({m.releaseYear})</span>
                                )}
                              </div>
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
                          <button
                            type="button"
                            onClick={() => toggleModelExpand(m.id)}
                            className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-cyan-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{m.variants?.length || 1} Variant(s)</span>
                            {expandedModelIds.has(m.id) ? (
                              <ChevronDown className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            {m.isPopular === 1 && (
                              <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                                POPULAR
                              </span>
                            )}
                            {m.isFeatured === 1 && (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openQuickEdit(m)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            title="Quick Edit Price & Basic Details"
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>Quick Edit</span>
                          </button>
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 transition-colors inline-flex items-center cursor-pointer"
                            title="Full Edit Model"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 transition-colors inline-flex items-center cursor-pointer"
                            title="Delete Model & All Variants"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Variants Sub-Table */}
                      {expandedModelIds.has(m.id) && m.variants && m.variants.length > 0 && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={7} className="p-3 pl-12 pr-4">
                            <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                  <span>RAM & Storage Variants ({m.variants.length})</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openQuickEdit(m)}
                                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold normal-case cursor-pointer text-xs"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Quick Edit All Variants</span>
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                {m.variants.map((v: any) => (
                                  <div
                                    key={v.id}
                                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                                  >
                                    <div>
                                      <div className="text-white font-semibold text-xs">{v.name || v.storage}</div>
                                      <div className="text-emerald-400 font-mono font-bold text-xs mt-0.5">
                                        ₹{Number(v.basePrice).toLocaleString('en-IN')}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => openQuickEdit(m, v.id)}
                                        className="p-1 rounded bg-slate-800 hover:bg-amber-950 text-amber-300 transition-colors cursor-pointer"
                                        title="Quick Edit this variant"
                                      >
                                        <Zap className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVariant(v.id, v.name || v.storage, m.name)}
                                        className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors cursor-pointer"
                                        title="Delete this variant"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
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
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-white">
                  {editingModel ? 'Edit Device Model' : 'Add New Device Model'}
                </h3>
                {editingModel && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      openQuickEdit(editingModel, selectedVariantId || undefined);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    title="Switch to fast Quick Edit mode"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quick Edit Mode</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1 rounded"
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer transition-colors"
              >
                {submitting ? 'Saving...' : editingModel ? 'Update Model' : 'Publish Model'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick Edit Modal */}
      {showQuickModal && quickModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleQuickSubmit}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 glass-panel space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Quick Edit: {quickModel.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Fast update buyback prices & basic device specifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Price Section */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Base Buyback Price (₹)</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Primary device buyback quote used for base valuation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncQuickPriceToAll}
                  className="px-2.5 py-1 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold cursor-pointer transition-all"
                  title="Copy this price to all variants below"
                >
                  Sync to all variants
                </button>
              </div>

              {/* Price Input & Quick Adjust Steppers */}
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={quickBasePrice}
                    onChange={(e) => setQuickBasePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-400 font-extrabold text-xl font-mono focus:outline-none focus:border-cyan-400"
                    placeholder="Enter price in ₹"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick ±:</span>
                  {[-1000, -500, -100, 100, 500, 1000].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleQuickPriceAdjust(step)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                        step > 0
                          ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {step > 0 ? `+₹${step.toLocaleString('en-IN')}` : `-₹${Math.abs(step).toLocaleString('en-IN')}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Variant Prices (if model has variants) */}
            {quickVariants && quickVariants.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Variant Price Breakdown ({quickVariants.length} SKUs)
                  </span>
                  <span className="text-[10px] text-slate-500">Edit per storage size</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {quickVariants.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-white font-semibold text-xs truncate">
                          {v.name || v.storage || `Variant ${idx + 1}`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {v.storage || ''} {v.ram ? `• ${v.ram}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">₹</span>
                          <input
                            type="number"
                            value={v.basePrice ?? ''}
                            onChange={(e) => {
                              const updated = [...quickVariants];
                              const newP = Number(e.target.value);
                              updated[idx] = {
                                ...updated[idx],
                                basePrice: isNaN(newP) ? 0 : newP,
                              };
                              setQuickVariants(updated);
                            }}
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs font-bold focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                        {quickVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuickVariants(quickVariants.filter((_, i) => i !== idx));
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Remove this variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Things */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Release Year</label>
                <input
                  type="number"
                  value={quickReleaseYear}
                  onChange={(e) => setQuickReleaseYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">Manufacturer Brand</label>
                <select
                  value={quickBrandId}
                  onChange={(e) => {
                    const newBId = e.target.value;
                    setQuickBrandId(newBId);
                    const b = brands.find((br) => br.id === newBId);
                    if (b?.categoryId) setQuickCategoryId(b.categoryId);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.categoryName || 'Smartphones'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Checkboxes */}
            <div className="flex items-center gap-4 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickIsPopular}
                  onChange={(e) => setQuickIsPopular(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-400 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">Mark as Popular</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickIsFeatured}
                  onChange={(e) => setQuickIsFeatured(e.target.checked)}
                  className="rounded border-slate-700 text-amber-400 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">Featured Flagship</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickIsActive}
                  onChange={(e) => setQuickIsActive(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-400 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">Active in Catalog</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowQuickModal(false);
                  openEditModal(quickModel, quickTargetVariantId || undefined);
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Specification Editor →</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{quickSubmitting ? 'Saving...' : 'Save Quick Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
