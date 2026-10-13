'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Search, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { playNotificationSound } from '@/lib/notifications';

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'All Supported Devices (General / Any)', categoryId: null },
  { value: 'SMARTPHONE', label: 'All Smartphones (All Brands)', categoryId: 'cat_smartphone' },
  { value: 'IPHONE', label: 'iPhone (Apple iOS Only)', categoryId: 'cat_smartphone' },
  { value: 'ANDROID_PHONE', label: 'Android Phones (Samsung, Pixel, etc.)', categoryId: 'cat_smartphone' },
  { value: 'LAPTOP', label: 'All Laptops (MacBook & Windows)', categoryId: 'cat_laptop' },
  { value: 'MACBOOK', label: 'MacBook (Apple Mac Only)', categoryId: 'cat_laptop' },
  { value: 'WINDOWS_LAPTOP', label: 'Windows Laptops (Dell, HP, etc.)', categoryId: 'cat_laptop' },
  { value: 'OTHER_LAPTOP', label: 'Other Laptops', categoryId: 'cat_laptop' },
  { value: 'TABLET', label: 'Tablets', categoryId: 'cat_tablet' },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [code, setCode] = useState('');
  const [targetCategory, setTargetCategory] = useState('SMARTPHONE');
  const [questionType, setQuestionType] = useState('SINGLE_CHOICE');
  const [answersList, setAnswersList] = useState([
    { code: 'PERFECT', label: 'Flawless Condition', adjustmentValue: 0, adjustmentType: 'FIXED' },
    { code: 'DAMAGED', label: 'Minor Defect', adjustmentValue: -1500, adjustmentType: 'FIXED' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions?_t=${Date.now()}`, { cache: 'no-store' });
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

  const handleAddAnswerOption = () => {
    setAnswersList((prev) => [
      ...prev,
      { code: `OPT_${prev.length + 1}`, label: 'New Choice', adjustmentValue: 0, adjustmentType: 'FIXED' },
    ]);
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code) return;
    setSubmitting(true);

    try {
      const targetOpt = TARGET_OPTIONS.find((o) => o.value === targetCategory);
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          targetCategory,
          categoryId: targetOpt?.categoryId || null,
          code: code.toUpperCase().replace(/[^A-Z0-9_]+/g, '_'),
          questionType,
          answers: answersList,
          adminName: 'Super Admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        playNotificationSound('status');
        setShowModal(false);
        setTitle('');
        setSubtitle('');
        setCode('');
        fetchQuestions();
      } else {
        alert(data.error || 'Failed to create question');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error creating question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
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
      alert(e.message || 'Error deleting question');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Diagnostic Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Dynamic Questions & Condition Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic evaluation questionnaires, device targets, and condition choices permanently persisted to database.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Question</span>
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {loading && (
          <div className="p-8 text-center text-slate-400 text-xs font-semibold animate-pulse">
            Loading diagnostic questionnaire catalog...
          </div>
        )}

        {!loading && questions.map((q, idx) => (
          <div
            key={q.id || idx}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-extrabold text-white">{q.title}</h3>
                </div>
                {q.subtitle && <p className="text-xs text-slate-400 pl-8">{q.subtitle}</p>}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                  {q.code}
                </span>
                <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  {q.targetCategory || 'ALL'}
                </span>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer"
                  title="Delete question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {q.answers?.map((ans: any) => (
                <div
                  key={ans.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ans.label}</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        Number(ans.adjustmentValue) > 0
                          ? 'text-emerald-400'
                          : Number(ans.adjustmentValue) < 0
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {ans.adjustmentType === 'PERCENTAGE'
                        ? `${ans.adjustmentValue}%`
                        : Number(ans.adjustmentValue) > 0
                        ? `+₹${ans.adjustmentValue}`
                        : `₹${ans.adjustmentValue}`}
                    </span>
                  </div>
                  {ans.description && (
                    <p className="text-[10px] text-slate-400 leading-tight">{ans.description}</p>
                  )}
                  {ans.isRejection === 1 && (
                    <div className="text-[9px] text-rose-400 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3" /> Rejection Flag
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateQuestion}
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Diagnostic Question</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
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
                  placeholder="e.g. Is the battery health above 80%?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle / User Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Check battery health in Settings > Battery"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unique Rule Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IPHONE_BATTERY_80"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Device Category *</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold cursor-pointer focus:outline-none focus:border-cyan-400"
                  >
                    {TARGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Answers Builder */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300">Answer Options & Adjustments:</span>
                  <button
                    type="button"
                    onClick={handleAddAnswerOption}
                    className="text-cyan-400 font-semibold hover:underline text-[11px] cursor-pointer"
                  >
                    + Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {answersList.map((ans, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <input
                        type="text"
                        placeholder="Option Label"
                        value={ans.label}
                        onChange={(e) => {
                          const updated = [...answersList];
                          updated[idx].label = e.target.value;
                          setAnswersList(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                      <input
                        type="number"
                        placeholder="Adjustment (e.g. -2000)"
                        value={ans.adjustmentValue}
                        onChange={(e) => {
                          const updated = [...answersList];
                          updated[idx].adjustmentValue = Number(e.target.value);
                          setAnswersList(updated);
                        }}
                        className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Publishing...' : 'Publish Question'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
