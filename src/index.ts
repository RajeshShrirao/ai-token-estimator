/**
 * ai-token-estimator — dependency-free token & cost estimation for LLM APIs.
 *
 * Heuristic estimator (no tokenizer WASM needed): blends word-count and
 * character-count signals calibrated per model family, then prices the
 * result against public per-million-token rates.
 *
 * MIT License — Built by NextReach Studio (https://www.nextreachstudio.in)
 */

export interface ModelProfile {
  /** Stable id, e.g. "gpt-4o" */
  id: string;
  /** Human label */
  label: string;
  /** Average characters per token for English prose/code mix */
  charsPerToken: number;
  /** USD per 1M input tokens (0 = unknown) */
  inputPerMTok: number;
  /** USD per 1M output tokens (0 = unknown) */
  outputPerMTok: number;
}

export const MODELS: ModelProfile[] = [
  { id: "gpt-4o", label: "GPT-4o", charsPerToken: 4.0, inputPerMTok: 2.5, outputPerMTok: 10 },
  { id: "gpt-4o-mini", label: "GPT-4o mini", charsPerToken: 4.0, inputPerMTok: 0.15, outputPerMTok: 0.6 },
  { id: "claude-35-sonnet", label: "Claude 3.5 Sonnet", charsPerToken: 3.8, inputPerMTok: 3, outputPerMTok: 15 },
  { id: "claude-35-haiku", label: "Claude 3.5 Haiku", charsPerToken: 3.8, inputPerMTok: 0.8, outputPerMTok: 4 },
  { id: "gemini-15-pro", label: "Gemini 1.5 Pro", charsPerToken: 4.0, inputPerMTok: 1.25, outputPerMTok: 5 },
  { id: "llama-31-70b", label: "Llama 3.1 70B", charsPerToken: 3.6, inputPerMTok: 0.35, outputPerMTok: 0.4 },
  { id: "mistral-large", label: "Mistral Large", charsPerToken: 3.7, inputPerMTok: 2, outputPerMTok: 6 },
  { id: "deepseek-v3", label: "DeepSeek V3", charsPerToken: 3.2, inputPerMTok: 0.27, outputPerMTok: 1.1 },
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
 * Estimate tokens for `text` on `modelId` (defaults to gpt-4o).
 * Returns 0 tokens for empty/whitespace input.
 */
export function estimateTokens(text: string, modelId = "gpt-4o", outputTokens = 0): Estimate {
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
