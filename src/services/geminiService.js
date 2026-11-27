// Universal Model-Agnostic LLM Inference Service
// Supports ANY model and API key: OpenAI, Google Gemini, Anthropic Claude,
// Groq, OpenRouter, DeepSeek, Mistral, Together AI, Local Ollama, LM Studio, or Custom Endpoints
import {
  contentMapSchema,
  lessonPlanSchema,
  rubricSchema,
  flashcardsSchema,
  quizBankSchema,
  toStandardJsonSchema
} from '../schemas.js';
import {
  buildContentMapPrompt,
  buildLessonPlanPrompt,
  buildRubricPrompt,
  buildFlashcardsPrompt,
  buildQuizBankPrompt,
  buildRecalibratePrompt,
  buildItemDifficultyPrompt,
  buildChunkSummaryPrompt
} from '../prompts.js';
import { DIFFICULTY_PROFILES } from '../config.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const CONFIG_STORAGE_KEY = 'MindBridge_llm_config';

/**
 * Pre-configured provider templates & recommended models.
 * Users can also input ANY model name or custom endpoint.
 */
export const PROVIDER_PRESETS = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, o3-mini, o1',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'o1', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    protocol: 'openai',
    requiresKey: true,
    keyPlaceholder: 'sk-proj-... or sk-...'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 3.5 Flash Lite, Flash-Lite Latest, 3.5 Flash, 3.8 Flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-3.5-flash-lite',
    models: ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-3.8-flash'],
    protocol: 'gemini',
    requiresKey: true,
    keyPlaceholder: 'AIzaSy... or Gemini API Key'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, 3.5 Haiku, 3 Opus',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    protocol: 'anthropic',
    requiresKey: true,
    keyPlaceholder: 'sk-ant-api03-...'
  },
  groq: {
    id: 'groq',
    name: 'Groq (Ultra-Fast)',
    description: 'Llama 3.3 70B, DeepSeek R1 Distill, Mixtral',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    protocol: 'openai',
    requiresKey: true,
    keyPlaceholder: 'gsk_...'
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models with one unified API key',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.0-flash-001',
    models: [
      'google/gemini-2.0-flash-001',
      'anthropic/claude-3.5-sonnet',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.3-70b-instruct',
      'openai/gpt-4o-mini'
    ],
    protocol: 'openai',
    requiresKey: true,
    keyPlaceholder: 'sk-or-v1-...'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek-V3 (deepseek-chat), DeepSeek-R1',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    protocol: 'openai',
    requiresKey: true,
    keyPlaceholder: 'sk-...'
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Small, Large, Codestral',
    defaultBaseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-small-latest',
    models: ['mistral-small-latest', 'mistral-large-latest', 'codestral-latest'],
    protocol: 'openai',
    requiresKey: true,
    keyPlaceholder: 'Mistral API Key'
  },
  together: {
    id: 'together',
    name: 'Together AI',
    description: 'Open-source models hosted on fast serverless GPUs',
    defaultBaseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    models: ['meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
    protocol: 'openai',
    requiresKey: true,
    keyPlaceholder: 'Together API Key'
  },
  ollama: {
    id: 'ollama',
    name: 'Local Ollama',
    description: 'Completely offline and private local models',
    defaultBaseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    models: ['llama3.2', 'mistral', 'deepseek-r1', 'qwen2.5', 'phi3'],
    protocol: 'openai',
    requiresKey: false,
    keyPlaceholder: 'Not needed (local)'
  },
  lmstudio: {
    id: 'lmstudio',
    name: 'Local LM Studio',
    description: 'Local inference via LM Studio server',
    defaultBaseUrl: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    models: ['local-model'],
    protocol: 'openai',
    requiresKey: false,
    keyPlaceholder: 'Not needed (local)'
  },
  custom: {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'Enter any OpenAI-compatible base URL and model name',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: [],
    protocol: 'openai',
    requiresKey: false,
    keyPlaceholder: 'API Key (if required)'
  }
};

/**
 * Persists LLM configuration to localStorage
 */
export function saveLLMConfig(config) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save LLM config to localStorage:', e);
    }
  }
}

/**
 * Clears saved LLM configuration from localStorage
 */
export function clearLLMConfig() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear LLM config from localStorage:', e);
    }
  }
}

