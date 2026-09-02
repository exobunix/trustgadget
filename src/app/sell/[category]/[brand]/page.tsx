'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Search, Smartphone, Laptop } from 'lucide-react';

export default function BrandModelsPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const brandSlug = params.brand as string;

  const [models, setModels] = useState<any[]>([]);
  const [brandName, setBrandName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/catalog/models?brandSlug=${brandSlug}`);
        const data = await res.json();
        if (data.success) {
          setModels(data.data);
          if (data.data.length > 0) {
            setBrandName(data.data[0].brandName);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brandSlug]);

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.series && m.series.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Link href={`/sell/${categorySlug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Brands
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Device Catalog
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Sell Your {brandName || 'Device'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Select your model to begin condition assessment and get instant quote.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading models...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredModels.map((m) => (
            <Link
              key={m.id}
              href={`/sell/${categorySlug}/${brandSlug}/${m.slug}`}
              className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all text-left group flex flex-col justify-between glass-panel"
            >
              <div>
                <div className="w-full h-40 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden p-2 flex items-center justify-center mb-3">
                  {m.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300">
                  {m.name}
                </h4>
                {m.series && (
                  <p className="text-xs text-slate-400 mt-0.5">{m.series}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Get up to</div>
                  <div className="text-sm font-bold text-emerald-400">
                    ₹{m.basePrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
