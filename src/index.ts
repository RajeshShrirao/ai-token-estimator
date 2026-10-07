/**
 * ai-token-estimator — dependency-free token & cost estimation for LLM APIs.
 *
 * Heuristic estimator (no tokenizer WASM needed): blends word-count and
 * character-count signals calibrated per model family, then prices the
 * result against public per-million-token rates.
 *
 * Model lineup + prices verified 2026-10-07 against each provider's official
 * pricing page (linked per model in `source`). Standard / non-cached /
 * short-context rates. Rates change often — re-verify before billing decisions.
 *
 * MIT License — Built by NextReach Studio (https://www.nextreachstudio.in)
 */

export interface ModelProfile {
  /** Stable id, e.g. "gpt-6-1-sol" */
  id: string;
  /** Human label */
  label: string;
  /** Average characters per token for English prose/code mix */
  charsPerToken: number;
  /** USD per 1M input tokens, standard tier (0 = unknown) */
  inputPerMTok: number;
  /** USD per 1M output tokens, standard tier (0 = unknown) */
  outputPerMTok: number;
  /** Official pricing page this rate was verified against */
  source: string;
}

const OPENAI_PRICING = "https://developers.openai.com/api/docs/pricing";
const ANTHROPIC_PRICING = "https://platform.claude.com/docs/en/models/overview";
const GEMINI_PRICING = "https://ai.google.dev/gemini-api/docs/pricing";
const DEEPSEEK_PRICING = "https://api-docs.deepseek.com/quick_start/pricing/";
const MISTRAL_PRICING = "https://docs.mistral.ai/inference/pricing";

export const MODELS: ModelProfile[] = [
  // --- OpenAI: GPT-6 generation + GPT-5.6 (official pricing) ---
  { id: "gpt-6-astra", label: "GPT-6 Astra (flagship)", charsPerToken: 4.0, inputPerMTok: 10, outputPerMTok: 50, source: OPENAI_PRICING },
  { id: "gpt-6-1-sol", label: "GPT-6.1 Sol", charsPerToken: 4.0, inputPerMTok: 2, outputPerMTok: 10, source: OPENAI_PRICING },
  { id: "gpt-6-luna", label: "GPT-6 Luna (cheapest)", charsPerToken: 4.0, inputPerMTok: 0.1, outputPerMTok: 0.5, source: OPENAI_PRICING },
  { id: "gpt-5-6-sol", label: "GPT-5.6 Sol", charsPerToken: 4.0, inputPerMTok: 4, outputPerMTok: 20, source: OPENAI_PRICING },
  // --- Anthropic: Claude 5 generation (official docs) ---
  { id: "claude-fable-5-1", label: "Claude Fable 5.1 (reasoning)", charsPerToken: 3.8, inputPerMTok: 10, outputPerMTok: 50, source: ANTHROPIC_PRICING },
  { id: "claude-opus-5-5", label: "Claude Opus 5.5", charsPerToken: 3.8, inputPerMTok: 4, outputPerMTok: 20, source: ANTHROPIC_PRICING },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", charsPerToken: 3.8, inputPerMTok: 2, outputPerMTok: 10, source: ANTHROPIC_PRICING },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5 (fastest)", charsPerToken: 3.8, inputPerMTok: 1, outputPerMTok: 5, source: ANTHROPIC_PRICING },
  // --- Google: Gemini 3 generation, standard tier ≤200k tokens (official docs) ---
  { id: "gemini-3-pro", label: "Gemini 3 Pro", charsPerToken: 4.0, inputPerMTok: 2, outputPerMTok: 12, source: GEMINI_PRICING },
  { id: "gemini-3-flash", label: "Gemini 3 Flash", charsPerToken: 4.0, inputPerMTok: 0.5, outputPerMTok: 3, source: GEMINI_PRICING },
  { id: "gemini-3-5-flash-lite", label: "Gemini 3.5 Flash-Lite", charsPerToken: 4.0, inputPerMTok: 0.3, outputPerMTok: 2.5, source: GEMINI_PRICING },
  // --- DeepSeek: V4 generation, peak cache-miss rates (official docs; off-peak is half) ---
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", charsPerToken: 3.2, inputPerMTok: 1.32, outputPerMTok: 3.96, source: DEEPSEEK_PRICING },
  { id: "deepseek-flash", label: "DeepSeek V4.1 Flash", charsPerToken: 3.2, inputPerMTok: 0.3, outputPerMTok: 1.2, source: DEEPSEEK_PRICING },
  // --- Meta Llama 4 via hosted inference (Together AI / Fireworks prevailing rates) ---
  { id: "llama-4-maverick", label: "Llama 4 Maverick (hosted)", charsPerToken: 3.6, inputPerMTok: 0.15, outputPerMTok: 0.6, source: "https://www.together.ai/pricing" },
  // --- Mistral (official docs) ---
  { id: "mistral-large-3", label: "Mistral Large 3", charsPerToken: 3.7, inputPerMTok: 0.5, outputPerMTok: 1.5, source: MISTRAL_PRICING },
  { id: "mistral-medium-3-5", label: "Mistral Medium 3.5", charsPerToken: 3.7, inputPerMTok: 1.5, outputPerMTok: 7.5, source: MISTRAL_PRICING },
  { id: "mistral-small-4", label: "Mistral Small 4", charsPerToken: 3.7, inputPerMTok: 0.15, outputPerMTok: 0.6, source: MISTRAL_PRICING },
];

export interface Estimate {
  model: string;
  characters: number;
  words: number;
  /** Estimated input tokens */
  tokens: number;
  /** Estimated cost in USD for `outputTokens` of generation (0 if unpriced) */
  costUSD: number;
}

/**
 * Estimate tokens for `text` on `modelId` (defaults to gpt-6-1-sol).
 * Returns 0 tokens for empty/whitespace input.
 */
export function estimateTokens(text: string, modelId = "gpt-6-1-sol", outputTokens = 0): Estimate {
  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Blend: word-based signal dominates for prose, char-based for code/CJK.
  const tokens = words === 0 ? 0 : Math.ceil(words * 1.3 + characters / model.charsPerToken / 2);

  const costUSD =
    model.inputPerMTok > 0
      ? (tokens / 1_000_000) * model.inputPerMTok + (outputTokens / 1_000_000) * model.outputPerMTok
      : 0;

  return { model: model.id, characters, words, tokens, costUSD };
}

/** Format a token count for UI display, e.g. 1500 -> "1.5K". */
export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

/** Format USD, e.g. 0.0025 -> "$0.0025". */
export function formatUSD(n: number): string {
  return `$${n.toFixed(n < 0.01 && n > 0 ? 4 : 2)}`;
}
