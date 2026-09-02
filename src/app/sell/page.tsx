'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Gamepad2,
  Headphones,
  Camera,
  Tv,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Info,
  Sparkles,
  HelpCircle,
  Truck,
  Check,
  X,
  Tag,
  Phone,
  Star,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

interface Brand {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  logoUrl?: string;
  isPopular: boolean;
}

interface Model {
  id: string;
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  series?: string;
  imageUrl?: string;
  releaseYear: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
}

interface Variant {
  id: string;
  modelId: string;
  name: string;
  slug: string;
  ram?: string;
  storage?: string;
  processor?: string;
  gpu?: string;
  basePrice: number;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  questionType: string;
  answers: {
    id: string;
    code: string;
    label: string;
    description?: string;
    adjustmentType: string;
    adjustmentValue: number;
    isRejection?: number;
  }[];
}

const STEP_NAMES = [
  { step: 1, name: 'Category' },
  { step: 2, name: 'Brand' },
  { step: 3, name: 'Model' },
  { step: 4, name: 'Variant' },
  { step: 5, name: 'Condition' },
  { step: 6, name: 'Get Quote' },
];

function SellPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Catalog Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [modelSearch, setModelSearch] = useState('');

  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Diagnostic Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Valuation Result
  const [valuationResult, setValuationResult] = useState<any>(null);

  // 1. Initial Load Categories
  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        const res = await fetch('/api/catalog/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
          // Check URL param category
          const catParam = searchParams.get('category');
          if (catParam) {
            const matchedCat = data.data.find((c: Category) => c.slug === catParam);
            if (matchedCat) {
              setSelectedCategory(matchedCat);
              setCurrentStep(2);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [searchParams]);

  // 2. Fetch Brands when category selected
  useEffect(() => {
    if (!selectedCategory) return;
    const catId = selectedCategory.id;
    async function loadBrands(id: string) {
      setLoading(true);
      try {
        const res = await fetch(`/api/catalog/brands?categoryId=${id}`);
        const data = await res.json();
        if (data.success) {
          setBrands(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBrands(catId);
  }, [selectedCategory]);

  // 3. Fetch Models when brand selected
  useEffect(() => {
    if (!selectedBrand) return;
    const bId = selectedBrand.id;
    async function loadModels(id: string) {
      setLoading(true);
      try {
        const res = await fetch(`/api/catalog/models?brandId=${id}`);
        const data = await res.json();
        if (data.success) {
          setModels(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadModels(bId);
  }, [selectedBrand]);

  // 4. Fetch Model Variants & Questions when model selected
  useEffect(() => {
    if (!selectedModel || !selectedCategory) return;
    const mId = selectedModel.id;
    const cId = selectedCategory.id;
    const bId = selectedBrand?.id || '';

    async function loadModelDetails(targetModelId: string, targetCatId: string, targetBrandId: string) {
      setLoading(true);
      try {
        const [modRes, qRes] = await Promise.all([
          fetch(`/api/catalog/model/${targetModelId}`),
          fetch(`/api/valuation/questions?categoryId=${targetCatId}&brandId=${targetBrandId}&modelId=${targetModelId}`),
        ]);
        const modData = await modRes.json();
        const qData = await qRes.json();

        if (modData.success && modData.data.variants) {
          setVariants(modData.data.variants);
          if (modData.data.variants.length > 0) {
            setSelectedVariant(modData.data.variants[0]);
          }
        }
        if (qData.success) {
          setQuestions(qData.data);
          // Set first answer as default for every question
          const initialAnswers: Record<string, string> = {};
          qData.data.forEach((q: Question) => {
            if (q.answers && q.answers.length > 0) {
              initialAnswers[q.code] = q.answers[0].code;
            }
          });
          setAnswers(initialAnswers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadModelDetails(mId, cId, bId);
  }, [selectedModel, selectedCategory, selectedBrand]);

  // Calculate Valuation Engine
  useEffect(() => {
    if (!selectedModel) {
      setValuationResult(null);
      return;
    }

    const answersPayload = Object.entries(answers).map(([questionCode, answerCode]) => ({
      questionCode,
      answerCode,
    }));

    async function calculate() {
      try {
        const res = await fetch('/api/valuation/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId: selectedModel?.id,
            variantId: selectedVariant?.id || null,
            answers: answersPayload,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setValuationResult(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    }

    calculate();
  }, [selectedModel, selectedVariant, answers]);

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          deviceValue: valuationResult?.estimatedPrice || selectedModel?.basePrice || 20000,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data);
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError('Error applying coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Proceed to Checkout
  const handleProceedCheckout = () => {
    if (!selectedModel) return;
    const finalPrice = (valuationResult?.estimatedPrice || selectedModel.basePrice) + (appliedCoupon?.bonusAmount || 0);

    const tradeInState = {
      categoryId: selectedCategory?.id,
      categoryName: selectedCategory?.name,
      brandName: selectedBrand?.name,
      modelName: selectedModel.name,
      variantName: selectedVariant?.name || 'Standard',
      deviceImageUrl: selectedModel.imageUrl,
      basePrice: valuationResult?.basePrice || selectedModel.basePrice,
      estimatedPrice: finalPrice,
      couponBonus: appliedCoupon?.bonusAmount || 0,
      couponCode: appliedCoupon?.code || '',
      answers,
      conditionSummary: answers,
    };

    localStorage.setItem('tmg_current_tradein', JSON.stringify(tradeInState));
    router.push('/checkout');
  };

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    (m.series && m.series.toLowerCase().includes(modelSearch.toLowerCase()))
  );

  const finalEstimatedPayout = (valuationResult?.estimatedPrice || selectedModel?.basePrice || 0) + (appliedCoupon?.bonusAmount || 0);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top 6-Step Tracker (Screenshots 4 & 5 Match) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 glass-panel">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {STEP_NAMES.map((st) => {
            const isPassed = currentStep > st.step;
            const isCurrent = currentStep === st.step;

            return (
              <div key={st.step} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (st.step < currentStep) setCurrentStep(st.step);
                  }}
                  disabled={st.step > currentStep}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : isPassed
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-pointer'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent ? 'bg-slate-950 text-emerald-400' : isPassed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isPassed ? '✓' : st.step}
                  </span>
                  <span>{st.name}</span>
                </button>
                {st.step < 6 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Selling Interface (Screenshots 4 & 5 Match) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Interactive Step Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: CATEGORY SELECTION */}
          {currentStep === 1 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Step 1 of 5
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  What are you selling?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select the category of your device to begin valuation.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentStep(2);
                    }}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all flex flex-col items-center justify-between text-center group space-y-3"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                      {cat.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Smartphone className="w-8 h-8 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Top Brands</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: BRAND SELECTION */}
          {currentStep === 2 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Step 2 of 5
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Select {selectedCategory?.name} Brand
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose the manufacturer brand of your {selectedCategory?.name?.toLowerCase()}.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrand(b);
                      setCurrentStep(3);
                    }}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex flex-col items-center justify-center text-center space-y-2 group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 overflow-hidden group-hover:scale-105 transition-transform">
                      {b.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="font-bold text-base text-cyan-400">{b.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                      {b.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: MODEL SELECTION */}
          {currentStep === 3 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Step 3 of 5
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Select {selectedBrand?.name} Model
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Search or select your exact device model from the catalog.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search model name (e.g. iPhone 16 Pro, S24 Ultra)..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
                {filteredModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m);
                      setCurrentStep(4);
                    }}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center gap-3.5 text-left group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      {m.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{m.series || selectedBrand?.name}</div>
                      <div className="text-xs font-extrabold text-emerald-400 font-mono mt-1">
                        Up to ₹{m.basePrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: VARIANT SELECTION */}
          {currentStep === 4 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Step 4 of 5
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Select Storage & RAM Variant
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pick your device’s exact storage capacity.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/40 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-bold">{v.name}</div>
                      <div className="text-xs font-mono text-emerald-400 font-extrabold mt-1">
                        Base ₹{v.basePrice.toLocaleString('en-IN')}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <span>Continue to Condition Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: DIAGNOSTIC QUESTIONS (Screenshot 5 Match) */}
          {currentStep === 5 && questions.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 glass-panel space-y-6 animate-fadeIn">
              {/* Question Navigation Top Bar */}
              <div className="flex items-center justify-between pb-2">
                <button
                  onClick={() => {
                    if (currentQuestionIdx > 0) {
                      setCurrentQuestionIdx(currentQuestionIdx - 1);
                    } else {
                      setCurrentStep(4);
                    }
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Model
                </button>

                <span className="text-xs font-bold text-emerald-400 font-mono">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
              </div>

              {/* Progress Step Pills (Screenshot 5 Match: ✓ 1 ✓ 2 ✓ 3 4 5...) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.code];
                  const isCurrent = idx === currentQuestionIdx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/40'
                          : isAnswered
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-950 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {isAnswered && !isCurrent ? '✓' : idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Content */}
              {(() => {
                const currentQ = questions[currentQuestionIdx];
                if (!currentQ) return null;

                return (
                  <div className="space-y-4 pt-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-white">{currentQ.title}</h3>
                      {currentQ.subtitle && (
                        <p className="text-xs text-slate-400 mt-1">{currentQ.subtitle}</p>
                      )}
                    </div>

                    {/* Answer Option Cards Grid (Screenshot 5 Match) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                      {currentQ.answers.map((ans) => {
                        const isSelected = answers[currentQ.code] === ans.code;
                        const isNegative = ans.adjustmentValue < 0;
                        const isPositive = ans.adjustmentValue > 0;

                        return (
                          <button
                            key={ans.id}
                            type="button"
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [currentQ.code]: ans.code }));
                              if (currentQuestionIdx < questions.length - 1) {
                                setCurrentQuestionIdx(currentQuestionIdx + 1);
                              }
                            }}
                            className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-2 group ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                                isNegative
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              }`}
                            >
                              {isNegative ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                            </div>

                            <div className="text-xs font-bold text-white">{ans.label}</div>
                            {ans.description && (
                              <div className="text-[11px] text-slate-400 leading-tight">
                                {ans.description}
                              </div>
                            )}

                            <div
                              className={`text-xs font-mono font-extrabold ${
                                isNegative ? 'text-rose-400' : isPositive ? 'text-emerald-400' : 'text-slate-500'
                              }`}
                            >
                              {ans.adjustmentValue > 0 ? `+₹${ans.adjustmentValue}` : ans.adjustmentValue < 0 ? `-₹${Math.abs(ans.adjustmentValue)}` : '₹0'}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Question Bottom Action Navigation */}
                    <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentQuestionIdx > 0) setCurrentQuestionIdx(currentQuestionIdx - 1);
                        }}
                        disabled={currentQuestionIdx === 0}
                        className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        Previous
                      </button>

                      {currentQuestionIdx < questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                        >
                          Next Question →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleProceedCheckout}
                          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20"
                        >
                          Proceed to Checkout →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY "YOUR QUOTE SUMMARY" CARD (Screenshots 4 & 5 Match) */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl glass-panel space-y-6">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
              Your Quote Summary
            </h3>

            {selectedModel ? (
              <div className="space-y-4">
                {/* Device Card Header */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {selectedModel.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedModel.imageUrl} alt={selectedModel.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Smartphone className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{selectedModel.name}</h4>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      {selectedVariant?.name || 'Standard'} • {selectedCategory?.name}
                    </div>
                  </div>
                </div>

                {/* Base Market Price */}
                <div className="flex justify-between items-center text-xs py-1 border-b border-slate-800 text-slate-400">
                  <span>Base Market Price</span>
                  <span className="font-mono font-bold text-white">
                    ₹{(valuationResult?.basePrice || selectedModel.basePrice).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Real-time Line-by-Line Adjustments (Screenshot 5 Match) */}
                {valuationResult?.adjustments && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                    {valuationResult.adjustments.map((adj: any, i: number) => {
                      const isNeg = adj.calculatedAmount < 0;
                      const isPos = adj.calculatedAmount > 0;
                      if (adj.calculatedAmount === 0) return null;

                      return (
                        <div key={i} className="flex justify-between items-start py-0.5">
                          <span className={`text-[11px] flex items-center gap-1.5 ${isNeg ? 'text-rose-300' : 'text-emerald-300'}`}>
                            {isNeg ? <X className="w-3 h-3 text-rose-400 shrink-0" /> : <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                            <span className="truncate max-w-[210px]">{adj.answerLabel}</span>
                          </span>
                          <span className={`font-mono font-bold text-[11px] ${isNeg ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isPos ? `+₹${adj.calculatedAmount}` : `-₹${Math.abs(adj.calculatedAmount)}`}
                          </span>
                        </div>
                      );
                    })}

                    {appliedCoupon && (
                      <div className="flex justify-between items-center py-1 text-emerald-400 font-bold border-t border-slate-800">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Coupon: {appliedCoupon.code}
                        </span>
                        <span>+₹{appliedCoupon.bonusAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Promo Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="pt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter Coupon (e.g. EXTRA1000)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <div className="text-[11px] text-rose-400 font-medium">{couponError}</div>
                )}

                {/* Final "You Get" Banner (Screenshot 5 Match) */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase">You Get</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    ₹{finalEstimatedPayout.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* No Hidden Charges Badge */}
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No hidden charges. What you see is what you get!</span>
                </div>

                {/* Proceed to Book Pickup Action */}
                <button
                  onClick={handleProceedCheckout}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Book Doorstep Pickup</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <Smartphone className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="text-sm font-bold text-white">No device selected yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Select your device brand and model on the left to see the instant quote summary here.
                </p>
              </div>
            )}

            {/* Trustpilot & Direct Help Footer (Screenshots 4 & 5 Match) */}
            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-white text-[11px]">4.8/5 · Trusted by 10,00,000+ users</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[11px]">Need Help?</div>
                  <div className="text-[10px] text-slate-400">Our support team is here for you</div>
                </div>
                <a
                  href="tel:18002098899"
                  className="text-emerald-400 font-mono font-bold text-xs flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" /> 1800 209 8899
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading valuation wizard...</div>}>
      <SellPageContent />
    </Suspense>
  );
}
