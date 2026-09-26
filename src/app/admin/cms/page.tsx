'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Image as ImageIcon,
  HelpCircle,
  BookOpen,
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  ExternalLink,
  Layers,
  Settings as SettingsIcon,
} from 'lucide-react';
import { playNotificationSound } from '@/lib/notifications';

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'faqs' | 'blogs' | 'testimonials' | 'settings'>('banners');

  const [banners, setBanners] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({
    company_name: 'TrustMyGadget Technologies India Pvt Ltd',
    support_phone: '1800 209 8899',
    support_hours: 'Mon-Sun 9AM-8PM',
    support_email: 'help@trustmygadget.com',
    office_address: 'Cyber City, Phase II, Gurugram, NCR, India',
    pickup_pincodes_count: '19450',
    min_order_value: '1500',
  });

  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Modals state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<string | null>(null); // 'banner' | 'faq' | 'blog' | 'testimonial'
  const [isNew, setIsNew] = useState(false);

  const loadCMS = async () => {
    setLoading(true);
    try {
      const [banRes, faqRes, blogRes, testRes, setRes] = await Promise.all([
        fetch('/api/cms/banners'),
        fetch('/api/cms/faqs'),
        fetch('/api/cms/blogs'),
        fetch('/api/cms/testimonials'),
        fetch('/api/cms/settings'),
      ]);

      const banData = await banRes.json();
      const faqData = await faqRes.json();
      const blogData = await blogRes.json();
      const testData = await testRes.json();
      const setData = await setRes.json();

      if (banData.success) setBanners(banData.data);
      if (faqData.success) setFaqs(faqData.data);
      if (blogData.success) setBlogs(blogData.data);
      if (testData.success) setTestimonials(testData.data);
      if (setData.success && setData.data) {
        setSettings((prev) => ({ ...prev, ...setData.data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMS();
  }, []);

  const notifySuccess = (msg: string) => {
    playNotificationSound('status');
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // --- BANNERS CRUD ---
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/cms/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        notifySuccess(isNew ? 'New banner published!' : 'Banner updated!');
        loadCMS();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;
    try {
      await fetch(`/api/cms/banners?id=${id}`, { method: 'DELETE' });
      notifySuccess('Banner removed');
      loadCMS();
    } catch (err) {
      console.error(err);
    }
  };

  // --- FAQS CRUD ---
  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/cms/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        notifySuccess(isNew ? 'FAQ question created!' : 'FAQ updated!');
        loadCMS();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await fetch(`/api/cms/faqs?id=${id}`, { method: 'DELETE' });
      notifySuccess('FAQ deleted');
      loadCMS();
    } catch (err) {
      console.error(err);
    }
  };

  // --- BLOGS CRUD ---
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/cms/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        notifySuccess(isNew ? 'Blog article published!' : 'Blog article updated!');
        loadCMS();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog article?')) return;
    try {
      await fetch(`/api/cms/blogs?id=${id}`, { method: 'DELETE' });
      notifySuccess('Blog deleted');
      loadCMS();
    } catch (err) {
      console.error(err);
    }
  };

  // --- TESTIMONIALS CRUD ---
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/cms/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        notifySuccess(isNew ? 'Review added!' : 'Review updated!');
        loadCMS();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await fetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' });
      notifySuccess('Review removed');
      loadCMS();
    } catch (err) {
      console.error(err);
    }
  };

  // --- SITE & FOOTER SETTINGS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        notifySuccess('Footer contact details & site settings updated globally!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Content & Marketing Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            CMS & Dynamic Content Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete management for hero promotional banners, FAQs, articles, reviews, and footer contact details.
          </p>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-500/40 animate-fadeIn shadow-lg">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'banners', label: `Hero Banners (${banners.length})`, icon: ImageIcon },
          { id: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
          { id: 'blogs', label: `Blog Articles (${blogs.length})`, icon: BookOpen },
          { id: 'testimonials', label: `Reviews (${testimonials.length})`, icon: Star },
          { id: 'settings', label: `Footer & Site Settings`, icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
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

      {/* 1. HERO BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Homepage Promotional Banners</h2>
            <button
              onClick={() => {
                setIsNew(true);
                setEditingItem({
                  title: '',
                  subtitle: '',
                  badgeText: 'LIMITED OFFER',
                  desktopImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80',
                  mobileImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
                  ctaText: 'Sell Device',
                  ctaUrl: '/sell',
                  displayOrder: banners.length + 1,
                  isActive: 1,
                });
                setModalType('banner');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.desktopImage} alt={b.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-cyan-300 bg-slate-950/90 px-2.5 py-1 rounded-md border border-cyan-500/30">
                      {b.badgeText || 'BANNER'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-white">{b.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{b.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">CTA: {b.ctaText}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem({ ...b });
                        setModalType('banner');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white"
                      title="Edit Banner"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. FAQS TAB */}
      {activeTab === 'faqs' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Customer FAQs Knowledge Base</h2>
            <button
              onClick={() => {
                setIsNew(true);
                setEditingItem({
                  category: 'General',
                  question: '',
                  answer: '',
                  displayOrder: faqs.length + 1,
                  isFeatured: 0,
                  isActive: 1,
                });
                setModalType('faq');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 glass-panel flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                      {f.category}
                    </span>
                    {f.isFeatured === 1 && (
                      <span className="text-[9px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{f.question}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.answer}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setIsNew(false);
                      setEditingItem({ ...f });
                      setModalType('faq');
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white"
                    title="Edit FAQ"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFAQ(f.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BLOGS TAB */}
      {activeTab === 'blogs' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Educational Resale Blogs & Guides</h2>
            <button
              onClick={() => {
                setIsNew(true);
                setEditingItem({
                  title: '',
                  slug: '',
                  excerpt: '',
                  content: '',
                  coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
                  author: 'TrustMyGadget Editorial',
                  category: 'Selling Guide',
                  readTime: '4 min read',
                  isPublished: 1,
                });
                setModalType('blog');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Article</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-bold text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded">
                      {b.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{b.excerpt}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">By {b.author}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem({ ...b });
                        setModalType('blog');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white"
                      title="Edit Article"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(b.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      title="Delete Article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TESTIMONIALS TAB */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Verified Customer Testimonials</h2>
            <button
              onClick={() => {
                setIsNew(true);
                setEditingItem({
                  customerName: '',
                  location: 'Delhi NCR',
                  deviceSold: 'iPhone 15 Pro Max',
                  rating: 5,
                  reviewText: '',
                  isFeatured: 1,
                  isActive: 1,
                });
                setModalType('testimonial');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="text-amber-400 font-bold text-xs">{'★'.repeat(t.rating)}</div>
                  <p className="text-xs text-slate-300 italic line-clamp-3">"{t.reviewText}"</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{t.customerName}</div>
                    <div className="text-[10px] text-cyan-400">{t.deviceSold} ({t.location})</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingItem({ ...t });
                        setModalType('testimonial');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white"
                      title="Edit Review"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FOOTER & SITE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl animate-fadeIn">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>Footer Contact Information & Helpline</span>
            </h2>
            <p className="text-xs text-slate-400">
              Changes saved here update immediately across the user website footer, support pages, and order receipts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Toll-Free Support Phone</label>
                <input
                  type="text"
                  value={settings.support_phone || ''}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. 1800 209 8899"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Support Working Hours</label>
                <input
                  type="text"
                  value={settings.support_hours || ''}
                  onChange={(e) => setSettings({ ...settings, support_hours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Mon-Sun 9AM-8PM"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Official Support Email</label>
                <input
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. help@trustmygadget.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Registered Legal Company Name</label>
                <input
                  type="text"
                  value={settings.company_name || ''}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. TrustMyGadget Technologies India Pvt Ltd"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1.5">Headquarters / Office Address</label>
                <input
                  type="text"
                  value={settings.office_address || ''}
                  onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Cyber City, Phase II, Gurugram, NCR, India"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Active Serviceable Pincodes</label>
                <input
                  type="text"
                  value={settings.pickup_pincodes_count || ''}
                  onChange={(e) => setSettings({ ...settings, pickup_pincodes_count: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. 19450"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Minimum Device Buyback Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.min_order_value || ''}
                  onChange={(e) => setSettings({ ...settings, min_order_value: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. 1500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings & Sync Website</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- EDIT / ADD MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">
                {isNew ? 'Create New' : 'Edit'} {modalType?.toUpperCase()}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Banner Form */}
            {modalType === 'banner' && (
              <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Banner Headline *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Subtitle</label>
                  <input
                    type="text"
                    value={editingItem.subtitle || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Badge Label</label>
                    <input
                      type="text"
                      value={editingItem.badgeText || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, badgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Display Order</label>
                    <input
                      type="number"
                      value={editingItem.displayOrder || 1}
                      onChange={(e) => setEditingItem({ ...editingItem, displayOrder: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Image URL *</label>
                  <input
                    type="url"
                    required
                    value={editingItem.desktopImage || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, desktopImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Button Text</label>
                    <input
                      type="text"
                      value={editingItem.ctaText || 'Sell Device'}
                      onChange={(e) => setEditingItem({ ...editingItem, ctaText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Button Link</label>
                    <input
                      type="text"
                      value={editingItem.ctaUrl || '/sell'}
                      onChange={(e) => setEditingItem({ ...editingItem, ctaUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                  <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl">Save Banner</button>
                </div>
              </form>
            )}

            {/* FAQ Form */}
            {modalType === 'faq' && (
              <form onSubmit={handleSaveFAQ} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Category *</label>
                  <select
                    value={editingItem.category || 'General'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="General">General</option>
                    <option value="Valuation">Valuation & Pricing</option>
                    <option value="Pickup">Pickup & Logistics</option>
                    <option value="Payment">Payments & Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Question *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.question || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Answer *</label>
                  <textarea
                    rows={4}
                    required
                    value={editingItem.answer || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingItem.isFeatured === 1}
                    onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked ? 1 : 0 })}
                    id="isFeaturedFAQ"
                  />
                  <label htmlFor="isFeaturedFAQ" className="text-slate-300">Feature this question on homepage</label>
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                  <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl">Save FAQ</button>
                </div>
              </form>
            )}

            {/* Blog Form */}
            {modalType === 'blog' && (
              <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Category</label>
                    <input
                      type="text"
                      value={editingItem.category || 'Selling Guide'}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Author</label>
                    <input
                      type="text"
                      value={editingItem.author || 'TrustMyGadget Team'}
                      onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Cover Image URL</label>
                  <input
                    type="url"
                    value={editingItem.coverImage || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Short Excerpt *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.excerpt || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Article Content *</label>
                  <textarea
                    rows={6}
                    required
                    value={editingItem.content || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                  <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl">Save Article</button>
                </div>
              </form>
            )}

            {/* Testimonial Form */}
            {modalType === 'testimonial' && (
              <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={editingItem.customerName || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, customerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">City / Location</label>
                    <input
                      type="text"
                      value={editingItem.location || 'Gurugram'}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Device Sold</label>
                    <input
                      type="text"
                      value={editingItem.deviceSold || 'iPhone 15 Pro Max'}
                      onChange={(e) => setEditingItem({ ...editingItem, deviceSold: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">Rating (1 to 5 Stars)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={editingItem.rating || 5}
                      onChange={(e) => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Review Feedback *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingItem.reviewText || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, reviewText: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                  <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl">Save Review</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
