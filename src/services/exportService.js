// Export Service: Generates Markdown, Anki CSV, package.json, print HTML, and ZIP package
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Filter items according to approval status filter
 */
function filterApproved(items, approvals, onlyApproved) {
  if (!onlyApproved || !approvals) return items || [];
  return (items || []).filter((item) => {
    const status = approvals[item.id];
    return status === 'approved' || status === undefined; // default approved or explicitly approved
  });
}

/**
 * Generate Markdown for Lesson Plan
 */
export function generateLessonPlanMarkdown(lessonPlan, approvals, onlyApproved = false) {
  if (!lessonPlan) return '# Lesson Plan\n*Not generated yet.*';

  let md = `# ${lessonPlan.title || 'Lesson Plan'}\n\n`;
  md += `**Target Audience:** ${lessonPlan.target_audience || 'N/A'}  \n`;
  md += `**Duration:** ${lessonPlan.duration_minutes || 'N/A'} minutes  \n`;
  md += `**Difficulty Level:** ${lessonPlan.difficulty || 'N/A'}  \n`;
  if (lessonPlan.pedagogical_approach) {
    md += `**Pedagogical Approach:** ${lessonPlan.pedagogical_approach}  \n`;
  }
  md += `\n---\n\n`;

  md += `## Learning Objectives\n\n`;
  (lessonPlan.objectives || []).forEach((obj) => {
    md += `- **[${obj.id}]** (${obj.bloom_level}): ${obj.description}\n`;
  });
  md += `\n`;

  md += `## Timeline & Phases\n\n`;
  md += `| Duration | Phase | Description | Teacher Actions | Student Actions | Source Section |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  (lessonPlan.timeline || []).forEach((p) => {
    md += `| ${p.time_allocation_minutes} min | ${p.phase_name} | ${p.activity_description} | ${p.teacher_actions} | ${p.student_actions} | ${p.source_section || 'N/A'} |\n`;
  });
  md += `\n`;

  if (lessonPlan.materials && lessonPlan.materials.length > 0) {
    md += `## Materials & Resources\n\n`;
    lessonPlan.materials.forEach((m) => {
      md += `- ${m}\n`;
    });
    md += `\n`;
  }

  if (lessonPlan.formative_checks && lessonPlan.formative_checks.length > 0) {
    md += `## Formative Assessments & Checks for Understanding\n\n`;
    lessonPlan.formative_checks.forEach((fc) => {
      md += `### ${fc.check_name} (${fc.check_type})\n`;
      md += `${fc.description}\n`;
      md += `*Source Section: ${fc.source_section || 'N/A'}*\n\n`;
    });
  }

  if (lessonPlan.differentiation_notes) {
    md += `## Differentiation & Scaffolding\n\n`;
    md += `- **For Struggling Students:** ${lessonPlan.differentiation_notes.for_struggling_students}\n`;
    md += `- **For Advanced Students:** ${lessonPlan.differentiation_notes.for_advanced_students}\n\n`;
  }

  return md;
}

/**
 * Generate Markdown for Rubric
 */
export function generateRubricMarkdown(rubric, approvals, onlyApproved = false) {
  if (!rubric) return '# Rubric\n*Not generated yet.*';

  let md = `# ${rubric.title || 'Assessment Rubric'}\n\n`;
  md += `**Total Points:** ${rubric.total_points || 100}  \n\n`;
  md += `---\n\n`;

  const criteria = filterApproved(rubric.criteria, approvals, onlyApproved);

  criteria.forEach((crit, index) => {
    md += `## Criterion ${index + 1}: ${crit.criterion_name} (${crit.weight_percentage}%)\n`;
    md += `*Mapped Objective: ${crit.mapped_objective_id} | Source: ${crit.source_section || 'N/A'}*\n\n`;

    md += `| Performance Level | Points | Performance Descriptors |\n`;
    md += `| :--- | :--- | :--- |\n`;
    (crit.performance_levels || []).forEach((lvl) => {
      md += `| **${lvl.level_name}** | ${lvl.points} pts | ${lvl.descriptor} |\n`;
    });
    md += `\n`;
  });

  return md;
}

