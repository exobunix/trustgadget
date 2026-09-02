'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ShieldCheck,
  Smartphone,
  CreditCard,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

function VerificationStudioContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [verifiedPrice, setVerifiedPrice] = useState<number>(0);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('Kiran Patel (Field Inspector)');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/orders?limit=50');
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
          if (initialOrderId) {
            const match = data.data.find((o: any) => o.id === initialOrderId || o.orderNumber === initialOrderId);
            if (match) loadOrderDetails(match);
          } else if (data.data.length > 0) {
            loadOrderDetails(data.data[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialOrderId]);

  const loadOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setVerifiedPrice(order.finalVerifiedPrice || order.estimatedPrice);
    setVerificationNotes(order.verificationNotes || 'Device hardware, screen, and battery health verified.');
    setSavedSuccess(false);
  };

  const handleSaveVerification = async (finalizePayout: boolean = false) => {
    if (!selectedOrder) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalVerifiedPrice: Number(verifiedPrice),
          status: finalizePayout ? 'PAYMENT_COMPLETED' : 'IN_VERIFICATION',
          paymentStatus: finalizePayout ? 'PAID' : 'PROCESSING',
          verificationNotes,
          adminName: verifiedBy,
          assignedAgent: verifiedBy,
          declaredCondition: selectedOrder.conditionSummary,
          verifiedCondition: { verifiedNotes: verificationNotes, verifiedPrice: Number(verifiedPrice) },
          priceDelta: Number(verifiedPrice) - Number(selectedOrder.estimatedPrice),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setSelectedOrder((prev: any) => ({
          ...prev,
          finalVerifiedPrice: Number(verifiedPrice),
          status: finalizePayout ? 'PAYMENT_COMPLETED' : 'IN_VERIFICATION',
          paymentStatus: finalizePayout ? 'PAID' : 'PROCESSING',
          verificationNotes,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
          Doorstep Hardware Diagnostics
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
          Physical Verification Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compare customer declared answers with field test reports and confirm final payout disbursement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Orders Picker Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 glass-panel space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Select Order to Verify
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  onClick={() => loadOrderDetails(ord)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/40 shadow-sm shadow-purple-500/20 ring-1 ring-purple-500/40'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-300">{ord.orderNumber}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      ord.status === 'PAYMENT_COMPLETED' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">{ord.customerName}</div>
                  <div className="text-[11px] text-slate-400">{ord.modelName}</div>
                  <div className="text-xs font-extrabold text-emerald-400 mt-1">
                    ₹{ord.estimatedPrice.toLocaleString('en-IN')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Verification Studio Workstation (8 cols) */}
        {selectedOrder ? (
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  Inspecting Device
                </span>
                <h2 className="text-xl font-black text-white">{selectedOrder.modelName}</h2>
                <p className="text-xs text-slate-400">
                  {selectedOrder.variantName} • Customer: {selectedOrder.customerName} (+91 {selectedOrder.customerPhone})
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">Original Estimated Quote</div>
                <div className="text-xl font-bold text-slate-300">
                  ₹{selectedOrder.basePrice?.toLocaleString('en-IN') || selectedOrder.estimatedPrice?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Side by Side Declared vs Verified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer Declared Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Customer Declared Answers
                </h3>
                <div className="space-y-2 text-slate-300">
                  {selectedOrder.conditionSummary ? (
                    typeof selectedOrder.conditionSummary === 'string' ? (
                      <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">{selectedOrder.conditionSummary}</pre>
                    ) : (
                      Object.entries(selectedOrder.conditionSummary).map(([k, v]) => (
                        <div key={k} className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">{k.replace('PHONE_', '').replace('LAPTOP_', '')}</span>
                          <span className="font-semibold text-white">{String(v)}</span>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="text-slate-500 italic">No declared diagnostic summary stored.</div>
                  )}
                </div>
              </div>

              {/* Verified Inspection Panel */}
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Field Diagnostics & Final Valuation
                </h3>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Final Verified Price (₹) *</label>
                  <input
                    type="number"
                    value={verifiedPrice}
                    onChange={(e) => setVerifiedPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-purple-500/40 text-emerald-400 font-extrabold text-base focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Verification Agent / Inspector</label>
                  <input
                    type="text"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Inspection Notes & Findings</label>
                  <textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="e.g. Minor scratch on bezel, battery health 92%, all cameras passed."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-bold text-white">Target Payout: {selectedOrder.payoutMethod}</div>
                  <div className="text-slate-400 font-mono">
                    {selectedOrder.payoutMethod === 'UPI' ? selectedOrder.payoutUpiId : `${selectedOrder.payoutBankAccount} (${selectedOrder.payoutBankIfsc})`}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                selectedOrder.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
              }`}>
                {selectedOrder.paymentStatus}
              </span>
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verification record updated successfully.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleSaveVerification(false)}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Save Inspection Record Only
              </button>

              <button
                onClick={() => handleSaveVerification(true)}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Approve & Complete Doorstep Payout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-500">
            Select an order from the left list to begin inspection.
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading verification studio...</div>}>
      <VerificationStudioContent />
    </Suspense>
  );
}
