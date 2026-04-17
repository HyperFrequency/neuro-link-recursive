# neuro-link-recursive

Unified context, memory & behavior control plane for AI agent harnesses.

## Contents

- [Quickstart (60s)](#quickstart-60s)
- [What It Does](#what-it-does)
- [Architecture](#architecture) — 4 small diagrams (full set in [`docs/architecture.md`](docs/architecture.md))
- [Quick Start (detailed)](#quick-start-detailed)
- [Directory Layout](#directory-layout)
- [Skills (16)](#skills-16)
- [Hooks (5)](#hooks-5)
- [Configuration](#configuration)
- [`nlr` CLI](#nlr-cli)

## Quickstart (60s)

```bash
# 1. Install deps + start services
curl -fsSL https://raw.githubusercontent.com/HyperFrequency/neuro-link-recursive/master/setup-deps.sh | bash

# 2. Start the runtime
cd ~/neuro-link && nohup neuro-link start --port 8080 --tunnel > /tmp/nlr.log 2>&1 &

# 3. Drop a file into the inbox
echo "# Rust ownership" > ~/neuro-link/00-raw/hello.md
```

Wait 3 seconds, then `tail /tmp/nlr.log` — you'll see `loose drop detected` and `Classified hello -> software-engineering`.

## What It Does

A hybrid RAG + LLM-Wiki system with a pure Rust MCP server core. Drop markdown files to define workflows, reasoning ontologies, and operational tasks — the system auto-generates skills, hooks, cron jobs, and monitors performance.

- **LLM-Wiki** — Incrementally builds a persistent, cross-referenced wiki from raw sources (Karpathy pattern)
- **Auto-RAG** — Injects relevant wiki context into every prompt via hooks
- **Reasoning Ontologies** — Domain, agent, and workflow ontologies via InfraNodus
- **HITL + Recursive Self-Improvement** — Logs, grades, and improves agent performance
- **Harness Bridge** — Bridges Claude Code, K-Dense, ForgeCode via MCP
- **Markdown-First Config** — Drop `.md` files to define jobs, harness connections, workflows

## Architecture

Four narrowly-scoped diagrams. See [`docs/architecture.md`](docs/architecture.md) for per-diagram explanations.

### Drop → Classify

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'IBM Plex Mono, Menlo, Monaco, monospace', 'fontSize':'14px', 'primaryColor':'#f5f5f7', 'primaryTextColor':'#1a1a1a', 'primaryBorderColor':'#3b3b3b'}}}%%
graph LR
    DROP[Drop file] --> RAW["00-raw/<br/>SHA256 dedup"]
    RAW --> CLASSIFY[classify-inbox]
    CLASSIFY --> DOMAIN{domain?}
    DOMAIN --> SORT["01-sorted/&lt;domain&gt;/"]
```

### Classify → Embed → Qdrant

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'IBM Plex Mono, Menlo, Monaco, monospace', 'fontSize':'14px', 'primaryColor':'#f5f5f7', 'primaryTextColor':'#1a1a1a', 'primaryBorderColor':'#3b3b3b'}}}%%
graph LR
    SORT["01-sorted/"] --> CHUNK[chunk]
    CHUNK --> EMBED["embed<br/>llama-server:8400"]
    EMBED --> QDRANT[("Qdrant<br/>nlr_wiki")]
    CHUNK --> CURATE[wiki-curate]
    CURATE --> WIKI["02-KB-main/"]
```

### Query → Hybrid RAG

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'IBM Plex Mono, Menlo, Monaco, monospace', 'fontSize':'14px', 'primaryColor':'#f5f5f7', 'primaryTextColor':'#1a1a1a', 'primaryBorderColor':'#3b3b3b'}}}%%
graph LR
    Q[query] --> BM25[BM25<br/>wiki md]
    Q --> VEC[vector<br/>Qdrant]
    Q --> EXT[InfraNodus]
    BM25 --> RRF[RRF fuse]
    VEC --> RRF
    EXT --> RRF
    RRF --> TOPK[top-k chunks]
```

### Worker Loop → HITL

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'IBM Plex Mono, Menlo, Monaco, monospace', 'fontSize':'14px', 'primaryColor':'#f5f5f7', 'primaryTextColor':'#1a1a1a', 'primaryBorderColor':'#3b3b3b'}}}%%
graph LR
    LOG["session_log.jsonl"] --> GRADE[grade]
    GRADE --> PROP["proposal.md"]
    PROP --> HITL{HITL?}
    HITL -->|approve| APPLY[apply + commit]
    HITL -->|defer| PARK[park]
    APPLY --> IMP["improvements.jsonl"]
```

## Quick Start (detailed)

```bash
# Clone
git clone https://github.com/HyperFrequency/neuro-link-recursive.git
cd neuro-link-recursive

# Initialize (creates dirs, installs skills/hooks, registers in settings.json)
bash scripts/init.sh

# Configure secrets
cp secrets/.env.example secrets/.env
# Edit secrets/.env with your API keys

# Build the Rust MCP server + CLI
cd server && cargo build --release && cd ..

# Interactive setup
/neuro-link-setup

# Check status
/neuro-link status
```

## Directory Layout

```
neuro-link-recursive/
├── server/                     Rust MCP server + CLI (cargo)
│   └── src/                    MCP tools: wiki, RAG, ontology, tasks, harness
├── skills/                     16 SKILL.md files (Phase 1 + Phase 2)
├── hooks/                      5 hook scripts
├── config/                     10 markdown config files (YAML frontmatter)
├── 00-raw/                     Immutable ingested sources
├── 01-sorted/                  Classified by domain
│   ├── books/ arxiv/ medium/ huggingface/ github/ docs/
├── 02-KB-main/                 Synthesized wiki (LLM-maintained)
│   ├── schema.md               Wiki conventions
│   ├── index.md                Auto-generated navigation
│   └── log.md                  Mutation audit trail
├── 03-ontology-main/           Reasoning ontologies
│   ├── workflow/               State definitions, phase gating, goals
│   └── agents/                 By-agent, by-state, by-HITL
├── 04-KB-agents-workflows/     Per-agent/workflow knowledge
├── 05-self-improvement-HITL/   Human-in-the-loop improvement
│   ├── overview.md
│   ├── models/                 logs-raw.md, logs-graded.md, change-log.md
│   ├── hyperparameters/        ...
│   ├── prompts/                ...
│   ├── features/               ...
│   ├── code-changes/           ...
│   └── services-integrations/  ...
├── 05-insights-gaps/           Knowledge gap reports
├── 06-self-improvement-recursive/  Automated improvement
│   ├── overview.md
│   ├── harness-to-harness-comms/
│   ├── harness-cli/            Session logs, grading, auto-rag, agents, skills
│   ├── harness-editor/         ...
│   ├── harness-web/            ...
│   └── brain/                  ...
├── 06-progress-reports/        Daily/weekly/monthly synthesis
├── 07-neuro-link-task/         Task queue (markdown job specs)
├── 08-code-docs/               Code documentation
│   ├── my-repos/ common-tools/ my-forks/
├── 09-business-docs/           Non-code docs
├── state/                      Runtime state (JSON/JSONL)
├── secrets/                    API keys (.gitignored)
├── scripts/init.sh             One-command setup
├── CLAUDE.md                   Agent instructions
├── SETUP.md                    LLM-guided setup walkthrough
└── README.md                   This file
```

## Skills (16)

### Phase 1 — Core
| Skill | Purpose |
|-------|---------|
| `neuro-link` | Main orchestrator: status, scan, ingest, curate |
| `neuro-scan` | Brain scanner: pending tasks, stale pages, gaps, failures |
| `wiki-curate` | Karpathy synthesis: raw → wiki page |
| `crawl-ingest` | Source ingestion with SHA256 dedup |
| `auto-rag` | Context injection per prompt |
| `job-scanner` | Task queue processor |
| `reasoning-ontology` | InfraNodus dual ontologies |
| `neuro-link-setup` | Interactive guided setup |

### Phase 2 — Self-Improvement & Maintenance
| Skill | Purpose |
|-------|---------|
| `neuro-surgery` | Fix failures, HITL tasks, ontology inconsistencies |
| `hyper-sleep` | Background maintenance daemon |
| `self-improve-hitl` | Propose improvements with human approval |
| `self-improve-recursive` | Automated improvement with consortium |
| `progress-report` | Daily/weekly/monthly synthesis |
| `knowledge-gap` | InfraNodus gap analysis → auto-tasks |
| `code-docs` | Deepwiki-style code documentation |
| `harness-bridge` | Cross-harness work dispatch |

## Hooks (5)

| Hook | Event | Purpose |
|------|-------|---------|
| `auto-rag-inject.sh` | UserPromptSubmit | Inject wiki context into prompts |
| `neuro-task-check.sh` | UserPromptSubmit | Remind about priority-1 tasks |
| `neuro-log-tool-use.sh` | PostToolUse | Log tool metadata (no secrets) |
| `harness-bridge-check.sh` | PreToolUse | Suggest harness delegation |
| `neuro-grade.sh` | PostToolUse | Score tool effectiveness |

## Configuration

All config at `config/*.md`. Each file has YAML frontmatter for machine-readable settings.

| Config | Purpose |
|--------|---------|
| `neuro-link.md` | Master config: active skills, directories, LLM routing |
| `neuro-scan.md` | Scan targets, staleness thresholds, notifications |
| `neuro-surgery.md` | HITL approval matrix, fix categories |
| `hyper-sleep.md` | Background maintenance schedule |
| `crawl-ingest-update.md` | Ingestion sources (4 table types), extraction strategies |
| `main-codebase-tools.md` | Your repos → auto-index via Context7 + Auggie |
| `adjacent-tools-code-docs.md` | Upstream tools → keep docs updated |
| `forked-repos-with-changes.md` | Fork divergence tracking |
| `harness-harness-comms.md` | Harness bridge routing rules |
| `neuro-link-config.md` | System config: MCP servers, Ngrok, permissions, logging |

## Markdown-Driven Operations

Drop `.md` files into `07-neuro-link-task/` to create jobs:

```yaml
---
type: ingest | curate | scan | repair | report | ontology
status: pending
priority: 1-5
created: 2026-04-15
---
# Job: Ingest NautilusTrader v2.0 release notes
Source: https://github.com/nautechsystems/nautilus_trader/releases
Auto-curate: yes
```

The `job-scanner` skill processes these automatically. The `neuro-scan` skill creates remediation tasks here when it finds issues.

## Harness-to-Harness Communication

```mermaid
%%{init: {'theme':'base', 'themeVariables': {'fontFamily':'IBM Plex Mono, Menlo, Monaco, monospace', 'fontSize':'14px', 'primaryColor':'#f5f5f7', 'primaryTextColor':'#1a1a1a', 'primaryBorderColor':'#3b3b3b'}}}%%
flowchart LR
    CC[Claude Code] <-->|MCP/mcp2cli| NLR[neuro-link-recursive]
    KD[K-Dense BYOK] <-->|API| NLR
    FC[ForgeCode] <-->|MCP/mcp2cli| NLR
    CW[Claw-Code] <-->|MCP/mcp2cli| NLR
    NLR <-->|Ngrok| REMOTE[Remote Agents]
```

Configure in `config/harness-harness-comms.md`. Each harness gets routing rules for task delegation.

## `nlr` CLI

The `nlr` binary is both an MCP server (stdin/stdout JSON-RPC) and a CLI tool.

```bash
# Check system health
nlr status

# Initialize the NLR directory structure
nlr init

# Ingest a URL
nlr ingest --url https://example.com/article

# Search wiki pages
nlr search "market microstructure"

# List pending tasks
nlr tasks list

# Create a task
nlr tasks create --title "Ingest release notes" --type ingest --priority 1

# Read a config file
nlr config read neuro-link

# Run a heartbeat health check
nlr heartbeat

# Scan for stale pages, gaps, and failures
nlr scan

# Grade the current session
nlr grade --session
```

## License

MIT
