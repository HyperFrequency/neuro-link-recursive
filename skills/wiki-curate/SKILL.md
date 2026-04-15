---
name: wiki-curate
description: >
  Synthesize raw sources into structured wiki pages following the Karpathy LLM-Wiki pattern.
  Reads material from 00-raw/ or 01-sorted/, produces structured markdown in 02-KB-main/ with
  YAML frontmatter, citations, contradiction tracking, open questions, and wikilinks.
  Auto-generates reasoning ontologies via the reasoning-ontology skill.
  Use when the user says /wiki-curate <topic>, asks to "write a wiki page about X",
  "synthesize X into the knowledge base", or auto-triggered after crawl-ingest when auto_curate=true.
metadata:
  openclaw:
    icon: "book"
    requires:
      bins: [python3]
      mcps: [infranodus, turbovault]
---

# /wiki-curate

Karpathy LLM-Wiki synthesis: raw sources → structured, cross-referenced wiki page.

## When to Use

- User says `/wiki-curate <topic>` or "synthesize X" / "write a wiki page about X"
- Auto-triggered after crawl-ingest when `auto_curate: true` in config
- Called by job-scanner for `type: curate` tasks

## When NOT to Use

- To ingest a new source — use crawl-ingest first
- To update an ontology without changing the wiki page — use reasoning-ontology
- For code documentation — use deep-tool-wiki or code-docs (Phase 2)

## Procedure

### Step 1 — Identify source material

1. If topic matches files in `01-sorted/`: use those as primary sources
2. If topic matches existing raw material in `00-raw/`: use that
3. Check if a wiki page already exists in `02-KB-main/` for this topic
   - If yes: this is an UPDATE operation — read existing page, merge new sources
   - If no: this is a CREATE operation

### Step 2 — Read the wiki schema

Read `02-KB-main/schema.md` for:
- Required frontmatter fields
- Section structure
- Citation format
- Contradiction handling rules

### Step 3 — Check for overlap and contradictions

Query existing wiki pages for related content:
1. Grep `02-KB-main/` for mentions of the topic
2. If InfraNodus is available: run `generate_overlap_from_texts` between new source material and existing wiki content
3. Note any contradictions or overlapping claims

### Step 4 — Synthesize the wiki page

Using the `wiki_llm` model from config (default: claude-sonnet-4-6):

1. **Overview** (3 sentences max): What this is, why it matters, key insight
2. **Conceptual Model**: Flowing prose with `[[wikilinks]]` linking to related entities. This is the causal/dependency structure, not a bulleted list.
3. **Details**: Deep content with subheadings. Include code examples, data schemas, configuration snippets where relevant.
4. **Contradictions**: If sources disagree, document both positions with citations and confidence levels. Add a "Synthesis opportunity" note.
5. **Open Questions**: What we don't know yet. These drive future gap analysis.
6. **Sources**: Full reference list with `[source:slug]` format.

### Step 5 — Generate frontmatter

```yaml
---
title: Page Title
domain: topic-domain
sources:
  - slug: source-id
    url: https://...
    type: paper | article | repo | docs | video | book
    ingested: 2026-04-15
    confidence: high | medium | low
confidence: overall-confidence
last_updated: 2026-04-15
sha256: computed-hash
open_questions:
  - Listed questions from step 4
wikilinks:
  - "[[Linked Entity]]"
---
```

### Step 6 — Write the page

Write to `02-KB-main/<domain>/<topic-slug>.md` (create domain subdirectory if needed).

### Step 7 — Update the log

Append to `02-KB-main/log.md`:
```
## [timestamp] Created/Updated: <domain>/<topic-slug>.md
- Sources: [list]
- Confidence: level
- Triggered by: /wiki-curate <topic> | auto-curate | job-scanner
- Changes: [summary if update]
```

### Step 8 — Regenerate index

Re-read all pages in `02-KB-main/` and regenerate `02-KB-main/index.md` with:
- Page title, domain, confidence, last updated, open question count, contradiction count

### Step 9 — Generate reasoning ontology (optional)

If the page is substantial (>500 words of content):
1. Invoke the reasoning-ontology skill for this topic
2. This generates dual ontologies (high-level + ultra-detailed) and persists to InfraNodus

### Step 10 — Staleness propagation

If this was an UPDATE:
1. Read `wikilinks[]` from all other wiki pages
2. Any page that links to the updated page: add `needs_review: true` to its frontmatter
3. This signals neuro-scan to flag those pages on the next scan

### Step 11 — Obsidian sync (if configured)

If `obsidian_vault` is set in config and TurboVault MCP is available:
1. Write a copy of the wiki page to the Obsidian vault under a `NeuroLink/` folder
2. This makes the wiki browsable in Obsidian's graph view alongside existing vault content
