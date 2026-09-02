'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [ruleType, setRuleType] = useState('DEDUCTION');
  const [priorityLevel, setPriorityLevel] = useState('GLOBAL');
  const [adjustmentType, setAdjustmentType] = useState('FIXED');
  const [adjustmentValue, setAdjustmentValue] = useState('-2500');
  const [questionCode, setQuestionCode] = useState('');
  const [answerCode, setAnswerCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rules');
      const data = await res.json();
      if (data.success) {
        setRules(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || adjustmentValue === undefined) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ruleType,
          priorityLevel,
          adjustmentType,
          adjustmentValue: Number(adjustmentValue),
          questionCode: questionCode || null,
          answerCode: answerCode || null,
          adminName: 'Super Admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName('');
        fetchRules();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await fetch(`/api/admin/rules?id=${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Pricing Engine Hierarchy
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Deduction & Addition Rules
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage global and model-level pricing rules, priority overrides, and adjustment caps.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Valuation Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Rule Name</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Priority Level</th>
                <th className="py-3.5 px-4 font-semibold">Adjustment</th>
                <th className="py-3.5 px-4 font-semibold">Trigger Condition</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No custom pricing rules registered yet. Default answer matrix applies.
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{r.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.ruleType === 'ADDITION'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {r.ruleType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {r.priorityLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {r.adjustmentType === 'PERCENTAGE'
                        ? `${r.adjustmentValue}%`
                        : `₹${r.adjustmentValue.toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {r.questionCode ? `${r.questionCode} -> ${r.answerCode || '*'}` : 'Global Match'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateRule}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Valuation Rule</h3>
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
                <label className="block text-slate-300 font-semibold mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Drop Impact Frame Penalty"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rule Type</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="DEDUCTION">Deduction (-)</option>
                    <option value="ADDITION">Addition (+ Bonus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority Hierarchy</label>
                  <select
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="GLOBAL">Global (Lowest)</option>
                    <option value="CATEGORY">Category Level</option>
                    <option value="BRAND">Brand Level</option>
                    <option value="MODEL">Model Specific</option>
                    <option value="VARIANT">Variant Specific (Highest)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adjustment Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="FIXED">Fixed Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%) of Base</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adjustment Value</label>
                  <input
                    type="number"
                    required
                    placeholder="-2500 or 15"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
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
                {submitting ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
