import React from 'react';
import { FileText, Sliders, Map, Cpu, CheckSquare, Download, ChevronRight } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Upload & Parse', shortTitle: 'Upload', icon: FileText, desc: 'Raw teaching material' },
  { id: 2, title: 'Teacher Settings', shortTitle: 'Settings', icon: Sliders, desc: 'Difficulty & duration' },
  { id: 3, title: 'Content Map', shortTitle: 'Content Map', icon: Map, desc: 'Single source of truth' },
  { id: 4, title: 'Generate', shortTitle: 'Generate', icon: Cpu, desc: 'Parallel synthesis' },
  { id: 5, title: 'Review & Calibrate', shortTitle: 'Review', icon: CheckSquare, desc: 'Bloom alignment' },
  { id: 6, title: 'Export Package', shortTitle: 'Export', icon: Download, desc: 'ZIP, CSV, Print' },
];

export default function Stepper({ currentStep, setStep, maxCompletedStep }) {
  const currentStepData = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const progressPercent = Math.round((currentStep / STEPS.length) * 100);

  return (
    <nav className="no-print bg-white border-b border-slate-200 py-2 sm:py-3 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile View (< sm): Compact Step Status + Progress Bar + Step Pills */}
        <div className="block sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate">
              <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full text-[10px]">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="font-bold text-slate-800 truncate">{currentStepData.title}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
              {progressPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Step Tap Circles */}
          <div className="flex items-center justify-between pt-1">
            {STEPS.map((step) => {
              const isCurrent = currentStep === step.id;
              const isCompleted = step.id < currentStep || step.id <= maxCompletedStep;
              const isClickable = step.id <= maxCompletedStep + 1;

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setStep(step.id)}
                  aria-label={`Step ${step.id}: ${step.title}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${isCurrent
                    ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-xs'
                    : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isClickable
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                >
                  {step.id}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tablet and Desktop View (>= sm): Full Stepper */}
        <ol className="hidden sm:flex items-center justify-between w-full overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.id;
            const isCompleted = step.id < currentStep || step.id <= maxCompletedStep;
            const isClickable = step.id <= maxCompletedStep + 1;

            return (
              <li
                key={step.id}
                className={`flex items-center flex-1 min-w-0 ${idx !== STEPS.length - 1 ? 'pr-2' : ''
                  }`}
              >
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setStep(step.id)}
                  className={`group flex items-center space-x-2 text-left w-full transition-opacity min-w-0 ${!isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${isCurrent
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-300'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="hidden lg:block truncate min-w-0">
                    <p
                      className={`text-xs font-bold leading-tight truncate ${isCurrent
                        ? 'text-sky-900'
                        : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-500'
                        }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
                  </div>

                  {/* Medium screen label */}
                  <div className="hidden md:block lg:hidden truncate min-w-0">
                    <p
                      className={`text-[11px] font-bold leading-tight truncate ${isCurrent
                        ? 'text-sky-900'
                        : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-500'
                        }`}
                    >
                      {step.shortTitle}
                    </p>
                  </div>
                </button>

                {idx !== STEPS.length - 1 && (
                  <div className="hidden md:block w-4 lg:w-8 border-t border-slate-200 mx-1 lg:mx-2 shrink-0" />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
