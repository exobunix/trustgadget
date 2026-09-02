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
} from 'lucide-react';

export default function AdminPricingEnginePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Question Modal
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCode, setNewCode] = useState('');

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

  const handleUpdateAdjustment = (qIndex: number, ansIndex: number, val: number) => {
    const updated = [...questions];
    updated[qIndex].answers[ansIndex].adjustmentValue = val;
    setQuestions(updated);
  };

  const handleSaveQuestion = async (q: any) => {
    setSavingId(q.id);
    setSaveSuccess(false);
    try {
      // Save all answers for this question
      for (const ans of q.answers) {
        await fetch(`/api/admin/questions/answer`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answerId: ans.id,
            adjustmentValue: Number(ans.adjustmentValue),
            label: ans.label,
            description: ans.description,
          }),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
      id: `ans_temp_${Date.now()}`,
      questionId: targetQ.id,
      code: `OPT_${targetQ.answers.length + 1}`,
      label: 'New Condition Option',
      description: 'Customer condition description',
      adjustmentType: 'FIXED',
      adjustmentValue: 0,
      isRejection: 0,
    };
    targetQ.answers.push(newAns);
    setQuestions(updated);
  };

  const handleDeleteAnswer = (qIndex: number, ansIndex: number) => {
    const updated = [...questions];
    updated[qIndex].answers.splice(ansIndex, 1);
    setQuestions(updated);
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this dynamic evaluation question?')) return;
    try {
      await fetch(`/api/admin/questions?id=${qId}`, { method: 'DELETE' });
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Pricing
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Pricing Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage sell questions, answers and price adjustments
          </p>
        </div>

        <button
          onClick={() => setShowAddQuestionModal(true)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2 self-start transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Price Calculation Formula Banner (Screenshot 1 Match) */}
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
              Positive Adjustments
            </span>
            <span className="text-rose-400 text-base">-</span>
            <span className="px-3.5 py-1.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
              Negative Adjustments
            </span>
            <span className="text-slate-400 text-base">=</span>
            <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
              Final Price
            </span>
          </div>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/40 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pricing matrix saved!</span>
          </div>
        )}
      </div>

      {/* Dynamic Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            {/* Question Top Row */}
            <div className="flex items-start justify-between gap-4 pb-2">
              <div className="flex items-start gap-3">
                <span className="text-sm font-black text-emerald-400 mt-0.5">
                  {qIndex + 1}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">{q.title}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{q.answers?.length || 0} answer options</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  {q.subtitle && (
                    <p className="text-xs text-slate-400 mt-2 font-normal">{q.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSaveQuestion(q)}
                  disabled={savingId === q.id}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Save adjustments"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingId === q.id ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Answer Cards Grid (Screenshot 1 Match: Green positive vs Pink/Red negative cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {q.answers?.map((ans: any, ansIndex: number) => {
                const isNegative = Number(ans.adjustmentValue) < 0;
                const isPositive = Number(ans.adjustmentValue) > 0;

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
                    {/* Top choice header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isNegative
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {isNegative ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{ans.label}</div>
                          {ans.description && (
                            <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                              {ans.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Display amount badge */}
                      <div
                        className={`text-xs font-mono font-extrabold shrink-0 ${
                          isNegative ? 'text-rose-400' : isPositive ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {Number(ans.adjustmentValue) === 0
                          ? '₹0'
                          : Number(ans.adjustmentValue) > 0
                          ? `+₹${Number(ans.adjustmentValue).toLocaleString('en-IN')}`
                          : `-₹${Math.abs(Number(ans.adjustmentValue)).toLocaleString('en-IN')}`}
                      </div>
                    </div>

                    {/* Numeric Input box below */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        value={ans.adjustmentValue}
                        onChange={(e) => handleUpdateAdjustment(qIndex, ansIndex, Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-950 border focus:outline-none ${
                          isNegative
                            ? 'border-rose-500/40 text-rose-300 focus:border-rose-400'
                            : 'border-slate-700 text-emerald-300 focus:border-emerald-400'
                        }`}
                        placeholder="Adjustment (e.g. -20000 or +500)"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteAnswer(qIndex, ansIndex)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove answer option"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* + Add Answer Option Row */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleAddAnswerOption(qIndex)}
                className="text-xs font-bold text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-slate-800/60 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Answer Option</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateQuestion}
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Diagnostic Question</h3>
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Does the device turn on?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle / User Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Press the power button to check if device boots normally"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unique Rule Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PHONE_POWER_ON"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-md"
              >
                Create Question
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
