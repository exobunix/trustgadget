'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, HelpCircle, BookOpen, Star, Plus, Trash2 } from 'lucide-react';

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'faqs' | 'blogs' | 'testimonials'>('banners');

  const [banners, setBanners] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCMS() {
      setLoading(true);
      try {
        const [banRes, faqRes, blogRes, testRes] = await Promise.all([
          fetch('/api/cms/banners'),
          fetch('/api/cms/faqs'),
          fetch('/api/cms/blogs'),
          fetch('/api/cms/testimonials'),
        ]);

        const banData = await banRes.json();
        const faqData = await faqRes.json();
        const blogData = await blogRes.json();
        const testData = await testRes.json();

        if (banData.success) setBanners(banData.data);
        if (faqData.success) setFaqs(faqData.data);
        if (blogData.success) setBlogs(blogData.data);
        if (testData.success) setTestimonials(testData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCMS();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Content & Marketing Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          CMS & Dynamic Content Manager
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage homepage carousel banners, customer FAQs, educational resale blogs, and verified reviews.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'banners', label: `Hero Banners (${banners.length})`, icon: ImageIcon },
          { id: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
          { id: 'blogs', label: `Blog Articles (${blogs.length})`, icon: BookOpen },
          { id: 'testimonials', label: `Reviews (${testimonials.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Banners List */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {banners.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3"
            >
              <div className="relative h-40 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.desktopImage} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 text-[9px] font-bold text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/30">
                  {b.badgeText || 'BANNER'}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white">{b.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{b.subtitle}</p>
              <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-slate-800">
                <span>CTA: {b.ctaText}</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQs List */}
      {activeTab === 'faqs' && (
        <div className="space-y-3 animate-fadeIn">
          {faqs.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 glass-panel"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">{f.category}</span>
                {f.isFeatured === 1 && (
                  <span className="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white">{f.question}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Blogs List */}
      {activeTab === 'blogs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {blogs.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3"
            >
              <div className="relative h-40 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 text-[9px] font-bold text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded">
                  {b.category}
                </span>
              </div>
              <h3 className="font-bold text-sm text-white line-clamp-2">{b.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{b.excerpt}</p>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                By {b.author} • {b.readTime}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testimonials List */}
      {activeTab === 'testimonials' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3"
            >
              <div className="text-amber-400 font-bold text-xs">{'★'.repeat(t.rating)}</div>
              <p className="text-xs text-slate-300 italic line-clamp-3">"{t.reviewText}"</p>
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-white">{t.customerName}</div>
                <div className="text-[10px] text-cyan-400">{t.deviceSold}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
