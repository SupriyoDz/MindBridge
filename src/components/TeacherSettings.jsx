import React from 'react';
import { Sliders, Clock, HelpCircle, Globe, Users, Target, BookOpen } from 'lucide-react';
import { DIFFICULTY_PROFILES } from '../config.js';

export default function TeacherSettings({
  settings,
  setSettings,
  onProceed,
  onBack,
  isLoading = false
}) {
  const currentProfile = DIFFICULTY_PROFILES[settings.difficulty] || DIFFICULTY_PROFILES.Introductory;

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Teacher Pedagogical Configuration</h2>
            <p className="text-xs text-slate-500">
              Set instructional boundaries, Bloom's distribution targets, and classroom constraints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Document Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>Document Type</span>
            </label>
            <select
              value={settings.documentType}
              onChange={(e) => handleChange('documentType', e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            >
              <option value="auto">Auto-Detect Document Structure</option>
              <option value="lecture_notes">Lecture Notes (Concept Synthesis & Practice)</option>
              <option value="syllabus">Syllabus (Course-Level Competencies)</option>
              <option value="textbook_chapter">Textbook Chapter (Section-Level Procedures)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {settings.documentType === 'syllabus'
                ? 'Calibrates for broad, overarching modular learning outcomes.'
                : settings.documentType === 'textbook_chapter'
                ? 'Calibrates for granular procedural mechanics and step-by-step principles.'
                : 'Calibrates for core comprehension and active recall.'}
            </p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-sky-600" />
              <span>Difficulty & Bloom's Target</span>
            </label>
            <select
              value={settings.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            >
              <option value="Introductory">Introductory (Remember 35%, Understand 35%, Apply 30%)</option>
              <option value="Intermediate">Intermediate (Apply 45%, Analyze 30%, Understand 15%)</option>
              <option value="Advanced">Advanced (Analyze 35%, Evaluate 25%, Create 20%)</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Controls prompt calibration constraints and post-generation drift verification.
            </p>
          </div>

          {/* Class Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>Class Duration (Minutes)</span>
            </label>
            <input
              type="number"
              min={15}
              max={240}
              step={5}
              value={settings.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value) || 50)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The lesson plan timeline phases will sum strictly to this exact minute count.
            </p>
          </div>

          {/* Quiz Items Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Quiz Bank Item Count</span>
            </label>
            <input
              type="number"
              min={3}
              max={20}
              value={settings.quizItemCount}
              onChange={(e) => handleChange('quizItemCount', parseInt(e.target.value) || 8)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Number of assessment items generated with distractor misconception rationales.
            </p>
          </div>

          {/* Audience / Grade Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Target Audience / Level</span>
            </label>
            <input
              type="text"
              value={settings.audience}
              onChange={(e) => handleChange('audience', e.target.value)}
              placeholder="e.g. Undergraduate Computer Science, High School AP, Professional"
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Used to tune linguistic tone, worked examples, and cognitive scaffolding.
            </p>
          </div>

          {/* Output Language */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>Output Language</span>
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Hindi">Hindi</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              All generated rubrics, plans, questions, and rationales will be in this language.
            </p>
          </div>
        </div>

        {/* Dynamic Pedagogical Summary Card */}
        <div className="mt-6 p-4 bg-sky-50/70 border border-sky-200/80 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-sky-600 text-white rounded-lg shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                Active Pedagogical Profile: {settings.difficulty}
              </p>
              <p className="text-xs text-sky-900 mt-0.5">
                {currentProfile.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                {Object.entries(currentProfile.targets)
                  .filter(([_, pct]) => pct > 0)
                  .map(([lvl, pct]) => (
                    <span
                      key={lvl}
                      className="px-2 py-0.5 bg-white border border-sky-300 text-sky-800 rounded font-semibold"
                    >
                      {lvl}: {pct}%
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition text-center justify-center flex items-center"
        >
          &larr; Back to Upload
        </button>

        <button
          type="button"
          onClick={onProceed}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl shadow-md shadow-sky-600/20 transition text-center justify-center flex items-center space-x-2 disabled:opacity-75"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Content Map...</span>
            </>
          ) : (
            <>
              <span>Generate Content Map</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