/**
 * Retrieves full LLM configuration.
 * Priority order:
 *  1. Active runtime overrides (passed as argument)
 *  2. User saved preferences in localStorage
 *  3. Environment variables (.env)
 */
export function getLLMConfig(overrides = {}) {
  if (typeof overrides === 'string') {
    overrides = { apiKey: overrides };
  }

  // 1. Read stored config from localStorage if available
  let stored = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const item = window.localStorage.getItem(CONFIG_STORAGE_KEY);
      if (item) stored = JSON.parse(item);
    } catch (_) { }
  }

  // 2. Read environment variables
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

  // API Key
  let apiKey = (
    overrides.apiKey ??
    stored.apiKey ??
    env.VITE_LLM_API_KEY ??
    env.VITE_OPENAI_API_KEY ??
    env.VITE_GEMINI_API_KEY ??
    env.VITE_ANTHROPIC_API_KEY ??
    env.VITE_GROQ_API_KEY ??
    env.VITE_OPENROUTER_API_KEY ??
    env.VITE_DEEPSEEK_API_KEY ??
    ''
  ).trim();

  // Base URL
  let baseUrl = (
    overrides.baseUrl ??
    stored.baseUrl ??
    env.VITE_LLM_BASE_URL ??
    ''
  ).trim();

  // Model Name
  let model = (
    overrides.model ??
    stored.model ??
    env.VITE_LLM_MODEL ??
    env.VITE_MODEL_NAME ??
    ''
  ).trim();

  // If model was set to retired gemini-2.5-flash, upgrade it to gemini-3.5-flash-lite
  if (model === 'gemini-2.5-flash') {
    model = 'gemini-3.5-flash-lite';
  }

  // Provider
  let provider = (
    overrides.provider ??
    stored.provider ??
    env.VITE_LLM_PROVIDER ??
    'auto'
  ).toLowerCase().trim();

  // Automatic provider detection if set to 'auto' or unspecified
  if (!provider || provider === 'auto') {
    if (baseUrl.includes('generativelanguage.googleapis.com')) {
      provider = 'gemini';
    } else if (baseUrl.includes('anthropic.com')) {
      provider = 'anthropic';
    } else if (baseUrl.includes('groq.com')) {
      provider = 'groq';
    } else if (baseUrl.includes('openrouter.ai')) {
      provider = 'openrouter';
    } else if (baseUrl.includes('deepseek.com')) {
      provider = 'deepseek';
    } else if (baseUrl.includes('together.xyz')) {
      provider = 'together';
    } else if (baseUrl.includes('mistral.ai')) {
      provider = 'mistral';
    } else if (baseUrl.includes('11434') || baseUrl.includes('ollama')) {
      provider = 'ollama';
    } else if (baseUrl.includes('1234') || baseUrl.includes('lmstudio')) {
      provider = 'lmstudio';
    } else if (apiKey.startsWith('sk-ant-') || model.startsWith('claude')) {
      provider = 'anthropic';
    } else if (apiKey.startsWith('gsk_')) {
      provider = 'groq';
    } else if (apiKey.startsWith('sk-or-')) {
      provider = 'openrouter';
    } else if (apiKey.startsWith('dsk-') || model.startsWith('deepseek')) {
      provider = 'deepseek';
    } else if (model.startsWith('gpt') || model.startsWith('o1') || model.startsWith('o3') || (apiKey.startsWith('sk-') && !apiKey.startsWith('AQ.'))) {
      provider = 'openai';
    } else if (model.startsWith('gemini') || apiKey.startsWith('AIza') || apiKey.startsWith('AQ.')) {
      provider = 'gemini';
    } else if (model.includes('llama') || model.includes('mistral') || model.includes('qwen')) {
      provider = baseUrl ? 'custom' : 'groq';
    } else if (baseUrl) {
      provider = 'custom';
    } else {
      provider = 'gemini';
    }
  }

  // Lookup preset
  const preset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;

  if (!baseUrl) {
    baseUrl = preset.defaultBaseUrl;
  }
  // Normalize base URL (strip trailing slashes and /chat/completions)
  baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/chat\/completions$/, '');

  if (!model) {
    model = preset.defaultModel;
  }

  const protocol = preset.protocol || (provider === 'gemini' ? 'gemini' : provider === 'anthropic' ? 'anthropic' : 'openai');

  return { apiKey, provider, model, baseUrl, protocol };
}

