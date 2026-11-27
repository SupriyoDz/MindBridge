// Prompts for Gemini API - Academic AI Studio
// Each prompt explicitly includes: Role, Inputs, Targets, Difficulty Profile, Pedagogy, Grounding Constraints, and Schema

export function buildContentMapPrompt({ rawOrSummarizedText, teacherSettings, difficultyProfile }) {
  const isSyllabus = teacherSettings.documentType === 'syllabus';
  const isChapter = teacherSettings.documentType === 'textbook_chapter';

  return `You are a distinguished instructional designer and curriculum architect in higher education.
Your task is to analyze the provided teaching materials and generate a single authoritative "Content Map" that will serve as the sole source of truth for all downstream educational artifacts.

### Teacher & Course Settings:
- Specified Document Type: ${teacherSettings.documentType} (Scope guidance: ${
    isSyllabus
      ? 'Focus on broad course-level overarching competencies, module outcomes, and overarching conceptual foundations.'
      : isChapter
      ? 'Focus on modular section-level mechanics, step-by-step procedures, and domain principles.'
      : 'Calibrate across core conceptual understanding and practical problem solving.'
  })
- Target Difficulty: ${teacherSettings.difficulty} (${difficultyProfile.description})
- Target Audience/Level: ${teacherSettings.audience}
- Target Output Language: ${teacherSettings.language}
- Target Bloom's Taxonomy Distribution:
${Object.entries(difficultyProfile.targets)
  .map(([lvl, pct]) => `  * ${lvl}: ${pct}%`)
  .join('\n')}

### Strict Grounding & Integrity Rules:
1. GROUNDED IN SOURCE ONLY: Use ONLY information directly supported by the provided text. Do NOT hallucinate concepts, theories, or details not present in the input.
2. SOURCE SECTION CITATION: Every key concept and learning objective MUST cite a valid "source_section" referring to headings or parts in the text (e.g. "Section 2: Paxos vs Raft" or "Week 3-4: Linear Structures").
3. BLOOM'S TAXONOMY ALIGNMENT: Formulate each learning objective with an explicit Bloom's Taxonomy verb (e.g., Define, Explain, Implement, Compare, Evaluate, Synthesize) corresponding to its tagged bloom_level.
4. CALIBRATION TARGETS: Distribute learning objectives roughly according to the difficulty profile's targets:
   Introductory -> heavy Remember/Understand; Intermediate -> heavy Apply/Analyze; Advanced -> heavy Analyze/Evaluate/Create.
5. STANDARDIZED IDS: Number learning objectives sequentially starting with LO1, LO2, LO3, etc.

### Provided Input Content:
"""
${rawOrSummarizedText}
"""

Output strictly valid JSON conforming to the requested Content Map schema.`;
}

export function buildLessonPlanPrompt({ contentMap, teacherSettings, difficultyProfile }) {
  return `You are an expert master educator and curriculum developer.
Design a comprehensive, rigorous lesson plan tailored strictly to the provided Content Map and pedagogical parameters.

### Role & Pedagogical Directives:
- Role: Senior Pedagogical Architect & Lesson Planner
- Pedagogical Approach: ${difficultyProfile.pedagogy}
- Target Audience: ${teacherSettings.audience}
- Difficulty Level: ${teacherSettings.difficulty} (${difficultyProfile.description})
- Total Allocated Time: ${teacherSettings.durationMinutes} minutes EXACTLY.
- Target Output Language: ${teacherSettings.language}

### Strict Constraints:
1. TIME ALLOCATION INVARIANT: The sum of "time_allocation_minutes" across all timeline phases MUST sum EXACTLY to ${teacherSettings.durationMinutes} minutes. No more, no less.
2. OBJECTIVE ALIGNMENT: Include objectives from the Content Map (referencing their IDs LO1, LO2, etc.) and ensure their Bloom's level matches the pedagogical target.
3. GROUNDING: Base all activities, explanations, and formative checks strictly on the Content Map and source sections. CITE the source_section for each activity and check. Do not invent facts or unsupported external concepts.
4. STRUCTURE: Divide into coherent phases (e.g., Retrieval/Hook, Explicit Instruction & Modeling, Guided Practice, Formative Check, Independent/Collaborative Application, Synthesis & Exit Ticket).
5. DIFFERENTIATION: Provide practical, concrete adjustments for both struggling and advanced students.

### Content Map (Single Source of Truth):
${JSON.stringify(contentMap, null, 2)}

Output strictly valid JSON conforming to the lessonPlanSchema.`;
}

