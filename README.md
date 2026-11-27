# MindBridge: Teaching-Content-to-Review-Ready Artifact Generator

> An academic AI studio that ingests raw teaching materials and generates structured, review-ready educational artifacts strictly calibrated by difficulty and Bloom's Taxonomy. Built on a universal, model-agnostic architecture compatible with any modern LLM supporting structured JSON outputs.

---

## Key Highlights

- **Pure Client-Side Architecture**: Built with React, Vite, Tailwind CSS, Recharts, and PDF.js. No custom backend or database required.
- **Guided Onboarding & Workspace**: Starts on an informative Home & Guide landing view explaining the 4 synchronized artifacts and 6-step pipeline, with a **Get Started** button and 1-click sample dataset launchers.
- **Universal Model-Agnostic LLM Engine**: Seamlessly compatible with Google Gemini, OpenAI (`gpt-4o`, `gpt-4o-mini`, `o3-mini`), Anthropic Claude, Groq, OpenRouter, DeepSeek, Mistral, Together AI, and local Ollama / LM Studio endpoints. Auto-detects provider from your API key, model name, or base URL.
- **Content Map as Single Source of Truth (SSOT)**: Analyzes raw input once, establishing standardized Learning Objectives (`LO1`, `LO2`, ...), key concepts, prerequisites, and section citations. All 4 generators read exclusively from this map, never raw text.
- **Pedagogical Difficulty Profiles & Bloom's Calibrator**:
  - **Introductory**: Remember + Understand ~70%, Apply ~30%. Plain language, scaffolding.
  - **Intermediate**: Apply ~45%, Analyze ~30%, Understand ~15%. Mixed scenarios, transfer problems.
  - **Advanced**: Analyze ~35%, Evaluate ~25%, Create ~20%, Apply ~15%. Edge cases, case studies, open-ended trade-offs.
  - Empirical distribution bar chart with `PASS` / `WARN` badges and one-click recalibration when cognitive drift > 15%.
- **Review-Ready Teacher Controls**:
  - Approve / Reject / Needs Edit status per item with a live progress bar.
  - Coverage Matrix: Verifies all LOs have quiz questions, flashcards, and rubric criteria; one-click "Generate Missing" for uncovered LOs.
  - "Make Harder" / "Make Easier" on individual flashcards and quiz questions.
  - Quality Dashboard: 100% JSON validity rate, % items with source citations, LO coverage %, Bloom's alignment score.
- **Export Package**:
  - One-click ZIP download with `lesson-plan.md`, `rubric.md`, `flashcards.md`, `flashcards.csv` (Anki-compatible), `quiz-bank.md`, `package.json`, and `print.html`.
  - Clean "Print / Save as PDF" preview with page breaks and zero UI chrome.
- **Fully Responsive UI**: Optimized across mobile (320px+), tablet, and desktop screens.

---

## File Structure

```text
hackathon/
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── README.md                                  # Quickstart, demo script & overview
├── docs/                                      # All submission & technical documentation
│   ├── MindBridge_Complete_Documentation.pdf  # Unified submission dossier (PDF)
│   ├── MindBridge_Complete_Documentation.docx # Unified submission dossier (DOCX)
│   ├── SOLUTION_DESCRIPTION.md / .pdf / .docx # Full solution description & walkthrough
│   ├── ARCHITECTURE.md / .pdf / .docx         # Model-agnostic system architecture
│   ├── PLAN.md / .pdf / .docx                 # Implementation plan & milestones
│   └── SUMMARY.md / .pdf / .docx              # Executive summary
├── scripts/
│   └── generate_submission_docs.cjs           # Automated Markdown -> DOCX/PDF compiler
└── src/
    ├── App.jsx                                # Root state, landing toggle & 6-step orchestration
    ├── main.jsx
    ├── index.css
    ├── config.js                              # Bloom levels, colors, difficulty profiles & sample docs
    ├── schemas.js                             # Strict JSON schemas for structured outputs
    ├── prompts.js                             # Grounded prompt templates (no placeholders)
    ├── services/
    │   ├── geminiService.js                   # Universal multi-provider LLM client, retry & fallback
    │   ├── pdfService.js                      # PDF.js text extraction & blank/scanned PDF detection
    │   ├── chunkingService.js                 # Heading-based chunking & word counter
    │   ├── calibratorService.js               # Bloom distribution analyzer & drift calculator
    │   └── exportService.js                   # Markdown, Anki CSV, ZIP, & Print HTML export
    └── components/
        ├── Header.jsx                         # Sticky navigation (Home/Guide, Workspace, Reset)
        ├── HomeLandingView.jsx                # Onboarding guide, 6-step overview & Get Started CTA
        ├── Stepper.jsx                        # Responsive 6-step workflow stepper
        ├── DocumentUploader.jsx               # Drag-drop, paste, word count, sample loaders
        ├── TeacherSettings.jsx                # Doc type, difficulty, duration, audience, language
        ├── ContentMapViewer.jsx               # Single source of truth editor
        ├── GenerationProgress.jsx             # Parallel 4-artifact generator cards
        ├── CalibratorDashboard.jsx            # Recharts distribution bar chart & recalibrate
        ├── ReviewStudio.jsx                   # Tabbed preview, approval controls, coverage matrix
        ├── ExportPanel.jsx                    # ZIP bundle, individual downloads, print view
        └── PrintView.jsx                      # Clean print layout with page breaks
```

---

## Quickstart & Run Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Any LLM Model & API Key
Create or update `.env` in the project root (see `.env.example` for all provider presets):

