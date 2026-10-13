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

const TARGET_CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Supported Devices (General / Any)', categoryId: null },
  { value: 'SMARTPHONE', label: 'All Smartphones (All Brands)', categoryId: 'cat_smartphone' },
  { value: 'IPHONE', label: 'iPhone (Apple iOS Only)', categoryId: 'cat_smartphone' },
  { value: 'ANDROID_PHONE', label: 'Android Phones (Samsung, OnePlus, etc.)', categoryId: 'cat_smartphone' },
  { value: 'LAPTOP', label: 'All Laptops (MacBook & Windows)', categoryId: 'cat_laptop' },
  { value: 'MACBOOK', label: 'MacBook (Apple Mac Only)', categoryId: 'cat_laptop' },
  { value: 'WINDOWS_LAPTOP', label: 'Windows Laptops (Dell, HP, Lenovo, etc.)', categoryId: 'cat_laptop' },
  { value: 'OTHER_LAPTOP', label: 'Other Supported Laptops', categoryId: 'cat_laptop' },
  { value: 'TABLET', label: 'Tablets (iPads, Tabs, etc.)', categoryId: 'cat_tablet' },
];

export default function AdminPricingEnginePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | 'cat_smartphone' | 'cat_laptop' | 'cat_tablet'>('ALL');

  // New Question Modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newTargetCategory, setNewTargetCategory] = useState('SMARTPHONE');

  const fetchQuestions = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/admin/questions?_t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
      } else {
        setErrorMessage(data.error || 'Failed to load questions from database');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Network error fetching questions');
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

  // Update target category with synchronized categoryId
  const handleUpdateTargetCategory = (qIndex: number, targetValue: string) => {
    const option = TARGET_CATEGORY_OPTIONS.find((o) => o.value === targetValue);
    const updated = [...questions];
    updated[qIndex].targetCategory = targetValue;
    updated[qIndex].categoryId = option?.categoryId || null;
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
    setErrorMessage(null);
    try {
      const payload = {
        id: q.id,
        title: q.title,
        subtitle: q.subtitle,
        categoryId: q.categoryId || null,
        targetCategory: q.targetCategory || 'ALL',
        code: q.code,
        isActive: q.isActive,
        displayOrder: q.displayOrder,
        answers: q.answers,
        adminName: 'Super Admin',
      };

      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save question to persistent database');
      }

      playNotificationSound('status');
      setSaveSuccessId(q.id);
      setTimeout(() => setSaveSuccessId(null), 3000);
      await fetchQuestions();
    } catch (e: any) {
      console.error('Save failed:', e);
      setErrorMessage(e.message || 'Database write failed. Unsaved edits are preserved.');
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
    if (!confirm('Are you sure you want to permanently delete this valuation question and all its choices?')) return;
    try {
      const res = await fetch(`/api/admin/questions?id=${qId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        playNotificationSound('default');
        fetchQuestions();
      } else {
        alert(data.error || 'Failed to delete question');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to delete question');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    try {
      const selectedOption = TARGET_CATEGORY_OPTIONS.find((o) => o.value === newTargetCategory);
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subtitle: newSubtitle,
          targetCategory: newTargetCategory,
          categoryId: selectedOption?.categoryId || null,
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
      } else {
        alert(data.error || 'Failed to create question');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error creating question');
    }
  };

  // Filter questions based on active category tab
  const filteredQuestions = questions.filter((q) => {
    if (activeCategoryTab === 'ALL') return true;
    return q.categoryId === activeCategoryTab;
  });

  const phoneCount = questions.filter((q) => q.categoryId === 'cat_smartphone' || q.targetCategory === 'SMARTPHONE' || q.targetCategory === 'IPHONE' || q.targetCategory === 'ANDROID_PHONE').length;
  const laptopCount = questions.filter((q) => q.categoryId === 'cat_laptop' || q.targetCategory === 'LAPTOP' || q.targetCategory === 'MACBOOK' || q.targetCategory === 'WINDOWS_LAPTOP').length;

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
            Configure device questionnaires, accurate targeting (iPhone vs Android, MacBook vs Windows), and sum-of-percentage deductions.
          </p>
        </div>

        <button
          onClick={() => setShowAddQuestionModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 self-start transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-slate-900/60 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategoryTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeCategoryTab === 'ALL'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Questions ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveCategoryTab('cat_smartphone')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeCategoryTab === 'cat_smartphone'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Smartphones ({phoneCount})</span>
          </button>

          <button
            onClick={() => setActiveCategoryTab('cat_laptop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeCategoryTab === 'cat_laptop'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Laptops ({laptopCount})</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-400 pr-3">
          Formula: <span className="text-emerald-400 font-mono">Final = Base − Base × (Σ% ÷ 100) − Fixed</span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-slate-400 text-xs font-bold animate-pulse">
          Loading diagnostic questionnaires from database...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredQuestions.length === 0 && (
        <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-extrabold text-white">No valuation questions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create questions above to dynamically adjust buyback quotes based on customer device conditions.
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((q, qIndex) => {
          const isSaving = savingId === q.id;
          const isSaved = saveSuccessId === q.id;
          const currentTarget = q.targetCategory || 'ALL';

          return (
            <div
              key={q.id || qIndex}
              className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl transition-all"
            >
              {/* Question Header & Editable Inputs */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 w-full">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-cyan-400 text-xs font-black flex items-center justify-center shrink-0 mt-1">
                    {qIndex + 1}
                  </div>

                  <div className="w-full space-y-2">
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

                    {/* Metadata & Hierarchical Category Switcher */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <span className="text-[11px] text-slate-400">
                        Code: <strong className="font-mono text-cyan-400">{q.code}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Target Category:</span>
                        <select
                          value={currentTarget}
                          onChange={(e) => handleUpdateTargetCategory(qIndex, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                        >
                          {TARGET_CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-500 text-slate-950'
                        : isSaving
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                    }`}
                    title="Save all changes for this question permanently to persistent database"
                  >
                    {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Saving to Database...' : isSaved ? 'Saved!' : 'Save Question'}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
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
                  const isPercentage = ans.adjustmentType === 'PERCENTAGE';

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
                              placeholder="Answer title (e.g. Flawless / Cracked Screen)"
                            />

                            {/* Editable Description */}
                            <input
                              type="text"
                              value={ans.description || ''}
                              onChange={(e) => handleUpdateAnswerField(qIndex, ansIndex, 'description', e.target.value)}
                              className="w-full text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-0.5 focus:outline-none focus:border-cyan-400"
                              placeholder="Description / helper hint"
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
                          className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
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
                          placeholder="Value (e.g. -15 for 15% or -3000 for ₹3,000)"
                        />

                        {/* Delete Choice */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAnswer(qIndex, ansIndex, ans.id)}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
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
                  className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 py-1.5 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer"
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
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
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
                  placeholder="e.g. Battery Maximum Capacity & Health"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Subtitle / Helper Instruction</label>
                <input
                  type="text"
                  placeholder="e.g. Check battery health percentage in device settings"
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
                    placeholder="e.g. IPHONE_BATTERY_HEALTH"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Target Device *</label>
                  <select
                    value={newTargetCategory}
                    onChange={(e) => setNewTargetCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    {TARGET_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-500/20 cursor-pointer"
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
