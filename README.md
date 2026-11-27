<<<<<<< HEAD
# MindBridge: Teaching-Content-to-Review-Ready Artifact Generator

> An academic AI studio that ingests raw teaching materials and generates structured, review-ready educational artifacts strictly calibrated by difficulty and Bloom's Taxonomy. Built on a model-agnostic architecture compatible with any modern LLM supporting structured JSON outputs.

---

## Key Highlights

- **Pure Client-Side Architecture**: Built with React, Vite, Tailwind CSS, Recharts, and PDF.js. No custom backend or database required.
- **Model-Agnostic LLM Inference Engine**: Seamlessly compatible with any LLM provider or self-hosted endpoint that supports structured JSON outputs and schema enforcement. Simply configure your endpoint and API key.
- **Content Map as Single Source of Truth (SSOT)**: Analyzes raw input once, establishing standardized Learning Objectives (`LO1`, `LO2`, ...), key concepts, and section citations. All 4 generators read exclusively from this map, never raw text.
- **Pedagogical Difficulty Profiles & Bloom's Calibrator**:
  - **Introductory**: Remember + Understand ~70%, Apply ~30%. Plain language, scaffolding.
  - **Intermediate**: Apply ~45%, Analyze ~30%, Understand ~15%. Mixed scenarios, transfer problems.
  - **Advanced**: Analyze ~35%, Evaluate ~25%, Create ~20%, Apply ~15%. Edge cases, case studies, open-ended trade-offs.
  - Empirical distribution bar chart with PASS / WARN badges and one-click recalibration when drift > 15%.
- **Review-Ready Teacher Controls**:
  - Approve / Reject / Needs Edit status per item with a live progress bar.
  - Coverage Matrix: Verifies all LOs have quiz questions, flashcards, and rubric criteria; one-click "Generate Missing" for uncovered LOs.
  - "Make Harder" / "Make Easier" on individual flashcards and quiz questions.
  - Quality Dashboard: 100% JSON validity rate, % items with source citations, LO coverage %, Bloom's alignment score.
- **Export Package**:
  - One-click ZIP download with `lesson-plan.md`, `rubric.md`, `flashcards.md`, `flashcards.csv` (Anki-compatible), `quiz-bank.md`, `package.json`, and `print.html`.
  - Clean "Print / Save as PDF" preview with page breaks and zero UI chrome.

---

## File Structure

```
hackathon/
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── SUMMARY.md                  # Platform executive summary
├── ARCHITECTURE.md             # Model-agnostic system architecture & flows
├── PLAN.md                     # Roadmap, phase specs, risk matrix & milestones
├── README.md                   # Quickstart, demo script & overview
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── config.js               # Bloom levels, colors, difficulty profiles & sample docs
    ├── schemas.js              # Strict JSON schemas for structured outputs
    ├── prompts.js              # Grounded prompt templates (no placeholders)
    ├── services/
    │   ├── geminiService.js    # Pluggable LLM client, JSON mode, backoff, retry
    │   ├── pdfService.js       # PDF.js text extraction & blank/scanned PDF detection
    │   ├── chunkingService.js  # Heading-based chunking & word counter
    │   ├── calibratorService.js# Bloom distribution analyzer, drift calculator
    │   └── exportService.js    # Markdown, Anki CSV, ZIP, & Print HTML export
    └── components/
        ├── Header.jsx          # Brand, API key modal pill, reset button
        ├── Stepper.jsx         # 6-step workflow stepper
        ├── DocumentUploader.jsx# Drag-drop, paste, word count, sample loaders
        ├── TeacherSettings.jsx # Doc type, difficulty, duration, audience, language
        ├── ContentMapViewer.jsx# Single source of truth editor
        ├── GenerationProgress.jsx # Parallel 4-artifact generator cards
        ├── CalibratorDashboard.jsx# Recharts distribution bar chart & recalibrate
        ├── ReviewStudio.jsx    # Tabbed preview, approval controls, coverage matrix
        ├── ExportPanel.jsx     # ZIP bundle, individual downloads, print view
        └── PrintView.jsx       # Clean print layout with page breaks
```

---

## Quickstart & Run Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Any LLM Model & API Key (OpenAI, Gemini, Claude, Groq, DeepSeek, Ollama, etc.)
You can use **any model and API key** in two ways:

