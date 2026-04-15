---
title: Wiki Schema
domain: system
sources: [karpathy-llm-wiki, graphify, cornelius-brain]
confidence: high
last_updated: 2026-04-15
---

# Wiki Page Schema

Conventions for all pages in `02-KB-main/`. The LLM writes and maintains wiki pages; the user curates sources and asks questions. This schema defines how pages are structured.

## Page Frontmatter

Every wiki page MUST have this YAML frontmatter:

```yaml
---
title: Human-readable page title
domain: topic-area (e.g., trading, ml, infrastructure, research)
sources:
  - slug: source-identifier
    url: https://...
    type: paper | article | repo | docs | video | book | conversation
    ingested: 2026-04-15
    confidence: high | medium | low
confidence: high | medium | low | contested
last_updated: 2026-04-15
sha256: abc123...  # hash of page content for change detection
open_questions:
  - Question that remains unanswered
wikilinks:
  - "[[Related Entity]]"
  - "[[Another Entity]]"
---
```

### Confidence Levels

- **high**: Multiple corroborating sources, well-established facts
- **medium**: Single authoritative source or inferred from multiple indirect sources
- **low**: Single non-authoritative source, anecdotal, or speculative
- **contested**: Sources actively disagree; see Contradictions section

## Section Structure

Every wiki page follows this section order. Omit sections that don't apply.

### 1. Overview
3 sentences maximum. What this is, why it matters, key insight.

### 2. Conceptual Model
The causal/dependency structure expressed as prose with embedded `[[wikilinks]]`. This is NOT a bulleted list — write flowing text that naturally links entities.

Example:
> [[NautilusTrader]] implements an [[event-driven architecture]] where [[Order]] objects flow through a [[risk engine]] before reaching the [[execution client]]. The [[portfolio]] tracks [[Position]] state changes triggered by [[fill events]] from the [[exchange adapter]].

### 3. Details
Free-form deep content. Use subheadings as needed. Include code examples, configuration snippets, data schemas where relevant.

### 4. Contradictions
ONLY include when sources disagree. Format:

> **Claim A** [source:paper-2024]: Feature X improves performance by 30%
> **Claim B** [source:blog-2025]: Feature X has no measurable effect in production
> **Synthesis opportunity**: Difference may be due to dataset scale. Test with production data.

This follows the Cornelius "productive contradictions" pattern — opposing conclusions are synthesis opportunities, not conflicts to resolve.

### 5. Open Questions
Bulleted list of things we don't know yet. These become inputs for `neuro-scan` knowledge gap detection.

### 6. Sources
Full reference list. Format:

```
[source:slug] Author, Title, URL, Date. Confidence: high/medium/low.
```

## Citation Format

Inline: `[source:slug]` — maps to a full reference in the Sources section.
Cross-page: `[[Page Title]]` — wikilink to another page in 02-KB-main/.
External: `[text](url)` — standard markdown link for non-wiki references.

## Index Maintenance

`index.md` is auto-generated. It lists all pages grouped by domain with:
- Page title (linked)
- Confidence level
- Last updated date
- Number of open questions
- Number of contradictions

Regenerate `index.md` after every page creation or update.

## Log Format

`log.md` is append-only. Each entry:

```
## [2026-04-15T10:30:00Z] Created: trading/market-microstructure.md
- Sources: [source:harris-2003], [source:cont-2001]
- Confidence: high
- Triggered by: /wiki-curate market-microstructure
- Ontology: generated (45 triples high-level, 312 ultra-detailed)
```

## Staleness Detection

Pages are considered stale when:
- `last_updated` is older than the threshold in `config/neuro-scan.md` (default: 30 days)
- A source in the `sources[]` array has been updated upstream
- A linked page (`wikilinks[]`) has been updated more recently

When a page is updated, all pages that link to it are flagged as `needs_review` (staleness propagation).

## Naming Convention

- File names: kebab-case, matching the topic. Example: `market-microstructure.md`
- Subdirectories for large domains: `trading/`, `ml/`, `infrastructure/`
- No spaces in file names
- No special characters except hyphens
