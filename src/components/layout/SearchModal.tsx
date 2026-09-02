'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Smartphone, Laptop, ArrowRight, TrendingUp } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  series: string;
  imageUrl: string;
  basePrice: number;
  minPrice: number;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchResults('');
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchResults(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search e.g. iPhone 15, S24 Ultra, MacBook Air M3, Dell XPS..."
            className="w-full bg-transparent text-white text-base focus:outline-none placeholder:text-slate-500"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); fetchResults(''); }}
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2.5 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-xs text-slate-400 border-b border-slate-800/60">
          <span className="flex items-center gap-1 text-cyan-400 font-medium shrink-0">
            <TrendingUp className="w-3.5 h-3.5" /> Popular:
          </span>
          {['iPhone 16 Pro', 'iPhone 15', 'Galaxy S24', 'MacBook Air M3', 'OnePlus 13', 'Dell XPS'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                fetchResults(tag);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/30 border border-slate-700/50 transition-all shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Searching gadgets...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/sell/${item.categorySlug || 'smartphones'}/${item.brandSlug}/${item.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-all group border border-transparent hover:border-cyan-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden text-slate-400 group-hover:text-cyan-400">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : item.categorySlug === 'laptops' ? (
                        <Laptop className="w-5 h-5" />
                      ) : (
                        <Smartphone className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.brandName} • {item.series || item.categoryName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Get up to</div>
                      <div className="text-sm font-bold text-emerald-400">
                        ₹{item.basePrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm font-medium">No matching devices found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by brand (e.g. Apple, Dell) or model name.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Click any device to start instant valuation</span>
          <Link 
            href="/sell" 
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            Browse all catalog <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
