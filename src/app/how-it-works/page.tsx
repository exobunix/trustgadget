'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  CheckCircle2,
  Zap,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Seamless Trade-in Experience
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          How TrustMyGadget Works
        </h1>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          We’ve re-engineered the old phone and laptop selling experience with algorithmic pricing, free doorstep pickup, and instant cashless payouts.
        </p>
      </div>

      {/* 4 Deep Steps */}
      <div className="space-y-10">
        {[
          {
            step: '01',
            title: 'Select Your Smartphone or Laptop Model',
            desc: 'Search from our comprehensive Indian catalog of over 2,000+ phones (Apple, Samsung, OnePlus, Xiaomi, Vivo) and laptops (MacBook, Dell, HP, Lenovo). Pick your exact memory and storage configuration.',
            icon: Smartphone,
            badge: 'STEP 1',
          },
          {
            step: '02',
            title: 'Answer Intuitive Diagnostic Questions',
            desc: 'Tell us about your device’s functional health: touch responsiveness, screen glass condition, battery backup, and whether you have the original retail box and tax invoice. Our questions adapt dynamically to your device.',
            icon: CheckCircle2,
            badge: 'STEP 2',
          },
          {
            step: '03',
            title: 'Receive an Algorithmic Guaranteed Quote',
            desc: 'Our rule engine computes real-time Indian secondary market indices to give you the highest fair price. Transparent deductions and bonuses are itemized line-by-line with zero hidden markdowns.',
            icon: Zap,
            badge: 'STEP 3',
          },
          {
            step: '04',
            title: 'Free Doorstep Verification & Instant Payment',
            desc: 'Our certified logistics executive visits your home at your scheduled date and time slot. They perform a 5-minute diagnostic verification, guide you through a DoD certified data wipe, and transfer payment to your UPI / Bank before leaving.',
            icon: Truck,
            badge: 'STEP 4',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col md:flex-row items-start gap-6 hover:border-cyan-500/40 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Icon className="w-8 h-8" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {item.badge}
                  </span>
                  <span className="text-2xl font-black text-slate-700">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="p-10 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-2xl text-center neon-glow-cyan">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to experience the fastest tech trade-in?</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto">
          Get an instant estimated price in under 60 seconds with no obligation.
        </p>
        <Link
          href="/sell"
          className="mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-all"
        >
          <span>Sell Your Device Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
