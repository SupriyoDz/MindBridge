# Implementation & Strategic Execution Plan
## MindBridge: Academic Artifact Studio

This document defines the comprehensive development, testing, and operational rollout plan for the **Teaching-Content-to-Review-Ready Artifact Studio**. The system architecture is model-agnostic, supporting arbitrary LLM endpoints and credentials that adhere to structured JSON schema generation.

---

### 1. Phased Development Roadmap

```mermaid
gantt
    title Development & Deployment Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Ingestion & Foundation
    Project Setup & Tailwind UI Scaffolding :done, 2026-11-01, 3d
    Client PDF Extraction & Heading Chunker  :done, 2026-11-04, 3d
    section Phase 2: Governance & SSOT
    Pedagogical Config & Bloom's Taxonomy Profiles :done, 2026-11-07, 2d
    Content Map Schema & Synthesis Pipeline        :done, 2026-11-09, 3d
    section Phase 3: Synthesis & LLM Engine
    Model-Agnostic Inference Client & Fallbacks    :done, 2026-11-12, 3d
    Parallel Generation: Lesson, Rubric, Cards, Quiz:done, 2026-11-15, 3d
    section Phase 4: Calibration & Review
    Bloom's Drift Guard & Recharts Analytics      :done, 2026-11-18, 2d
    Human-in-the-Loop Review & Coverage Matrix    :done, 2026-11-20, 3d
    section Phase 5: Export & Packaging
    Multi-Format Exporter (ZIP, Anki, Print CSS)   :done, 2026-11-23, 2d
    End-to-End Benchmarking & Verification         :active, 2026-11-25, 2d
```

---

### 2. Detailed Phase Specifications

#### Phase 1: Ingestion & Document Processing Engine
- **Objective**: Provide a reliable, client-side ingestion pipeline capable of parsing digital teaching materials without server-side storage dependencies.
- **Deliverables**:
  - Drag-and-drop file upload zone supporting `.pdf`, `.md`, and `.txt`, plus an active paste-text area.
  - Client-side text-layer extraction via WebAssembly/JavaScript PDF parsers.
  - Scanned PDF detection: evaluates text length and surfaces clear error notices if a document lacks machine-readable text layers.
  - Heading-based hierarchical chunker with fallback to ~1,500-word blocks for long documents, accompanied by automatic modular chunk summarization.
  - Preloaded sample teaching assets (messy lecture notes, course syllabus) for instant evaluation.

#### Phase 2: Pedagogical Configuration & Content Map (SSOT)
- **Objective**: Establish the Single Source of Truth that binds all subsequent artifact generation.
- **Deliverables**:
  - Teacher settings panel for selecting document type (`auto`, `lecture_notes`, `syllabus`, `textbook_chapter`), difficulty profile (`Introductory`, `Intermediate`, `Advanced`), class duration (minutes), quiz item count, target audience, and output language.
  - JSON schema for the Content Map (`topics`, `summary`, `key_concepts`, `prerequisites`, `source_sections`, `learning_objectives`).
  - Interactive Content Map editor allowing instructors to inspect, add, modify, or delete indexed learning objectives (`LO1`, `LO2`, `LO3`...) before artifact synthesis begins.

#### Phase 3: Model-Agnostic Inference Layer & Strict JSON Schema Enforcement
- **Objective**: Build an open, resilient API client capable of communicating with any LLM endpoint supporting structured output formats.
- **Deliverables**:
  - Abstracted client-side inference service accepting user-supplied credentials via `.env` or direct UI input.
  - Strict JSON schema enforcement across all generation prompts (`responseSchema` / `responseMimeType: "application/json"`).
  - Resilient network handling: exponential backoff for rate limits (`429`) and transient server errors (`503`), automatic single retry on schema parse anomalies, and automatic fallback chains across available high-speed models.

#### Phase 4: Parallel Multi-Artifact Synthesis Engine
- **Objective**: Simultaneously generate four aligned curriculum assets derived strictly from the confirmed Content Map.
- **Deliverables**:
  - **Lesson Plan**: Includes time-allocated phases that strictly sum to the configured class duration, learning objective references, teacher/student actions, formative checks, and differentiation notes.
  - **Rubric**: Establishes 4 performance levels (Exemplary, Proficient, Developing, Beginning) mapped to specific `LO` IDs with point weights.
  - **Flashcards**: Atomic retrieval prompt-and-answer pairs tagged with Bloom's Taxonomy level, difficulty, and source citations.
  - **Quiz Bank**: Multiple-choice and short-answer assessment items with answer keys and distractor misconception rationales.
  - Per-artifact status tracking cards with independent "Regenerate" controls.

