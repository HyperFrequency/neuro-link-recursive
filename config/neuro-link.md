---
version: 1
active_skills:
  - neuro-link
  - neuro-scan
  - wiki-curate
  - crawl-ingest
  - auto-rag
  - job-scanner
  - reasoning-ontology
  - neuro-link-setup
directories:
  root: /Users/DanBot/Desktop/HyperFrequency/neuro-link-recursive
  raw: ./00-raw
  sorted: ./01-sorted
  kb_main: ./02-KB-main
  ontology: ./03-ontology-main
  agents_workflows: ./04-KB-agents-workflows
  insights: ./05-insights-gaps
  reports: ./06-progress-reports
  tasks: ./07-neuro-link-task
  code_docs: ./08-code-docs
  business_docs: ./09-business-docs
  config: ./config
  state: ./state
  secrets: ./secrets
scan_interval_minutes: 30
default_llm: claude-sonnet-4-6
wiki_llm: claude-sonnet-4-6
ontology_llm: claude-opus-4-6
embedding_model: Octen-8B-4096
vector_db: qdrant
obsidian_vault: /Users/DanBot/Desktop/neuro-quant-vault
auto_curate: true
auto_rag: true
harness_bridge:
  enabled: false
  harnesses: []
---

# neuro-link-recursive Master Config

Main orchestrator configuration. Edit the YAML frontmatter to change system behavior.

## Active Skills

All 8 Phase 1 skills are enabled by default. Remove a skill name from `active_skills` to disable it.

## Directory Mappings

The `directories` block maps logical names to filesystem paths. All paths are relative to `root` unless they start with `/`.

## LLM Routing

- `default_llm` — used for most operations (scanning, classification, context injection)
- `wiki_llm` — used for wiki page synthesis (needs strong writing + synthesis ability)
- `ontology_llm` — used for reasoning ontology generation (needs deep causal reasoning)

## Auto Behaviors

- `auto_curate: true` — crawl-ingest automatically triggers wiki-curate after ingestion
- `auto_rag: true` — auto-rag hook injects wiki context into every prompt

## Harness Bridge (Phase 3)

Set `harness_bridge.enabled: true` and add harness configs to `harnesses[]` when ready.
See `config/harness-harness-comms.md` for the full harness bridge configuration.
