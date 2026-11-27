# Executive Summary
## MindBridge: Teaching-Content-to-Review-Ready Artifact Studio

### 1. Vision & Mission
Educators and instructional designers face a persistent challenge: raw teaching materials (such as lecture notes, textbook chapters, slide outlines, or coarse syllabi) are unstructured and time-consuming to convert into cohesive instructional assets. Manually drafting aligned lesson plans, objective-driven assessment rubrics, active recall flashcards, and balanced quiz banks often takes hours per lecture module.

**MindBridge** is an academic AI studio designed to bridge this gap. It ingests messy or structured educational source text, parses and normalizes the material, and leverages a **Single Source of Truth (SSOT)** pattern to produce a synchronized suite of academic artifacts calibrated to explicit pedagogical levels (Bloom's Taxonomy) and instructional constraints.

---

### 2. Core Value Propositions

- **Model-Agnostic Intelligence**: Built upon an open, pluggable LLM inference layer. Any compliant LLM API key and model endpoint (e.g., frontier proprietary models, open-weights enterprise models, or local hosted endpoints) can be connected without architectural rework.
- **Single Source of Truth (Content Map)**: Rather than prompting generative models independently with raw text—which leads to hallucinated objectives and cross-artifact contradictions—the studio extracts an authoritative, editable **Content Map** first. All downstream artifacts bind deterministically to these Learning Objective identifiers (`LO1`, `LO2`, `LO3`).
- **Calibrated Difficulty Profiles**: Enforces cognitive rigor via Bloom's Taxonomy profiles:
  - **Introductory**: Remember (35%), Understand (35%), Apply (30%).
  - **Intermediate**: Apply (45%), Analyze (30%), Understand (15%).
  - **Advanced**: Analyze (35%), Evaluate (25%), Create (20%), Apply (15%).
- **Automated Drift Detection & One-Click Recalibration**: Computes empirical Bloom distributions post-generation. If artifact cognitive depth drifts by >15 percentage points from target pedagogical profiles, a `WARN` alert surfaces with one-click corrective recalibration.
- **Human-in-the-Loop Review Studio**: Instructors maintain total governance:
  - Inline editing of prompts, questions, rubrics, and timeline phases.
  - Granular approval tracking (`Approved`, `Needs Edit`, `Rejected`).
  - Learning Objective Coverage Matrix highlighting uncovered outcomes with on-demand item generation.
  - Per-item difficulty calibration ("Make Harder" / "Make Easier").
- **Versatile Multi-Format Export**: Generates an integrated package with a single click:
  - `lesson-plan.md`: Formatted lesson plan with duration-invariant timeline.
  - `rubric.md`: 4-level criterion-referenced assessment rubric.
  - `flashcards.md` & `flashcards.csv`: Anki-compatible spaced-retrieval flashcards.
  - `quiz-bank.md`: Multiple-choice and short-answer items with distractor misconception rationales.
  - `package.json`: Complete machine-readable curriculum package.
  - `print.html`: Standalone, clean print layout with `@media print` page breaks.

---

### 3. Workflow Overview

```
[Raw Source Material]
  (PDF / Markdown / TXT)
          │
          ▼
[Heading Chunker & Preprocessor]
          │
          ▼
[Teacher Pedagogical Configuration]
  (Difficulty, Duration, Audience, Language)
          │
          ▼
[Content Map (Single Source of Truth)] <── [Instructor Inspection & Edit]
          │
          ▼
[Parallel Multi-Artifact Generation]
  ├── Lesson Plan (timeline summing to target duration)
  ├── Assessment Rubric (4 performance tiers per LO)
  ├── Active Retrieval Flashcards
  └── Quiz Bank (with distractor misconception rationales)
          │
          ▼
[Bloom's Taxonomy Calibrator & Drift Guard]
          │
          ▼
[Instructor Verification & Coverage Matrix]
          │
          ▼
[Packaging & Multi-Format Export (ZIP / Anki / Markdown / PDF)]
```

---

### 4. Technical Specifications

| Dimension | Specification |
| :--- | :--- |
| **Frontend Runtime** | React 18, Vite 5, Tailwind CSS |
| **LLM Inference Engine** | Pluggable client-side LLM inference with JSON Schema / Structured Output mode |
| **Document Processing** | Client-side `pdf.js` text layer extractor + heading-aware hierarchical chunker |
| **Visual Analytics** | Recharts (Responsive bar charts for empirical vs target Bloom distributions) |
| **Packaging & Export** | JSZip, FileSaver, Anki CSV engine, clean print CSS engine |
| **Data Integrity** | Strict JSON Schema validation, automatic single retry, and rate-limit backoff |
| **Architecture** | 100% Client-side single-page app (no custom backend or persistent server state required) |
