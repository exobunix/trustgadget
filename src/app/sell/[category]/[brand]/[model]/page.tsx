'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  RefreshCw,
  Smartphone,
  Laptop,
} from 'lucide-react';

export default function ModelValuationPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const brandSlug = params.brand as string;
  const modelSlug = params.model as string;
  const router = useRouter();

  const [model, setModel] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [step, setStep] = useState<'VARIANT' | 'QUESTIONS' | 'RESULT'>('VARIANT');
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const modRes = await fetch(`/api/catalog/model/${modelSlug}`);
        const modData = await modRes.json();
        if (modData.success) {
          setModel(modData.data);
          setVariants(modData.data.variants || []);
          if (modData.data.variants && modData.data.variants.length > 0) {
            setSelectedVariant(modData.data.variants[0]);
          }

          const qRes = await fetch(`/api/valuation/questions?categoryId=${modData.data.categoryId}&brandId=${modData.data.brandId}&modelId=${modData.data.id}`);
          const qData = await qRes.json();
          if (qData.success) {
            setQuestions(qData.data);
            const initial: Record<string, string> = {};
            qData.data.forEach((q: any) => {
              if (q.answers && q.answers.length > 0) {
                initial[q.code] = q.answers[0].code;
              }
            });
            setAnswers(initial);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [modelSlug]);

  const handleCalculate = async () => {
    if (!model) return;
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
          modelId: model.id,
          variantId: selectedVariant?.id || null,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setValuationResult(data.data);
        setStep('RESULT');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!valuationResult || !model) return;

    const checkoutData = {
      modelId: model.id,
      variantId: selectedVariant?.id || '',
      categoryName: model.categoryName || 'Device',
      brandName: model.brandName || '',
      modelName: model.name,
      variantName: selectedVariant?.name || 'Standard',
      deviceImageUrl: model.imageUrl || '',
      basePrice: valuationResult.basePrice,
      estimatedPrice: valuationResult.estimatedPrice,
      sessionToken: valuationResult.sessionToken || '',
      conditionSummary: answers,
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tmg_checkout_order', JSON.stringify(checkoutData));
      router.push('/checkout');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500 text-sm">Loading device diagnostics...</div>;
  }

  if (!model) {
    return (
      <div className="py-24 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold text-white">Device Not Found</h2>
        <p className="text-xs text-slate-400 mt-2">The requested model could not be found in our catalog.</p>
        <Link href="/sell" className="mt-4 inline-block px-4 py-2 bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link href={`/sell/${categorySlug}/${brandSlug}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to {brandSlug.toUpperCase()}
      </Link>

      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden p-2 shrink-0">
          {model.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <Smartphone className="w-10 h-10 text-slate-600" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
            {model.brandName} • {model.series || model.categoryName}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">{model.name}</h1>
          <p className="text-xs text-slate-400 mt-1">Get up to ₹{model.basePrice.toLocaleString('en-IN')} with instant doorstep payout.</p>
        </div>
      </div>

      {/* STEP 1: VARIANT SELECTION */}
      {step === 'VARIANT' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Select Your Exact Specification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-white">{v.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {v.storage && <span>Storage: {v.storage} • </span>}
                      {v.ram && <span>RAM: {v.ram}</span>}
                      {v.processor && <div>{v.processor}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Base Value</div>
                    <div className="text-base font-extrabold text-emerald-400">
                      ₹{v.basePrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep('QUESTIONS')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 flex items-center gap-2"
            >
              <span>Next: Condition Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: QUESTIONS */}
      {step === 'QUESTIONS' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button onClick={() => setStep('VARIANT')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Variant
            </button>
            <span className="text-xs text-cyan-400 font-semibold">{selectedVariant?.name}</span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{q.title}</h3>
                    {q.subtitle && <p className="text-xs text-slate-400 mt-0.5">{q.subtitle}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {q.answers.map((ans: any) => {
                    const isSelected = answers[q.code] === ans.code;
                    return (
                      <button
                        key={ans.id}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.code]: ans.code }))}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-950/40 ring-1 ring-cyan-500/30 text-white'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{ans.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                        </div>
                        {ans.description && <p className="text-[11px] text-slate-400 mt-1">{ans.description}</p>}
                        {ans.isRejection && (
                          <div className="mt-2 text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Device rejection policy</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleCalculate}
              disabled={calculating}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center gap-2"
            >
              {calculating ? (
                <span>Calculating Live Quote...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Get Instant Price Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RESULT SCREEN */}
      {step === 'RESULT' && valuationResult && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl text-center neon-glow-cyan">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
              GUARANTEED QUOTE
            </span>
            <h2 className="text-sm text-slate-400 mt-2">Your Estimated Selling Price</h2>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 my-2">
              ₹{valuationResult.estimatedPrice.toLocaleString('en-IN')}
            </div>

            {valuationResult.isRejected && (
              <div className="mt-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {valuationResult.rejectionReason}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleProceedToCheckout}
                disabled={valuationResult.isRejected}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/30"
              >
                Sell This Device →
              </button>
              <button
                onClick={() => setStep('QUESTIONS')}
                className="px-6 py-3.5 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Modify Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
