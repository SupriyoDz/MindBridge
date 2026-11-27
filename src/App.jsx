import React, { useState, useMemo } from 'react';
import Header from './components/Header.jsx';
import Stepper from './components/Stepper.jsx';
import HomeLandingView from './components/HomeLandingView.jsx';
import DocumentUploader from './components/DocumentUploader.jsx';
import TeacherSettings from './components/TeacherSettings.jsx';
import ContentMapViewer from './components/ContentMapViewer.jsx';
import GenerationProgress from './components/GenerationProgress.jsx';
import CalibratorDashboard from './components/CalibratorDashboard.jsx';
import ReviewStudio from './components/ReviewStudio.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import PrintView from './components/PrintView.jsx';

import {
  generateContentMap,
  generateLessonPlan,
  generateRubric,
  generateFlashcards,
  generateQuizBank,
  recalibrateArtifact,
  adjustItemDifficulty,
  generateMissingItemForObjective,
  summarizeTextChunk,
  getLLMConfig
} from './services/geminiService.js';
import { chunkDocumentByHeadings, countWords } from './services/chunkingService.js';
import { DIFFICULTY_PROFILES, SAMPLE_DOCUMENTS } from './config.js';
import {
  analyzeBloomAlignment,
  computeBloomDistribution,
  extractAllBloomItems
} from './services/calibratorService.js';

