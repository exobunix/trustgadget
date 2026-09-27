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
  Phone,
  Mail,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
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

  const orderNum = order?.orderNumber || orderId;
  const verificationLink = `/track-order?q=${orderNum}`;
  const customerName = order?.customerName || 'Valued Customer';

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* Celebration Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 dark:bg-gradient-to-tr dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-emerald-200 dark:border-emerald-500/40 shadow-xl dark:shadow-2xl text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
          SELL ORDER PLACED SUCCESSFULLY
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
          Your Pickup Has Been Scheduled!
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto font-medium">
          Our verified partner representative will visit your address for doorstep verification and instant payout.
        </p>

        {/* Order Number Pill */}
        <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm shadow-sm">
          <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
          <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{orderNum}</span>
          <button
            onClick={handleCopyOrderNumber}
            className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Copy Order ID"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Confirmation Message Callout (Requirement 4) */}
      <div className="p-6 rounded-3xl bg-cyan-50/90 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/40 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Thanks {customerName}, Our team will contact you within 30 minutes.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To verify any visit, check our verification link:{' '}
              <Link href={verificationLink} className="text-cyan-700 dark:text-cyan-300 font-bold underline hover:text-cyan-600">
                trustmygadget.com/track-order?q={orderNum}
              </Link>{' '}
              or verify order number <strong className="font-mono text-slate-900 dark:text-white">{orderNum}</strong> directly with our support helpline at{' '}
              <a href="tel:+919113990217" className="text-cyan-700 dark:text-cyan-300 font-bold underline">
                +91 91139 90217
              </a>.
            </p>
          </div>
        </div>

        {/* SMS / Email Simulation Confirmation Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-[11px]">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950 border border-cyan-100 dark:border-cyan-900/60 flex items-center gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">
              SMS dispatched to <strong className="text-slate-800 dark:text-slate-200">+91 {order?.customerPhone}</strong>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950 border border-cyan-100 dark:border-cyan-900/60 flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400 truncate">
              Email sent to <strong className="text-slate-800 dark:text-slate-200">{order?.customerEmail}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Phone Selling Safety Note Callout (Requirement 5) */}
      <div className="p-6 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/40 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Important Note for Phone Selling: Personal Safety & Data Concern</span>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
          <strong>Trust Gadget requests you to clean your phone data before handing over the phone to our collection executive for your safety and concern.</strong> Please make sure to:
        </p>
        <ul className="text-xs text-amber-800/90 dark:text-amber-300/80 space-y-1 list-disc pl-5">
          <li>Sign out of Apple iCloud, Google Account, or Samsung Account.</li>
          <li>Back up any important personal contacts, photos, and chats.</li>
          <li>Remove screen lock PIN, biometric fingerprints, and facial recognition.</li>
          <li>Perform a complete factory reset to ensure zero personal data remains on the device.</li>
        </ul>
      </div>

      {/* Details Box */}
      {order && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Order & Pickup Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Device</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{order.modelName}</div>
              <div className="text-slate-500 dark:text-slate-400">{order.variantName}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Estimated Payout</span>
              <div className="text-base font-extrabold text-cyan-600 dark:text-cyan-300">
                ₹{order.estimatedPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">Via {order.payoutMethod}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Pickup Date & Window</span>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{order.pickupDate}</div>
              <div className="text-slate-500 dark:text-slate-400">{order.pickupTimeSlot}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium">Pickup Address</span>
              <div className="text-xs text-slate-900 dark:text-white font-medium line-clamp-2">
                {order.pickupAddress}, {order.pickupCity} - {order.pickupPincode}
              </div>
            </div>
          </div>

          {/* Next Steps Checklist */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> How to Prepare for Doorstep Pickup:
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span>Keep your phone charged with at least 30% battery for on-site diagnostic testing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span>Keep a valid Govt Photo ID (Aadhaar / Driving License) handy for ownership verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">•</span>
                <span>Keep original box, bill, and original charger ready if declared in the valuation questionnaire.</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link
              href={verificationLink}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Order & Verify Visit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="tel:+919113990217"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Helpline: +91 91139 90217</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
