'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, DollarSign, Calendar, RefreshCw } from 'lucide-react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('FIXED');
  const [discountValue, setDiscountValue] = useState('1000');
  const [minDeviceValue, setMinDeviceValue] = useState('15000');
  const [maxBonus, setMaxBonus] = useState('2000');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          title,
          description,
          discountType,
          discountValue: Number(discountValue),
          minDeviceValue: Number(minDeviceValue),
          maxBonus: Number(maxBonus),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setCode('');
        setTitle('');
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Marketing & Growth
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Coupons & Exchange Bonuses
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create promotional coupon codes to give customers extra cash bonuses during device trade-in checkout.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                <Tag className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div>
              <div className="font-mono text-lg font-black text-cyan-300 tracking-wider">
                {c.code}
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Bonus Cash:</span>
                <span className="font-bold text-emerald-400">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Bonus` : `+₹${c.discountValue.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Min Device Value:</span>
                <span className="font-semibold text-slate-300">₹{c.minDeviceValue?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCoupon}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Promo Coupon</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Code (Promo Code) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXTRA1000 or FESTIVE500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹1,000 Special Exchange Bonus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bonus Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="FIXED">Flat Cash Bonus (₹)</option>
                    <option value="PERCENTAGE">Percentage Bonus (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bonus Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Device Value (₹)</label>
                  <input
                    type="number"
                    value={minDeviceValue}
                    onChange={(e) => setMinDeviceValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={maxBonus}
                    onChange={(e) => setMaxBonus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Applicable on flagship smartphone upgrades"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Publish Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
