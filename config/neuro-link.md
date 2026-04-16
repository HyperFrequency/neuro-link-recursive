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
  root: /Users/DanBot/Desktop/HyperFrequency/neuro-link
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
obsidian_vault: /Users/DanBot/Vaults/neuro-quant-vault
auto_curate: true
auto_rag: true
allowed_paths: all
# ── Heavy Services Mode: local | cloud | hybrid ──
# local:  run embeddings/Qdrant/Neo4j in Docker on this machine
# cloud:  use cloud APIs (Voyage/OpenAI embeddings, Qdrant Cloud, Neo4j Aura)
# hybrid: per-service override below
services_mode: local
embeddings:
  mode: local  # local | openai | voyage | cohere
  local_url: http://localhost:8400/v1/embeddings
  local_model: Octen/Octen-Embedding-8B
  local_dims: 4096
  cloud_provider: openai
  cloud_model: text-embedding-3-large
  cloud_api_key_env: OPENAI_API_KEY
vector_db:
  mode: local  # local | qdrant_cloud | pinecone
  local_url: http://localhost:6333
  cloud_url: ""
  cloud_api_key_env: QDRANT_CLOUD_API_KEY
graph_db:
  mode: local  # local | neo4j_aura | none
  local_uri: bolt://localhost:7687
  cloud_uri: ""
  cloud_api_key_env: NEO4J_AURA_PASSWORD
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
