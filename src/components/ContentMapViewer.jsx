import React, { useState } from 'react';
import { Map, Plus, Trash2, Edit3, Check, RefreshCw, BookOpen, Tag, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { BLOOM_LEVELS, BLOOM_COLORS } from '../config.js';

export default function ContentMapViewer({
  contentMap,
  setContentMap,
  onProceed,
  onRegenerate,
  isLoading,
  error = null,
  onBackToSettings
}) {
  const [editingLoId, setEditingLoId] = useState(null);
  const [newLo, setNewLo] = useState({
    id: '',
    description: '',
    bloom_level: 'Apply',
    source_section: ''
  });
  const [showAddLo, setShowAddLo] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-14 text-center shadow-sm space-y-5 animate-pulse">
        <div className="w-14 h-14 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900">Synthesizing Single Source of Truth Content Map...</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Extracting pedagogical hierarchy, Bloom-aligned learning objectives (LO1...LOk), key concepts, prerequisites, and section citations into an invariant curriculum boundary.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 text-xs text-sky-700 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          <span>Processing document content with LLM engine...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Content Map Synthesis Failed</h3>
          <p className="text-xs sm:text-sm text-rose-600 max-w-md mx-auto">{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          {onBackToSettings && (
            <button
              type="button"
              onClick={onBackToSettings}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Settings</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRegenerate}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Synthesis</span>
          </button>
        </div>
      </div>
    );
  }

  if (!contentMap) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-4">
        <p className="text-sm text-slate-600">No Content Map found. Please run the generation step.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onBackToSettings && (
            <button
              type="button"
              onClick={onBackToSettings}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              &larr; Back to Settings
            </button>
          )}
          <button
            type="button"
            onClick={onRegenerate}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition"
          >
            Generate Content Map &rarr;
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateLo = (id, field, value) => {
    setContentMap((prev) => ({
      ...prev,
      learning_objectives: prev.learning_objectives.map((lo) =>
        lo.id === id ? { ...lo, [field]: value } : lo
      )
    }));
  };

  const handleDeleteLo = (id) => {
    setContentMap((prev) => ({
      ...prev,
      learning_objectives: prev.learning_objectives.filter((lo) => lo.id !== id)
    }));
  };

  const handleAddLo = () => {
    if (!newLo.description.trim()) return;
    const nextId = newLo.id.trim() || `LO${(contentMap.learning_objectives?.length || 0) + 1}`;
    setContentMap((prev) => ({
      ...prev,
      learning_objectives: [
        ...(prev.learning_objectives || []),
        { ...newLo, id: nextId }
      ]
    }));
    setNewLo({ id: '', description: '', bloom_level: 'Apply', source_section: '' });
    setShowAddLo(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {contentMap.document_title || 'Curriculum Content Map'}
                </h2>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase">
                  {contentMap.detected_type?.replace('_', ' ') || 'Curriculum'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Single Source of Truth: All 4 artifact generators synthesize from this mapped structure.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze Source</span>
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Executive Summary
          </h4>
          <textarea
            value={contentMap.summary || ''}
            onChange={(e) =>
              setContentMap((prev) => ({ ...prev, summary: e.target.value }))
            }
            rows={2}
            className="w-full text-xs font-normal text-slate-700 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Topics & Prerequisites Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topics Tag Cloud */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-sky-600" />
              <span>Core Topics</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(contentMap.topics || []).map((topic, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs bg-white text-slate-700 border border-slate-200 rounded-md font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Prerequisites</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              {(contentMap.prerequisites || []).map((prereq, i) => (
                <li key={i}>{prereq}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Concepts Grid */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Grounded Key Concepts ({contentMap.key_concepts?.length || 0})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(contentMap.key_concepts || []).map((kc, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:border-sky-300 transition text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>{kc.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {kc.source_section}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{kc.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Objectives Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Learning Objectives (Single Source of Truth)
            </h3>
            <p className="text-xs text-slate-500">
              Each objective carries a permanent ID (LO1, LO2) and a Bloom's level. Downstream generators will bind to these IDs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddLo(!showAddLo)}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Objective</span>
          </button>
        </div>

        {/* Add Objective Inline Box */}
        {showAddLo && (
          <div className="mt-4 p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
            <h5 className="text-xs font-bold text-sky-900">Add New Learning Objective</h5>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <input
                type="text"
                placeholder="ID (e.g. LO5)"
                value={newLo.id}
                onChange={(e) => setNewLo({ ...newLo, id: e.target.value })}
                className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Actionable outcome starting with a Bloom's verb..."
                value={newLo.description}
                onChange={(e) => setNewLo({ ...newLo, description: e.target.value })}
                className="sm:col-span-5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
              <select
                value={newLo.bloom_level}
                onChange={(e) => setNewLo({ ...newLo, bloom_level: e.target.value })}
                className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-medium"
              >
                {BLOOM_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Source section..."
                value={newLo.source_section}
                onChange={(e) => setNewLo({ ...newLo, source_section: e.target.value })}
                className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddLo}
                className="sm:col-span-1 px-3 py-1.5 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Objectives Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-16">ID</th>
                <th className="py-2.5 px-3 w-28">Bloom Level</th>
                <th className="py-2.5 px-3">Objective Description</th>
                <th className="py-2.5 px-3 w-40">Source Section</th>
                <th className="py-2.5 px-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(contentMap.learning_objectives || []).map((lo) => {
                const color = BLOOM_COLORS[lo.bloom_level] || BLOOM_COLORS.Understand;
                const isEditing = editingLoId === lo.id;

                return (
                  <tr key={lo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {lo.id}
                    </td>

                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <select
                          value={lo.bloom_level}
                          onChange={(e) => handleUpdateLo(lo.id, 'bloom_level', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        >
                          {BLOOM_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] border ${color.bg} ${color.text} ${color.border}`}
                        >
                          {lo.bloom_level}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {isEditing ? (
                        <textarea
                          value={lo.description}
                          onChange={(e) => handleUpdateLo(lo.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full p-1.5 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        lo.description
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={lo.source_section}
                          onChange={(e) => handleUpdateLo(lo.id, 'source_section', e.target.value)}
                          className="w-full p-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        lo.source_section || 'N/A'
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => setEditingLoId(isEditing ? null : lo.id)}
                        className="p-1 text-slate-400 hover:text-sky-600 rounded transition"
                        title={isEditing ? 'Save' : 'Edit'}
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLo(lo.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Proceed Footer */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2 text-xs text-slate-500 justify-center sm:justify-start">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {contentMap.learning_objectives?.length || 0} Learning Objectives ready for multi-artifact synthesis
          </span>
        </div>

        <button
          type="button"
          onClick={onProceed}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center space-x-2"
        >
          <span>Confirm Content Map & Generate Artifacts</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