// Backward compatibility export
export function getApiKey(overrideKey = null) {
  return getLLMConfig(overrideKey).apiKey;
}

/**
 * Quick connection test to verify that the active provider, model, and API key work.
 */
export async function testLLMConnection(testConfig = {}) {
  const config = getLLMConfig(testConfig);
  const startTime = Date.now();

  const testPrompt = 'Respond strictly with this exact JSON object: {"status": "ok", "message": "connection successful"}';

  const result = await callUniversalLLMJSON({
    prompt: testPrompt,
    schema: {
      type: "object",
      properties: {
        status: { type: "string" },
        message: { type: "string" }
      },
      required: ["status"]
    },
    llmConfig: config,
    systemInstruction: "You are a test ping responder. Output strictly valid JSON.",
    maxRetries: 1
  });

  const latencyMs = Date.now() - startTime;
  return {
    success: true,
    latencyMs,
    model: config.model,
    provider: config.provider,
    result
  };
}

/**
 * Universal JSON inference call that executes against OpenAI, Gemini, Anthropic, or Custom formats.
 */
export async function callUniversalLLMJSON({
  prompt,
  schema = null,
  llmConfig = {},
  systemInstruction = null,
  maxRetries = 2
}) {
  const config = getLLMConfig(llmConfig);

  const isLocal =
    config.baseUrl.includes('localhost') ||
    config.baseUrl.includes('127.0.0.1') ||
    config.baseUrl.includes('0.0.0.0') ||
    config.provider === 'ollama' ||
    config.provider === 'lmstudio';

  if (!isLocal && (!config.apiKey || config.apiKey.length === 0)) {
    throw new Error(
      `API Key missing for ${config.provider.toUpperCase()}. Please configure your API key in .env or active settings.`
    );
  }

  if (config.protocol === 'anthropic' || config.provider === 'anthropic') {
    return await executeAnthropicJSON({
      prompt,
      schema,
      config,
      systemInstruction,
      maxRetries
    });
  } else if (config.protocol === 'gemini' || config.provider === 'gemini') {
    return await executeGeminiJSON({
      prompt,
      schema,
      config,
      systemInstruction,
      maxRetries
    });
  } else {
    // OpenAI and all OpenAI-compatible endpoints
    return await executeOpenAIJSON({
      prompt,
      schema,
      config,
      systemInstruction,
      maxRetries
    });
  }
}

// Backward-compatible alias
export const callGeminiJSON = callUniversalLLMJSON;

/**
 * Executes a call using OpenAI-compatible /chat/completions format.
 * Compatible with OpenAI, Groq, OpenRouter, Together AI, DeepSeek, Local Ollama, LMStudio, vLLM.
 */
async function executeOpenAIJSON({
  prompt,
  schema,
  config,
  systemInstruction,
  maxRetries
}) {
  const endpoint = `${config.baseUrl}/chat/completions`;
  const stdSchema = toStandardJsonSchema(schema);

  const systemContent =
    (systemInstruction || "You are an elite academic curriculum architect and psychometrician.") +
    "\nOutput strictly valid JSON conforming exactly to the requested schema. Do NOT include markdown code fences, thought tags, or conversational commentary.";

  const userContent = schema
    ? `${prompt}\n\n### MANDATORY JSON OUTPUT SCHEMA:\n${JSON.stringify(stdSchema, null, 2)}\n\nRespond with raw JSON conforming to this schema.`
    : prompt;

  const isReasoningModel =
    config.model.startsWith('o1') ||
    config.model.startsWith('o3') ||
    config.model.includes('deepseek-reasoner');

  let useJsonFormat = true;
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const headers = {
        "Content-Type": "application/json"
      };

      if (config.apiKey) {
        headers["Authorization"] = `Bearer ${config.apiKey}`;
      } else {
        headers["Authorization"] = "Bearer ollama";
      }

      if (config.provider === 'openrouter' || config.baseUrl.includes('openrouter.ai')) {
        headers["HTTP-Referer"] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        headers["X-Title"] = "MindBridge";
      }

      const payload = {
        model: config.model,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent }
        ],
        ...(isReasoningModel ? {} : { temperature: 0.2 }),
        ...(useJsonFormat && !isReasoningModel ? { response_format: { type: "json_object" } } : {})
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;

        // If response_format is rejected by this model/provider, retry with prompt-based JSON
        if (useJsonFormat && (response.status === 400 || response.status === 422) &&
          (errorMessage.includes('response_format') || errorMessage.includes('json_object') || errorMessage.includes('format'))) {
          console.warn(`[${config.model}] response_format not supported. Retrying with prompt-guided JSON...`);
          useJsonFormat = false;
          continue;
        }

        if (response.status === 429 || response.status === 500 || response.status === 503 || response.status === 529) {
          attempt++;
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[${config.model}] Status ${response.status}. Retrying in ${Math.round(waitTime)}ms...`);
          await delay(waitTime);
          continue;
        }

        throw new Error(`[${config.model}] API Error (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      const content = message?.content || message?.reasoning_content;

      if (!content) {
        throw new Error(`[${config.model}] Empty response content received from inference endpoint.`);
      }

      return cleanAndParseJSON(content);
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt >= maxRetries) break;
      await delay(1000 * attempt);
    }
  }

  throw lastError || new Error(`Failed to generate response using model ${config.model}`);
}