#### Phase 5: Bloom's Taxonomy Calibration & Drift Telemetry
- **Objective**: Ensure artifacts adhere quantitatively to pedagogical target distributions.
- **Deliverables**:
  - Aggregation of all Bloom-tagged items across generated assets.
  - Responsive Recharts bar chart contrasting empirical distributions against the target profile.
  - Drift calculation engine: surfaces a `PASS` badge when max drift is &le; 15% and a `WARN` badge when drift exceeds 15%.
  - One-click recalibration loop: selectively prompts the LLM to restructure only the offending artifact with corrective cognitive guidance.

#### Phase 6: Human-in-the-Loop Review Studio & Coverage Matrix
- **Objective**: Give educators complete editorial oversight and gap analysis capabilities.
- **Deliverables**:
  - Tabbed review interface with inline editing on every field of every generated item.
  - Per-item three-state approval system (`Approved`, `Needs Edit`, `Rejected`) with live approval progress bars.
  - Learning Objective Coverage Matrix: maps every `LO` against counts of quiz questions, flashcards, and rubric criteria, with a `+ Generate Missing` button for uncovered outcomes.
  - Granular difficulty adjustments (`Make Harder` / `Make Easier`) for individual questions and flashcards.
  - Quality telemetry dashboard calculating JSON validity (100%), citation rate, LO coverage %, and Bloom alignment score.

#### Phase 7: Export Packaging & Printing
- **Objective**: Output production-ready, accessible files for classroom and LMS integration.
- **Deliverables**:
  - Unified ZIP bundle generator packaging `lesson-plan.md`, `rubric.md`, `flashcards.md`, `flashcards.csv` (Anki-compatible format), `quiz-bank.md`, `package.json`, and `print.html`.
  - Individual download triggers for every artifact file.
  - Dedicated "Print / Save as PDF" view with `@media print` styling enforcing page breaks between artifacts and suppressing all UI controls.
  - Export filter toggle: defaults to exporting approved items only, with an option to include all generated items.

---

### 3. Technical Risk Matrix & Mitigation Strategies

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Model Rate Limits (429 / Quota)** | High | Medium | Implement randomized exponential backoff and maintain automatic fallback to high-throughput, high-quota models. |
| **Scanned / Image-Only PDFs** | Medium | Medium | Inspect extracted text density client-side; display explicit diagnostic alerts directing users to searchable text or OCR tools. |
| **Context Window Saturation** | High | Low | Enforce heading-based document chunking (>1,500 words) and summarize intermediate chunks before generating the Content Map. |
| **Cognitive Drift from Target Level** | Medium | Medium | Enforce strict Bloom tags per schema, compute empirical distributions, and trigger targeted recalibration if drift exceeds 15%. |
| **Client-Side Key Misconfiguration** | High | Low | Validate key format prior to API dispatch; provide an instant in-browser modal for runtime key configuration. |

---

### 4. Verification & Acceptance Criteria (Definition of Done)

- [x] **Ingestion Accuracy**: Accurately extracts text from digital PDFs, Markdown, and TXT files; detects empty/scanned PDFs with informative alerts.
- [x] **Single Source of Truth**: Generates a structured Content Map (`LO1`, `LO2`...) with full inline editing capability before artifact generation.
- [x] **Schema Conformance**: 100% of LLM calls use structured JSON mode; zero unhandled JSON parse exceptions.
- [x] **Temporal Invariant**: Lesson plan phase durations sum strictly to configured class duration.
- [x] **Psychometric Rigor**: Rubrics feature 4 distinct performance levels; multiple-choice quiz questions include distractor misconception rationales.
- [x] **Grounding Verification**: Every key concept, flashcard, and quiz question carries an explicit `source_section` citation.
- [x] **Drift Guard**: Accurately identifies Bloom's Taxonomy drift > 15% and provides targeted one-click recalibration.
- [x] **Coverage Audit**: Coverage Matrix reliably flags uncovered learning objectives and generates missing items on demand.
- [x] **Multi-Format Export**: Generates valid ZIP archives, Anki-compliant CSV files, clean Markdown documents, and page-broken printable HTML views.
- [x] **Zero Build Errors**: Clean compilation verified via `npm run build` with zero broken dependencies or syntax issues.
