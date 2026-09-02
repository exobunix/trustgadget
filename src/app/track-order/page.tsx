'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Zap,
} from 'lucide-react';

const ORDER_STAGES = [
  { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Sell request registered online' },
  { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', desc: 'Logistics agent assigned' },
  { key: 'COLLECTED', label: 'Device Collected', desc: 'Agent inspected and collected' },
  { key: 'IN_VERIFICATION', label: 'Physical Verification', desc: 'Hardware & component diagnostics' },
  { key: 'PRICE_CONFIRMED', label: 'Price Confirmed', desc: 'Final valuation validated' },
  { key: 'PAYMENT_COMPLETED', label: 'Payment Completed', desc: 'Funds transferred to account' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setOrder(null);
        setErrorMsg(data.error || 'No order found with this Order ID or Phone Number');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error tracking order.');
    } finally {
      setLoading(false);
    }
  };

  const getStageIndex = (status: string) => {
    if (status === 'CANCELLED') return -1;
    const idx = ORDER_STAGES.findIndex((s) => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentStageIdx = order ? getStageIndex(order.status) : 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
          Live Order Status
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1">
          Track Your Sell Order
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Enter your Order ID (e.g. TMG-849201) or registered 10-digit mobile number.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="mt-6 flex items-center gap-2 max-w-md mx-auto"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Order ID or Mobile Number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Tracking Dashboard Result */}
      {order && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Order Overview Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  {order.categoryName} Resale
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {order.modelName} ({order.variantName})
                </h2>
                <p className="text-xs text-slate-400">
                  Order ID: <span className="font-mono text-cyan-300 font-bold">{order.orderNumber}</span> • Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">
                  {order.finalVerifiedPrice ? 'Confirmed Payout' : 'Estimated Payout'}
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  ₹{(order.finalVerifiedPrice || order.estimatedPrice).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-semibold text-slate-400">
                  Payout Status:{' '}
                  <span className={order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* 6-STAGE TIMELINE TRACKER */}
            {order.status === 'CANCELLED' ? (
              <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <h3 className="text-base font-bold text-rose-200">Order Cancelled</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {order.cancellationReason || 'This pickup order was cancelled by the customer or logistics supervisor.'}
                </p>
              </div>
            ) : (
              <div className="py-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                  Live Stage Pipeline
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {ORDER_STAGES.map((st, idx) => {
                    const isPassed = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div
                        key={st.key}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                          isCurrent
                            ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/50'
                            : isPassed
                            ? 'border-emerald-500/50 bg-emerald-950/20 text-slate-300'
                            : 'border-slate-800 bg-slate-950/40 text-slate-600 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs font-bold ${
                            isCurrent
                              ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/20'
                              : isPassed
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : isPassed ? 'text-white' : 'text-slate-500'}`}>
                          {st.label}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                          {st.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup & Agent Details */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" /> Pickup & Logistics Info
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Scheduled Date</span>
                  <span className="font-semibold text-white">{order.pickupDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Time Slot</span>
                  <span className="font-semibold text-white">{order.pickupTimeSlot}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Assigned Agent</span>
                  <span className="font-semibold text-cyan-400">
                    {order.assignedAgent || 'Assigning field executive...'}
                  </span>
                </div>
                <div className="py-1.5">
                  <span className="text-slate-400 block mb-1">Pickup Address</span>
                  <span className="font-medium text-slate-200">
                    {order.pickupAddress}, {order.pickupCity} - {order.pickupPincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Payout Information */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Payout Disbursement
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Payout Method</span>
                  <span className="font-semibold text-white">{order.payoutMethod}</span>
                </div>
                {order.payoutMethod === 'UPI' ? (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Target UPI ID</span>
                    <span className="font-mono font-semibold text-cyan-300">{order.payoutUpiId}</span>
                  </div>
                ) : (
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-400">Bank Account</span>
                    <span className="font-mono font-semibold text-cyan-300">{order.payoutBankAccount} ({order.payoutBankIfsc})</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Payment Status</span>
                  <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.verificationNotes && (
                  <div className="py-1.5">
                    <span className="text-slate-400 block mb-1">Inspection Notes</span>
                    <span className="text-slate-300 italic text-[11px] bg-slate-950 p-2 rounded-lg block border border-slate-800">
                      "{order.verificationNotes}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading tracking system...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
