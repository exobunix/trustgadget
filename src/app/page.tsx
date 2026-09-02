'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  Lock,
  Star,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
} from 'lucide-react';

interface ModelItem {
  id: string;
  name: string;
  slug: string;
  series?: string;
  imageUrl: string;
  basePrice: number;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  desktopImage: string;
  ctaText: string;
  ctaUrl: string;
}

interface TestimonialItem {
  id: string;
  customerName: string;
  location: string;
  deviceSold: string;
  rating: number;
  reviewText: string;
  avatarUrl?: string;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: string;
  category: string;
  readTime: string;
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<'smartphones' | 'laptops'>('smartphones');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [popularModels, setPopularModels] = useState<ModelItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [activeFaq, setActiveFaq] = useState<string | null>('faq_1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [banRes, modRes, testRes, faqRes, blogRes] = await Promise.all([
          fetch('/api/cms/banners').then((r) => r.json()),
          fetch('/api/catalog/models?popular=true&limit=8').then((r) => r.json()),
          fetch('/api/cms/testimonials').then((r) => r.json()),
          fetch('/api/cms/faqs').then((r) => r.json()),
          fetch('/api/cms/blogs?limit=3').then((r) => r.json()),
        ]);

        if (banRes.success) setBanners(banRes.data);
        if (modRes.success) setPopularModels(modRes.data);
        if (testRes.success) setTestimonials(testRes.data);
        if (faqRes.success) setFaqs(faqRes.data);
        if (blogRes.success) setBlogs(blogRes.data);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Carousel auto-timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 overflow-hidden">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-8 pb-20 lg:pt-14 lg:pb-28 overflow-hidden grid-pattern">
        {/* Futuristic Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-sm shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>India’s Most Transparent Device Resale Platform</span>
                <span className="hidden sm:inline text-slate-500">•</span>
                <span className="hidden sm:inline text-emerald-400">100% Free Doorstep Pickup</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Sell Your Gadget.{' '}
                <span className="gradient-text-cyan">Get the Best Value.</span>{' '}
                <span className="gradient-text-emerald">Get Paid Fast.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Turn your old smartphone or laptop into instant cash with TrustMyGadget. Get a transparent quote in 60 seconds, schedule a doorstep pickup, and get paid instantly to your UPI or Bank.
              </p>

              {/* Quick Category Action Cards */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  What do you want to sell today?
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                  <Link
                    href="/sell/smartphones"
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all glass-panel group ${
                      selectedCategory === 'smartphones'
                        ? 'border-cyan-500/60 bg-slate-900/90 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-500/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedCategory('smartphones')}
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shrink-0">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white group-hover:text-cyan-300">Smartphone</div>
                      <div className="text-xs text-slate-400">iPhones, Galaxy, OnePlus</div>
                    </div>
                  </Link>

                  <Link
                    href="/sell/laptops"
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all glass-panel group ${
                      selectedCategory === 'laptops'
                        ? 'border-emerald-500/60 bg-slate-900/90 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => setSelectedCategory('laptops')}
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                      <Laptop className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white group-hover:text-emerald-300">Laptop</div>
                      <div className="text-xs text-slate-400">MacBook, Dell, HP, ASUS</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* CTAs & Micro-Proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/sell"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 rounded-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>Sell Your Device Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-2xl transition-all"
                >
                  <span>Check Device Value</span>
                </Link>
              </div>

              {/* Trust Stats Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-lg sm:text-xl font-bold text-white">₹4.8 Cr+</div>
                  <div className="text-xs text-slate-400">Paid to Sellers</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-cyan-400">150,000+</div>
                  <div className="text-xs text-slate-400">Devices Recycled</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-400">4.9 ★</div>
                  <div className="text-xs text-slate-400">Customer Rating</div>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive 3D Card Stack */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-6 glass-panel border border-slate-700/80 shadow-2xl overflow-hidden neon-glow-cyan">
                {/* Header of Visual Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-300">Live Valuation Terminal</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    INDIA MARKET INDEX
                  </span>
                </div>

                {/* Simulated Device Spotlight */}
                <div className="py-6 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80"
                      alt="iPhone 15 Pro Max"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 mb-1">
                      <TrendingUp className="w-3 h-3" /> High Demand Model
                    </div>
                    <h3 className="text-base font-bold text-white">Apple iPhone 15 Pro Max</h3>
                    <p className="text-xs text-slate-400">256GB • Titanium Blue</p>
                  </div>
                </div>

                {/* Instant Breakdown Simulated Box */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Base Device Value</span>
                    <span className="font-semibold text-slate-200">₹78,000</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Flawless Display & Body</span>
                    <span className="font-semibold text-emerald-400">+₹500</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Original Box & Tax Bill</span>
                    <span className="font-semibold text-emerald-400">+₹700</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Your Estimated Payout</span>
                    <span className="text-xl font-extrabold text-cyan-300">₹79,200</span>
                  </div>
                </div>

                {/* Action in Card */}
                <Link
                  href="/sell/smartphones/apple/iphone-15-pro-max"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md"
                >
                  <span>Instant Payout for This Device</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Floating Micro-badge */}
                <div className="absolute -bottom-2 -left-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-[11px] text-slate-300">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Pickup in Gurugram, BLR, BOM & 100+ cities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. CAROUSEL BANNERS (CMS BACKED) ================= */}
      {banners.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 glass-panel shadow-2xl">
            <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 flex items-center ${
                    index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {/* Background Image with Dark Gradient Overlay */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.desktopImage}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

                  {/* Banner Content */}
                  <div className="relative z-10 max-w-xl px-6 sm:px-12 py-8 space-y-3">
                    {banner.badgeText && (
                      <span className="inline-block text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                        {banner.badgeText}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {banner.subtitle}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={banner.ctaUrl || '/sell'}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs sm:text-sm font-bold transition-all shadow-md"
                      >
                        <span>{banner.ctaText || 'Sell Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
                <button
                  onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1.5">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBanner(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentBanner ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= 3. POPULAR GADGETS SHOWCASE ================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              Top Selling Gadgets in India
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trending Resale Values Today
            </h2>
          </div>
          <Link
            href="/sell"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>View all 60+ models</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularModels.map((device) => (
            <Link
              key={device.id}
              href={`/sell/${device.categorySlug || 'smartphones'}/${device.brandSlug}/${device.slug}`}
              className="group p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between glass-panel glass-panel-hover"
            >
              <div>
                <div className="relative w-full h-44 rounded-xl bg-slate-950 flex items-center justify-center p-3 mb-4 overflow-hidden border border-slate-800/80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={device.imageUrl}
                    alt={device.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                    {device.brandName}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {device.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {device.series || device.categoryName}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Get up to</div>
                  <div className="text-base font-extrabold text-emerald-400">
                    ₹{device.basePrice.toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="p-2 rounded-xl bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 4. 4-STEP HOW IT WORKS ================= */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Simple & Fast Process
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              How TrustMyGadget Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From instant valuation to cash in your bank account in 4 frictionless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Select Device',
                desc: 'Pick your smartphone or laptop brand, model, and storage variant from our extensive catalog.',
                icon: Smartphone,
                color: 'text-cyan-400',
                border: 'border-cyan-500/30',
              },
              {
                step: '02',
                title: 'Answer Condition',
                desc: 'Answer a few quick questions about your screen, body, battery, and available box/bill.',
                icon: CheckCircle2,
                color: 'text-emerald-400',
                border: 'border-emerald-500/30',
              },
              {
                step: '03',
                title: 'Get Instant Quote',
                desc: 'Our dynamic engine computes a guaranteed fair market quote with transparent deductions.',
                icon: Zap,
                color: 'text-purple-400',
                border: 'border-purple-500/30',
              },
              {
                step: '04',
                title: 'Doorstep Payout',
                desc: 'Our verified executive inspects device at your home and transfers cash via UPI before leaving.',
                icon: Truck,
                color: 'text-blue-400',
                border: 'border-blue-500/30',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all group glass-panel"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-slate-950 border ${item.border} ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-slate-500 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. WHY TRUSTMYGADGET COMPARISON ================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            The Trust Advantage
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Why Choose TrustMyGadget vs Offline Tech Markets?
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Experience the difference of an algorithm-powered technology resale platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TrustMyGadget Box */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-xl shadow-cyan-500/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">TrustMyGadget</h3>
                <span className="text-xs text-cyan-400 font-semibold">Next-Gen Digital Resale</span>
              </div>
            </div>

            <ul className="space-y-3.5 pt-2 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Algorithmic Transparent Valuation:</strong> No arbitrary bargaining or sudden markdowns.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Free Doorstep Service:</strong> Zero travel cost or time wasted in congested markets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Certified DoD Data Sanitization:</strong> We secure-wipe your phone/laptop in front of you.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant UPI / Bank IMPS:</strong> Full money credited directly before handing over gadget.</span>
              </li>
            </ul>
          </div>

          {/* Traditional Second Hand Shops */}
          <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-400">Traditional Offline Markets</h3>
                <span className="text-xs text-slate-500">Old Grey-Market Shops</span>
              </div>
            </div>

            <ul className="space-y-3.5 pt-2 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>Aggressive low-ball negotiations and artificial defect claims.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>Requires traveling in traffic with no guarantee of sale price.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>Severe risk of personal photos/chats recovering from poorly wiped memory.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>Unverified cash notes or delayed post-dated cheques.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= 6. TESTIMONIALS ================= */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Real Customer Stories
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Trusted by 150,000+ Gadget Sellers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between glass-panel"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 mb-3">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{t.reviewText}"
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                      {t.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatarUrl} alt={t.customerName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                          {t.customerName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{t.customerName}</div>
                      <div className="text-[11px] text-cyan-400">{t.deviceSold}</div>
                      <div className="text-[10px] text-slate-500">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= 7. FAQ ACCORDION (FULL WIDTH) ================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Have Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Everything you need to know about instant price calculation, free doorstep pickup, certified data wiping, and direct payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden glass-panel"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <span className={`text-cyan-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 8. RESALE INSIGHTS BLOG ================= */}
      {blogs.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Knowledge Center
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Latest Resale Insights & Guides
              </h2>
            </div>
            <Link href="/blog" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Browse all articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between glass-panel"
              >
                <div>
                  <div className="relative h-44 rounded-xl bg-slate-950 overflow-hidden mb-4 border border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.coverImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-cyan-300 bg-slate-950/90 px-2.5 py-0.5 rounded border border-cyan-500/30">
                      {blog.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{blog.author}</span>
                  <span>{blog.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= 9. FINAL HIGH-CONVERSION CTA ================= */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-slate-950 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-2xl neon-glow-cyan">
            <span className="inline-block text-xs font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30 mb-4">
              FASTEST PAYOUT GUARANTEED
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Ready to turn your old gadget into cash?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mt-4 leading-relaxed">
              Get an instant valuation in 60 seconds with zero obligation. Free doorstep pickup scheduled at your convenience.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sell"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-extrabold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
              >
                Sell Your Device Now →
              </Link>
              <Link
                href="/faqs"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-600 transition-all"
              >
                Read Resale FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
