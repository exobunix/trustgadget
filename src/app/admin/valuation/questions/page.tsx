'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Search, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [code, setCode] = useState('');
  const [questionType, setQuestionType] = useState('SINGLE_CHOICE');
  const [answersList, setAnswersList] = useState([
    { code: 'PERFECT', label: 'Flawless Condition', adjustmentValue: 0, adjustmentType: 'FIXED' },
    { code: 'DAMAGED', label: 'Minor Defect', adjustmentValue: -1500, adjustmentType: 'FIXED' },
  ]);
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          code: code.toUpperCase().replace(/[^A-Z0-9_]+/g, '_'),
          questionType,
          answers: answersList,
          adminName: 'Super Admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setTitle('');
        setSubtitle('');
        setCode('');
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
            Configure dynamic evaluation questionnaires, condition options, and answer-level adjustments.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Question</span>
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 glass-panel space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{q.title}</h3>
                  {q.subtitle && <p className="text-xs text-slate-400 mt-0.5">{q.subtitle}</p>}
                  <span className="inline-block mt-1 font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                    CODE: {q.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Answer Choices Grid */}
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
                        ans.adjustmentValue > 0
                          ? 'text-emerald-400'
                          : ans.adjustmentValue < 0
                          ? 'text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {ans.adjustmentValue > 0 ? `+${ans.adjustmentValue}` : `${ans.adjustmentValue}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateQuestion}
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 glass-panel space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Diagnostic Question</h3>
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
                <label className="block text-slate-300 font-semibold mb-1">Question Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Is the camera lens scratched or blurry?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle / User Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Inspect front and rear cameras under direct light"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unique Rule Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PHONE_CAMERA_LENS"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Question Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="SINGLE_CHOICE">Single Choice Cards</option>
                    <option value="YES_NO">Yes / No Toggle</option>
                    <option value="DROPDOWN">Dropdown List</option>
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
                    className="text-cyan-400 font-semibold hover:underline text-[11px]"
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold shadow-md disabled:opacity-50"
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