export function buildRubricPrompt({ contentMap, teacherSettings, difficultyProfile }) {
  return `You are a psychometrician and assessment design specialist.
Create an authentic, criterion-referenced assessment rubric evaluated across exactly 4 performance levels for evaluating student mastery based on the Content Map.

### Role & Pedagogical Directives:
- Role: Assessment & Rubric Design Specialist
- Target Difficulty: ${teacherSettings.difficulty} (${difficultyProfile.description})
- Target Audience: ${teacherSettings.audience}
- Target Output Language: ${teacherSettings.language}
- Target Bloom's Profile:
${Object.entries(difficultyProfile.targets)
  .map(([lvl, pct]) => `  * ${lvl}: ${pct}%`)
  .join('\n')}

### Strict Constraints:
1. 4 PERFORMANCE LEVELS: Every criterion MUST have exactly 4 performance levels:
   Level 4 (Exemplary/Mastery - 4 pts), Level 3 (Proficient/Competent - 3 pts), Level 2 (Developing/Approaching - 2 pts), Level 1 (Beginning/Unsatisfactory - 1 pt).
2. WEIGHT INVARIANT: The sum of weight_percentage across all criteria should ideally total 100%. Total points should typically be 100 or 20 (scaled accordingly).
3. LO MAPPING: Every criterion MUST map to a specific "mapped_objective_id" from the Content Map (e.g. "LO1", "LO2").
4. CITE SOURCE: Each criterion must cite the corresponding source_section.
5. OBSERVABLE DESCRIPTORS: Provide clear, concrete, observable criteria descriptors for each level, not generic buzzwords.
6. GROUNDING: Use only facts and concepts confirmed in the Content Map.

### Content Map (Single Source of Truth):
${JSON.stringify(contentMap, null, 2)}

Output strictly valid JSON conforming to the rubricSchema.`;
}

export function buildFlashcardsPrompt({ contentMap, teacherSettings, difficultyProfile, count = 10 }) {
  return `You are a cognitive science specialist in spaced retrieval practice and active recall.
Create a deck of ${count} high-yield, academically rigorous flashcards based on the Content Map.

### Role & Pedagogical Directives:
- Role: Spaced Retrieval Practice & Active Recall Designer
- Target Difficulty: ${teacherSettings.difficulty} (${difficultyProfile.description})
- Target Audience: ${teacherSettings.audience}
- Target Output Language: ${teacherSettings.language}
- Target Bloom's Taxonomy Distribution:
${Object.entries(difficultyProfile.targets)
  .filter(([_, pct]) => pct > 0)
  .map(([lvl, pct]) => `  * ${lvl}: ~${pct}% of the cards`)
  .join('\n')}

### Strict Constraints:
1. ATOMICITY: Each card must test one specific concept, mechanism, distinction, or application.
2. BLOOM'S CALIBRATION:
   - For Introductory: Focus on definitions, core concepts, identifying key components (Remember, Understand).
   - For Intermediate: Focus on predicting outcomes, comparing two approaches, applying rules to examples (Apply, Analyze).
   - For Advanced: Focus on diagnosing edge-case bugs, trade-offs under constraints, evaluating architectural choices (Analyze, Evaluate, Create).
3. TAGGING & GROUNDING: Every card MUST include:
   - "bloom_level": Exactly one of ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"].
   - "difficulty": "Introductory", "Intermediate", or "Advanced".
   - "mapped_objective_id": Corresponding LO id (e.g. "LO1") from the Content Map.
   - "source_section": Cited section from the Content Map.
4. DO NOT INVENT FACTS: Every card must be 100% grounded in the Content Map.

### Content Map (Single Source of Truth):
${JSON.stringify(contentMap, null, 2)}

Output strictly valid JSON conforming to the flashcardsSchema.`;
}

