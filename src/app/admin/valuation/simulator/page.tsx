'use client';

import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Smartphone,
  Laptop,
  ArrowRight,
} from 'lucide-react';

export default function AdminValuationSimulatorPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  // 1. Load Categories
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/catalog/categories');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCategories(data.data);
        setSelectedCategory(data.data[0]);
      }
    }
    load();
  }, []);

  // 2. Load Brands when Category changes
  useEffect(() => {
    if (!selectedCategory) return;
    async function loadBrands() {
      const res = await fetch(`/api/catalog/brands?categoryId=${selectedCategory.id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setBrands(data.data);
        setSelectedBrand(data.data[0]);
      }
    }
    loadBrands();
  }, [selectedCategory]);

  // 3. Load Models when Brand changes
  useEffect(() => {
    if (!selectedBrand) return;
    async function loadModels() {
      const res = await fetch(`/api/catalog/models?brandId=${selectedBrand.id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setModels(data.data);
        setSelectedModel(data.data[0]);
      } else {
        setModels([]);
        setSelectedModel(null);
      }
    }
    loadModels();
  }, [selectedBrand]);

  // 4. Load Model Details (Variants & Questions)
  useEffect(() => {
    if (!selectedModel || !selectedCategory) return;
    async function loadModelDetails() {
      const [modRes, qRes] = await Promise.all([
        fetch(`/api/catalog/model/${selectedModel.id}`),
        fetch(`/api/valuation/questions?categoryId=${selectedCategory.id}&brandId=${selectedBrand?.id}&modelId=${selectedModel.id}`),
      ]);
      const modData = await modRes.json();
      const qData = await qRes.json();

      if (modData.success && modData.data.variants) {
        setVariants(modData.data.variants);
        setSelectedVariant(modData.data.variants[0] || null);
      }
      if (qData.success) {
        setQuestions(qData.data);
        const initialAnswers: Record<string, string> = {};
        qData.data.forEach((q: any) => {
          if (q.answers && q.answers.length > 0) {
            initialAnswers[q.code] = q.answers[0].code;
          }
        });
        setAnswers(initialAnswers);
      }
    }
    loadModelDetails();
  }, [selectedModel, selectedCategory, selectedBrand]);

  const runSimulation = async () => {
    if (!selectedModel) return;
    setCalculating(true);
    try {
      const answersPayload = Object.entries(answers).map(([questionCode, answerCode]) => ({
        questionCode,
        answerCode,
      }));

      const res = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: selectedModel.id,
          variantId: selectedVariant?.id || null,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  // Auto-run simulation on answer / variant changes
  useEffect(() => {
    if (selectedModel && questions.length > 0) {
      runSimulation();
    }
  }, [selectedModel, selectedVariant, answers]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Pricing Engine Sandbox
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Admin Valuation Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate real-time valuation logic, test hierarchical deductions/bonuses, and audit line-by-line calculations.
          </p>
        </div>

        <button
          onClick={runSimulation}
          className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
          <span>Rerun Engine</span>
        </button>
      </div>

      {/* Selector Toolbar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Category */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">1. Category</label>
          <select
            value={selectedCategory?.id || ''}
            onChange={(e) => {
              const cat = categories.find((c) => c.id === e.target.value);
              setSelectedCategory(cat);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">2. Manufacturer Brand</label>
          <select
            value={selectedBrand?.id || ''}
            onChange={(e) => {
              const b = brands.find((brand) => brand.id === e.target.value);
              setSelectedBrand(b);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">3. Device Model</label>
          <select
            value={selectedModel?.id || ''}
            onChange={(e) => {
              const m = models.find((mod) => mod.id === e.target.value);
              setSelectedModel(m);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Variant */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">4. Variant / Storage</label>
          <select
            value={selectedVariant?.id || ''}
            onChange={(e) => {
              const v = variants.find((vr) => vr.id === e.target.value);
              setSelectedVariant(v);
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} (Base ₹{v.basePrice.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Simulation Arena: Left Questions, Right Live Execution Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Condition Toggles (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Diagnostic Answers Simulator ({questions.length} questions)
            </h3>
            <span className="text-[11px] text-cyan-400">Click choices to watch price mutate live</span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 glass-panel space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{q.title}</h4>
                    {q.subtitle && <p className="text-[11px] text-slate-400">{q.subtitle}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.answers.map((ans: any) => {
                    const isSelected = answers[q.code] === ans.code;
                    return (
                      <button
                        key={ans.id}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.code]: ans.code }))}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-500/40 font-semibold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px]">{ans.label}</span>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              ans.adjustmentValue > 0
                                ? 'text-emerald-400'
                                : ans.adjustmentValue < 0
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {ans.adjustmentValue > 0 ? `+${ans.adjustmentValue}` : ans.adjustmentValue < 0 ? `${ans.adjustmentValue}` : '₹0'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Engine Calculation Breakdown & Audit Log (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          {simulationResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl glass-panel space-y-6 neon-glow-cyan">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                  SIMULATED PAYOUT VALUE
                </span>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 mt-2">
                  ₹{simulationResult.estimatedPrice.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Base Price: ₹{simulationResult.basePrice.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Adjustments Summary Table */}
              <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Itemized Adjustments:
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {simulationResult.adjustments.map((adj: any, i: number) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-800/60 text-[11px]">
                      <span className="text-slate-300 truncate max-w-[65%]">
                        {adj.questionTitle.split('?')[0]}: <span className="text-slate-400">{adj.answerLabel}</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          adj.calculatedAmount > 0
                            ? 'text-emerald-400'
                            : adj.calculatedAmount < 0
                            ? 'text-rose-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {adj.calculatedAmount > 0 ? `+₹${adj.calculatedAmount}` : adj.calculatedAmount < 0 ? `-₹${Math.abs(adj.calculatedAmount)}` : '₹0'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between font-bold text-white text-xs border-t border-slate-700">
                  <span>Net Deductions</span>
                  <span className="text-rose-400">-₹{simulationResult.totalDeductions.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-xs">
                  <span>Net Bonuses</span>
                  <span className="text-emerald-400">+₹{simulationResult.totalAdditions.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Engine Audit Trail Log */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                  Engine Evaluation Trace:
                </div>
                <div className="space-y-1 text-[10px] font-mono text-slate-400 max-h-36 overflow-y-auto">
                  {simulationResult.ruleAuditLog.map((log: string, idx: number) => (
                    <div key={idx} className="leading-tight">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
