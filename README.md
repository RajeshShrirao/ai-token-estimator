# AI Token Estimator — Token Counter & LLM Cost Calculator (TypeScript)

Dependency-free **AI token counter** and **LLM API cost estimator** for GPT-6, Claude 5, Gemini 3, DeepSeek V4, Llama 4 and Mistral. Paste text in, get token counts plus estimated input/output cost in USD — no tokenizer WASM, no API key, works in Node and the browser.

> 🖥️ **Prefer a UI?** Try the free interactive version: **[AI Token Calculator — NextReach Studio](https://www.nextreachstudio.in/tools/ai-token-calculator)**

> 📅 **Model lineup verified 2026-10-07** against each provider's official pricing page (linked per model in code via `source`). Standard / non-cached / short-context rates. Providers reprice often — re-verify before billing decisions.

## Install

No dependencies. Copy `src/index.ts` into your project, or clone:

```bash
git clone https://github.com/RajeshShrirao/ai-token-estimator.git
```

## Usage

```ts
import { estimateTokens, formatTokens, formatUSD, MODELS } from "./src/index.js";

// Estimate tokens for a prompt on GPT-6.1 Sol, assuming a 500-token reply
const r = estimateTokens("Summarise this quarterly report…", "gpt-6-1-sol", 500);

console.log(formatTokens(r.tokens)); // e.g. "1.2K"
console.log(formatUSD(r.costUSD));   // e.g. "$0.0080"
console.log(r.words, r.characters);  // word / char breakdown
```

List supported models:

```ts
import { MODELS } from "./src/index.js";
console.log(MODELS.map((m) => m.id));
// gpt-6-astra, gpt-6-1-sol, gpt-6-luna, gpt-5-6-sol,
// claude-fable-5-1, claude-opus-5-5, claude-sonnet-5-5, claude-haiku-4-5,
// gemini-3-pro, gemini-3-flash, gemini-3-5-flash-lite,
// deepseek-v4-pro, deepseek-flash, llama-4-maverick,
// mistral-large-3, mistral-medium-3-5, mistral-small-4
```

## How it estimates

Real tokenizers (tiktoken, SentencePiece) need per-model vocab files. This library blends two cheap signals calibrated per model family — word count (dominates for prose) and character count (dominates for code and CJK text) — and prices the result against public per-million-token rates. Within ~10–20% of exact counts for English text: good enough for budgeting prompts, sizing context windows, and comparing model costs.

## Supported models

| Model | Pricing (input / output per 1M, standard) | Verified against |
|---|---|---|
| GPT-6 Astra | $10 / $50 | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| GPT-6.1 Sol | $2 / $10 | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| GPT-6 Luna | $0.10 / $0.50 | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| GPT-5.6 Sol | $4 / $20 | [OpenAI pricing](https://developers.openai.com/api/docs/pricing) |
| Claude Fable 5.1 | $10 / $50 | [Anthropic docs](https://platform.claude.com/docs/en/models/overview) |
| Claude Opus 5.5 | $4 / $20 | [Anthropic docs](https://platform.claude.com/docs/en/models/overview) |
| Claude Sonnet 5.5 | $2 / $10 | [Anthropic docs](https://platform.claude.com/docs/en/models/overview) |
| Claude Haiku 4.5 | $1 / $5 | [Anthropic docs](https://platform.claude.com/docs/en/models/overview) |
| Gemini 3 Pro | $2 / $12 | [Google docs](https://ai.google.dev/gemini-api/docs/pricing) |
| Gemini 3 Flash | $0.50 / $3 | [Google docs](https://ai.google.dev/gemini-api/docs/pricing) |
| Gemini 3.5 Flash-Lite | $0.30 / $2.50 | [Google docs](https://ai.google.dev/gemini-api/docs/pricing) |
| DeepSeek V4 Pro | $1.32 / $3.96 (peak; off-peak half) | [DeepSeek docs](https://api-docs.deepseek.com/quick_start/pricing/) |
| DeepSeek V4.1 Flash | $0.30 / $1.20 (peak; off-peak half) | [DeepSeek docs](https://api-docs.deepseek.com/quick_start/pricing/) |
| Llama 4 Maverick (hosted) | $0.15 / $0.60 | prevailing Together/Fireworks rates |
| Mistral Large 3 | $0.50 / $1.50 | [Mistral docs](https://docs.mistral.ai/inference/pricing) |
| Mistral Medium 3.5 | $1.50 / $7.50 | [Mistral docs](https://docs.mistral.ai/inference/pricing) |
| Mistral Small 4 | $0.15 / $0.60 | [Mistral docs](https://docs.mistral.ai/inference/pricing) |

Rates change — check provider pages before billing decisions. OpenAI long-context and Batch/Flex tiers, Gemini >200k-token tiers, and DeepSeek cache-hit/off-peak discounts are intentionally not modeled; standard rates keep estimates comparable.

## Related free tools

- [LLM Cost Calculator](https://www.nextreachstudio.in/tools/llm-cost-calculator) — compare API spend across providers
- [Context Window Calculator](https://www.nextreachstudio.in/tools/context-window-calculator) — capacity & truncation analysis
- [VRAM Estimator](https://www.nextreachstudio.in/tools/vram-estimator) — GPU sizing for local LLMs

## Built by

**[NextReach Studio](https://www.nextreachstudio.in)** — senior-engineered software & AI studio in Pune, India. Fixed-scope websites in 24–72 hours, custom software & AI systems in 2–4 weeks. Contact: hello@nextreachstudio.in

## License

MIT — see [LICENSE](./LICENSE).
