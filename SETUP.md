# neuro-link-recursive Setup Guide

Interactive, LLM-guided setup. Run `/neuro-link-setup` for the full walkthrough, or follow these steps manually.

## Prerequisites

See **[INSTALL.md](INSTALL.md)** for complete dependency installation instructions covering Rust, Python, Docker services, MCP servers, API keys, and Obsidian setup.

Quick summary of what you need:
- **Phase 1**: Rust toolchain, npm, InfraNodus/Firecrawl/Context7/Auggie/TurboVault MCP servers
- **Phase 2**: Qdrant vector DB (Docker), embedding model
- **Phase 3**: Neo4j (Docker), Ngrok, mcp2cli-rs, harness bridge config

## Step 1: Initialize

```bash
cd /Users/DanBot/Desktop/HyperFrequency/neuro-link-recursive
bash scripts/init.sh
```

This creates the directory tree, initializes state files, symlinks skills, and installs hooks.

## Step 2: Configure Secrets

```bash
cp secrets/.env.example secrets/.env
```

Edit `secrets/.env` with your API keys. Required keys for Phase 1:

| Key | Where to get it | Used by |
|-----|-----------------|---------|
| `INFRANODUS_API_KEY` | https://infranodus.com/settings | Ontology generation, gap analysis |
| `FIRECRAWL_API_KEY` | https://firecrawl.dev/app/api-keys | Web crawling in crawl-ingest |
| `CONTEXT7_API_KEY` | Already in ~/.claude.json | Code doc lookups |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys | Multi-model routing via PAL |

If you already have these in `~/.claude.json` MCP server configs, you can skip this step — the skills will use the MCP server keys directly.

## Step 3: Review Master Config

Open `config/neuro-link.md` and review:
- `active_skills` — which skills are enabled
- `directories.root` — points to this directory
- `obsidian_vault` — path to your Obsidian vault
- `scan_interval_minutes` — how often neuro-scan checks for tasks
- `auto_curate` — whether crawl-ingest auto-triggers wiki-curate
- `auto_rag` — whether the auto-rag hook is active

## Step 4: Configure Ingestion Sources

Edit `config/crawl-ingest-update.md` to define:
- **Table 1**: Markdown + images to ingest directly
- **Table 2**: URLs to crawl (single page)
- **Table 3**: Sites to crawl entirely
- **Table 4**: Sites to crawl + monitor for updates (with last-crawled timestamps)

## Step 5: Register Your Codebases

Edit these config files:
- `config/main-codebase-tools.md` — your repos (auto-indexes via Context7 + Auggie)
- `config/adjacent-tools-code-docs.md` — upstream tools you use
- `config/forked-repos-with-changes.md` — your forks (tracks upstream diff)

## Step 6: Verify Installation

```bash
/neuro-link status
```

Expected output:
- All 8 skills: active
- All 3 hooks: registered
- Config: loaded
- State: initialized
- MCP servers: connected (InfraNodus, Firecrawl, TurboVault, Context7, Auggie)

## Step 7: First Ingest

Try ingesting a source:

```bash
/crawl-ingest https://karpathy.github.io/2024/01/llm-wiki/
```

Then curate it into a wiki page:

```bash
/wiki-curate llm-wiki-concepts
```

Check the result in `02-KB-main/` and the mutation log in `02-KB-main/log.md`.

## Step 8: Set Up Auto-RAG

The `auto-rag-inject.sh` hook is already registered. It injects relevant wiki context into every prompt based on keyword matching against `02-KB-main/index.md`.

To test:
```bash
/auto-rag preview "How does NautilusTrader handle order routing?"
```

This shows what context would be injected without actually injecting it.

## Phase 2 Setup (when ready)

### Qdrant Vector DB
```bash
docker run -d -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```
Update `secrets/.env` with `QDRANT_URL=http://localhost:6333`.
The `auto-rag` skill will switch from keyword matching to semantic retrieval.

### Reasoning Ontology Graphs
Run `/reasoning-ontology <domain>` for each domain you want ontologies for.
These are persisted to InfraNodus and can be queried by any agent.

### Heartbeat Daemon
```bash
/schedule create --name "neuro-heartbeat" --cron "*/15 * * * *" --prompt "/neuro-scan"
```

## Phase 3 Setup (when ready)

### MCP Server Generation
```bash
# Build standalone MCP server from skills
mcp2cli-rs bake --profile neuro-link-recursive --transport stdio
```

### Ngrok API Router
```bash
ngrok http 8080 --domain=your-domain.ngrok-free.app
```
Update `config/neuro-link-config.md` with the Ngrok URL.

### Harness-to-Harness Bridge
Edit `config/harness-harness-comms.md` to add:
- K-Dense BYOK connection (localhost or API)
- ForgeCode CLI connection
- Claw-Code connection

Each harness gets an MCP server endpoint + API key.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Hook not firing | Check `~/.claude/settings.json` has the hook registered |
| InfraNodus errors | Verify API key in `secrets/.env` or MCP config |
| Firecrawl rate limit | Check `config/crawl-ingest-update.md` crawl interval |
| Stale wiki pages | Run `/neuro-scan` to detect and queue updates |
| Missing skills | Re-run `bash scripts/init.sh` to re-symlink |