```bash
# Model name can be ANY model string:
#   Gemini:    gemini-3.5-flash-lite, gemini-flash-lite-latest, gemini-3-flash-preview
#   OpenAI:    gpt-4o-mini, gpt-4o, o3-mini
#   Anthropic: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022
#   Groq:      llama-3.3-70b-versatile
#   Ollama:    llama3.2, mistral, qwen2.5
VITE_LLM_MODEL=gemini-3.5-flash-lite

# Provider: auto | gemini | openai | anthropic | groq | openrouter | deepseek | mistral | together | ollama | lmstudio | custom
VITE_LLM_PROVIDER=auto

# Your API key (auto-detects provider when VITE_LLM_PROVIDER=auto)
VITE_LLM_API_KEY=your_api_key_here

# Optional: custom base URL (e.g. for Groq, OpenRouter, Together, or local Ollama)
# VITE_LLM_BASE_URL=http://localhost:11434/v1
```

### 3. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

### 5. Regenerate Submission Documentation (`docs/`)
```bash
npm run docs:generate
```

---

## Supporting Documentation (`docs/`)

All supporting documents are organized in the [`docs/`](./docs) folder in Markdown, DOCX, and PDF formats:

- **[`docs/MindBridge_Complete_Documentation.pdf`](./docs/MindBridge_Complete_Documentation.pdf)** ([`.docx`](./docs/MindBridge_Complete_Documentation.docx)) — Complete unified submission dossier.
- **[`docs/SUMMARY.md`](./docs/SUMMARY.md)** ([`.pdf`](./docs/SUMMARY.pdf) | [`.docx`](./docs/SUMMARY.docx)) — Executive summary.
- **[`docs/SOLUTION_DESCRIPTION.md`](./docs/SOLUTION_DESCRIPTION.md)** ([`.pdf`](./docs/SOLUTION_DESCRIPTION.pdf) | [`.docx`](./docs/SOLUTION_DESCRIPTION.docx)) — Full solution description, pedagogical calibration math, and walkthrough.
- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** ([`.pdf`](./docs/ARCHITECTURE.pdf) | [`.docx`](./docs/ARCHITECTURE.docx)) — System architecture, data flow diagrams, and multi-provider inference design.
- **[`docs/PLAN.md`](./docs/PLAN.md)** ([`.pdf`](./docs/PLAN.pdf) | [`.docx`](./docs/PLAN.docx)) — Implementation roadmap, phase specs, and risk matrix.

---

## 2-Minute Demo Script

| Time | Action | What to Explain / Observe |
| :--- | :--- | :--- |
| **0:00 - 0:15** | **Home & Guide** | Land on the **MindBridge** onboarding page explaining the 4 synchronized artifacts and 6-step workflow. Click **"Get Started in Studio"** (or launch a 1-click sample dataset). |
| **0:15 - 0:30** | **Step 1: Upload & Parse** | Click **"Messy Lecture Notes (Raft/Paxos)"**. Point out the instant word count (~370 words) and text preview. Long documents (>1500 words) are automatically chunked by headings and summarized before analysis. Click **"Next: Teacher Settings"**. |
| **0:30 - 0:45** | **Step 2: Teacher Settings** | Select Difficulty: **"Intermediate"**. Note the live pedagogical profile card showing target Bloom's distribution (Apply 45%, Analyze 30%). Set duration to **50 min** and Quiz Items to **8**. Click **"Generate Content Map"** — the UI jumps immediately to the Content Map synthesis screen. |
| **0:45 - 1:05** | **Step 3: Content Map (SSOT)** | Show the synthesized Content Map. Point out that each Learning Objective has a permanent ID (`LO1`, `LO2`...) and Bloom tag. Demonstrate inline editing (change a Bloom level or tweak a definition). Click **"Confirm Content Map & Generate Artifacts"**. |
| **1:05 - 1:25** | **Step 4: Multi-Artifact Generation** | Watch the 4 parallel generators running with strict JSON schemas: Lesson Plan, Rubric, Flashcards, and Quiz Bank. Highlight per-artifact status, schema validation, and automatic retry. Click **"Proceed to Calibrator & Review Studio"**. |
| **1:25 - 1:45** | **Step 5: Calibrate & Review** | Show the **Recharts Bar Chart** comparing actual vs target Bloom's distribution. Notice the `PASS` badge and Alignment Score. Switch tabs in Review Studio: show the 50-min Lesson Plan timeline, 4-level Rubric, Flashcards, and Quiz Bank with distractor misconception rationales. Click **"Make Harder"** on a question to demonstrate dynamic item-level recalibration, and inspect the **Coverage Matrix**. |
| **1:45 - 2:00** | **Step 6: Export Package** | Show the **Export Studio**. Click **"Download Full ZIP Bundle"** for Markdown files, Anki CSV, `package.json`, and `print.html`. Click **"Open Print / PDF Preview"** for clean academic print layout with page breaks and zero UI chrome. |

---

## Known Limitations

1. **Scanned / Image-Only PDFs**: The extractor uses client-side `pdf.js` to extract digital text layers. If a user uploads a pure image/scanned PDF without OCR text, the system surfaces a clear alert prompting for searchable digital text or OCR preprocessing.
2. **Client-Side API Key Storage**: In a purely client-side single-page app architecture, API calls are made directly from the user's browser. In a multi-tenant enterprise deployment, calls can be proxied through a secure backend or edge worker to prevent client-side credential exposure.
3. **Browser Print Margins**: While clean CSS `@media print` rules enforce page breaks (`page-break-after: always`) and hide UI chrome, final margins and header/footer timestamps are subject to the user's browser print dialog defaults.
4. **Token Limits on Long Textbooks**: Documents up to ~25,000 words are handled via heading-based chunking and chunk summarization. Multi-hundred-page textbooks (>100,000 words) should be ingested chapter-by-chapter for optimal grounding fidelity.
