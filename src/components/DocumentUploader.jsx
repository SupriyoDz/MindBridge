import React, { useState, useRef } from 'react';
import { Upload, FileText, BookOpen, AlertTriangle, CheckCircle, FileCode, Layers } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService.js';
import { countWords, chunkDocumentByHeadings } from '../services/chunkingService.js';
import { SAMPLE_DOCUMENTS } from '../config.js';

export default function DocumentUploader({
  documentText,
  setDocumentText,
  documentTitle,
  setDocumentTitle,
  onProceed,
  teacherSettings,
  setTeacherSettings
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const words = countWords(documentText);
  const chunks = chunkDocumentByHeadings(documentText);
  const isLargeDoc = words > 1500;

  const handleFileProcess = async (file) => {
    setErrorMessage(null);
    setIsLoadingFile(true);

    try {
      const fileName = file.name;
      const lowerName = fileName.toLowerCase();
      setDocumentTitle(fileName.replace(/\.[^/.]+$/, ''));

      if (lowerName.endsWith('.pdf')) {
        const extracted = await extractTextFromPDF(file);
        setDocumentText(extracted);
      } else if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
        const text = await file.text();
        if (!text || text.trim().length === 0) {
          throw new Error('The selected text/markdown file is empty.');
        }
        setDocumentText(text);
      } else {
        throw new Error('Unsupported file format. Please upload a .pdf, .md, or .txt file.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to process file.');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sampleKey) => {
    const sample = SAMPLE_DOCUMENTS[sampleKey];
    if (sample) {
      setErrorMessage(null);
      setDocumentTitle(sample.title);
      setDocumentText(sample.text);
      if (sample.type && setTeacherSettings) {
        setTeacherSettings((prev) => ({
          ...prev,
          documentType: sample.type
        }));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Sample Loaders */}
      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <span>Ingest Raw Teaching Materials</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Upload lecture notes, a syllabus, or textbook chapters in PDF, Markdown, or plain text.
          </p>
        </div>

        {/* 2 Preloaded Samples */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Samples:
          </span>
          <button
            type="button"
            onClick={() => loadSample('messyLectureNotes')}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium bg-white hover:bg-sky-50 text-sky-800 border border-sky-200 rounded-lg shadow-xs transition flex items-center justify-center sm:justify-start space-x-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">Messy Lecture Notes (Raft/Paxos)</span>
          </button>
          <button
            type="button"
            onClick={() => loadSample('shortSyllabus')}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg shadow-xs transition flex items-center justify-center sm:justify-start space-x-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">Course Syllabus (Data Structures)</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3 text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Extraction Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Zone & Manual Paste Area Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drag & Drop Zone */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              isDragging
                ? 'border-sky-500 bg-sky-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              accept=".pdf,.txt,.md"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & drop document here, or <span className="text-sky-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports PDF (text-based), Markdown (.md), and TXT</p>
            {isLoadingFile && (
              <p className="text-xs font-semibold text-sky-600 mt-3 animate-pulse">
                Extracting text layer with pdf.js...
              </p>
            )}
          </div>

          {/* Document Stats & Chunking Indicators */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Document Word Count:</span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                {words.toLocaleString()} words
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Detected Chunks:</span>
              <span className="font-semibold text-slate-700 font-mono">
                {chunks.length} {chunks.length === 1 ? 'block' : 'blocks'}
              </span>
            </div>

            {isLargeDoc && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-amber-800">
                <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Long Document Optimization Active:</strong> Text exceeds 1,500 words. It will be modularized and summarized by section headings prior to analysis, preventing context saturation.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Paste & Live Text Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Text Preview & Paste Box
            </label>
            {documentText && (
              <button
                type="button"
                onClick={() => setDocumentText('')}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition"
              >
                Clear text
              </button>
            )}
          </div>

          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste syllabus, notes, or chapter text here directly..."
            rows={12}
            className="w-full flex-1 p-3 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed text-slate-800 resize-y"
          />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 text-center sm:text-left">
          {words > 0 ? (
            <span className="text-emerald-700 font-medium flex items-center justify-center sm:justify-start space-x-1">
              <CheckCircle className="w-4 h-4 inline shrink-0" />
              <span>Ready for pedagogical calibration ({words} words loaded)</span>
            </span>
          ) : (
            'Load a sample or upload a document to proceed'
          )}
        </div>

        <button
          type="button"
          disabled={!documentText || documentText.trim().length < 20}
          onClick={onProceed}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
        >
          <span>Next: Teacher Settings</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
