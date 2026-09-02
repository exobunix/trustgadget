'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Truck,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function WhyUsPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          The TrustMyGadget Edge
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">
          Why TrustMyGadget?
        </h1>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          Designed from the ground up to eliminate unfair bargaining, risky data wipes, and tedious offline market negotiations.
        </p>
      </div>

      {/* 6 Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Algorithmic Pricing',
            desc: 'Real-time secondary market indexing ensures you receive the maximum cash value without arbitrary retail cuts.',
            icon: TrendingUp,
            color: 'text-cyan-400',
          },
          {
            title: '100% Free Doorstep Pickup',
            desc: 'Serving 19,000+ Indian pincodes. Our verified field team comes to your residence or workplace on your schedule.',
            icon: Truck,
            color: 'text-emerald-400',
          },
          {
            title: 'Certified DoD Data Wipe',
            desc: 'We sanitize SSDs, eMMCs, and flash chips to Department of Defense DoD 5220.22-M standards in front of your eyes.',
            icon: Lock,
            color: 'text-purple-400',
          },
          {
            title: 'Instant Cashless Payment',
            desc: 'Payment hit directly via UPI (Google Pay, PhonePe) or IMPS bank transfer before the agent leaves your premises.',
            icon: Zap,
            color: 'text-amber-400',
          },
          {
            title: 'Zero Pressure Guarantee',
            desc: 'If after physical inspection you change your mind for any reason, cancellation is 100% free with no penalties.',
            icon: ShieldCheck,
            color: 'text-blue-400',
          },
          {
            title: 'Circular Tech Economy',
            desc: 'Every phone and laptop bought is certified, refurbished, or safely recycled, reducing e-waste footprint in India.',
            icon: CheckCircle2,
            color: 'text-teal-400',
          },
        ].map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3 hover:border-slate-700 transition-all"
            >
              <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 w-fit ${pillar.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">{pillar.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison Matrix Table */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-6">
        <h3 className="text-xl font-bold text-white text-center">
          How We Compare Against Alternatives
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Features</th>
                <th className="py-3 px-4 font-bold text-cyan-400">TrustMyGadget</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Offline Second-Hand Stores</th>
                <th className="py-3 px-4 font-semibold text-slate-500">Peer-to-Peer Classifieds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Price Transparency</td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Algorithmic Quote</td>
                <td className="py-3.5 px-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Heavy Bargaining</td>
                <td className="py-3.5 px-4 text-amber-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Endless Lowballers</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Doorstep Service</td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 100% Free Doorstep</td>
                <td className="py-3.5 px-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Must Travel</td>
                <td className="py-3.5 px-4 text-amber-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Stranger Home Visits</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Data Security</td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> DoD Certified Erase</td>
                <td className="py-3.5 px-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Basic Factory Reset</td>
                <td className="py-3.5 px-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> High Data Leak Risk</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-white">Payout Speed</td>
                <td className="py-3.5 px-4 text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Instant UPI / IMPS</td>
                <td className="py-3.5 px-4 text-amber-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Often Cheques</td>
                <td className="py-3.5 px-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Payment Scams Risk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
