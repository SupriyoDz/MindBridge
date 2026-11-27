import React, { useState } from 'react';
import {
  Download,
  FileArchive,
  FileText,
  Table,
  Layers,
  HelpCircle,
  Code,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  Globe
} from 'lucide-react';
import {
  downloadZipPackage,
  downloadFile,
  generateLessonPlanMarkdown,
  generateRubricMarkdown,
  generateFlashcardsMarkdown,
  generateFlashcardsCSV,
  generateQuizBankMarkdown,
  generatePrintHTML
} from '../services/exportService.js';

export default function ExportPanel({
  contentMap,
  lessonPlan,
  rubric,
  flashcards,
  quizBank,
  teacherSettings,
  approvals,
  onOpenPrintView
}) {
  const [onlyApproved, setOnlyApproved] = useState(true);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await downloadZipPackage({
        contentMap,
        lessonPlan,
        rubric,
        flashcards,
        quizBank,
        teacherSettings,
        approvals,
        onlyApproved
      });
    } catch (e) {
      console.error(e);
      alert('Failed to package ZIP: ' + e.message);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingle = (type) => {
    if (type === 'lesson-plan.md') {
      const md = generateLessonPlanMarkdown(lessonPlan, approvals, onlyApproved);
      downloadFile('lesson-plan.md', md);
    } else if (type === 'rubric.md') {
      const md = generateRubricMarkdown(rubric, approvals, onlyApproved);
      downloadFile('rubric.md', md);
    } else if (type === 'flashcards.md') {
      const md = generateFlashcardsMarkdown(flashcards, approvals, onlyApproved);
      downloadFile('flashcards.md', md);
    } else if (type === 'flashcards.csv') {
      const csv = generateFlashcardsCSV(flashcards, approvals, onlyApproved);
      downloadFile('flashcards.csv', csv, 'text/csv;charset=utf-8');
    } else if (type === 'quiz-bank.md') {
      const md = generateQuizBankMarkdown(quizBank, approvals, onlyApproved);
      downloadFile('quiz-bank.md', md);
    } else if (type === 'package.json') {
      const pkg = {
        metadata: {
          generated_at: new Date().toISOString(),
          settings: teacherSettings,
          onlyApproved
        },
        content_map: contentMap,
        lesson_plan: lessonPlan,
        rubric: rubric,
        flashcards: flashcards,
        quiz_bank: quizBank,
        approvals
      };
      downloadFile('package.json', JSON.stringify(pkg, null, 2), 'application/json');
    } else if (type === 'print.html') {
      const html = generatePrintHTML({
        contentMap,
        lessonPlan,
        rubric,
        flashcards,
        quizBank,
        teacherSettings,
        approvals,
        onlyApproved
      });
      downloadFile('print.html', html, 'text/html;charset=utf-8');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export Educational Artifact Package</h2>
              <p className="text-xs text-slate-500">
                Download unified ZIP bundles, individual markdown docs, Anki CSV decks, or printable clean PDF views.
              </p>
            </div>
          </div>

          {/* Toggle: Approved Only vs All */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:space-x-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setOnlyApproved(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center justify-center flex-1 ${
                onlyApproved
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved Only (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setOnlyApproved(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center justify-center flex-1 ${
                !onlyApproved
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Include All Items
            </button>
          </div>
        </div>

        {/* Primary ZIP & Print Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main ZIP Download */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sky-900 font-bold mb-1">
                <FileArchive className="w-5 h-5 text-sky-600" />
                <span>Complete Curriculum ZIP Bundle</span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Contains all 7 files: <code className="text-sky-800">lesson-plan.md</code>, <code className="text-sky-800">rubric.md</code>, <code className="text-sky-800">flashcards.md</code>, <code className="text-sky-800">flashcards.csv</code> (Anki), <code className="text-sky-800">quiz-bank.md</code>, <code className="text-sky-800">package.json</code>, and <code className="text-sky-800">print.html</code>.
              </p>
            </div>

            <button
              type="button"
              disabled={isZipping}
              onClick={handleDownloadZip}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Assembling ZIP Package...' : 'Download Full ZIP Bundle (.zip)'}</span>
            </button>
          </div>

          {/* Clean Print / PDF View */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-slate-900 font-bold mb-1">
                <Printer className="w-5 h-5 text-slate-700" />
                <span>Print & Save as Clean PDF</span>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Renders a print-optimized document view with page breaks between artifacts, standard academic typography, and zero UI chrome.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenPrintView}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Open Print / PDF Preview</span>
            </button>
          </div>
        </div>

        {/* Individual File Downloads */}
        <div className="mt-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Download Individual Artifact Files
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'lesson-plan.md', label: 'Lesson Plan Markdown', icon: FileText },
              { name: 'rubric.md', label: 'Rubric Markdown', icon: Table },
              { name: 'flashcards.md', label: 'Flashcards Markdown', icon: Layers },
              { name: 'flashcards.csv', label: 'Flashcards CSV (Anki Deck)', icon: FileSpreadsheet },
              { name: 'quiz-bank.md', label: 'Quiz Bank Markdown', icon: HelpCircle },
              { name: 'package.json', label: 'Full Package Data (JSON)', icon: Code },
              { name: 'print.html', label: 'Standalone Print HTML', icon: Globe }
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.name}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-sky-300 transition shadow-2xs"
                >
                  <div className="flex items-center space-x-2.5 truncate mr-2">
                    <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400">{f.label}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(f.name)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition shrink-0"
                    title={`Download ${f.name}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