export function buildQuizBankPrompt({ contentMap, teacherSettings, difficultyProfile }) {
  const count = teacherSettings.quizItemCount || 8;
  return `You are an expert psychometrician and university examination author.
Generate a rigorous ${count}-item quiz bank consisting of multiple-choice and short-answer questions strictly derived from the Content Map.

### Role & Pedagogical Directives:
- Role: University Exam Item Writer & Psychometrician
- Total Items: ${count} questions (mix of ~70% Multiple Choice with 4 options [A, B, C, D] and ~30% Short Answer).
- Target Difficulty: ${teacherSettings.difficulty} (${difficultyProfile.description})
- Target Audience: ${teacherSettings.audience}
- Target Output Language: ${teacherSettings.language}
- Target Bloom's Taxonomy Distribution:
${Object.entries(difficultyProfile.targets)
  .filter(([_, pct]) => pct > 0)
  .map(([lvl, pct]) => `  * ${lvl}: ~${pct}% of items`)
  .join('\n')}

### Strict Psychometric Constraints:
1. DISTRACTOR RATIONALE: For every Multiple Choice question, provide an explicit "distractor_rationales" array explaining WHY each wrong option represents a common misconception or plausible error.
2. CORRECT ANSWER & EXPLANATION: Provide unequivocal correct answers and detailed explanations referencing the underlying theory.
3. BLOOM'S & LO MAPPING: Every item MUST have:
   - "bloom_level": One of ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"].
   - "mapped_objective_id": Valid LO id from the Content Map (LO1, LO2, etc.).
   - "source_section": Explicit section from the Content Map.
   - "difficulty": Matches target difficulty.
4. ZERO HALLUCINATION: Only test material present in the Content Map. Never ask questions about unmentioned facts.

### Content Map (Single Source of Truth):
${JSON.stringify(contentMap, null, 2)}

Output strictly valid JSON conforming to the quizBankSchema.`;
}

export function buildRecalibratePrompt({ artifactType, currentArtifact, contentMap, targetProfile, driftDetails, schema }) {
  return `You are an educational calibrator correcting Bloom's Taxonomy alignment drift in an educational artifact.

### Correction Objective:
The artifact "${artifactType}" has drifted beyond acceptable pedagogical tolerances from the target difficulty profile:
${driftDetails}

Target Bloom's Distribution:
${Object.entries(targetProfile.targets)
  .map(([lvl, pct]) => `  * ${lvl}: ${pct}%`)
  .join('\n')}

### Corrective Instructions:
1. Maintain the overall structure, topic coverage, and Learning Objective mappings from the Content Map.
2. RESTRUCTURE items (questions, cards, or activities) whose Bloom's level is over-represented or under-represented.
3. If higher-order Bloom's (Analyze, Evaluate, Create) are needed: elevate items from rote recall into scenario-based analysis, trade-off comparisons, diagnosing edge cases, or synthesis.
4. If foundational Bloom's (Remember, Understand, Apply) are needed: reduce overly complex edge-case framing into clear comprehension, worked explanations, or direct conceptual application.
5. Ensure EVERY item retains its "source_section" and valid "mapped_objective_id".

### Content Map:
${JSON.stringify(contentMap, null, 2)}

### Current Artifact with Drift:
${JSON.stringify(currentArtifact, null, 2)}

Regenerate the entire corrected artifact in strictly valid JSON conforming to the original schema.`;
}

export function buildItemDifficultyPrompt({ itemType, item, direction, contentMap, targetProfile }) {
  return `You are an instructional designer calibrating the difficulty of an individual educational item.

### Task:
Adjust the following ${itemType} item to make it ${direction.toUpperCase()} (${direction === 'harder' ? 'increase cognitive load, shift to higher Bloom\'s level like Analyze/Evaluate, introduce nuanced scenario or edge case' : 'decrease cognitive load, shift to Remember/Understand/Apply, clarify language, provide scaffolding'}).

### Current Item:
${JSON.stringify(item, null, 2)}

### Content Map Context:
${JSON.stringify(contentMap, null, 2)}

### Rules:
- Keep the item grounded in the original source_section and mapped_objective_id.
- Return the updated item in JSON format matching the item's original structure.`;
}

export function buildChunkSummaryPrompt({ chunkText, chunkIndex, totalChunks }) {
  return `You are an academic text analyzer. Summarize the following section (${chunkIndex + 1} of ${totalChunks}) of a pedagogical document.
Preserve all key definitions, named theorems/algorithms, equations, structural headings, technical distinctions, and learning goals.
Eliminate conversational filler.

Text to summarize:
"""
${chunkText}
"""

Return a structured, dense summary preserving section titles and technical accuracy.`;
}
