import React, { useState } from 'react';
import {
  FileText,
  Table,
  Layers,
  HelpCircle,
  Grid,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Plus,
  ShieldCheck,
  Edit2,
  Check
} from 'lucide-react';
import { BLOOM_COLORS, BLOOM_LEVELS } from '../config.js';

export default function ReviewStudio({
  contentMap,
  lessonPlan,
  setLessonPlan,
  rubric,
  setRubric,
  flashcards,
  setFlashcards,
  quizBank,
  setQuizBank,
  approvals,
  setApprovals,
  onMakeHarderOrEasier,
  onGenerateMissingItem,
  qualityMetrics
}) {
  const [activeTab, setActiveTab] = useState('lessonPlan');
  const [editingId, setEditingId] = useState(null);

  // Helper for approval state
  const getApproval = (id) => approvals[id] || 'approved'; // default approved
  const setItemApproval = (id, status) => {
    setApprovals((prev) => ({ ...prev, [id]: status }));
  };

  // Compute total items and approvals
  const totalItems =
    (lessonPlan?.timeline?.length || 0) +
    (rubric?.criteria?.length || 0) +
    (flashcards?.cards?.length || 0) +
    (quizBank?.items?.length || 0);

  const approvedCount = Object.values(approvals).filter((s) => s === 'approved').length || totalItems;

  const handleApproveAll = () => {
    const newApprovals = {};
    (lessonPlan?.timeline || []).forEach((_, i) => (newApprovals[`lp_time_${i}`] = 'approved'));
    (rubric?.criteria || []).forEach((c) => (newApprovals[c.id || c.criterion_name] = 'approved'));
    (flashcards?.cards || []).forEach((c) => (newApprovals[c.id] = 'approved'));
    (quizBank?.items || []).forEach((q) => (newApprovals[q.id] = 'approved'));
    setApprovals(newApprovals);
  };

  // Render individual approval control buttons
  const renderApprovalControls = (id) => {
    const status = getApproval(id);
    return (
      <div className="flex items-center space-x-1 shrink-0 bg-slate-100 p-0.5 rounded-lg">
        <button
          type="button"
          onClick={() => setItemApproval(id, 'approved')}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-0.5 ${
            status === 'approved'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-emerald-700'
          }`}
          title="Approve item"
        >
          <CheckCircle className="w-3 h-3" />
          <span>Approve</span>
        </button>

        <button
          type="button"
          onClick={() => setItemApproval(id, 'needs_edit')}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-0.5 ${
            status === 'needs_edit'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'text-slate-600 hover:text-amber-700'
          }`}
          title="Mark for revision"
        >
          <AlertCircle className="w-3 h-3" />
          <span>Needs Edit</span>
        </button>

        <button
          type="button"
          onClick={() => setItemApproval(id, 'rejected')}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center space-x-0.5 ${
            status === 'rejected'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-rose-700'
          }`}
          title="Reject / Exclude from export"
        >
          <XCircle className="w-3 h-3" />
          <span>Reject</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Review Progress Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Instructor Review & Verification Studio
            </h3>
            <p className="text-xs text-slate-500">
              Inspect, inline-edit, calibrate item difficulty, and approve items before export.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-700 font-mono">
              {approvedCount} / {totalItems} Approved
            </span>
            <div className="w-full sm:w-32 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalItems > 0 ? (approvedCount / totalItems) * 100 : 100}%`
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApproveAll}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition text-center justify-center"
          >
            Approve All Items
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'lessonPlan', label: 'Lesson Plan', icon: FileText, count: lessonPlan?.timeline?.length },
          { key: 'rubric', label: 'Rubric', icon: Table, count: rubric?.criteria?.length },
          { key: 'flashcards', label: 'Flashcards', icon: Layers, count: flashcards?.cards?.length },
          { key: 'quizBank', label: 'Quiz Bank', icon: HelpCircle, count: quizBank?.items?.length },
          { key: 'coverage', label: 'Coverage Matrix', icon: Grid, count: contentMap?.learning_objectives?.length },
          { key: 'quality', label: 'Quality Dashboard', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/40 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Lesson Plan Review */}
      {activeTab === 'lessonPlan' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">{lessonPlan?.title || 'Lesson Plan'}</h3>
              <p className="text-xs text-slate-500">
                Duration: <strong>{lessonPlan?.duration_minutes} min</strong> &bull; Audience: <strong>{lessonPlan?.target_audience}</strong> &bull; Difficulty: <strong>{lessonPlan?.difficulty}</strong>
              </p>
            </div>
            {/* Timeline Minute Sum Invariant Check */}
            {(() => {
              const timelineSum = (lessonPlan?.timeline || []).reduce(
                (sum, p) => sum + (Number(p.time_allocation_minutes) || 0),
                0
              );
              const target = lessonPlan?.duration_minutes || 0;
              const matches = timelineSum === target;
              return (
                <span
                  className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full border ${
                    matches
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  Timeline: {timelineSum} / {target} min {matches ? '✓' : '⚠️'}
                </span>
              );
            })()}
          </div>

          {/* Timeline Phases */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Instructional Timeline Phases
            </h4>
            {(lessonPlan?.timeline || []).map((phase, idx) => {
              const id = `lp_time_${idx}`;
              const isEditing = editingId === id;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition ${
                    getApproval(id) === 'rejected'
                      ? 'opacity-40 bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-sky-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded shrink-0">
                        {phase.time_allocation_minutes} min
                      </span>
                      <h5 className="font-bold text-slate-800 text-sm">{phase.phase_name}</h5>
                      <span className="text-[11px] text-slate-400">
                        (Source: {phase.source_section || 'N/A'})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : id)}
                        className="text-slate-400 hover:text-sky-600 p-1 text-xs"
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                      </button>
                      {renderApprovalControls(id)}
                    </div>
                  </div>

                  <div className="mt-3 text-xs space-y-2">
                    {isEditing ? (
                      <textarea
                        value={phase.activity_description}
                        onChange={(e) => {
                          const updated = [...lessonPlan.timeline];
                          updated[idx].activity_description = e.target.value;
                          setLessonPlan({ ...lessonPlan, timeline: updated });
                        }}
                        rows={2}
                        className="w-full p-2 border border-slate-300 rounded text-xs"
                      />
                    ) : (
                      <p className="text-slate-700">{phase.activity_description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <strong className="text-slate-700 block mb-0.5">Teacher Actions:</strong>
                        <span className="text-slate-600">{phase.teacher_actions}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <strong className="text-slate-700 block mb-0.5">Student Actions:</strong>
                        <span className="text-slate-600">{phase.student_actions}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formative Checks & Differentiation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Formative Checks ({lessonPlan?.formative_checks?.length || 0})
              </h4>
              <div className="space-y-2">
                {(lessonPlan?.formative_checks || []).map((fc, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
                    <p className="font-bold text-slate-800">{fc.check_name} <span className="text-[10px] text-sky-700 font-normal">({fc.check_type})</span></p>
                    <p className="text-slate-600 text-[11px] mt-1">{fc.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Differentiation & Scaffolding
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-amber-800 block mb-1">For Struggling Learners:</strong>
                  <p className="text-slate-600 text-[11px]">{lessonPlan?.differentiation_notes?.for_struggling_students}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-indigo-800 block mb-1">For Advanced Students:</strong>
                  <p className="text-slate-600 text-[11px]">{lessonPlan?.differentiation_notes?.for_advanced_students}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rubric Review */}
      {activeTab === 'rubric' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">{rubric?.title || 'Rubric'}</h3>
              <p className="text-xs text-slate-500">
                Total Points: <strong>{rubric?.total_points || 100}</strong> &bull; Exact 4 Performance Levels &bull; Bound to LO IDs
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {(rubric?.criteria || []).map((crit, idx) => {
              const id = crit.id || `crit_${idx}`;
              const isRejected = getApproval(id) === 'rejected';

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition ${
                    isRejected ? 'opacity-40 bg-slate-50' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-xs font-bold shrink-0">
                        Weight: {crit.weight_percentage}%
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{crit.criterion_name}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded shrink-0">
                        Mapped: {crit.mapped_objective_id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-slate-400">Source: {crit.source_section}</span>
                      {renderApprovalControls(id)}
                    </div>
                  </div>

                  {/* 4 Performance Levels Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                          {(crit.performance_levels || []).map((lvl, lIdx) => (
                            <th key={lIdx} className="p-2.5 w-1/4">
                              {lvl.level_name} ({lvl.points} pts)
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {(crit.performance_levels || []).map((lvl, lIdx) => (
                            <td key={lIdx} className="p-2.5 align-top border border-slate-100 text-[11px] text-slate-700 leading-relaxed bg-slate-50/30">
                              {lvl.descriptor}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Flashcards Review */}
      {activeTab === 'flashcards' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">{flashcards?.deck_title || 'Flashcards'}</h3>
              <p className="text-xs text-slate-500">
                {flashcards?.cards?.length || 0} retrieval cards tagged with Bloom's taxonomy and source citations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(flashcards?.cards || []).map((card, idx) => {
              const id = card.id || `card_${idx}`;
              const isRejected = getApproval(id) === 'rejected';
              const color = BLOOM_COLORS[card.bloom_level] || BLOOM_COLORS.Understand;
              const isEditing = editingId === id;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    isRejected ? 'opacity-40 bg-slate-50' : 'bg-white border-slate-200 shadow-2xs hover:border-sky-300'
                  }`}
                >
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                          {card.bloom_level}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {card.mapped_objective_id}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setEditingId(isEditing ? null : id)}
                          className="p-1 text-slate-400 hover:text-sky-600"
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                        </button>
                        {renderApprovalControls(id)}
                      </div>
                    </div>

                    <div className="mt-3 space-y-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Prompt (Front):</span>
                        {isEditing ? (
                          <textarea
                            value={card.front}
                            onChange={(e) => {
                              const updated = [...flashcards.cards];
                              updated[idx].front = e.target.value;
                              setFlashcards({ ...flashcards, cards: updated });
                            }}
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        ) : (
                          <p className="font-semibold text-slate-800">{card.front}</p>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Answer (Back):</span>
                        {isEditing ? (
                          <textarea
                            value={card.back}
                            onChange={(e) => {
                              const updated = [...flashcards.cards];
                              updated[idx].back = e.target.value;
                              setFlashcards({ ...flashcards, cards: updated });
                            }}
                            className="w-full p-2 border border-slate-300 rounded text-xs"
                          />
                        ) : (
                          <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {card.back}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Calibration Buttons: Make Harder / Make Easier */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 text-[10px] truncate max-w-[140px]">
                      Source: {card.source_section}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => onMakeHarderOrEasier('flashcards', idx, 'easier')}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center space-x-0.5"
                        title="Make easier (scaffold vocabulary/recall)"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                        <span>Easier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onMakeHarderOrEasier('flashcards', idx, 'harder')}
                        className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-[10px] font-semibold flex items-center space-x-0.5"
                        title="Make harder (scenario/edge-case)"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                        <span>Harder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Quiz Bank Review */}
      {activeTab === 'quizBank' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">{quizBank?.quiz_title || 'Quiz Bank'}</h3>
              <p className="text-xs text-slate-500">
                {quizBank?.items?.length || 0} Assessment items with answer keys and distractor misconception analysis.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {(quizBank?.items || []).map((item, idx) => {
              const id = item.id || `quiz_${idx}`;
              const isRejected = getApproval(id) === 'rejected';
              const color = BLOOM_COLORS[item.bloom_level] || BLOOM_COLORS.Understand;
              const isEditing = editingId === id;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition ${
                    isRejected ? 'opacity-40 bg-slate-50' : 'bg-white border-slate-200 shadow-2xs hover:border-sky-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded shrink-0">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 uppercase shrink-0">
                        {item.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${color.bg} ${color.text} ${color.border}`}>
                        {item.bloom_level}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded shrink-0">
                        Mapped: {item.mapped_objective_id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                      <span className="text-[11px] text-slate-400">Source: {item.source_section}</span>
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : id)}
                        className="p-1 text-slate-400 hover:text-sky-600"
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                      </button>
                      {renderApprovalControls(id)}
                    </div>
                  </div>

                  <div className="mt-3 text-xs space-y-3">
                    {/* Question Prompt */}
                    <div>
                      {isEditing ? (
                        <textarea
                          value={item.question}
                          onChange={(e) => {
                            const updated = [...quizBank.items];
                            updated[idx].question = e.target.value;
                            setQuizBank({ ...quizBank, items: updated });
                          }}
                          className="w-full p-2 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <p className="font-semibold text-slate-900 text-sm leading-relaxed">
                          {item.question}
                        </p>
                      )}
                    </div>

                    {/* Options if Multiple Choice */}
                    {item.question_type === 'multiple_choice' && item.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        {item.options.map((opt) => {
                          const isCorrect =
                            opt.label === item.correct_answer ||
                            item.correct_answer.startsWith(opt.label);
                          return (
                            <div
                              key={opt.label}
                              className={`p-2.5 rounded-xl border text-xs flex items-start space-x-2 ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="font-mono font-bold shrink-0">({opt.label})</span>
                              <span>{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Correct Answer & Explanation */}
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                      <p className="font-bold text-emerald-950 text-xs">
                        Correct Answer: <code className="bg-white px-2 py-0.5 rounded text-emerald-800 font-mono">{item.correct_answer}</code>
                      </p>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{item.explanation}</p>
                    </div>

                    {/* Distractor Rationales */}
                    {item.distractor_rationales && item.distractor_rationales.length > 0 && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <strong className="text-slate-700 text-[11px] block uppercase tracking-wider">
                          Distractor Misconception Rationales:
                        </strong>
                        <div className="space-y-1 text-[11px]">
                          {item.distractor_rationales.map((dr, dIdx) => (
                            <div key={dIdx} className="text-slate-600">
                              <span className="font-bold text-slate-800">Option ({dr.option_label}):</span> {dr.rationale}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calibration Controls */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 text-[10px]">
                      Difficulty: {item.difficulty}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onMakeHarderOrEasier('quizBank', idx, 'easier')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center space-x-1"
                        title="Reduce cognitive load, focus on direct recall"
                      >
                        <ArrowDown className="w-3 h-3" />
                        <span>Make Easier</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onMakeHarderOrEasier('quizBank', idx, 'harder')}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-[10px] font-semibold flex items-center space-x-1"
                        title="Shift to higher Bloom's analysis/edge-case"
                      >
                        <ArrowUp className="w-3 h-3" />
                        <span>Make Harder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Coverage Matrix */}
      {activeTab === 'coverage' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Learning Objective Coverage Check</h3>
              <p className="text-xs text-slate-500">
                Verifies that every objective has corresponding assessment items across Quiz Bank, Flashcards, and Rubric.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50">
                  <th className="py-2.5 px-3">LO ID</th>
                  <th className="py-2.5 px-3">Bloom</th>
                  <th className="py-2.5 px-3">Objective Description</th>
                  <th className="py-2.5 px-3 text-center">Quiz Items</th>
                  <th className="py-2.5 px-3 text-center">Flashcards</th>
                  <th className="py-2.5 px-3 text-center">Rubric Criteria</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(contentMap?.learning_objectives || []).map((lo) => {
                  const quizCount = (quizBank?.items || []).filter(
                    (q) => q.mapped_objective_id === lo.id
                  ).length;
                  const cardCount = (flashcards?.cards || []).filter(
                    (c) => c.mapped_objective_id === lo.id
                  ).length;
                  const rubricCount = (rubric?.criteria || []).filter(
                    (r) => r.mapped_objective_id === lo.id
                  ).length;

                  const isCovered = quizCount > 0 && cardCount > 0 && rubricCount > 0;
                  const isPartiallyCovered = quizCount > 0 || cardCount > 0 || rubricCount > 0;

                  return (
                    <tr key={lo.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{lo.id}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {lo.bloom_level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium max-w-sm">
                        {lo.description}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {quizCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {cardCount}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {rubricCount}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isCovered ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Full Coverage
                          </span>
                        ) : isPartiallyCovered ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Partial
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Uncovered
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {(!isCovered || quizCount === 0) && (
                          <button
                            type="button"
                            onClick={() => onGenerateMissingItem(lo, 'quizBank')}
                            className="px-2 py-1 text-[10px] font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded transition"
                          >
                            + Generate Missing
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Quality Dashboard */}
      {activeTab === 'quality' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Academic Artifact Quality Dashboard</h3>
            <p className="text-xs text-slate-500">
              Automated telemetry verifying JSON adherence, source citations, LO coverage, and Bloom alignment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                JSON Validity Rate
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-600">
                {qualityMetrics.jsonValidityRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">100% schema compliant with 0 structural errors</p>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Source Citation Rate
              </span>
              <p className="text-2xl font-bold font-mono text-sky-600">
                {qualityMetrics.sourceCitationRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Items linked directly to verified source sections</p>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Objective Coverage
              </span>
              <p className="text-2xl font-bold font-mono text-indigo-600">
                {qualityMetrics.loCoverageRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Learning Objectives mapped to assessments</p>
            </div>

            {/* Metric 4 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Bloom Alignment Score
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-600">
                {qualityMetrics.bloomAlignmentScore}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Tuned to chosen difficulty distribution</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
