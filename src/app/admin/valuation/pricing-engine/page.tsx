'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Check,
  X,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Save,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Sliders,
  Smartphone,
  Laptop,
  Layers,
  Percent,
} from 'lucide-react';
import { playNotificationSound } from '@/lib/notifications';

export default function AdminPricingEnginePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | 'cat_smartphone' | 'cat_laptop'>('ALL');

  // New Question Modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('cat_smartphone');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/questions');
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Update question top-level fields
  const handleUpdateQuestionField = (qIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  // Update answer fields
  const handleUpdateAnswerField = (qIndex: number, ansIndex: number, field: string, value: any) => {
    const updated = [...questions];
    updated[qIndex].answers[ansIndex][field] = value;
    setQuestions(updated);
  };

  const handleSaveQuestion = async (q: any) => {
    setSavingId(q.id);
    setSaveSuccessId(null);
    try {
      // 1. Update question metadata (title, subtitle, categoryId)
      await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: q.id,
          title: q.title,
          subtitle: q.subtitle,
          categoryId: q.categoryId || null,
          code: q.code,
          isActive: q.isActive,
          adminName: 'Super Admin',
        }),
      });

      // 2. Save all answers for this question
      for (const ans of q.answers) {
        await fetch(`/api/admin/questions/answer`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answerId: ans.id,
            questionId: q.id,
            adjustmentValue: Number(ans.adjustmentValue) || 0,
            adjustmentType: ans.adjustmentType || 'FIXED',
            label: ans.label,
            description: ans.description,
            code: ans.code,
          }),
        });
      }

      playNotificationSound('status');
      setSaveSuccessId(q.id);
      setTimeout(() => setSaveSuccessId(null), 3000);
      await fetchQuestions();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const handleAddAnswerOption = (qIndex: number) => {
    const updated = [...questions];
    const targetQ = updated[qIndex];
    const newAns = {
      id: `ans_temp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      questionId: targetQ.id,
      code: `OPT_${Date.now().toString().slice(-4)}`,
      label: 'New Condition Option',
      description: 'Customer condition description',
      adjustmentType: 'FIXED',
      adjustmentValue: 0,
      isRejection: 0,
    };
    targetQ.answers.push(newAns);
    setQuestions(updated);
  };

  const handleDeleteAnswer = async (qIndex: number, ansIndex: number, ansId: string) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(ansIndex, 1);
    setQuestions(updated);

    if (ansId && !ansId.startsWith('ans_temp_')) {
      try {
        await fetch(`/api/admin/questions/answer?id=${ansId}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this evaluation question and all its choices?')) return;
    try {
      await fetch(`/api/admin/questions?id=${qId}`, { method: 'DELETE' });
      playNotificationSound('default');
      fetchQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subtitle: newSubtitle,
          categoryId: newCategory || null,
          code: newCode.toUpperCase().replace(/[^A-Z0-9_]+/g, '_'),
          questionType: 'SINGLE_CHOICE',
          answers: [
            { code: 'PERFECT', label: 'Yes, Flawless', description: 'Works normally with no defects', adjustmentValue: 0, adjustmentType: 'FIXED' },
            { code: 'DEFECT', label: 'No, Has Defect', description: 'Physical damage or degraded functionality', adjustmentValue: -2000, adjustmentType: 'FIXED' },
          ],
          adminName: 'Super Admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        playNotificationSound('status');
        setShowAddQuestionModal(false);
        setNewTitle('');
        setNewSubtitle('');
        setNewCode('');
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter questions based on active category tab
  const filteredQuestions = questions.filter((q) => {
    if (activeCategoryTab === 'ALL') return true;
    return q.categoryId === activeCategoryTab || !q.categoryId;
  });

  const phoneCount = questions.filter((q) => q.categoryId === 'cat_smartphone').length;
  const laptopCount = questions.filter((q) => q.categoryId === 'cat_laptop').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Pricing Engine & Rules
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Pricing Engine & Diagnostic Questions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure question titles, descriptions, categories, answer choices, and positive/negative price adjustments.
          </p>
        </div>

        <button
          onClick={() => setShowAddQuestionModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 self-start transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Category Tabs & Clarification Banner */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 glass-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategoryTab('ALL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Questions ({questions.length})</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('cat_smartphone')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'cat_smartphone'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Smartphones ({phoneCount})</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('cat_laptop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategoryTab === 'cat_laptop'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Laptops ({laptopCount})</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Smartphones use {phoneCount} questions; Laptops use {laptopCount} questions. Questions set to "All Devices" appear for both!</span>
          </div>
        </div>
      </div>

      {/* Price Calculation Formula Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Price Calculation Formula
          </h3>
          <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs font-bold">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-slate-200 border border-slate-700">
              Base Price
            </span>
            <span className="text-emerald-400 text-base">+</span>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Positive Adjustments (Accessories, Mint Condition)
            </span>
            <span className="text-rose-400 text-base">-</span>
            <span className="px-3.5 py-1.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
              Negative Adjustments (Damage, Dead Screen, Faults)
            </span>
            <span className="text-slate-400 text-base">=</span>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
              Final Quoted Payout
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((q) => {
          const qIndex = questions.findIndex((item) => item.id === q.id);
          const isSaving = savingId === q.id;
          const isSaved = saveSuccessId === q.id;

          const isSmartphone = q.categoryId === 'cat_smartphone';
          const isLaptop = q.categoryId === 'cat_laptop';

          return (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel shadow-xl space-y-5 hover:border-slate-700 transition-all"
            >
              {/* Question Top Row: Header & Category Assignment */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="flex items-start gap-3 w-full">
                  <span className="text-sm font-black text-emerald-400 mt-2 shrink-0">
                    {qIndex + 1}
                  </span>
                  <div className="space-y-2 w-full">
                    {/* Editable Title */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q.title}
                        onChange={(e) => handleUpdateQuestionField(qIndex, 'title', e.target.value)}
                        className="w-full text-base font-extrabold text-white bg-slate-950/70 border border-slate-700/80 focus:border-emerald-400 rounded-xl px-3 py-1.5 focus:outline-none"
                        placeholder="Question title..."
                      />
                    </div>

                    {/* Editable Subtitle */}
                    <input
                      type="text"
                      value={q.subtitle || ''}
                      onChange={(e) => handleUpdateQuestionField(qIndex, 'subtitle', e.target.value)}
                      className="w-full text-xs text-slate-400 bg-slate-950/50 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1 focus:outline-none"
                      placeholder="Question subtitle / customer guidance..."
                    />

                    {/* Metadata & Category Switcher */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <span className="text-[11px] text-slate-400">
                        Code: <strong className="font-mono text-cyan-400">{q.code}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Target Category:</span>
                        <select
                          value={q.categoryId || ''}
                          onChange={(e) => handleUpdateQuestionField(qIndex, 'categoryId', e.target.value || null)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                        >
                          <option value="cat_smartphone">Smartphone (Phones Only)</option>
                          <option value="cat_laptop">Laptop (Laptops Only)</option>
                          <option value="">All Devices (General / Any)</option>
                        </select>
                      </div>

                      <span className="text-slate-600">•</span>
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {q.answers?.length || 0} answer options
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save & Delete Action Controls */}
                <div className="flex items-center gap-2 shrink-0 sm:self-start">
                  <button
                    onClick={() => handleSaveQuestion(q)}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                      isSaved
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                    }`}
                    title="Save all changes for this question"
                  >
                    {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Question'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editable Answer Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {q.answers?.map((ans: any, ansIndex: number) => {
                  const isNegative = Number(ans.adjustmentValue) < 0;
                  const isPositive = Number(ans.adjustmentValue) > 0;
                  const isPercentage = ans.adjustmentType === 'PERCENTAGE' || ans.code === 'DEAD' || (q.code === 'PHONE_POWER' && ansIndex === 1);

                  return (
                    <div
                      key={ans.id || ansIndex}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isNegative
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : isPositive
                          ? 'bg-emerald-950/25 border-emerald-500/35'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      {/* Top row: Answer Label + Indicator Icon */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 w-full">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1 ${
                              isNegative
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {isNegative ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </div>

                          <div className="w-full space-y-1.5">
                            {/* Editable Label */}
                            <input
                              type="text"
                              value={ans.label}
                              onChange={(e) => handleUpdateAnswerField(qIndex, ansIndex, 'label', e.target.value)}
                              className="w-full text-xs font-bold text-white bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400"
                              placeholder="Answer title (e.g. Yes, boots up / Screen Cracked)"
                            />

                            {/* Editable Description */}
                            <input
                              type="text"
                              value={ans.description || ''}
                              onChange={(e) => handleUpdateAnswerField(qIndex, ansIndex, 'description', e.target.value)}
                              className="w-full text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-0.5 focus:outline-none focus:border-cyan-400"
                              placeholder="Description / hint (e.g. 70% will be deducted from base price)"
                            />
                          </div>
                        </div>

                        {/* Display Amount Badge */}
                        <div
                          className={`text-xs font-mono font-extrabold shrink-0 mt-1 ${
                            isNegative ? 'text-rose-400' : isPositive ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {Number(ans.adjustmentValue) === 0
                            ? '₹0'
                            : isPercentage
                            ? `${ans.adjustmentValue}%`
                            : Number(ans.adjustmentValue) > 0
                            ? `+₹${Number(ans.adjustmentValue).toLocaleString('en-IN')}`
                            : `-₹${Math.abs(Number(ans.adjustmentValue)).toLocaleString('en-IN')}`}
                        </div>
                      </div>

                      {/* Adjustment Configuration Row */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                        {/* Adjustment Type Selector */}
                        <select
                          value={ans.adjustmentType || 'FIXED'}
                          onChange={(e) => handleUpdateAnswerField(qIndex, ansIndex, 'adjustmentType', e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-300 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="FIXED">Fixed (₹)</option>
                          <option value="PERCENTAGE">Percent (%)</option>
                        </select>

                        {/* Numeric Input */}
                        <input
                          type="number"
                          value={ans.adjustmentValue}
                          onChange={(e) => handleUpdateAnswerField(qIndex, ansIndex, 'adjustmentValue', Number(e.target.value))}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-950 border focus:outline-none ${
                            isNegative
                              ? 'border-rose-500/40 text-rose-300 focus:border-rose-400'
                              : 'border-slate-700 text-emerald-300 focus:border-emerald-400'
                          }`}
                          placeholder="Value (e.g. -70 or -2000 or +1200)"
                        />

                        {/* Delete Choice */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAnswer(qIndex, ansIndex, ans.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                          title="Remove this answer choice"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* + Add Answer Option */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleAddAnswerOption(qIndex)}
                  className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Answer Choice</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Add Valuation Diagnostic Question</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Does the front camera function clearly?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Subtitle / Helper Instruction</label>
                <input
                  type="text"
                  placeholder="e.g. Open camera app and check front lens for blur or spots"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHONE_FRONT_CAMERA"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="cat_smartphone">Smartphones</option>
                    <option value="cat_laptop">Laptops</option>
                    <option value="">All Categories (General)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                >
                  Create Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
