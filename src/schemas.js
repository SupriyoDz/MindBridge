// JSON Schemas for Gemini & OpenAI Structured Outputs
// Contains both native uppercase schemas and automatic conversion to standard JSON Schema for OpenAI / OpenRouter / Groq / Ollama

export function toStandardJsonSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  if (Array.isArray(schema)) return schema.map(toStandardJsonSchema);

  const converted = {};
  for (const [key, val] of Object.entries(schema)) {
    if (key === 'type' && typeof val === 'string') {
      converted[key] = val.toLowerCase();
    } else if (typeof val === 'object' && val !== null) {
      converted[key] = toStandardJsonSchema(val);
    } else {
      converted[key] = val;
    }
  }
  return converted;
}

export const contentMapSchema = {
  type: "OBJECT",
  description: "Comprehensive content map serving as the single source of truth for all curriculum artifacts.",
  properties: {
    document_title: { type: "STRING" },
    detected_type: { 
      type: "STRING", 
      enum: ["lecture_notes", "syllabus", "textbook_chapter"] 
    },
    summary: { type: "STRING" },
    topics: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    key_concepts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          definition: { type: "STRING" },
          source_section: { type: "STRING" }
        },
        required: ["name", "definition", "source_section"]
      }
    },
    prerequisites: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    source_sections: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    learning_objectives: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING", description: "Standardized ID like LO1, LO2, LO3" },
          description: { type: "STRING", description: "Actionable outcome starting with a Bloom's verb" },
          bloom_level: {
            type: "STRING",
            enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
          },
          source_section: { type: "STRING" }
        },
        required: ["id", "description", "bloom_level", "source_section"]
      }
    }
  },
  required: [
    "document_title",
    "detected_type",
    "summary",
    "topics",
    "key_concepts",
    "prerequisites",
    "source_sections",
    "learning_objectives"
  ]
};

export const lessonPlanSchema = {
  type: "OBJECT",
  description: "Pedagogically structured lesson plan calibrated by time and Bloom's difficulty.",
  properties: {
    title: { type: "STRING" },
    duration_minutes: { type: "INTEGER" },
    target_audience: { type: "STRING" },
    difficulty: { type: "STRING" },
    pedagogical_approach: { type: "STRING" },
    objectives: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          description: { type: "STRING" },
          bloom_level: {
            type: "STRING",
            enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
          }
        },
        required: ["id", "description", "bloom_level"]
      }
    },
    timeline: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          time_allocation_minutes: { type: "INTEGER" },
          phase_name: { type: "STRING" },
          activity_description: { type: "STRING" },
          teacher_actions: { type: "STRING" },
          student_actions: { type: "STRING" },
          source_section: { type: "STRING" }
        },
        required: [
          "time_allocation_minutes",
          "phase_name",
          "activity_description",
          "teacher_actions",
          "student_actions",
          "source_section"
        ]
      }
    },
    materials: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    formative_checks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          check_name: { type: "STRING" },
          description: { type: "STRING" },
          check_type: { type: "STRING" },
          source_section: { type: "STRING" }
        },
        required: ["check_name", "description", "check_type", "source_section"]
      }
    },
    differentiation_notes: {
      type: "OBJECT",
      properties: {
        for_struggling_students: { type: "STRING" },
        for_advanced_students: { type: "STRING" }
      },
      required: ["for_struggling_students", "for_advanced_students"]
    }
  },
  required: [
    "title",
    "duration_minutes",
    "target_audience",
    "difficulty",
    "objectives",
    "timeline",
    "materials",
    "formative_checks",
    "differentiation_notes"
  ]
};

export const rubricSchema = {
  type: "OBJECT",
  description: "Assessment rubric with criteria, weights, performance levels, and LO mappings.",
  properties: {
    title: { type: "STRING" },
    total_points: { type: "INTEGER" },
    criteria: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          criterion_name: { type: "STRING" },
          mapped_objective_id: { type: "STRING" },
          weight_percentage: { type: "INTEGER" },
          source_section: { type: "STRING" },
          performance_levels: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                level_name: { type: "STRING" },
                points: { type: "INTEGER" },
                descriptor: { type: "STRING" }
              },
              required: ["level_name", "points", "descriptor"]
            }
          }
        },
        required: [
          "id",
          "criterion_name",
          "mapped_objective_id",
          "weight_percentage",
          "source_section",
          "performance_levels"
        ]
      }
    }
  },
  required: ["title", "total_points", "criteria"]
};

export const flashcardsSchema = {
  type: "OBJECT",
  description: "Flashcard deck calibrated by Bloom's taxonomy and source section citations.",
  properties: {
    deck_title: { type: "STRING" },
    cards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          front: { type: "STRING", description: "Prompt, question, or scenario" },
          back: { type: "STRING", description: "Clear, comprehensive answer/explanation" },
          bloom_level: {
            type: "STRING",
            enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
          },
          difficulty: { type: "STRING" },
          mapped_objective_id: { type: "STRING" },
          source_section: { type: "STRING" }
        },
        required: [
          "id",
          "front",
          "back",
          "bloom_level",
          "difficulty",
          "mapped_objective_id",
          "source_section"
        ]
      }
    }
  },
  required: ["deck_title", "cards"]
};

export const quizBankSchema = {
  type: "OBJECT",
  description: "Quiz bank containing multiple-choice and short-answer items with distractor rationales.",
  properties: {
    quiz_title: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          question_type: {
            type: "STRING",
            enum: ["multiple_choice", "short_answer"]
          },
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING", description: "e.g. A, B, C, D" },
                text: { type: "STRING" }
              },
              required: ["label", "text"]
            }
          },
          correct_answer: { type: "STRING" },
          explanation: { type: "STRING" },
          distractor_rationales: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                option_label: { type: "STRING" },
                rationale: { type: "STRING" }
              },
              required: ["option_label", "rationale"]
            }
          },
          bloom_level: {
            type: "STRING",
            enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
          },
          mapped_objective_id: { type: "STRING" },
          source_section: { type: "STRING" },
          difficulty: { type: "STRING" }
        },
        required: [
          "id",
          "question_type",
          "question",
          "correct_answer",
          "explanation",
          "bloom_level",
          "mapped_objective_id",
          "source_section",
          "difficulty"
        ]
      }
    }
  },
  required: ["quiz_title", "items"]
};