/**
 * Generate Markdown for Flashcards
 */
export function generateFlashcardsMarkdown(flashcards, approvals, onlyApproved = false) {
  if (!flashcards) return '# Flashcard Deck\n*Not generated yet.*';

  let md = `# ${flashcards.deck_title || 'Flashcard Deck'}\n\n`;
  const cards = filterApproved(flashcards.cards, approvals, onlyApproved);

  cards.forEach((card, index) => {
    md += `### Card ${index + 1} [${card.id}] (${card.bloom_level} - ${card.difficulty})\n`;
    md += `**Mapped LO:** ${card.mapped_objective_id} | **Source:** ${card.source_section || 'N/A'}\n\n`;
    md += `**Front (Prompt):**\n> ${card.front}\n\n`;
    md += `**Back (Answer):**\n> ${card.back}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

/**
 * Generate Anki-compatible CSV for Flashcards
 * Format: "Front","Back","Tags"
 */
export function generateFlashcardsCSV(flashcards, approvals, onlyApproved = false) {
  if (!flashcards || !flashcards.cards) return 'Front,Back,Tags\n';

  const cards = filterApproved(flashcards.cards, approvals, onlyApproved);
  const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""').replace(/\n/g, '<br>')}"`;

  let csv = 'Front,Back,Tags\n';
  cards.forEach((card) => {
    const front = escapeCsv(card.front);
    const back = escapeCsv(card.back);
    const tags = escapeCsv(`bloom:${card.bloom_level} difficulty:${card.difficulty} lo:${card.mapped_objective_id}`);
    csv += `${front},${back},${tags}\n`;
  });

  return csv;
}

/**
 * Generate Markdown for Quiz Bank
 */
export function generateQuizBankMarkdown(quizBank, approvals, onlyApproved = false) {
  if (!quizBank) return '# Quiz Bank\n*Not generated yet.*';

  let md = `# ${quizBank.quiz_title || 'Quiz Bank'}\n\n`;
  const items = filterApproved(quizBank.items, approvals, onlyApproved);

  items.forEach((item, index) => {
    md += `## Question ${index + 1} (${item.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'})\n`;
    md += `*Bloom's Level: ${item.bloom_level} | Difficulty: ${item.difficulty} | Mapped LO: ${item.mapped_objective_id} | Source: ${item.source_section || 'N/A'}*\n\n`;
    md += `**Prompt:**\n${item.question}\n\n`;

    if (item.question_type === 'multiple_choice' && item.options) {
      md += `**Options:**\n`;
      item.options.forEach((opt) => {
        md += `- **(${opt.label})** ${opt.text}\n`;
      });
      md += `\n`;
    }

    md += `**Correct Answer:** \`${item.correct_answer}\`\n\n`;
    md += `**Explanation:**\n${item.explanation}\n\n`;

    if (item.distractor_rationales && item.distractor_rationales.length > 0) {
      md += `**Distractor Rationales (Misconception Analysis):**\n`;
      item.distractor_rationales.forEach((dr) => {
        md += `- **Option (${dr.option_label}):** ${dr.rationale}\n`;
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Generates clean standalone print.html with academic layout & page breaks
 */
export function generatePrintHTML({
  contentMap,
  lessonPlan,
  rubric,
  flashcards,
  quizBank,
  teacherSettings,
  approvals,
  onlyApproved = false
}) {
  const lpMd = generateLessonPlanMarkdown(lessonPlan, approvals, onlyApproved);
  const rubMd = generateRubricMarkdown(rubric, approvals, onlyApproved);
  const fcMd = generateFlashcardsMarkdown(flashcards, approvals, onlyApproved);
  const qbMd = generateQuizBankMarkdown(quizBank, approvals, onlyApproved);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Curriculum Forge - Verified Educational Artifacts</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 900px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 { color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 8px; font-size: 24pt; }
    h2 { color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; font-size: 16pt; }
    h3 { color: #334155; margin-top: 18px; font-size: 13pt; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; vertical-align: top; }
    th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
    blockquote { border-left: 4px solid #0284c7; margin: 12px 0; padding: 6px 16px; background: #f8fafc; font-style: italic; }
    .page-break { page-break-after: always; break-after: page; }
    .badge { display: inline-block; padding: 2px 8px; font-size: 8pt; border-radius: 4px; background: #e0f2fe; color: #0369a1; font-weight: bold; }
    @media print {
      body { margin: 0; padding: 0; max-width: 100%; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 24px; padding: 12px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe; display: flex; justify-content: space-between; align-items: center;">
    <div><strong>Ready to Print / Save as PDF:</strong> Use your browser's Print dialog (Ctrl+P / Cmd+P) and choose "Save as PDF".</div>
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">Print Document</button>
  </div>

  <header style="text-align: center; margin-bottom: 40px;">
    <h1>${contentMap?.document_title || 'Curriculum Artifact Package'}</h1>
    <p><em>Generated by MindBridge Academic Studio &bull; Difficulty: ${teacherSettings.difficulty} &bull; Target Audience: ${teacherSettings.audience}</em></p>
  </header>

  <section class="page-break">
    <h2>1. Content Map (Single Source of Truth)</h2>
    <p><strong>Summary:</strong> ${contentMap?.summary || 'N/A'}</p>
    <h3>Learning Objectives:</h3>
    <ul>
      ${(contentMap?.learning_objectives || []).map(lo => `<li><strong>[${lo.id}]</strong> <span class="badge">${lo.bloom_level}</span>: ${lo.description} <em>(Source: ${lo.source_section})</em></li>`).join('')}
    </ul>
  </section>

  <section class="page-break">
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(lpMd)}</pre>
  </section>

  <section class="page-break">
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(rubMd)}</pre>
  </section>

  <section class="page-break">
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(fcMd)}</pre>
  </section>

  <section>
    <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(qbMd)}</pre>
  </section>
</body>
</html>`;
}

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Downloads a single text file
 */
export function downloadFile(filename, content, mimeType = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
}

/**
 * Packages all files into a structured ZIP file and triggers download
 */
export async function downloadZipPackage({
  contentMap,
  lessonPlan,
  rubric,
  flashcards,
  quizBank,
  teacherSettings,
  approvals,
  onlyApproved = false
}) {
  const zip = new JSZip();

  const lpMd = generateLessonPlanMarkdown(lessonPlan, approvals, onlyApproved);
  const rubMd = generateRubricMarkdown(rubric, approvals, onlyApproved);
  const fcMd = generateFlashcardsMarkdown(flashcards, approvals, onlyApproved);
  const fcCsv = generateFlashcardsCSV(flashcards, approvals, onlyApproved);
  const qbMd = generateQuizBankMarkdown(quizBank, approvals, onlyApproved);
  const printHtml = generatePrintHTML({
    contentMap,
    lessonPlan,
    rubric,
    flashcards,
    quizBank,
    teacherSettings,
    approvals,
    onlyApproved
  });

  const packageJson = {
    metadata: {
      generated_at: new Date().toISOString(),
      studio: "MindBridge Academic AI Studio",
      model: teacherSettings.modelName || "academic-llm-structured-v1",
      settings: teacherSettings,
      export_filter: onlyApproved ? "approved_items_only" : "all_items"
    },
    content_map: contentMap,
    lesson_plan: lessonPlan,
    rubric: rubric,
    flashcards: flashcards,
    quiz_bank: quizBank,
    item_approvals: approvals
  };

  zip.file('lesson-plan.md', lpMd);
  zip.file('rubric.md', rubMd);
  zip.file('flashcards.md', fcMd);
  zip.file('flashcards.csv', fcCsv);
  zip.file('quiz-bank.md', qbMd);
  zip.file('package.json', JSON.stringify(packageJson, null, 2));
  zip.file('print.html', printHtml);

  const content = await zip.generateAsync({ type: 'blob' });
  const docSlug = (contentMap?.document_title || 'curriculum-package')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30);
  saveAs(content, `${docSlug}-artifacts.zip`);
}
