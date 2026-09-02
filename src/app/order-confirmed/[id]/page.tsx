'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Truck,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Clock,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderConfirmedPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#00e599', '#4facfe', '#8b5cf6'],
      });
    } catch (e) {
      console.error(e);
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500 text-sm">Loading order confirmation...</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Celebration Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-2xl text-center neon-glow-emerald relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          SELL ORDER PLACED SUCCESSFULLY
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Your Pickup Has Been Scheduled!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
          Our logistics agent will visit your address for doorstep verification and instant payout.
        </p>

        {/* Order Number Pill */}
        <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm">
          <span className="text-slate-400">Order ID:</span>
          <span className="font-mono font-bold text-cyan-300">{order?.orderNumber || orderId}</span>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 text-slate-400 hover:text-white"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Details Box */}
      {order && (
        <div className="mt-8 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Order & Pickup Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Device</span>
              <div className="text-sm font-bold text-white">{order.modelName}</div>
              <div className="text-slate-400">{order.variantName}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Estimated Payout</span>
              <div className="text-base font-extrabold text-cyan-300">
                ₹{order.estimatedPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-emerald-400 text-[11px]">Via {order.payoutMethod}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Pickup Date & Window</span>
              <div className="text-xs font-bold text-white">{order.pickupDate}</div>
              <div className="text-slate-400">{order.pickupTimeSlot}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Pickup Address</span>
              <div className="text-xs text-white font-medium line-clamp-2">
                {order.pickupAddress}, {order.pickupCity} - {order.pickupPincode}
              </div>
            </div>
          </div>

          {/* Next Steps Checklist */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> How to Prepare for Pickup:
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Ensure your device has at least 30% battery for diagnostics.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Keep a valid Govt Photo ID (Aadhaar / Driving License) handy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Keep original box, invoice and charger ready (if declared).</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link
              href={`/track-order?q=${order.orderNumber}`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Order Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/account"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center"
            >
              View in Customer Portal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
