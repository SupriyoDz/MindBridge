import React from 'react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Brain,
  Layers,
  Clock,
  CheckSquare,
  FileText,
  HelpCircle,
  BarChart3,
  Sliders,
  Download,
  Target,
  Workflow,
  Cpu,
  GraduationCap,
  Play
} from 'lucide-react';

export default function HomeLandingView({
  onGetStarted,
  onLoadSampleAndStart,
  hasActiveWork = false
}) {
  return (
    <div className="space-y-16 py-4 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-sky-50/40 to-indigo-50/30 border border-slate-200/80 shadow-sm p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-200/80 text-sky-800 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Academic AI Studio &bull; Bloom&apos;s Taxonomy Calibrated &bull; Model-Agnostic</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Transform Raw Teaching Materials into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
              Review-Ready Academic Artifacts
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            MindBridge ingests messy lecture notes, syllabi, and textbook chapters, synthesizing an authoritative{' '}
            <strong className="font-semibold text-slate-800">Single Source of Truth (SSOT) Content Map</strong>.
            It concurrently generates time-budgeted lesson plans, assessment rubrics, active recall flashcards, and diagnostic quiz banks with empirical Bloom&apos;s cognitive alignment.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-base font-bold rounded-2xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all flex items-center justify-center space-x-3 group"
            >
              <span>{hasActiveWork ? 'Resume Current Workspace' : 'Get Started in Studio'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {hasActiveWork && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                Active session in progress (data preserved)
              </span>
            )}
          </div>

          {/* Quick-Start Sample Loaders */}
          <div className="pt-4 border-t border-slate-200/60 max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Or Explore with Preloaded Academic Datasets (Instant 1-Click Launch)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLoadSampleAndStart('messyLectureNotes')}
                className="flex items-center space-x-3 p-3 bg-white/90 hover:bg-white text-left border border-slate-200 hover:border-sky-300 rounded-xl shadow-xs hover:shadow transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Distributed Consensus: Raft vs Paxos</p>
                  <p className="text-[11px] text-slate-500 truncate">CS 452 Lecture Notes &bull; 50 min &bull; Intermediate</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onLoadSampleAndStart('shortSyllabus')}
                className="flex items-center space-x-3 p-3 bg-white/90 hover:bg-white text-left border border-slate-200 hover:border-indigo-300 rounded-xl shadow-xs hover:shadow transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">CS 210 Data Structures &amp; Algorithms</p>
                  <p className="text-[11px] text-slate-500 truncate">Full Course Syllabus &bull; Modular CLOs</p>
                </div>
              </button>
            </div>
          </div>

          {/* Architecture Pill Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center space-x-1.5 text-xs text-slate-600 bg-white/80 border border-slate-200 px-3 py-1 rounded-full font-medium shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSOT Zero-Hallucination</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 text-xs text-slate-600 bg-white/80 border border-slate-200 px-3 py-1 rounded-full font-medium shadow-xs">
              <Target className="w-3.5 h-3.5 text-sky-600" />
              <span>Empirical Bloom&apos;s Drift Guard (&le; 15%)</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 text-xs text-slate-600 bg-white/80 border border-slate-200 px-3 py-1 rounded-full font-medium shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Universal Model-Agnostic LLM Engine</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 text-xs text-slate-600 bg-white/80 border border-slate-200 px-3 py-1 rounded-full font-medium shadow-xs">
              <LockIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>100% Client-Side Privacy</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE 4 SYNCHRONIZED ARTIFACTS SECTION */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-3 py-0.5 rounded-full">
            <Layers className="w-3 h-3" />
            <span>Harmonized Academic Output</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Synchronized Artifacts. Zero Cross-Document Contradiction.
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Unlike siloed AI prompts that hallucinate mismatched objectives, MindBridge guarantees that every artifact references the exact same indexed Learning Objectives (LO1, LO2...).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Artifact 1: Lesson Plan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Lesson Plan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Time-budgeted instructional timeline summing strictly to the configured class duration (15–240 min). Structured into distinct pedagogical phases: Introduction, Direct Instruction, Guided Application, Formative Checks, and Synthesis.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Specifications:</span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Teacher &amp; student actions</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Formative assessment checkpoints</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Struggling &amp; advanced differentiation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Artifact 2: Assessment Rubric */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Assessment Rubric</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Criterion-referenced evaluation matrix featuring 4 standardized proficiency levels: Exemplary, Proficient, Developing, and Beginning with concrete, observable performance descriptors.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Specifications:</span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Exact 4-tier performance scale</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Criterion weights mapped to LOs</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Excludes subjective adjectives</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Artifact 3: Active Recall Flashcards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Active Flashcards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Atomic prompt-and-answer pairs designed specifically for spaced repetition and retrieval practice. Each card is tagged with its cognitive Bloom level, difficulty tier, and source section citations.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Specifications:</span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Atomic front/back prompts</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Anki CSV compatibility (`Front,Back,Tags`)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Bloom cognitive tagging</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Artifact 4: Quiz Bank */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Diagnostic Quiz Bank</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Balanced mix of multiple-choice and short-answer diagnostic items. Every distractor in multiple-choice questions includes an explicit rationale detailing the exact pedagogical misconception it tests.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Key Specifications:</span>
              <ul className="text-xs text-slate-700 space-y-1">
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Distractor misconception rationales</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Short-answer model responses</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Tagged to specific LO IDs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP WORKFLOW GUIDE */}
      <section className="space-y-8 bg-slate-100/70 border border-slate-200 rounded-3xl p-8 sm:p-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
            <Workflow className="w-3 h-3" />
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How MindBridge Works: 6-Step Instructional Guide
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Follow this streamlined workflow to convert raw teaching documents into certified curriculum packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center">1</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 1</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Upload &amp; Parse Document</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Upload PDF, Markdown, or plaintext lecture notes (or paste directly). Text is parsed client-side using WebAssembly PDF extractors with automatic empty/scanned guardrails and heading-aware chunking for long texts.
            </p>
            <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 font-medium">
              Action: Drop file or select a preloaded sample (Raft / CS 210).
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center">2</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 2</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Configure Pedagogical Settings</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Define your classroom boundaries: target audience, classroom duration (15–240 minutes), question count, and Bloom&apos;s Target Difficulty Profile: Introductory (Remember/Understand), Intermediate (Apply/Analyze), or Advanced (Analyze/Evaluate/Create).
            </p>
            <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 font-medium">
              Action: Choose duration and target Bloom difficulty tier.
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center">3</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 3</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Synthesize Content Map (SSOT)</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              The engine analyzes your document once to generate the Single Source of Truth: topics, grounded key concepts, definitions, prerequisites, and indexed Learning Objectives (LO1, LO2...). You can edit or add LOs before generating artifacts.
            </p>
            <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 font-medium">
              Action: Inspect, refine, or add custom Learning Objectives.
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center">4</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 4</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Parallel Multi-Artifact Generation</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Four specialized generators concurrently synthesize the Lesson Plan, Rubric, Flashcards, and Quiz Bank bound strictly to the Content Map. Strict JSON schema mode prevents hallucinated commentary and ensures perfect structure.
            </p>
            <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 font-medium">
              Action: Monitor parallel async generation with live progress bars.
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center">5</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 5</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Review Studio &amp; Bloom&apos;s Calibrator</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Review generated assets across dedicated tabs. View the Recharts cognitive distribution chart. If cognitive drift &gt; 15%, trigger 1-click targeted recalibration. Approve/reject items, adjust difficulty (&quot;Make Harder/Easier&quot;), and verify the LO Coverage Matrix.
            </p>
            <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 font-medium">
              Action: Verify Bloom alignment, approve items, tune difficulty.
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative">
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-sm flex items-center justify-center">6</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Step 6</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">Packaging &amp; Multi-Format Export</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Download a complete curriculum archive in one click: Markdown files, Anki-ready CSV flashcard decks, machine-readable package.json with metadata, and clean printable HTML with professional academic print stylesheets.
            </p>
            <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 font-medium">
              Action: Download unified ZIP bundle or trigger clean PDF print.
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE ARCHITECTURAL HIGHLIGHTS GRID */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
            <Cpu className="w-3 h-3" />
            <span>Technical Differentiators</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Academic Rigor and Cognitive Fidelity
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Why MindBridge outperforms generic AI chat interfaces for academic course preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: SSOT Zero Hallucination */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-sky-300 transition-colors space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Single Source of Truth (SSOT) Architecture</h3>
                <span className="text-[11px] font-semibold text-sky-600">Zero Cross-Artifact Hallucinations</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard LLM prompting generates lesson plans, rubrics, and quizzes independently, inevitably producing contradictory learning objectives and ungrounded grading criteria. MindBridge solves this fundamentally by extracting an authoritative, teacher-editable Content Map first. Every generator accepts this Content Map as an invariant schema boundary.
            </p>
          </div>

          {/* Card 2: Bloom's Calibrator & Drift Guard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 transition-colors space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bloom&apos;s Calibrator &amp; Drift Guard</h3>
                <span className="text-[11px] font-semibold text-indigo-600">15% Empirical Threshold &bull; 1-Click Recalibrate</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The calibrator telemetry engine scans every question, flashcard, and rubric criterion, computing an empirical distribution across Bloom&apos;s 6 cognitive levels. If deviation from the instructor&apos;s configured profile exceeds 15 percentage points (&Delta; &gt; 15%), the system alerts the instructor and offers 1-click targeted cognitive restructuring to realign the artifacts.
            </p>
          </div>

          {/* Card 3: Teacher-in-the-Loop Review Studio */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-emerald-300 transition-colors space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Teacher-in-the-Loop Review Studio</h3>
                <span className="text-[11px] font-semibold text-emerald-600">Granular Approvals &bull; Coverage Matrix &bull; Difficulty Tuning</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              AI serves as the assistant, while the teacher retains ultimate pedagogical authority. Instructors can mark any item as Approved, Needs Edit, or Rejected; tune individual item difficulty with instantaneous &quot;Make Harder&quot; or &quot;Make Easier&quot; actions; and inspect the Learning Objective Coverage Matrix to detect and automatically fill any curriculum blind spots.
            </p>
          </div>

          {/* Card 4: Universal Model-Agnostic Engine */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-amber-300 transition-colors space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Universal Model-Agnostic LLM Engine</h3>
                <span className="text-[11px] font-semibold text-amber-600">OpenAI &bull; Gemini &bull; Claude &bull; Groq &bull; Ollama Local</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never locked into a single AI vendor. Seamlessly connect to Google Gemini, OpenAI (GPT-4o), Anthropic Claude, Groq, DeepSeek, OpenRouter, or private local endpoints running Ollama and LM Studio. Includes automatic JSON Schema translation, exponential backoff retries, and fallback chains for enterprise resilience.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CALL-TO-ACTION */}
      <section className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 text-sky-200 text-xs font-semibold px-3.5 py-1 rounded-full backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Ready for Review-Ready Curriculum Generation</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Elevate Your Course Materials in Under 2 Minutes
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminate hours of manual lesson planning, rubric drafting, and question authoring. Experience mathematically aligned, cognitive-depth calibrated academic artifact synthesis.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>{hasActiveWork ? 'Return to Workspace' : 'Get Started Now — Free & Privacy-First'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onLoadSampleAndStart('messyLectureNotes')}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-semibold rounded-2xl border border-white/20 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current text-sky-400" />
              <span>Try Raft vs Paxos Sample</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            No registration required &bull; 100% Client-side document processing &bull; Bring your own API key or use local Ollama
          </p>
        </div>
      </section>
    </div>
  );
}

// Inline fallback lock icon in case LockIcon is named ShieldCheck/Lock in lucide
function LockIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