export default function App() {
  // Global & API State
  const [llmConfig] = useState(() => getLLMConfig());
  const [showLanding, setShowLanding] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState(1);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Document State
  const [documentTitle, setDocumentTitle] = useState('Consensus Algorithms');
  const [documentText, setDocumentText] = useState('');

  // Teacher Settings State
  const [teacherSettings, setTeacherSettings] = useState({
    documentType: 'auto',
    difficulty: 'Intermediate',
    durationMinutes: 50,
    quizItemCount: 8,
    flashcardCount: 10,
    audience: 'Undergraduate Computer Science',
    language: 'English'
  });

  // Content Map State (Single Source of Truth)
  const [contentMap, setContentMap] = useState(null);
  const [isGeneratingContentMap, setIsGeneratingContentMap] = useState(false);
  const [contentMapError, setContentMapError] = useState(null);

  // Generated Artifacts State
  const [lessonPlan, setLessonPlan] = useState(null);
  const [rubric, setRubric] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [quizBank, setQuizBank] = useState(null);

  // Generation status tracking per artifact
  const [generatorStatuses, setGeneratorStatuses] = useState({
    lessonPlan: { status: 'pending', error: null },
    rubric: { status: 'pending', error: null },
    flashcards: { status: 'pending', error: null },
    quizBank: { status: 'pending', error: null }
  });

  // Review Approvals: { [id]: 'approved' | 'needs_edit' | 'rejected' }
  const [approvals, setApprovals] = useState({});
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // Check if all artifacts are completed
  const allCompleted =
    generatorStatuses.lessonPlan.status === 'success' &&
    generatorStatuses.rubric.status === 'success' &&
    generatorStatuses.flashcards.status === 'success' &&
    generatorStatuses.quizBank.status === 'success';

  // Step 3 Handler: Generate Content Map
  const handleGenerateContentMap = async () => {
    // Jump immediately to the Content Map screen (Step 3)
    setCurrentStep(3);
    setMaxCompletedStep((prev) => Math.max(prev, 3));
    setIsGeneratingContentMap(true);
    setContentMapError(null);

    try {
      let textForAnalysis = documentText;
      const words = countWords(documentText);

      // If text > 1500 words, chunk and summarize chunks before analysis
      if (words > 1500) {
        const chunks = chunkDocumentByHeadings(documentText, 1500);
        const summaries = [];
        for (let i = 0; i < chunks.length; i++) {
          const summary = await summarizeTextChunk(chunks[i], i, chunks.length, llmConfig);
          summaries.push(`### Section Chunk ${i + 1}\n${summary}`);
        }
        textForAnalysis = summaries.join('\n\n');
      }

      const map = await generateContentMap(textForAnalysis, teacherSettings, llmConfig);
      setContentMap(map);
    } catch (err) {
      console.error(err);
      setContentMapError(err.message || 'Check your LLM configuration and API Key.');
    } finally {
      setIsGeneratingContentMap(false);
    }
  };

  // Step 4 Handler: Run All 4 Generators in Parallel
  const handleRunAllGenerators = async () => {
    if (!contentMap) return;
    setCurrentStep(4);

    // Reset statuses
    setGeneratorStatuses({
      lessonPlan: { status: 'generating', error: null },
      rubric: { status: 'generating', error: null },
      flashcards: { status: 'generating', error: null },
      quizBank: { status: 'generating', error: null }
    });

    const runGen = async (key, genFn, setFn) => {
      try {
        const result = await genFn(contentMap, teacherSettings, llmConfig);
        setFn(result);
        setGeneratorStatuses((prev) => ({
          ...prev,
          [key]: { status: 'success', error: null }
        }));
      } catch (err) {
        console.error(`Error generating ${key}:`, err);
        // Automatic retry once
        try {
          console.log(`Auto-retrying ${key} once...`);
          const retryResult = await genFn(contentMap, teacherSettings, llmConfig);
          setFn(retryResult);
          setGeneratorStatuses((prev) => ({
            ...prev,
            [key]: { status: 'success', error: null }
          }));
        } catch (retryErr) {
          setGeneratorStatuses((prev) => ({
            ...prev,
            [key]: { status: 'error', error: retryErr.message || 'Failed' }
          }));
        }
      }
    };

    // Trigger all 4 in parallel
    await Promise.allSettled([
      runGen('lessonPlan', generateLessonPlan, setLessonPlan),
      runGen('rubric', generateRubric, setRubric),
      runGen('flashcards', generateFlashcards, setFlashcards),
      runGen('quizBank', generateQuizBank, setQuizBank)
    ]);

    setMaxCompletedStep((prev) => Math.max(prev, 4));
  };

  // Handler for Regenerating a single artifact
  const handleRegenerateSingle = async (key) => {
    setGeneratorStatuses((prev) => ({
      ...prev,
      [key]: { status: 'generating', error: null }
    }));

    try {
      let result;
      if (key === 'lessonPlan') {
        result = await generateLessonPlan(contentMap, teacherSettings, llmConfig);
        setLessonPlan(result);
      } else if (key === 'rubric') {
        result = await generateRubric(contentMap, teacherSettings, llmConfig);
        setRubric(result);
      } else if (key === 'flashcards') {
        result = await generateFlashcards(contentMap, teacherSettings, llmConfig);
        setFlashcards(result);
      } else if (key === 'quizBank') {
        result = await generateQuizBank(contentMap, teacherSettings, llmConfig);
        setQuizBank(result);
      }
      setGeneratorStatuses((prev) => ({
        ...prev,
        [key]: { status: 'success', error: null }
      }));
    } catch (err) {
      setGeneratorStatuses((prev) => ({
        ...prev,
        [key]: { status: 'error', error: err.message || 'Failed' }
      }));
    }
  };

  // Handler for Bloom's Recalibrate (Drift > 15%)
  const handleRecalibrateArtifact = async (artifactKey, driftDetails) => {
    setIsRecalibrating(true);
    try {
      const targetProfile = DIFFICULTY_PROFILES[teacherSettings.difficulty];
      let currentArt = null;
      if (artifactKey === 'quizBank') currentArt = quizBank;
      else if (artifactKey === 'flashcards') currentArt = flashcards;
      else if (artifactKey === 'lessonPlan') currentArt = lessonPlan;
      else if (artifactKey === 'rubric') currentArt = rubric;

      const corrected = await recalibrateArtifact({
        artifactType: artifactKey,
        currentArtifact: currentArt,
        contentMap,
        targetProfile,
        driftDetails,
        llmConfig
      });

      if (artifactKey === 'quizBank') setQuizBank(corrected);
      else if (artifactKey === 'flashcards') setFlashcards(corrected);
      else if (artifactKey === 'lessonPlan') setLessonPlan(corrected);
      else if (artifactKey === 'rubric') setRubric(corrected);

      alert(`Successfully recalibrated ${artifactKey} to align with ${teacherSettings.difficulty} Bloom's targets!`);
    } catch (err) {
      console.error(err);
      alert('Recalibration failed: ' + err.message);
    } finally {
      setIsRecalibrating(false);
    }
  };

  // Handler for Make Harder / Make Easier on individual items
  const handleMakeHarderOrEasier = async (artifactType, index, direction) => {
    try {
      const targetProfile = DIFFICULTY_PROFILES[teacherSettings.difficulty];
      if (artifactType === 'quizBank') {
        const item = quizBank.items[index];
        const updated = await adjustItemDifficulty({
          itemType: 'quiz question',
          item,
          direction,
          contentMap,
          targetProfile,
          llmConfig
        });
        const newItems = [...quizBank.items];
        newItems[index] = { ...item, ...updated };
        setQuizBank({ ...quizBank, items: newItems });
      } else if (artifactType === 'flashcards') {
        const item = flashcards.cards[index];
        const updated = await adjustItemDifficulty({
          itemType: 'flashcard',
          item,
          direction,
          contentMap,
          targetProfile,
          llmConfig
        });
        const newCards = [...flashcards.cards];
        newCards[index] = { ...item, ...updated };
        setFlashcards({ ...flashcards, cards: newCards });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to adjust item difficulty: ' + err.message);
    }
  };

  // Handler for Generating missing item for uncovered Learning Objective
  const handleGenerateMissingItem = async (objective, artifactType) => {
    try {
      const newItem = await generateMissingItemForObjective({
        objective,
        artifactType,
        contentMap,
        teacherSettings,
        llmConfig
      });

      if (artifactType === 'quizBank') {
        setQuizBank((prev) => ({
          ...prev,
          items: [...(prev.items || []), { ...newItem, id: `quiz_extra_${Date.now()}` }]
        }));
      } else if (artifactType === 'flashcards') {
        setFlashcards((prev) => ({
          ...prev,
          cards: [...(prev.cards || []), { ...newItem, id: `card_extra_${Date.now()}` }]
        }));
      }
      alert(`Generated new item mapped to objective ${objective.id}!`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate missing item: ' + err.message);
    }
  };

  // Reset workspace
  const handleReset = () => {
    if (window.confirm('Reset the workspace? All generated artifacts and state will be cleared.')) {
      setDocumentText('');
      setContentMap(null);
      setContentMapError(null);
      setIsGeneratingContentMap(false);
      setLessonPlan(null);
      setRubric(null);
      setFlashcards(null);
      setQuizBank(null);
      setApprovals({});
      setCurrentStep(1);
      setMaxCompletedStep(1);
    }
  };

  // Launch sample document and navigate into workspace
  const handleLaunchSample = (sampleKey) => {
    const sample = SAMPLE_DOCUMENTS[sampleKey];
    if (sample) {
      setDocumentTitle(sample.title);
      setDocumentText(sample.text);
      if (sample.type) {
        setTeacherSettings((prev) => ({
          ...prev,
          documentType: sample.type
        }));
      }
      setCurrentStep(1);
      setShowLanding(false);
    }
  };

  // Quality metrics calculation
  const qualityMetrics = useMemo(() => {
    const allItems = [];
    if (quizBank?.items) allItems.push(...quizBank.items);
    if (flashcards?.cards) allItems.push(...flashcards.cards);
    if (rubric?.criteria) allItems.push(...rubric.criteria);
    if (lessonPlan?.timeline) allItems.push(...lessonPlan.timeline);

    const itemsWithCitations = allItems.filter(
      (item) => item.source_section && item.source_section.trim().length > 0
    );
    const citationRate =
      allItems.length > 0 ? Math.round((itemsWithCitations.length / allItems.length) * 100) : 100;

    const los = contentMap?.learning_objectives || [];
    const coveredLos = los.filter((lo) => {
      const hasQuiz = (quizBank?.items || []).some((q) => q.mapped_objective_id === lo.id);
      const hasCard = (flashcards?.cards || []).some((c) => c.mapped_objective_id === lo.id);
      const hasRubric = (rubric?.criteria || []).some((r) => r.mapped_objective_id === lo.id);
      return hasQuiz || hasCard || hasRubric;
    });
    const loCoverage =
      los.length > 0 ? Math.round((coveredLos.length / los.length) * 100) : 100;

    const allBloomItems = extractAllBloomItems({ contentMap, lessonPlan, rubric, flashcards, quizBank });
    const { percentages } = computeBloomDistribution(allBloomItems);
    const alignment = analyzeBloomAlignment(percentages, teacherSettings.difficulty);

    return {
      jsonValidityRate: 100,
      sourceCitationRate: citationRate,
      loCoverageRate: loCoverage,
      bloomAlignmentScore: alignment.alignmentScore
    };
  }, [contentMap, lessonPlan, rubric, flashcards, quizBank, teacherSettings.difficulty]);

  // If Print Preview is active, render full-page print view
  if (isPrintPreviewOpen) {
    return (
      <PrintView
        contentMap={contentMap}
        lessonPlan={lessonPlan}
        rubric={rubric}
        flashcards={flashcards}
        quizBank={quizBank}
        teacherSettings={teacherSettings}
        approvals={approvals}
        onClose={() => setIsPrintPreviewOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header
        onReset={handleReset}
        onNavigateHome={() => setShowLanding(true)}
        onNavigateWorkspace={() => setShowLanding(false)}
        showLanding={showLanding}
        hasActiveWork={Boolean(documentText || contentMap)}
      />

      {showLanding ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <HomeLandingView
            onGetStarted={() => setShowLanding(false)}
            onLoadSampleAndStart={handleLaunchSample}
            hasActiveWork={Boolean(documentText || contentMap)}
          />
        </main>
      ) : (
        <>
          <Stepper
            currentStep={currentStep}
            setStep={setCurrentStep}
            maxCompletedStep={maxCompletedStep}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Step 1: Upload */}
        {currentStep === 1 && (
          <DocumentUploader
            documentText={documentText}
            setDocumentText={setDocumentText}
            documentTitle={documentTitle}
            setDocumentTitle={setDocumentTitle}
            teacherSettings={teacherSettings}
            setTeacherSettings={setTeacherSettings}
            onProceed={() => {
              setCurrentStep(2);
              setMaxCompletedStep((prev) => Math.max(prev, 2));
            }}
          />
        )}

        {/* Step 2: Settings */}
        {currentStep === 2 && (
          <TeacherSettings
            settings={teacherSettings}
            setSettings={setTeacherSettings}
            onProceed={handleGenerateContentMap}
            onBack={() => setCurrentStep(1)}
            isLoading={isGeneratingContentMap}
          />
        )}

        {/* Step 3: Content Map */}
        {currentStep === 3 && (
          <ContentMapViewer
            contentMap={contentMap}
            setContentMap={setContentMap}
            onProceed={handleRunAllGenerators}
            onRegenerate={handleGenerateContentMap}
            isLoading={isGeneratingContentMap}
            error={contentMapError}
            onBackToSettings={() => setCurrentStep(2)}
          />
        )}

        {/* Step 4: Multi-Artifact Generation */}
        {currentStep === 4 && (
          <GenerationProgress
            statuses={generatorStatuses}
            onRegenerateSingle={handleRegenerateSingle}
            allCompleted={allCompleted}
            onProceedToReview={() => {
              setCurrentStep(5);
              setMaxCompletedStep((prev) => Math.max(prev, 5));
            }}
          />
        )}

        {/* Step 5: Review & Calibrate */}
        {currentStep === 5 && (
          <div className="space-y-8">
            <CalibratorDashboard
              contentMap={contentMap}
              lessonPlan={lessonPlan}
              rubric={rubric}
              flashcards={flashcards}
              quizBank={quizBank}
              teacherSettings={teacherSettings}
              onRecalibrateArtifact={handleRecalibrateArtifact}
              isRecalibrating={isRecalibrating}
            />

            <ReviewStudio
              contentMap={contentMap}
              lessonPlan={lessonPlan}
              setLessonPlan={setLessonPlan}
              rubric={rubric}
              setRubric={setRubric}
              flashcards={flashcards}
              setFlashcards={setFlashcards}
              quizBank={quizBank}
              setQuizBank={setQuizBank}
              approvals={approvals}
              setApprovals={setApprovals}
              onMakeHarderOrEasier={handleMakeHarderOrEasier}
              onGenerateMissingItem={handleGenerateMissingItem}
              qualityMetrics={qualityMetrics}
            />

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition text-center border border-slate-200 sm:border-transparent hover:bg-slate-100"
              >
                &larr; Back to Content Map
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(6);
                  setMaxCompletedStep((prev) => Math.max(prev, 6));
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 transition flex items-center justify-center space-x-2"
              >
                <span>Proceed to Export Package</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Export Package */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <ExportPanel
              contentMap={contentMap}
              lessonPlan={lessonPlan}
              rubric={rubric}
              flashcards={flashcards}
              quizBank={quizBank}
              teacherSettings={teacherSettings}
              approvals={approvals}
              onOpenPrintView={() => setIsPrintPreviewOpen(true)}
            />

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition text-center border border-slate-200 sm:border-transparent hover:bg-slate-100"
              >
                &larr; Back to Review Studio
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )}
</div>
  );
}
