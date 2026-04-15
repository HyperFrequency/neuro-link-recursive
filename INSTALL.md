# Installation Guide

Complete step-by-step guide to get neuro-link-recursive running from scratch. The entire system is a pure Rust binary (`nlr`). Assumes macOS (Homebrew available). Adjust package manager commands for Linux.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install nlr](#2-install-nlr)
3. [Infrastructure Setup](#3-infrastructure-setup)
4. [MCP Server Setup](#4-mcp-server-setup)
5. [mcp2cli-rs Setup](#5-mcp2cli-rs-setup)
6. [API Keys](#6-api-keys)
7. [Secrets and Environment Variables](#7-secrets-and-environment-variables)
8. [Obsidian Vault Setup](#8-obsidian-vault-setup)
9. [Harness Connections](#9-harness-connections)
10. [Skills and Hooks Installation](#10-skills-and-hooks-installation)
11. [Verification Checklist](#11-verification-checklist)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

### Rust toolchain

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Verify
rustc --version   # 1.75+
cargo --version
```

### Node.js 18+ (for npx install method)

```bash
brew install node

# Verify
node --version    # 18+
npm --version
```

### Docker (for Qdrant and Neo4j)

```bash
brew install --cask docker

# Verify
docker --version
```

### Git

```bash
# macOS ships with git; verify it's available
git --version
```

---

## 2. Install nlr

Three options. Pick one.

### Option A: npm (recommended)

```bash
npm install -g neuro-link-recursive
```

Or run without installing globally:

```bash
npx neuro-link-recursive init
```

### Option B: cargo

```bash
cargo install --path server
```

The binary installs to `~/.cargo/bin/nlr`.

### Option C: From source

```bash
git clone https://github.com/HyperFrequency/neuro-link-recursive.git
cd neuro-link-recursive/server
cargo build --release
```

The binary is at `server/target/release/nlr`. Add it to your PATH or symlink it:

```bash
ln -s "$(pwd)/target/release/nlr" ~/.cargo/bin/nlr
```

---

## 3. Infrastructure Setup

### Qdrant (vector DB for semantic search / Auto-RAG)

```bash
docker run -d -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

Verify: `curl -s http://localhost:6333/healthz`

Dashboard: http://localhost:6333/dashboard

Restart after reboot: `docker start $(docker ps -aqf "ancestor=qdrant/qdrant")`

### Neo4j (graph DB for Graphiti temporal knowledge graphs)

```bash
docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:5
```

Replace `password` with a real password and record it for `secrets/.env`.

Verify: `curl -s http://localhost:7474`

Browser: http://localhost:7474

### Ngrok (tunnel URLs for harness-to-harness communication)

```bash
# Via Homebrew
brew install ngrok

# Or via npm
npm install -g ngrok
```

Authenticate:

```bash
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
# Get token from https://dashboard.ngrok.com/get-started/your-authtoken
```

Verify: `ngrok version`

---

## 4. MCP Server Setup

### neuro-link-recursive MCP for Claude Code

Add this to `~/.claude.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "neuro-link-recursive": {
      "type": "stdio",
      "command": "nlr",
      "args": ["mcp"],
      "env": {
        "NLR_ROOT": "/path/to/neuro-link-recursive"
      }
    }
  }
}
```

Replace `/path/to/neuro-link-recursive` with the absolute path to your clone.

### InfraNodus MCP

```json
{
  "mcpServers": {
    "mcporter": {
      "command": "npx",
      "args": ["-y", "@infranodus/mcp-server"],
      "env": {
        "INFRANODUS_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Firecrawl MCP

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Context7 MCP

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    }
  }
}
```

No API key required for the default tier.

### Auggie MCP (Augment Code)

```json
{
  "mcpServers": {
    "auggie": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/augment-mcp-server"]
    }
  }
}
```

Follow any auth steps shown in Claude Code on first invocation.

### TurboVault MCP (Obsidian vault operations)

```json
{
  "mcpServers": {
    "turbovault": {
      "command": "npx",
      "args": ["-y", "@turbovault/mcp-server"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/your/obsidian/vault"
      }
    }
  }
}
```

---

## 5. mcp2cli-rs Setup

`mcp2cli-rs` converts MCP servers into standalone CLIs for the harness bridge.

```bash
cargo install mcp2cli-rs
mcp2cli-rs --profile mcp2cli-profile.json
```

If the crate is not yet published, build from source:

```bash
git clone https://github.com/HyperFrequency/mcp2cli-rs.git
cd mcp2cli-rs
cargo install --path .
```

Verify: `mcp2cli-rs --help`

---

## 6. API Keys

### InfraNodus

- **What it's for**: Reasoning ontologies, knowledge graphs, content gap analysis
- **Where to get it**: https://infranodus.com/settings -- sign in, go to Settings > API Keys, generate a new key
- **How to set it**: Add `INFRANODUS_API_KEY=ink_...` to `secrets/.env`
- **How to verify**: `nlr status` should show InfraNodus as connected; or invoke the `mcporter` MCP server in Claude Code

### Firecrawl

- **What it's for**: Web scraping for the crawl-ingest pipeline
- **Where to get it**: https://firecrawl.dev/app/api-keys -- sign in, generate a new key
- **How to set it**: Add `FIRECRAWL_API_KEY=fc-...` to `secrets/.env`
- **How to verify**: `nlr status` should show Firecrawl as connected; or invoke the `firecrawl` MCP server

### OpenRouter

- **What it's for**: Multi-model routing via PAL (for embedding models and LLM fallbacks)
- **Where to get it**: https://openrouter.ai/keys -- sign in, create a new key
- **How to set it**: Add `OPENROUTER_API_KEY=sk-or-...` to `secrets/.env`
- **How to verify**: `nlr status` should show OpenRouter as connected

### Ngrok

- **What it's for**: Tunnel URLs for harness-to-harness communication
- **Where to get it**: https://dashboard.ngrok.com/get-started/your-authtoken
- **How to set it**: Add `NGROK_AUTH_TOKEN=...` to `secrets/.env`; also run `ngrok config add-authtoken YOUR_TOKEN`
- **How to verify**: `ngrok version` and `nlr status`

### K-Dense BYOK (optional)

- **What it's for**: K-Dense harness API access
- **Where to get it**: Your K-Dense account dashboard
- **How to set it**: Add `KDENSE_API_KEY=...` to `secrets/.env`
- **How to verify**: `nlr status` should show K-Dense as connected (if configured)

### Neo4j

- **What it's for**: Graphiti temporal knowledge graphs
- **Where to get it**: You set the password when starting the container (step 3)
- **How to set it**: Add `NEO4J_PASSWORD=...` to `secrets/.env`
- **How to verify**: `curl -s http://localhost:7474` returns JSON; `nlr status` shows Neo4j connected

---

## 7. Secrets and Environment Variables

All secrets live in `secrets/.env` (gitignored).

```bash
cp secrets/.env.example secrets/.env
# Edit with your keys
```

Full reference:

```bash
# --- Required ---
INFRANODUS_API_KEY=ink_...          # Ontology generation, gap analysis
FIRECRAWL_API_KEY=fc-...            # Web crawling in crawl-ingest
OPENROUTER_API_KEY=sk-or-...        # Multi-model routing via PAL

# --- Infrastructure ---
QDRANT_URL=http://localhost:6333    # Vector DB
QDRANT_API_KEY=                     # Leave blank for local Qdrant
NEO4J_URI=bolt://localhost:7687     # Graph DB
NEO4J_USER=neo4j
NEO4J_PASSWORD=...                  # Password from docker run

# --- Embeddings ---
EMBEDDING_MODEL=Octen-8B            # Default embedding model
EMBEDDING_DIM=4096                  # Embedding dimensions

# --- Harness bridge ---
NGROK_AUTH_TOKEN=...                # Tunnel URLs
KDENSE_API_KEY=                     # K-Dense BYOK (optional)
KDENSE_URL=http://localhost:3000
MODAL_TOKEN_ID=                     # Modal.com cloud compute (optional)
MODAL_TOKEN_SECRET=
```

The `nlr` binary reads these from the environment or from `secrets/.env` at startup.

---

## 8. Obsidian Vault Setup

neuro-link-recursive syncs wiki pages and ontologies to an Obsidian vault for visual navigation.

1. Install [Obsidian](https://obsidian.md) if you don't have it.
2. Create or designate a vault directory (e.g., `~/Documents/Auto-Quant`).
3. Point the config to your vault -- update `config/neuro-link.md` frontmatter:
   ```yaml
   obsidian_vault: /path/to/your/obsidian/vault
   ```
4. Ensure the vault path matches `OBSIDIAN_VAULT_PATH` in TurboVault's MCP config (step 4).
5. Install the **neuro-link-recursive Obsidian plugin** from the community plugins browser or manually copy it into `.obsidian/plugins/neuro-link-recursive/`.
6. Connect TurboVault MCP (configured in step 4) so Claude Code can read/write vault contents.

Recommended Obsidian community plugins:
- **Dataview** -- query YAML frontmatter across pages
- **Graph Analysis** -- enhanced graph view
- **Templater** -- consistent page scaffolding

---

## 9. Harness Connections

### Claude Code (primary, always active)

- **Install**: Already installed if you're reading this in Claude Code
- **Configure**: Add the `neuro-link-recursive` MCP server to `~/.claude.json` (step 4)
- **Verify**: Run `nlr status` from within Claude Code; the MCP server should show as connected

### K-Dense BYOK (localhost)

- **Install**: Follow K-Dense setup instructions for your platform
- **Configure**: Set `KDENSE_API_KEY` and `KDENSE_URL=http://localhost:3000` in `secrets/.env`; add a harness entry in `config/harness-harness-comms.md`
- **Verify**: `curl -s http://localhost:3000/health` should return OK; `nlr status` should show K-Dense connected

### ForgeCode (CLI)

- **Install**: `npm install -g forgecode-cli` or download from ForgeCode website
- **Configure**: Add ForgeCode API key to `secrets/.env`; register the harness endpoint in `config/harness-harness-comms.md`
- **Verify**: `forgecode --version`; `nlr status` should list ForgeCode as a connected harness

Each harness gets an MCP server endpoint and API key. Edit `config/harness-harness-comms.md` to manage connections.

---

## 10. Skills and Hooks Installation

```bash
nlr init
```

Or equivalently:

```bash
bash scripts/init.sh
```

This will:
- Create the full directory tree
- Symlink skill definitions into `~/.claude/skills/`
- Copy hook scripts into `~/.claude/hooks/`
- Register hooks in `~/.claude/settings.json`
- Initialize state files

Safe to re-run after updates (idempotent).

Manual verification:

```bash
ls -la ~/.claude/skills/neuro-link/SKILL.md
ls -la ~/.claude/hooks/auto-rag-inject.sh
grep -c "neuro" ~/.claude/settings.json
```

---

## 11. Verification Checklist

Run each of these after installation:

```bash
nlr status                    # Should show OK for all components
nlr config neuro-link        # Should print the master config
nlr tasks                    # Should show empty queue (or pending tasks)
echo '{"jsonrpc":"2.0","method":"initialize","id":1}' | nlr mcp  # Should return a JSON-RPC response
```

### Component-by-component checks

```bash
# nlr binary
nlr --version && echo "OK: nlr"

# Qdrant
curl -sf http://localhost:6333/healthz && echo "OK: Qdrant"

# Neo4j
curl -sf http://localhost:7474 > /dev/null && echo "OK: Neo4j"

# Ngrok
ngrok version > /dev/null 2>&1 && echo "OK: Ngrok"

# mcp2cli-rs
mcp2cli-rs --help > /dev/null 2>&1 && echo "OK: mcp2cli-rs"

# Hooks registered
grep -q "auto-rag-inject" ~/.claude/settings.json && echo "OK: Hooks"

# Skills installed
ls ~/.claude/skills/neuro-link/SKILL.md > /dev/null 2>&1 && echo "OK: Skills"

# Secrets file exists
[ -f secrets/.env ] && echo "OK: secrets/.env"
```

---

## 12. Troubleshooting

| Problem | Solution |
|---------|----------|
| `cargo build` fails | Ensure Rust 1.75+: `rustup update stable` |
| `nlr` not found | Add `~/.cargo/bin` to PATH or reinstall via npm |
| Qdrant connection refused | Start container: `docker start $(docker ps -aqf "ancestor=qdrant/qdrant")` |
| Neo4j connection refused | Start container: `docker start $(docker ps -aqf "ancestor=neo4j:5")` |
| MCP server not found by Claude Code | Verify `~/.claude.json` has the `neuro-link-recursive` entry under `mcpServers` |
| Hook not firing | Re-run `nlr init` and check `~/.claude/settings.json` |
| Permission denied on hook | `chmod +x ~/.claude/hooks/*.sh` |
| InfraNodus 401 | Regenerate API key at https://infranodus.com/settings |
| Firecrawl rate limit | Check crawl interval in `config/crawl-ingest-update.md` |
| `npx neuro-link-recursive` fails | Ensure Node.js 18+: `node --version` |
