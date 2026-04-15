# neuro-link-recursive

Unified context, memory & behavior control plane. Hybrid RAG + LLM-Wiki system with auto-curation, reasoning ontologies, and recursive self-improvement. Pure Rust binary (`nlr`).

## Architecture

Three-layer knowledge system (Karpathy LLM-Wiki pattern):
1. **Raw sources** (`00-raw/`) -- immutable ingested material. Never modify.
2. **Wiki** (`02-KB-main/`) -- LLM-synthesized, structured markdown. The LLM owns this layer.
3. **Schema** (`02-KB-main/schema.md`) -- conventions for wiki page structure, citations, contradictions.

Supporting layers:
- `01-sorted/` -- classified raw material by domain (books, arxiv, medium, huggingface, github, docs)
- `03-ontology-main/` -- InfraNodus reasoning ontologies per workflow, agent, and state
- `04-KB-agents-workflows/` -- per-agent/workflow knowledge pages
- `05-insights-gaps/` -- knowledge gap reports, contradiction logs, recommended actions
- `06-progress-reports/` -- daily/weekly/monthly synthesis
- `07-neuro-link-task/` -- task queue: each `.md` file is a job spec (YAML frontmatter + description)
- `08-code-docs/` -- code documentation (extends deep-tool-wiki pattern)
- `09-business-docs/` -- non-code documentation
- `config/` -- all markdown config files with YAML frontmatter
- `state/` -- runtime state (JSON/JSONL): heartbeat, scores, session logs, deviations

## CLI

The `nlr` binary is the single entry point for all operations:

```bash
nlr init              # Initialize directory tree, skills, hooks
nlr status            # Check all components
nlr config <name>     # Print a config file
nlr tasks             # List task queue
nlr mcp               # Run as MCP server (stdio)
```

## MCP Server

`nlr` runs as an MCP server for Claude Code. Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "neuro-link-recursive": {
      "type": "stdio",
      "command": "nlr",
      "args": ["mcp"],
      "env": {"NLR_ROOT": "/path/to/neuro-link-recursive"}
    }
  }
}
```

## Obsidian Plugin

The neuro-link-recursive Obsidian plugin syncs wiki pages and ontologies to your vault. Install it from the Obsidian community plugins browser or manually place it in `.obsidian/plugins/neuro-link-recursive/`. Configure the vault path in `config/neuro-link.md` frontmatter:

```yaml
obsidian_vault: /path/to/your/obsidian/vault
```

Connect TurboVault MCP for vault read/write from Claude Code.

## Wiki Page Conventions

Read `02-KB-main/schema.md` before creating or editing any wiki page. Key rules:
- Every page has YAML frontmatter: `title`, `domain`, `sources[]`, `confidence`, `last_updated`, `open_questions[]`
- Sections: Overview (3 sentences max) > Conceptual Model > Details > Contradictions > Open Questions > Sources
- Use `[[wikilinks]]` for InfraNodus-compatible entity linking
- Use `[source:slug]` for inline citations, full refs at bottom
- When sources disagree, add a Contradictions section with both positions + confidence levels

## Ontology Format

Reasoning ontologies use the InfraNodus wikilink format (see `ontology-creator` skill):
```
[[entity1]] relation description [[entity2]] [relationCode]
```
Relation codes: `[isA]`, `[partOf]`, `[hasAttribute]`, `[causedBy]`, `[relatedTo]`, `[interactsWith]`, `[requires]`, `[produces]`, `[enables]`, `[contradicts]`

Two tiers per topic:
- High-level summary: 30-60 triples covering major concepts
- Ultra-detailed: 200-400 triples covering everything in the wiki body

## Task Queue

Files in `07-neuro-link-task/` are job specs. Format:
```yaml
---
type: ingest | curate | scan | repair | report | ontology
status: pending | running | completed | failed
priority: 1-5
created: YYYY-MM-DD
depends_on: []
assigned_harness: claude-code
---
# Job description
```
The `job-scanner` skill processes pending tasks sorted by priority.

## Config Files

All at `config/`. Each has YAML frontmatter (machine-readable settings) + markdown body (human context).
Master config: `config/neuro-link.md`. Read it first.

## MCP Integrations

Auto-RAG queries these MCP servers based on context:
- **InfraNodus** (`mcporter`) -- knowledge graphs, gap analysis, ontology queries
- **TurboVault** (`turbovault`) -- Obsidian vault search, link analysis, batch updates
- **Context7** (`mcp__context7__*`) -- upstream code docs and API signatures
- **Auggie** (`mcp__auggie__*`) -- cross-framework semantic search
- **Firecrawl** (`firecrawl`) -- web scraping for crawl-ingest pipeline

## Skills

| Skill | Purpose |
|-------|---------|
| `neuro-link` | Main orchestrator: status, scan, ingest, curate |
| `neuro-scan` | Brain scanner: pending tasks, stale pages, gaps, failures |
| `wiki-curate` | Karpathy synthesis: raw > wiki page with citations + contradictions |
| `crawl-ingest` | Source ingestion: URL/repo/file > 00-raw/ with SHA256 dedup |
| `auto-rag` | Context injection per prompt via hook or manual preview |
| `job-scanner` | Task queue processor for 07-neuro-link-task/ |
| `reasoning-ontology` | Generate/update InfraNodus reasoning ontologies |
| `neuro-link-setup` | Interactive guided setup |

## Rules

- Never modify files in `00-raw/` -- they are immutable source material
- Always append to `02-KB-main/log.md` when creating or updating wiki pages
- Always regenerate `02-KB-main/index.md` after wiki mutations
- Task files in `07-neuro-link-task/` must have their `status` frontmatter updated on completion/failure
- State files in `state/` are JSONL (append-only) except `heartbeat.json` (overwritten)
- Secrets in `secrets/.env` are .gitignored -- never read or display API keys
- HITL: destructive wiki edits require user confirmation per `config/neuro-surgery.md` rules