/**
 * Executes a call using Google Generative Language format with multi-model auto-fallback
 */
async function executeGeminiJSON({
  prompt,
  schema,
  config,
  systemInstruction,
  maxRetries
}) {
  const cleanModel = (config.model || '').replace(/^models\//, '').trim();
  const modelsToTry = [...new Set([
    // If the configured model is retired (2.5) or overloaded (3.5-flash), use the fast, high-uptime 3.5-flash-lite
    cleanModel === 'gemini-2.5-flash' || cleanModel === 'gemini-3.5-flash' ? 'gemini-3.5-flash-lite' : cleanModel,
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview'
  ])].filter(Boolean);

  let lastError = null;

  for (const modelName of modelsToTry) {
    const endpoint = `${config.baseUrl}/models/${modelName}:generateContent?key=${config.apiKey}`;
    let attempt = 0;
    let useSchema = Boolean(schema);

    while (attempt < maxRetries) {
      try {
        const payload = {
          contents: [{
            role: "user",
            parts: [{
              text: !useSchema && schema
                ? `${prompt}\n\n### MANDATORY JSON OUTPUT SCHEMA:\n${JSON.stringify(toStandardJsonSchema(schema), null, 2)}\n\nRespond strictly with raw JSON conforming to this schema.`
                : prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            ...(useSchema ? { responseSchema: schema } : {})
          },
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {})
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || response.statusText;

          // If schema is rejected by this particular model, fallback without responseSchema
          if (useSchema && response.status === 400 && (errorMessage.includes('schema') || errorMessage.includes('Schema') || errorMessage.includes('responseSchema'))) {
            useSchema = false;
            continue;
          }

          // If 503 (temporary high demand spike on Google servers), retry with short backoff before abandoning
          if (response.status === 503) {
            attempt++;
            if (attempt < 2) {
              console.warn(`[Gemini ${modelName}] 503 temporary overload. Retrying in 1.5s...`);
              await delay(1500 + Math.random() * 500);
              continue;
            }
            console.warn(`[Gemini ${modelName}] 503 persists. Falling over to next verified model in chain...`);
            lastError = new Error(`[Gemini ${modelName}] (503): ${errorMessage}`);
            break; // Try next model in modelsToTry
          }

          // If model is 404 (retired/not found) or 429 quota limit hit on free tier, try next fallback model
          if (response.status === 404 || (response.status === 429 && (errorMessage.includes('limit: 20') || errorMessage.includes('quota')))) {
            console.warn(`[Gemini ${modelName}] Status ${response.status}. Trying next fallback model...`);
            lastError = new Error(`[Gemini ${modelName}] (${response.status}): ${errorMessage}`);
            break; // Try next model in modelsToTry
          }

          if (response.status === 429 || response.status === 500) {
            attempt++;
            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            await delay(waitTime);
            continue;
          }

          throw new Error(`[Gemini ${modelName}] API Error (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error(`[Gemini ${modelName}] Received empty response candidate from API.`);
        }

        return cleanAndParseJSON(rawText);
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt >= maxRetries) break;
        await delay(800 * attempt);
      }
    }
  }

  throw lastError || new Error(`Failed to generate content from Gemini API across models.`);
}

/**
 * Executes a call using Anthropic Claude direct Messages API format
 */
async function executeAnthropicJSON({
  prompt,
  schema,
  config,
  systemInstruction,
  maxRetries
}) {
  const endpoint = `${config.baseUrl}/messages`;
  const stdSchema = toStandardJsonSchema(schema);

  const systemContent =
    (systemInstruction || "You are an elite academic curriculum architect and psychometrician.") +
    "\nOutput strictly valid JSON conforming exactly to the requested schema. Do NOT include markdown code fences, thought tags, or conversational commentary.";

  const userContent = schema
    ? `${prompt}\n\n### MANDATORY JSON OUTPUT SCHEMA:\n${JSON.stringify(stdSchema, null, 2)}\n\nRespond strictly with raw JSON conforming to this schema.`
    : prompt;

  const payload = {
    model: config.model,
    max_tokens: 4096,
    system: systemContent,
    messages: [
      { role: "user", content: userContent }
    ],
    temperature: 0.2
  };

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;

        if (response.status === 429 || response.status === 500 || response.status === 529) {
          attempt++;
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await delay(waitTime);
          continue;
        }

        throw new Error(`[Anthropic ${config.model}] (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text;
      if (!text) {
        throw new Error(`[Anthropic ${config.model}] Received empty content in response.`);
      }

      return cleanAndParseJSON(text);
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt >= maxRetries) break;
      await delay(1000 * attempt);
    }
  }

  throw lastError || new Error(`Failed to generate response using Anthropic model ${config.model}`);
}

/**
 * Resilient JSON parser that handles code fences, reasoning tags (<think>),
 * preamble text, and minor JSON quirks across different LLMs.
 */
export function cleanAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received from LLM inference.');
  }

  // 1. Strip reasoning blocks (<think>...</think>) from reasoning models
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 2. Try direct JSON.parse
  try {
    return JSON.parse(cleaned);
  } catch (_) { }

  // 3. Extract content inside markdown fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) {
      cleaned = fenceMatch[1].trim();
    }
  }

  // 4. Extract outer bracketed structure
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx > startIdx) {
    const candidate = cleaned.slice(startIdx, endIdx + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // Clean trailing commas and unicode quotes
      const sanitized = candidate
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/[\u201C\u201D]/g, '"');
      try {
        return JSON.parse(sanitized);
      } catch (_) { }
    }
  }

  // 5. Final fallback
  const fallback = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

  return JSON.parse(fallback);
}

/**
 * Summarizes text chunks when input exceeds word threshold
 */
export async function summarizeTextChunk(chunkText, chunkIndex, totalChunks, llmConfig) {
  const prompt = buildChunkSummaryPrompt({ chunkText, chunkIndex, totalChunks });
  try {
    const result = await callUniversalLLMJSON({
      prompt: `${prompt}\n\nRespond with a JSON object: {"summary": "your summary text here"}`,
      llmConfig,
      maxRetries: 2
    });
    return result.summary || chunkText;
  } catch (e) {
    return chunkText;
  }
}

/**
 * Generate Content Map (Single Source of Truth)
 */
export async function generateContentMap(rawOrSummarizedText, teacherSettings, llmConfig) {
  const profile = DIFFICULTY_PROFILES[teacherSettings.difficulty] || DIFFICULTY_PROFILES.Introductory;
  const prompt = buildContentMapPrompt({
    rawOrSummarizedText,
    teacherSettings,
    difficultyProfile: profile
  });

  return await callUniversalLLMJSON({
    prompt,
    schema: contentMapSchema,
    llmConfig,
    systemInstruction: "You are an elite academic curriculum architect. Generate rigorously grounded, structured content maps in strict JSON format."
  });
}

/**
 * Generate Lesson Plan
 */
export async function generateLessonPlan(contentMap, teacherSettings, llmConfig) {
  const profile = DIFFICULTY_PROFILES[teacherSettings.difficulty] || DIFFICULTY_PROFILES.Introductory;
  const prompt = buildLessonPlanPrompt({
    contentMap,
    teacherSettings,
    difficultyProfile: profile
  });

  return await callUniversalLLMJSON({
    prompt,
    schema: lessonPlanSchema,
    llmConfig
  });
}

/**
 * Generate Rubric
 */
export async function generateRubric(contentMap, teacherSettings, llmConfig) {
  const profile = DIFFICULTY_PROFILES[teacherSettings.difficulty] || DIFFICULTY_PROFILES.Introductory;
  const prompt = buildRubricPrompt({
    contentMap,
    teacherSettings,
    difficultyProfile: profile
  });

  return await callUniversalLLMJSON({
    prompt,
    schema: rubricSchema,
    llmConfig
  });
}

/**
 * Generate Flashcards
 */
export async function generateFlashcards(contentMap, teacherSettings, llmConfig) {
  const profile = DIFFICULTY_PROFILES[teacherSettings.difficulty] || DIFFICULTY_PROFILES.Introductory;
  const prompt = buildFlashcardsPrompt({
    contentMap,
    teacherSettings,
    difficultyProfile: profile,
    count: teacherSettings.flashcardCount || 10
  });

  return await callUniversalLLMJSON({
    prompt,
    schema: flashcardsSchema,
    llmConfig
  });
}

/**
 * Generate Quiz Bank
 */
export async function generateQuizBank(contentMap, teacherSettings, llmConfig) {
  const profile = DIFFICULTY_PROFILES[teacherSettings.difficulty] || DIFFICULTY_PROFILES.Introductory;
  const prompt = buildQuizBankPrompt({
    contentMap,
    teacherSettings,
    difficultyProfile: profile
  });

  return await callUniversalLLMJSON({
    prompt,
    schema: quizBankSchema,
    llmConfig
  });
}

/**
 * Recalibrate a specific artifact when Bloom's drift exceeds threshold
 */
export async function recalibrateArtifact({
  artifactType,
  currentArtifact,
  contentMap,
  targetProfile,
  driftDetails,
  llmConfig
}) {
  let schema = null;
  if (artifactType === 'lessonPlan') schema = lessonPlanSchema;
  else if (artifactType === 'rubric') schema = rubricSchema;
  else if (artifactType === 'flashcards') schema = flashcardsSchema;
  else if (artifactType === 'quizBank') schema = quizBankSchema;

  const prompt = buildRecalibratePrompt({
    artifactType,
    currentArtifact,
    contentMap,
    targetProfile,
    driftDetails,
    schema
  });

  return await callUniversalLLMJSON({
    prompt,
    schema,
    llmConfig
  });
}

/**
 * Calibrate an individual item (Make Harder / Make Easier)
 */
export async function adjustItemDifficulty({
  itemType,
  item,
  direction,
  contentMap,
  targetProfile,
  llmConfig
}) {
  const prompt = buildItemDifficultyPrompt({
    itemType,
    item,
    direction,
    contentMap,
    targetProfile
  });

  return await callUniversalLLMJSON({
    prompt,
    schema: null,
    llmConfig
  });
}

/**
 * Generate a missing item mapped to an uncovered Learning Objective
 */
export async function generateMissingItemForObjective({
  objective,
  artifactType,
  contentMap,
  teacherSettings,
  llmConfig
}) {
  const profile = DIFFICULTY_PROFILES[teacherSettings.difficulty] || DIFFICULTY_PROFILES.Introductory;
  const prompt = `You are an assessment item developer.
Generate ONE single ${artifactType === 'quizBank' ? 'quiz question' : artifactType === 'flashcards' ? 'flashcard' : 'rubric criterion'} specifically targeting the following uncovered Learning Objective:
- ID: ${objective.id}
- Objective: ${objective.description}
- Bloom's Level: ${objective.bloom_level}
- Source Section: ${objective.source_section}

Difficulty: ${teacherSettings.difficulty}
Audience: ${teacherSettings.audience}

Grounded only in this Content Map context:
${JSON.stringify(contentMap, null, 2)}

Return strictly a single JSON object corresponding to one item in the ${artifactType} collection.`;

  return await callUniversalLLMJSON({
    prompt,
    schema: null,
    llmConfig
  });
}
