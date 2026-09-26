'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Smartphone, Laptop, Sparkles } from 'lucide-react';

export default function CategoryBrandsPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [brands, setBrands] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await fetch('/api/catalog/categories');
        const catData = await catRes.json();
        if (catData.success) {
          const current = catData.data.find((c: any) => c.slug === categorySlug);
          setCategory(current);
          if (current) {
            const bRes = await fetch(`/api/catalog/brands?categoryId=${current.id}`);
            const bData = await bRes.json();
            if (bData.success) setBrands(bData.data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug]);

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Link href="/sell" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Categories
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            All Major Indian Brands
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Sell Your {category?.name || 'Device'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Select your manufacturer brand to view eligible models.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading brand catalog...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBrands.map((b) => (
            <Link
              key={b.id}
              href={`/sell/${categorySlug}/${b.slug}`}
              className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center text-center group glass-panel"
            >
              <div className="w-full h-16 sm:h-20 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-center px-3 py-2 mb-3 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all">
                {b.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logoUrl} alt={b.name} className="w-auto h-auto max-h-12 max-w-[85%] object-contain" />
                ) : (
                  <span className="font-extrabold text-base text-cyan-400">{b.name}</span>
                )}
              </div>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                {b.name}
              </span>
              {b.isPopular === 1 && (
                <span className="text-[10px] text-cyan-400 mt-1 font-semibold">Popular</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
