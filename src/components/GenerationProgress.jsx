import React from 'react';
import {
  FileText,
  Table,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function GenerationProgress({
  statuses,
  onRegenerateSingle,
  onProceedToReview,
  allCompleted
}) {
  const artifacts = [
    {
      key: 'lessonPlan',
      name: 'Lesson Plan',
      desc: 'Timeline summing strictly to class duration, activities, formative checks, differentiation',
      icon: FileText
    },
    {
      key: 'rubric',
      name: 'Assessment Rubric',
      desc: 'Criteria x 4 performance levels (Exemplary, Proficient, Developing, Beginning) mapped to LOs',
      icon: Table
    },
    {
      key: 'flashcards',
      name: 'Active Recall Flashcards',
      desc: 'Atomic retrieval cards tagged with Bloom levels, difficulty, and source citations',
      icon: Layers
    },
    {
      key: 'quizBank',
      name: 'Quiz Bank & Distractor Rationales',
      desc: 'Multiple-choice and short-answer items with misconception rationales and answer keys',
      icon: HelpCircle
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Parallel Multi-Artifact Generation
            </h2>
            <p className="text-xs text-slate-500">
              Synthesizing 4 pedagogical artifacts simultaneously with strict JSON schema compliance.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Status:</span>
            {allCompleted ? (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All 4 Artifacts Generated</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-bold rounded-full flex items-center space-x-1 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>Generating in Parallel...</span>
              </span>
            )}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {artifacts.map((art) => {
            const Icon = art.icon;
            const state = statuses[art.key] || { status: 'pending', error: null, elapsed: 0 };
            const isDone = state.status === 'success';
            const isRunning = state.status === 'generating';
            const isError = state.status === 'error';

            return (
              <div
                key={art.key}
                className={`p-5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isRunning
                    ? 'bg-sky-50/40 border-sky-300 ring-2 ring-sky-200/50'
                    : isError
                    ? 'bg-rose-50/40 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700'
                          : isRunning
                          ? 'bg-sky-100 text-sky-700'
                          : isError
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{art.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{art.desc}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 ml-2">
                    {isDone && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    )}
                    {isRunning && (
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-sky-700 bg-white px-2.5 py-1 rounded-full border border-sky-200">
                        <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                        <span>Calling API...</span>
                      </span>
                    )}
                    {isError && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-rose-700 bg-white px-2.5 py-1 rounded-full border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Error message and per-artifact retry button */}
                {isError && (
                  <div className="mt-3 p-3 bg-white border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
                    <span className="truncate mr-2">{state.error || 'Generation error'}</span>
                    <button
                      type="button"
                      onClick={() => onRegenerateSingle(art.key)}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[11px] shrink-0 transition"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Success details & Per-artifact Regenerate */}
                {isDone && (
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[11px] text-emerald-800 font-medium">
                      Validated strictly against schema
                    </span>
                    <button
                      type="button"
                      onClick={() => onRegenerateSingle(art.key)}
                      className="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500 text-center sm:text-left">
          {allCompleted ? 'All items generated and verified.' : 'Awaiting completion of all 4 generators...'}
        </div>

        <button
          type="button"
          disabled={!allCompleted}
          onClick={onProceedToReview}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
        >
          <span>Proceed to Calibrator & Review Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
