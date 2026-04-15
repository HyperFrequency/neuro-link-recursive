---
name: auto-rag
description: >
  Auto-RAG context injection for neuro-link-recursive. Injects relevant wiki page content into the
  current conversation based on topic detection. Works via the auto-rag-inject.sh UserPromptSubmit hook
  (keyword matching against 02-KB-main/index.md) or invoked directly for preview mode.
  Use when the user says /auto-rag preview <prompt> to see what context would be injected,
  /auto-rag rebuild to regenerate the keyword index, or /auto-rag status to check injection stats.
  The hook-driven mode fires automatically on every prompt when auto_rag=true in config.
metadata:
  openclaw:
    icon: "zap"
    requires:
      bins: [python3]
---

# /auto-rag

Automatic context injection from the neuro-link-recursive knowledge base.

## How It Works

### Hook-Driven (Automatic)

The `auto-rag-inject.sh` hook fires on every `UserPromptSubmit`:
1. Extracts keywords from the user's prompt
2. Matches against the topic index at `02-KB-main/index.md`
3. If match found: reads the Overview + Conceptual Model sections of the matching wiki page(s)
4. Injects as `additionalContext` — the agent sees it as a system reminder

This is designed to be **fast** (<100ms). No LLM calls — pure keyword grep.

### Direct Invocation

| Command | Action |
|---------|--------|
| `/auto-rag preview <prompt>` | Show what context would be injected for this prompt |
| `/auto-rag rebuild` | Regenerate the keyword index from current wiki pages |
| `/auto-rag status` | Show injection stats (hits, misses, top topics) |
| `/auto-rag on` / `/auto-rag off` | Toggle auto-injection |

## When to Use

- `/auto-rag preview` — to debug or preview context injection
- `/auto-rag rebuild` — after bulk wiki updates to ensure index is current
- `/auto-rag status` — to understand injection patterns

## When NOT to Use

- Don't invoke directly for context — just ask your question and let the hook inject
- For deep research — use parallel-web, research-lookup, or deep-tool-wiki
- For code-specific context — use docs-dual-lookup

## Procedure

### `preview <prompt>`

1. Read `02-KB-main/index.md` for the topic list
2. Extract keywords from the provided prompt (split on spaces, lowercase, remove stop words)
3. Match keywords against page titles, domains, and wikilinks
4. For each match: read the first 200 lines of the wiki page
5. Display the context that WOULD be injected, with match scores

### `rebuild`

1. Glob `02-KB-main/**/*.md` (exclude schema, index, log)
2. For each page: extract title, domain, wikilinks, and first 5 lines of Overview
3. Build a keyword index: `state/auto-rag-index.json`
   ```json
   {
     "keywords": {
       "market-microstructure": ["02-KB-main/trading/market-microstructure.md"],
       "nautilus": ["02-KB-main/trading/nautilus-trader.md", "02-KB-main/trading/order-routing.md"]
     },
     "pages": {
       "02-KB-main/trading/market-microstructure.md": {
         "title": "Market Microstructure",
         "domain": "trading",
         "keywords": ["market", "microstructure", "orderbook", "spread"],
         "overview": "First 200 chars..."
       }
     }
   }
   ```
4. Report: N pages indexed, M unique keywords

### `status`

Read `state/session_log.jsonl` and count:
- Total prompts since last rebuild
- Prompts with auto-rag injection (hits)
- Prompts without injection (misses)
- Top 10 most-injected topics
- Top 10 keywords that didn't match anything (potential gap indicators)

## Phase 2: Semantic RAG

When Qdrant is available:
1. Embed wiki pages with Octen 8B (4096 dimensions)
2. On prompt: embed the prompt, search Qdrant for nearest wiki chunks
3. Hybrid scoring: keyword match score + semantic similarity + recency weight
4. This replaces the keyword grep with true semantic retrieval
