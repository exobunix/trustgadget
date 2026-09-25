'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, HelpCircle, ArrowRight } from 'lucide-react';

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  useEffect(() => {
    async function loadFaqs() {
      const res = await fetch('/api/cms/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.data);
        if (data.data.length > 0) setActiveFaq(data.data[0].id);
      }
    }
    loadFaqs();
  }, []);

  const categories = ['All', 'Valuation', 'Pickup & Payment', 'Data Security', 'Device Condition', 'General'];

  const filteredFaqs = faqs.filter((f) => {
    const matchCat = selectedCategory === 'All' || f.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 font-sans">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-widest">
          Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium">
          Everything you need to know about valuations, free doorstep pickup, certified data wiping, and instant payments.
        </p>

        {/* Search */}
        <div className="mt-6 relative max-w-lg mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions (e.g. pickup, payment, cracked display)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 shadow-md"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === c
                ? 'bg-cyan-500 text-white dark:bg-cyan-400 dark:text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:border-slate-800 shadow-sm'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* FAQs 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFaqs.map((faq) => {
          const isOpen = activeFaq === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 overflow-hidden glass-panel h-fit transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                className="w-full text-left p-6 flex items-start justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
              >
                <span className="text-slate-900 dark:text-white">{faq.question}</span>
                <span className={`text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/40">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
