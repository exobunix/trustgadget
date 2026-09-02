'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, Zap, Award, Globe, HeartHandshake, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          About TrustMyGadget
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          Pioneering India’s Tech Trade-in Revolution
        </h1>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          Founded with a mission to bring absolute transparency, institutional trust, and speed to the consumer electronics resale lifecycle.
        </p>
      </div>

      {/* Story Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
        <h2 className="text-2xl font-bold text-white">Our Story & Mission</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          India is the second largest smartphone market in the world, with over 150 million devices upgraded every year. Yet, until recently, selling a used gadget meant travelling to congested grey markets, facing stressful haggling, and risking private data leaks from uncertified resets.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          TrustMyGadget was established to build an algorithmic, transparent bridge between device owners and the secondary tech ecosystem. By fusing proprietary pricing models with verified doorstep logistics and instant UPI payments, we empower every consumer to unlock true cash value from their gadgets in minutes.
        </p>
      </div>

      {/* Leadership & Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-3xl font-black text-cyan-400">150,000+</div>
          <div className="text-xs text-slate-400 mt-1">Smartphones & Laptops Bought</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-3xl font-black text-emerald-400">₹4.8 Cr+</div>
          <div className="text-xs text-slate-400 mt-1">Directly Disbursed to Sellers</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-3xl font-black text-purple-400">19,450+</div>
          <div className="text-xs text-slate-400 mt-1">Indian Pincodes Serviceable</div>
        </div>
      </div>
    </div>
  );
}
