import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import {
  generateLessonPlanMarkdown,
  generateRubricMarkdown,
  generateFlashcardsMarkdown,
  generateQuizBankMarkdown
} from '../services/exportService.js';

export default function PrintView({
  contentMap,
  lessonPlan,
  rubric,
  flashcards,
  quizBank,
  teacherSettings,
  approvals,
  onClose
}) {
  return (
    <div className="bg-white min-h-screen text-slate-900">
      {/* Top Controls Bar - Hidden on print */}
      <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-50 shadow-md gap-2">
        <button
          onClick={onClose}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Exit Print Preview</span>
          <span className="xs:hidden">Exit</span>
        </button>

        <div className="text-xs text-slate-400 hidden md:block truncate text-center">
          Clean Academic Print View &bull; Use browser print dialog to save as PDF
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow transition shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden xs:inline">Print / Save as PDF</span>
          <span className="xs:hidden">Print</span>
        </button>
      </div>

      {/* Printable Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 print:p-0 print:max-w-full space-y-8 sm:space-y-12">
        {/* Cover / Header */}
        <header className="border-b-2 border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {contentMap?.document_title || 'Educational Curriculum Artifacts'}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Target Audience: <strong>{teacherSettings.audience}</strong> &bull; Difficulty: <strong>{teacherSettings.difficulty}</strong> &bull; Duration: <strong>{teacherSettings.durationMinutes} min</strong> &bull; Language: <strong>{teacherSettings.language}</strong>
          </p>
        </header>

        {/* Section 1: Content Map */}
        <section className="print-page-break space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-2">
            1. Curriculum Content Map (Single Source of Truth)
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>Summary:</strong> {contentMap?.summary}
          </p>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Learning Objectives:</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {(contentMap?.learning_objectives || []).map((lo) => (
                <li key={lo.id} className="flex items-start space-x-2">
                  <span className="font-mono font-bold text-sky-800">[{lo.id}]</span>
                  <span className="font-semibold text-slate-600">({lo.bloom_level}):</span>
                  <span>{lo.description}</span>
                  <span className="text-slate-400 text-[10px]">({lo.source_section})</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 2: Lesson Plan */}
        <section className="print-page-break space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-2">
            2. Lesson Plan: {lessonPlan?.title}
          </h2>

          <div className="text-xs space-y-3">
            <p className="text-slate-700">
              <strong>Pedagogy:</strong> {lessonPlan?.pedagogical_approach}
            </p>

            <h4 className="font-bold text-slate-800 uppercase text-[11px] pt-2">Timeline Phases:</h4>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border border-slate-300 w-16">Time</th>
                  <th className="p-2 border border-slate-300 w-32">Phase</th>
                  <th className="p-2 border border-slate-300">Activity & Strategy</th>
                  <th className="p-2 border border-slate-300 w-36">Source Section</th>
                </tr>
              </thead>
              <tbody>
                {(lessonPlan?.timeline || []).map((p, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{p.time_allocation_minutes}m</td>
                    <td className="p-2 border border-slate-300 font-bold">{p.phase_name}</td>
                    <td className="p-2 border border-slate-300">
                      <p>{p.activity_description}</p>
                      <p className="text-[10px] text-slate-500 mt-1"><em>Teacher:</em> {p.teacher_actions}</p>
                    </td>
                    <td className="p-2 border border-slate-300 text-[11px] text-slate-500">{p.source_section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Rubric */}
        <section className="print-page-break space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-2">
            3. Assessment Rubric: {rubric?.title}
          </h2>
          <p className="text-xs text-slate-600">Total Points: {rubric?.total_points || 100}</p>

          <div className="space-y-4">
            {(rubric?.criteria || []).map((crit, idx) => (
              <div key={idx} className="print-avoid-break space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>Criterion {idx + 1}: {crit.criterion_name} ({crit.weight_percentage}%)</span>
                  <span>Mapped: {crit.mapped_objective_id}</span>
                </div>
                <table className="w-full text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-[10px] uppercase">
                    <tr>
                      {(crit.performance_levels || []).map((lvl, lIdx) => (
                        <th key={lIdx} className="p-2 border border-slate-300 w-1/4">
                          {lvl.level_name} ({lvl.points} pts)
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {(crit.performance_levels || []).map((lvl, lIdx) => (
                        <td key={lIdx} className="p-2 border border-slate-300 text-[11px] align-top">
                          {lvl.descriptor}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Flashcards */}
        <section className="print-page-break space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-2">
            4. Active Recall Flashcards ({flashcards?.cards?.length || 0} items)
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {(flashcards?.cards || []).map((card, idx) => (
              <div key={idx} className="print-avoid-break border border-slate-300 p-3 rounded space-y-2">
                <div className="flex justify-between font-bold text-slate-500 text-[10px]">
                  <span>CARD #{idx + 1} ({card.bloom_level})</span>
                  <span>{card.mapped_objective_id}</span>
                </div>
                <p className="font-bold text-slate-900">{card.front}</p>
                <p className="text-slate-700 text-[11px] border-t border-slate-200 pt-1.5">{card.back}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Quiz Bank */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-300 pb-2">
            5. Quiz Bank & Answer Key ({quizBank?.items?.length || 0} questions)
          </h2>

          <div className="space-y-4 text-xs">
            {(quizBank?.items || []).map((item, idx) => (
              <div key={idx} className="print-avoid-break border border-slate-200 p-4 rounded-lg space-y-2">
                <div className="flex justify-between font-bold text-slate-600 text-[11px]">
                  <span>Question {idx + 1} ({item.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'})</span>
                  <span>[{item.bloom_level} &bull; {item.mapped_objective_id}]</span>
                </div>

                <p className="font-semibold text-slate-900">{item.question}</p>

                {item.question_type === 'multiple_choice' && item.options && (
                  <div className="pl-4 space-y-1 text-[11px]">
                    {item.options.map((opt) => (
                      <div key={opt.label}>
                        <strong>({opt.label})</strong> {opt.text}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-[11px] bg-slate-50 p-2 rounded">
                  <p><strong>Correct Answer:</strong> {item.correct_answer}</p>
                  <p className="text-slate-600 mt-0.5"><em>Explanation:</em> {item.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
