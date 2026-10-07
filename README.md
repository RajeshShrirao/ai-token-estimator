# AI Token Estimator — Token Counter & LLM Cost Calculator (TypeScript)

Dependency-free **AI token counter** and **LLM API cost estimator** for GPT-4o, Claude 3.5, Gemini, Llama 3.1, Mistral and DeepSeek. Paste text in, get token counts plus estimated input/output cost in USD — no tokenizer WASM, no API key, works in Node and the browser.

> 🖥️ **Prefer a UI?** Try the free interactive version: **[AI Token Calculator — NextReach Studio](https://www.nextreachstudio.in/tools/ai-token-calculator)**

## Install

No dependencies. Copy `src/index.ts` into your project, or clone:

```bash
git clone https://github.com/RajeshShrirao/ai-token-estimator.git
```

## Usage

```ts
import { estimateTokens, formatTokens, formatUSD, MODELS } from "./src/index.js";

// Estimate tokens for a prompt on GPT-4o, assuming a 500-token reply
const r = estimateTokens("Summarise this quarterly report…", "gpt-4o", 500);

console.log(formatTokens(r.tokens)); // e.g. "1.2K"
console.log(formatUSD(r.costUSD));   // e.g. "$0.0080"
console.log(r.words, r.characters);  // word / char breakdown
```

List supported models:

```ts
import { MODELS } from "./src/index.js";
console.log(MODELS.map((m) => m.id));
// gpt-4o, gpt-4o-mini, claude-35-sonnet, claude-35-haiku,
// gemini-15-pro, llama-31-70b, mistral-large, deepseek-v3
```

## How it estimates

Real tokenizers (tiktoken, SentencePiece) need per-model vocab files. This library blends two cheap signals calibrated per model family — word count (dominates for prose) and character count (dominates for code and CJK text) — and prices the result against public per-million-token rates. Within ~10–20% of exact counts for English text: good enough for budgeting prompts, sizing context windows, and comparing model costs.

## Supported models

| Model | Pricing (input / output per 1M) |
|---|---|
| GPT-4o / GPT-4o mini | $2.50 / $10 · $0.15 / $0.60 |
| Claude 3.5 Sonnet / Haiku | $3 / $15 · $0.80 / $4 |
| Gemini 1.5 Pro | $1.25 / $5 |
| Llama 3.1 70B | $0.35 / $0.40 |
| Mistral Large | $2 / $6 |
| DeepSeek V3 | $0.27 / $1.10 |

Rates change — check provider pages before billing decisions.

## Related free tools

- [LLM Cost Calculator](https://www.nextreachstudio.in/tools/llm-cost-calculator) — compare API spend across providers
- [Context Window Calculator](https://www.nextreachstudio.in/tools/context-window-calculator) — capacity & truncation analysis
- [VRAM Estimator](https://www.nextreachstudio.in/tools/vram-estimator) — GPU sizing for local LLMs

## Built by

**[NextReach Studio](https://www.nextreachstudio.in)** — senior-engineered software & AI studio in Pune, India. Fixed-scope websites in 24–72 hours, custom software & AI systems in 2–4 weeks. Contact: hello@nextreachstudio.in

## License

MIT — see [LICENSE](./LICENSE).
