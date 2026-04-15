# Installation Guide

Complete step-by-step guide to get neuro-link-recursive running from scratch. Assumes macOS (Homebrew available). Adjust package manager commands for Linux.

---

## Table of Contents

1. [Rust Toolchain](#1-rust-toolchain)
2. [npm (for MCP distribution)](#2-npm-for-mcp-distribution)
3. [Qdrant Vector DB](#3-qdrant-vector-db)
4. [Neo4j Graph DB](#4-neo4j-graph-db)
5. [Ngrok](#5-ngrok)
6. [mcp2cli-rs](#6-mcp2cli-rs)
7. [InfraNodus API Key](#7-infranodus-api-key)
8. [Firecrawl API Key](#8-firecrawl-api-key)
9. [Context7 MCP](#9-context7-mcp)
10. [Auggie MCP](#10-auggie-mcp)
11. [TurboVault MCP](#11-turbovault-mcp)
12. [Obsidian Vault](#12-obsidian-vault)
13. [Claude Code Skills and Hooks](#13-claude-code-skills-and-hooks)
14. [Secrets and Environment Variables](#14-secrets-and-environment-variables)
15. [Verification](#15-verification)

---

## 1. Rust Toolchain

The MCP server (`server/`) is written in Rust.

```bash
# Install rustup (Rust toolchain manager)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow the prompts, then reload your shell
source "$HOME/.cargo/env"

# Verify
rustc --version   # should be 1.75+
cargo --version
```

Install clippy (linter) if not already present:

```bash
rustup component add clippy
```

Build the server:

```bash
cd server
cargo build --release
```

The binary is at `server/target/release/nlr`.

---

## 2. npm (for MCP distribution)

npm is used to package and distribute the MCP server binary.

```bash
# Install Node.js (includes npm) via Homebrew
brew install node

# Verify
node --version
npm --version
```

---

## 3. Qdrant Vector DB

Qdrant stores wiki embeddings for semantic search (Auto-RAG).

```bash
# Pull and run Qdrant via Docker
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v qdrant_storage:/qdrant/storage \
  qdrant/qdrant:latest

# Verify it's running
curl -s http://localhost:6333/healthz
# Should return: {"title":"qdrant - vectorass engine","version":"..."}
```

To start Qdrant after a reboot:

```bash
docker start qdrant
```

The dashboard is available at http://localhost:6333/dashboard.

---

## 4. Neo4j Graph DB

Neo4j powers Graphiti temporal knowledge graphs (Phase 3).

```bash
# Pull and run Neo4j via Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your-password-here \
  -v neo4j_data:/data \
  -v neo4j_logs:/logs \
  neo4j:5-community

# Verify
curl -s http://localhost:7474
# Should return a JSON response with neo4j info
```

The Neo4j browser is available at http://localhost:7474.

Replace `your-password-here` with a real password and record it for the `.env` file (see step 14).

---

## 5. Ngrok

Ngrok provides tunnel URLs for harness-to-harness communication (Phase 3).

```bash
# Install via Homebrew
brew install ngrok

# Authenticate (get token from https://dashboard.ngrok.com/get-started/your-authtoken)
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN

# Verify
ngrok version
```

---

## 6. mcp2cli-rs

`mcp2cli-rs` converts MCP servers into standalone CLIs. Used for the harness bridge.

```bash
# Install from crates.io (requires Rust toolchain from step 1)
cargo install mcp2cli-rs

# Verify
mcp2cli-rs --help
```

If the crate is not yet published, build from source:

```bash
git clone https://github.com/HyperFrequency/mcp2cli-rs.git
cd mcp2cli-rs
cargo install --path .
```

---

## 7. InfraNodus API Key

InfraNodus powers reasoning ontologies, knowledge graphs, and content gap analysis.

1. Go to https://infranodus.com and sign in (or create an account).
2. Navigate to **Settings** > **API Keys** (https://infranodus.com/settings).
3. Generate a new API key.
4. Save it -- you will add it to `secrets/.env` in step 14.

The InfraNodus MCP server (`mcporter`) must be configured in your Claude Code settings. Add to `~/.claude.json` under `mcpServers`:

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

---

## 8. Firecrawl API Key

Firecrawl handles web scraping for the crawl-ingest pipeline.

1. Go to https://firecrawl.dev and sign in.
2. Navigate to **API Keys** (https://firecrawl.dev/app/api-keys).
3. Generate a new key.
4. Save it for `secrets/.env`.

Add the Firecrawl MCP server to `~/.claude.json`:

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

---

## 9. Context7 MCP

Context7 provides up-to-date code documentation and API signatures for upstream libraries.

Add to `~/.claude.json`:

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

No separate API key is required for the default tier.

Verify it works by running Claude Code and invoking a Context7 tool (e.g., `resolve-library-id`).

---

## 10. Auggie MCP

Auggie (Augment Code) provides semantic code understanding and cross-framework search.

Add to `~/.claude.json`:

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

Follow any additional auth steps shown in Claude Code on first invocation.

---

## 11. TurboVault MCP

TurboVault provides Obsidian vault operations: search, link analysis, batch updates.

Add to `~/.claude.json`:

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

Replace `/path/to/your/obsidian/vault` with the absolute path to your Obsidian vault directory.

---

## 12. Obsidian Vault

neuro-link-recursive syncs wiki pages and ontologies to an Obsidian vault for visual navigation.

1. Install [Obsidian](https://obsidian.md) if you don't have it.
2. Create or designate a vault directory (e.g., `~/Documents/Auto-Quant`).
3. Ensure the vault path matches what you set in TurboVault's `OBSIDIAN_VAULT_PATH` (step 11).
4. Update `config/neuro-link.md` frontmatter:
   ```yaml
   obsidian_vault: /path/to/your/obsidian/vault
   ```

Recommended Obsidian plugins:
- **Dataview** -- query YAML frontmatter across pages
- **Graph Analysis** -- enhanced graph view
- **Templater** -- consistent page scaffolding

---

## 13. Claude Code Skills and Hooks

The init script installs skills and hooks into your Claude Code configuration.

```bash
cd /path/to/neuro-link-recursive
bash scripts/init.sh
```

This will:
- Create the full directory tree
- Symlink 8 skill definitions into `~/.claude/skills/`
- Copy 3 hook scripts into `~/.claude/hooks/`
- Register hooks in `~/.claude/settings.json`
- Initialize state files

If you need to re-install after updates:

```bash
bash scripts/init.sh   # idempotent, safe to re-run
```

Manual verification:

```bash
# Skills should be symlinked
ls -la ~/.claude/skills/neuro-link/SKILL.md

# Hooks should be executable
ls -la ~/.claude/hooks/auto-rag-inject.sh

# settings.json should reference the hooks
grep -c "neuro" ~/.claude/settings.json
```

---

## 14. Secrets and Environment Variables

All secrets live in `secrets/.env` (gitignored).

```bash
cp secrets/.env.example secrets/.env
```

Edit `secrets/.env` and fill in every key:

```bash
# --- Phase 1 (required) ---
INFRANODUS_API_KEY=ink_...          # From step 7
FIRECRAWL_API_KEY=fc-...            # From step 8
CONTEXT7_API_KEY=                    # Leave blank if using MCP server directly
OPENROUTER_API_KEY=sk-or-...        # https://openrouter.ai/keys (for multi-model routing)

# --- Phase 2 (vector DB + embeddings) ---
QDRANT_URL=http://localhost:6333    # From step 3
QDRANT_API_KEY=                     # Leave blank for local Qdrant
EMBEDDING_MODEL=Octen-8B            # Default embedding model
EMBEDDING_DIM=4096                  # Embedding dimensions

# --- Phase 3 (harness bridge + graph DB) ---
NGROK_AUTH_TOKEN=...                # From step 5
NEO4J_URI=bolt://localhost:7687     # From step 4
NEO4J_USER=neo4j
NEO4J_PASSWORD=...                  # Password you set in step 4
KDENSE_API_KEY=                     # K-Dense BYOK API key (if using)
KDENSE_URL=http://localhost:3000
MODAL_TOKEN_ID=                     # Modal.com (if using cloud compute)
MODAL_TOKEN_SECRET=
```

The Rust server reads these from the environment or from `secrets/.env` at startup.

---

## 15. Verification

Run these checks to confirm everything is working.

### Quick check (all at once)

```bash
make status
```

### Component-by-component

```bash
# Rust server compiles
cd server && cargo check && echo "OK: Rust" && cd ..

# nlr binary exists
test -x server/target/release/nlr && echo "OK: nlr binary"

# Qdrant is reachable
curl -sf http://localhost:6333/healthz && echo "OK: Qdrant"

# Neo4j is reachable
curl -sf http://localhost:7474 > /dev/null && echo "OK: Neo4j"

# Ngrok is installed
ngrok version > /dev/null 2>&1 && echo "OK: Ngrok"

# mcp2cli-rs is installed
mcp2cli-rs --help > /dev/null 2>&1 && echo "OK: mcp2cli-rs"

# Hooks are registered
grep -q "auto-rag-inject" ~/.claude/settings.json && echo "OK: Hooks"

# Skills are installed
ls ~/.claude/skills/neuro-link/SKILL.md > /dev/null 2>&1 && echo "OK: Skills"

# Secrets file exists
[ -f secrets/.env ] && echo "OK: secrets/.env exists"
```

### Run the interactive LLM-guided setup

For a guided walkthrough that checks each component and helps configure anything that's missing:

```bash
/neuro-link-setup
```

See [SETUP.md](SETUP.md) for the full interactive setup guide.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `cargo build` fails | Ensure Rust 1.75+: `rustup update stable` |
| Qdrant connection refused | Start container: `docker start qdrant` |
| Neo4j connection refused | Start container: `docker start neo4j` |
| MCP server not found | Verify `~/.claude.json` has the server config (steps 7-11) |
| Hook not firing | Re-run `bash scripts/init.sh` and check `~/.claude/settings.json` |
| Permission denied on hook | Run `chmod +x ~/.claude/hooks/*.sh` |
| InfraNodus 401 | Regenerate API key at https://infranodus.com/settings |
| Firecrawl rate limit | Check crawl interval in `config/crawl-ingest-update.md` |