#### Option A: In the Interactive Web Studio (Recommended)
Click the model badge in the top navigation bar at any time to open the **Model & API Key Configuration** modal:
- **Select any Provider preset**: OpenAI, Google Gemini, Anthropic Claude, Groq, OpenRouter, DeepSeek, Mistral, Together AI, Local Ollama, LM Studio, or Custom.
- **Type ANY Model Name**: Enter whatever model identifier your provider accepts (e.g. `gpt-4o`, `gemini-2.5-flash`, `claude-3-5-sonnet-20241022`, `llama-3.3-70b-versatile`, `deepseek-chat`, etc.).
- **Live "Test Connection"**: One-click verification sends a test prompt and shows real-time latency and status.
- **Persistent Storage**: Saved settings automatically persist across page reloads in `localStorage`.

#### Option B: Via `.env` Environment File
Create or update `.env` in the project root:
```bash
# Model name can be ANY model string:
VITE_LLM_MODEL=gemini-2.5-flash
VITE_LLM_PROVIDER=auto
VITE_LLM_API_KEY=your_api_key_here

# Optional: custom base URL for Groq, OpenRouter, Together, or local Ollama
# VITE_LLM_BASE_URL=https://api.groq.com/openai/v1
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

---

## 2-Minute Demo Script

| Time | Action | What to Explain / Observe |
| :--- | :--- | :--- |
| **0:00 - 0:20** | **Step 1: Upload & Parse** | Click **"Messy Lecture Notes (Raft/Paxos)"**. Point out the instant word count (~370 words) and text preview. Mention that long documents (>1500 words) are automatically chunked by headings and summarized before analysis. Click **"Next: Teacher Settings"**. |
| **0:20 - 0:40** | **Step 2: Teacher Settings** | Select Difficulty: **"Intermediate"**. Note the live pedagogical profile card showing target Bloom's distribution (Apply 45%, Analyze 30%). Set duration to **50 min** and Quiz Items to **8**. Click **"Generate Content Map"**. |
| **0:40 - 1:00** | **Step 3: Content Map (Single Truth)** | Show the synthesized Content Map. Point out that each Learning Objective has a permanent ID (`LO1`, `LO2`...) and Bloom tag. Demonstrate inline editing (change a Bloom level or tweak a definition). Click **"Confirm Content Map & Generate Artifacts"**. |
| **1:00 - 1:25** | **Step 4: Multi-Artifact Generation** | Watch the 4 parallel generators running with strict JSON schemas: Lesson Plan, Rubric, Flashcards, and Quiz Bank. Highlight the per-artifact status, schema validation, and automatic single retry. Click **"Proceed to Calibrator & Review Studio"**. |
| **1:25 - 1:45** | **Step 5: Calibrate & Review** | Show the **Recharts Bar Chart** comparing actual vs target Bloom's distribution. Notice the PASS badge and Alignment Score (~92%). Switch tabs in Review Studio: show the Lesson Plan timeline summing to 50 min, Rubric with 4 performance levels, Flashcards, and Quiz Bank with distractor misconception rationales. Click **"Make Harder"** on a question to demonstrate dynamic item-level recalibration. Inspect the **Coverage Matrix** showing all LOs mapped. |
| **1:45 - 2:00** | **Step 6: Export Package** | Show the **Export Studio**. Click **"Download Full ZIP Bundle"** to get the zip containing Markdown files, Anki CSV, `package.json`, and `print.html`. Click **"Open Print / PDF Preview"** to demonstrate clean academic print layout with page breaks and zero UI chrome. |

---

## Known Limitations

1. **Scanned / Image-Only PDFs**: The extractor uses client-side `pdf.js` to extract digital text layers. If a user uploads a pure image/scanned PDF without OCR text, the system surfaces a clear alert prompting for searchable digital text or OCR preprocessing.
2. **Client-Side API Key Storage**: In a purely client-side single-page app architecture, API calls are made directly from the user's browser. In a multi-tenant enterprise deployment, calls can be proxied through a secure backend or edge worker to prevent client-side credential exposure.
3. **Browser Print Margins**: While clean CSS `@media print` rules enforce page breaks (`page-break-after: always`) and hide UI chrome, final margins and header/footer timestamps are subject to the user's browser print dialog defaults.
4. **Token Limits on Long Textbooks**: Documents up to ~25,000 words are handled via heading-based chunking and chunk summarization. Multi-hundred-page textbooks (>100,000 words) should be ingested chapter-by-chapter for optimal grounding fidelity.
=======
# MindBridge
>>>>>>> 85844cfbfd52ba916e2d7c03e22d1e1653e286aa
