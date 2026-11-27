import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AlertCircle, CheckCircle2, RefreshCw, Activity, ArrowUpRight } from 'lucide-react';
import { analyzeBloomAlignment, computeBloomDistribution, extractAllBloomItems } from '../services/calibratorService.js';

export default function CalibratorDashboard({
  contentMap,
  lessonPlan,
  rubric,
  flashcards,
  quizBank,
  teacherSettings,
  onRecalibrateArtifact,
  isRecalibrating
}) {
  // Extract all bloom items across artifacts
  const allBloomItems = extractAllBloomItems({ contentMap, lessonPlan, rubric, flashcards, quizBank });
  const { percentages, counts, total } = computeBloomDistribution(allBloomItems);
  const alignment = analyzeBloomAlignment(percentages, teacherSettings.difficulty);

  // Prepare chart data for Recharts
  const chartData = alignment.comparisons.map((c) => ({
    name: c.level,
    Actual: c.actual,
    Target: c.target,
    Count: counts[c.level] || 0
  }));

  // Identify which artifact has the highest contribution to drift
  // Let's compute drift for flashcards and quiz bank specifically
  const fcItems = (flashcards?.cards || []).map((c) => ({ bloom_level: c.bloom_level }));
  const qbItems = (quizBank?.items || []).map((q) => ({ bloom_level: q.bloom_level }));

  const fcDist = computeBloomDistribution(fcItems);
  const qbDist = computeBloomDistribution(qbItems);

  const fcAlignment = analyzeBloomAlignment(fcDist.percentages, teacherSettings.difficulty);
  const qbAlignment = analyzeBloomAlignment(qbDist.percentages, teacherSettings.difficulty);

  const offendingArtifact =
    qbAlignment.maxDrift > fcAlignment.maxDrift ? 'quizBank' : 'flashcards';
  const offendingDrift = Math.max(qbAlignment.maxDrift, fcAlignment.maxDrift);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top Banner & Status Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Bloom's Taxonomy Calibration & Alignment Engine
              </h3>
              {alignment.status === 'PASS' ? (
                <span className="inline-flex self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PASS: Calibrated ({alignment.alignmentScore}%)</span>
                </span>
              ) : (
                <span className="inline-flex self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>WARN: Drift &gt; 15% (Max {alignment.maxDrift}%)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Profile: <strong>{teacherSettings.difficulty}</strong> ({alignment.targetProfile.description})
            </p>
          </div>
        </div>

        {/* Alignment Stats */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Items Analyzed</p>
            <p className="text-sm font-bold text-slate-800 font-mono">{total}</p>
          </div>
          <div className="text-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Max Taxonomy Drift</p>
            <p className={`text-sm font-bold font-mono ${alignment.maxDrift > 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
              &plusmn;{alignment.maxDrift}%
            </p>
          </div>
        </div>
      </div>

      {/* Recalibration Alert if Drift Exceeds 15% */}
      {alignment.status === 'WARN' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div>
            <p className="font-bold flex items-center space-x-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cognitive Level Drift Detected (&gt;15 percentage points)</span>
            </p>
            <p className="text-[11px] text-amber-800 mt-1">
              {alignment.driftedLevels
                .map((d) => `${d.level}: actual ${d.actual}% vs target ${d.target}% (${d.diff})`)
                .join(' • ')}
              . Offending artifact: <strong>{offendingArtifact === 'quizBank' ? 'Quiz Bank' : 'Flashcards'}</strong>.
            </p>
          </div>

          <button
            type="button"
            disabled={isRecalibrating}
            onClick={() => {
              const driftInfo = alignment.driftedLevels
                .map((d) => `${d.level}: target was ${d.target}%, actual was ${d.actual}% (${d.diff})`)
                .join('; ');
              onRecalibrateArtifact(offendingArtifact, driftInfo);
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm transition shrink-0 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
            <span>
              {isRecalibrating
                ? 'Recalibrating...'
                : `One-Click Recalibrate ${offendingArtifact === 'quizBank' ? 'Quiz Bank' : 'Flashcards'}`}
            </span>
          </button>
        </div>
      )}

      {/* Recharts Bar Chart: Actual vs Target Distribution */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Distribution Comparison: Actual Generated vs Pedagogical Target
        </h4>
        <div className="w-full h-64 bg-slate-50/50 p-2 rounded-xl border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis
                unit="%"
                domain={[0, 60]}
                tick={{ fontSize: 11, fill: '#475569' }}
              />
              <Tooltip
                formatter={(val, name) => [`${val}%`, name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="Actual" fill="#0284c7" radius={[4, 4, 0, 0]} name="Actual Empirical %" />
              <Bar dataKey="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Target Profile %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
