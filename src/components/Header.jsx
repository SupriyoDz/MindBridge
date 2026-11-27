import React from 'react';
import { Sparkles, RotateCcw, BookOpen, Layers } from 'lucide-react';

export default function Header({
  onReset,
  onNavigateHome,
  onNavigateWorkspace,
  showLanding = false,
  hasActiveWork = false
}) {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Title (Clickable, navigates home) */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center space-x-2 sm:space-x-3 text-left focus:outline-none group transition-opacity hover:opacity-95 shrink-0"
          title="Return to Home Landing & Guide"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-sm sm:text-lg text-slate-900 tracking-tight truncate">
                MindBridge
              </span>
              <span className="hidden md:inline-block bg-sky-100 text-sky-800 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                Academic AI Studio
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden lg:block truncate">
              Teaching-Content-to-Review-Ready Artifact Generator
            </p>
          </div>
        </button>

        {/* Center/Right Navigation Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Navigation Pill Group */}
          <nav className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200/80">
            {/* Home / Guide Button */}
            <button
              type="button"
              onClick={onNavigateHome}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all ${showLanding
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              title="View introduction and 6-step workflow guide"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:hidden">Home</span>
              <span className="hidden sm:inline">Home / Guide</span>
            </button>

            {/* Workspace Button */}
            <button
              type="button"
              onClick={onNavigateWorkspace}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg transition-all relative ${!showLanding
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              title="Open or return to the MindBridge generation workspace"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Workspace</span>
              {hasActiveWork && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"
                  title="Active session in progress"
                />
              )}
            </button>
          </nav>

          {/* Reset Workspace Button */}
          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors shrink-0"
            title="Reset workspace and start new document"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
