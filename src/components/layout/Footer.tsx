'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Truck,
  Lock,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Upper Trust Strip */}
      <div className="border-b border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Instant Price Quote</h4>
                <p className="text-xs text-slate-400 mt-0.5">Algorithm-backed fair market pricing in under 60 seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Free Doorstep Pickup</h4>
                <p className="text-xs text-slate-400 mt-0.5">Zero pickup charges across 19,000+ Indian pincodes.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">DoD Data Sanitization</h4>
                <p className="text-xs text-slate-400 mt-0.5">100% certified data wipe to keep your privacy inviolable.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Instant Doorstep Payout</h4>
                <p className="text-xs text-slate-400 mt-0.5">Direct UPI / IMPS transferred on the spot before agent leaves.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Mega Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Trust<span className="text-cyan-400">My</span>Gadget
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India’s next-generation technology trade-in and resale infrastructure. Sell old smartphones, MacBooks, and high-performance gaming laptops with instant valuation and certified doorstep payout.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>1800 209 8899 (Toll-Free Mon-Sun 9AM-8PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>support@trustmygadget.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cyber City, Phase II, Gurugram, NCR, India</span>
              </div>
            </div>
          </div>

          {/* Sell Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Sell Your Device</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/sell/smartphones" className="hover:text-cyan-400 transition-colors">Sell Smartphone</Link></li>
              <li><Link href="/sell/laptops" className="hover:text-cyan-400 transition-colors">Sell Laptop</Link></li>
              <li><Link href="/sell/smartphones/apple" className="hover:text-cyan-400 transition-colors">Sell Apple iPhone</Link></li>
              <li><Link href="/sell/smartphones/samsung" className="hover:text-cyan-400 transition-colors">Sell Samsung Galaxy</Link></li>
              <li><Link href="/sell/laptops/apple-macbook" className="hover:text-cyan-400 transition-colors">Sell MacBook Air / Pro</Link></li>
              <li><Link href="/sell/laptops/dell" className="hover:text-cyan-400 transition-colors">Sell Dell Laptop</Link></li>
              <li><Link href="/sell" className="hover:text-cyan-400 transition-colors font-medium text-cyan-400">Browse All Brands →</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Company & Info</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link></li>
              <li><Link href="/why-us" className="hover:text-cyan-400 transition-colors">Why TrustMyGadget</Link></li>
              <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Resale Insights Blog</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/track-order" className="hover:text-cyan-400 transition-colors text-emerald-400 font-semibold">Track Your Order</Link></li>
              <li><Link href="/admin" className="hover:text-purple-400 transition-colors text-purple-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Admin Portal</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Support & Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/faqs" className="hover:text-cyan-400 transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/selling-policy" className="hover:text-cyan-400 transition-colors">Device Buyback Policy</Link></li>
              <li><Link href="/account" className="hover:text-cyan-400 transition-colors">Customer Account</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TrustMyGadget Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
            <span>•</span>
            <Link href="/faqs" className="hover:text-slate-400">FAQs</Link>
            <span>•</span>
            <span className="text-cyan-500 font-medium">Made for India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
