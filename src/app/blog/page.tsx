'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, User, BookOpen } from 'lucide-react';

export default function BlogIndexPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/cms/blogs');
      const data = await res.json();
      if (data.success) setBlogs(data.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Knowledge Center
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          Resale Insights & Tech Guides
        </h1>
        <p className="text-sm text-slate-300 mt-3">
          Expert guides on device depreciation, battery health, data wiping, and getting maximum cash on upgrades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {blogs.map((b) => (
          <Link
            key={b.id}
            href={`/blog/${b.slug}`}
            className="group p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between glass-panel"
          >
            <div>
              <div className="relative h-48 rounded-2xl bg-slate-950 overflow-hidden mb-4 border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.coverImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold text-cyan-300 bg-slate-950/90 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  {b.category}
                </span>
              </div>
              <h2 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                {b.title}
              </h2>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {b.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>{b.author}</span>
              <span className="flex items-center gap-1 font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
