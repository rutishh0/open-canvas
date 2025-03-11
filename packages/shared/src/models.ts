import { CustomModelConfig, ModelConfigurationParams } from "./types.js";

// Empty arrays for unused model types
const AZURE_MODELS: ModelConfigurationParams[] = [];
const OPENAI_MODELS: ModelConfigurationParams[] = [];
const OLLAMA_MODELS: ModelConfigurationParams[] = [];
const ANTHROPIC_MODELS: ModelConfigurationParams[] = [];
const FIREWORKS_MODELS: ModelConfigurationParams[] = [];
const GROQ_MODELS: ModelConfigurationParams[] = [];
const GEMINI_MODELS: ModelConfigurationParams[] = [];

// Only keep the OpenRouter Gemini Flash model
const OPENROUTER_MODELS: ModelConfigurationParams[] = [
  {
    name: "google/gemini-2.0-flash-exp:free",
    label: "Google: Gemini Flash 2.0 Experimental",
    config: {
      provider: "openai", // OpenRouter uses OpenAI-compatible API
      temperatureRange: {
        min: 0,
        max: 1,
        default: 0.7,
        current: 0.7,
      },
      maxTokens: {
        min: 1,
        max: 8192,
        default: 4096,
        current: 4096,
      },
    },
    isNew: true,
  }
];

export const LANGCHAIN_USER_ONLY_MODELS: string[] = [];

// Models which do NOT support the temperature parameter.
export const TEMPERATURE_EXCLUDED_MODELS: string[] = [];

// Models which do NOT stream back tool calls.
export const NON_STREAMING_TOOL_CALLING_MODELS: string[] = [];

// Models which do NOT stream back text.
export const NON_STREAMING_TEXT_MODELS: string[] = [];

// Models which preform CoT before generating a final response.
export const THINKING_MODELS: string[] = [];

// Only include the OpenRouter model
export const ALL_MODELS: ModelConfigurationParams[] = [
  ...OPENROUTER_MODELS,
];

type OPENAI_MODEL_NAMES = (typeof OPENAI_MODELS)[number]["name"];
type ANTHROPIC_MODEL_NAMES = (typeof ANTHROPIC_MODELS)[number]["name"];
type FIREWORKS_MODEL_NAMES = (typeof FIREWORKS_MODELS)[number]["name"];
type GEMINI_MODEL_NAMES = (typeof GEMINI_MODELS)[number]["name"];
type AZURE_MODEL_NAMES = (typeof AZURE_MODELS)[number]["name"];
type OLLAMA_MODEL_NAMES = (typeof OLLAMA_MODELS)[number]["name"];
type GROQ_MODEL_NAMES = (typeof GROQ_MODELS)[number]["name"];
type OPENROUTER_MODEL_NAMES = (typeof OPENROUTER_MODELS)[number]["name"];
export type ALL_MODEL_NAMES =
  | OPENAI_MODEL_NAMES
  | ANTHROPIC_MODEL_NAMES
  | FIREWORKS_MODEL_NAMES
  | GEMINI_MODEL_NAMES
  | AZURE_MODEL_NAMES
  | OLLAMA_MODEL_NAMES
  | GROQ_MODEL_NAMES
  | OPENROUTER_MODEL_NAMES;

// Set the default model to the Gemini Flash model
export const DEFAULT_MODEL_NAME: ALL_MODEL_NAMES = OPENROUTER_MODELS[0].name;
export const DEFAULT_MODEL_CONFIG: CustomModelConfig = {
  ...OPENROUTER_MODELS[0].config,
  temperatureRange: { ...OPENROUTER_MODELS[0].config.temperatureRange },
  maxTokens: { ...OPENROUTER_MODELS[0].config.maxTokens },
};