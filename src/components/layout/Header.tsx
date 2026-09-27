'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Smartphone,
  Laptop,
  Search,
  User,
  ShieldCheck,
  Menu,
  X,
  Truck,
  Zap,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { SearchModal } from './SearchModal';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'py-2.5 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-900/5 dark:shadow-black/40'
            : 'py-4 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LEFT: Logo */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-900 p-1 shadow-md shadow-orange-500/10 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:border-orange-500/40 transition-all">
                <Image
                  src="/logo-icon.png"
                  alt="TrustGadgetMart Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center leading-none">
                  <span>Trust</span><span className="text-orange-500">GadgetMart</span>
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-widest text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                  Your Tech Destination
                </span>
              </div>
            </Link>

            {/* CENTER: Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT: Actions & CTAs */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
              {/* Instant Search Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all text-xs font-medium"
                title="Search gadgets"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden xl:inline">Search device...</span>
                <kbd className="hidden xl:inline text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">⌘K</kbd>
              </button>

              {/* Theme Toggle (Light / Dark Switch) */}
              <ThemeToggle />

              {/* Track Order */}
              <Link
                href="/track-order"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all whitespace-nowrap"
              >
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Track Order</span>
              </Link>

              {/* User Account */}
              <Link
                href="/account"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all"
                title="Customer Account"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>

              {/* Customer Support */}
              <Link
                href="/support"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all whitespace-nowrap"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Support</span>
              </Link>

              {/* Primary Sell CTA */}
              <Link
                href="/sell"
                className="relative inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-xl shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
              >
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 fill-slate-950" />
                <span>Sell Device</span>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 px-4 py-6 space-y-4 backdrop-blur-xl animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link
                href="/sell/smartphones"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-cyan-700 dark:text-cyan-300"
              >
                <Smartphone className="w-4 h-4" /> Sell Phone
              </Link>
              <Link
                href="/sell/laptops"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <Laptop className="w-4 h-4" /> Sell Laptop
              </Link>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                </Link>
              ))}
              <Link
                href="/track-order"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Track Existing Order
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
              <Link
                href="/support"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" /> Customer Support & Help
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Instant Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
