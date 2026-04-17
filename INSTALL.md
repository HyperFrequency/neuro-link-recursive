# neuro-link-recursive — Install Guide

LLM-friendly, numbered steps. Three install paths (pick one). Each step lists the
command, expected output, and what to do if it fails.

---

## What you're installing

`neuro-link-recursive` is a unified context, memory & behavior control plane for
AI agent harnesses (Claude Code, Cline, K-Dense, ForgeCode...). The runtime is
a single Rust binary (`neuro-link`, v0.2.0) plus several backing services.

**Components installed:**

| Component | Purpose | Default port |
|-----------|---------|--------------|
| `neuro-link` (Rust) | HTTP API, MCP server (stdio + HTTP), CLI | `8080` |
| Qdrant (Docker) | Vector store for the dense half of hybrid RAG | `6333` |
| Neo4j (Docker) | Temporal knowledge graph (Graphiti) | `7474`, `7687` |
| Obsidian headless (Docker) | Web-accessible vault UI for the runtime KB | `8501` |
| Ollama | Local LLM + lightweight embeddings | `11434` |
| llama-server (llama.cpp) | Octen-Embedding-8B (4096-dim primary embedder) | `8400` |
| ngrok | Public tunnel for harness-to-harness MCP-over-HTTP | dynamic |
| Obsidian plugin | UI inside any Obsidian vault | n/a |
| Claude Code MCP | 34 MCP tools, 5 hooks, 16 skills wired in | n/a |

**Hybrid RAG flow:** retrieval combines BM25 (lexical) and Qdrant
(dense vector) results via Reciprocal Rank Fusion (RRF). Successful queries
return `"source": "hybrid-rrf"`.

### Runtime root vs dev source

This repo has two roles depending on where you cloned it:

- **Runtime root** — `~/neuro-link/` — what the live `neuro-link serve`
  process reads. Data lives here (`02-KB-main/`, `03-ontology-main/`, etc.).
- **Dev source** — `~/Desktop/HyperFrequency/neuro-link/` — the git checkout
  you build from. Data folders here are **symlinks** back to the runtime root.

If you're a first-time user with no existing runtime, the install scripts
treat your clone as both — `NLR_ROOT` defaults to the directory containing
`install.sh`.

---

## Path A — `npm install -g neuro-link` (recommended)

Best for: you already have Node 18+ and just want the binary + setup wizard.

### A.1 — Install the npm package

```bash
npm install -g neuro-link
```

**Expected output:** `added 1 package` plus a `[neuro-link postinstall]` line
saying it placed a binary in `native/<platform>-<arch>/`.

**If it fails:**
- "unsupported platform": you're not on darwin-arm64, darwin-x64, linux-x64,
  or win32-x64. Use Path C (manual build) instead.
- "no binary installed": prebuilt binary couldn't be downloaded. Either
  rebuild (`npm rebuild neuro-link`) or use Path C.

### A.2 — Verify the binary

```bash
neuro-link --version
```

**Expected:** `neuro-link 0.2.0`.

**If it fails:** the npm bin shim couldn't resolve the binary. Set
`NEURO_LINK_BINARY=/path/to/neuro-link` or rebuild via Path C.

### A.3 — Run the dependency setup

```bash
curl -fsSL https://raw.githubusercontent.com/HyperFrequency/neuro-link-recursive/master/setup-deps.sh -o /tmp/setup-deps.sh
NLR_ROOT="$HOME/neuro-link" bash /tmp/setup-deps.sh
```

**Expected:** six numbered `=== N/6 ... ===` sections, ending with `Status` and
green `[OK]` lines for Qdrant, Neo4j, Ollama, llama-server.

**If it fails on Docker:** open Docker Desktop manually, wait for the whale icon
to be steady, re-run the script.
**If ollama pulls hang:** check disk space (the qwen3 model is ~15 GB).

### A.4 — Configure secrets

```bash
cd "$HOME/neuro-link"
cp secrets/.env.example secrets/.env
$EDITOR secrets/.env
```

Fill in (at minimum): `INFRANODUS_API_KEY`, `FIRECRAWL_API_KEY`,
`OPENROUTER_API_KEY`, `NGROK_AUTH_TOKEN`, `NEO4J_PASSWORD`. The `NLR_API_TOKEN`
is auto-generated on first `neuro-link serve` if blank.

### A.5 — Start the server

```bash
neuro-link serve --port 8080 --token "$(grep NLR_API_TOKEN secrets/.env | cut -d= -f2)" &
```

**Expected:** logs ending in `listening on 0.0.0.0:8080`.

### A.6 — Verify everything

Skip to **[Verify install](#verify-install)** below.

---

## Path B — `curl ... | bash` (one-shot, no Node required)

Best for: fresh machine, you want every dependency installed in one go.

### B.1 — Run the installer

```bash
curl -fsSL https://raw.githubusercontent.com/HyperFrequency/neuro-link-recursive/master/install.sh | bash
```

**What this does:**
1. Clones the repo into `~/neuro-link-recursive` (override with `NLR_INSTALL_DIR=...`).
2. Installs Homebrew, git, Rust, Node 20, Docker, ngrok, ollama, llama.cpp.
3. `cargo build --release` for the `neuro-link` Rust binary.
4. Builds the Obsidian plugin.
5. Runs `setup-deps.sh` (containers, models, Claude wiring, MCP).
6. Symlinks `neuro-link` to `~/.cargo/bin/`.
7. Detects Obsidian vaults and offers to install the plugin.
8. Runs the runtime smoke test.

**Expected output:** `=== 1/9 ===` through `=== 9/9 ===` sections, then a
`Summary` block with green `+` items and ideally `All checks passed.` from
the smoke test.

**If it fails partway:** the script is idempotent — fix the underlying issue
and re-run. It checks before installing anything.

### B.2 — Configure secrets

Same as **A.4** but `cd ~/neuro-link-recursive`.

### B.3 — Verify

Skip to **[Verify install](#verify-install)**.

---

## Path C — Manual (`git clone && make install`)

Best for: development, custom builds, restricted networks.

### C.1 — Clone the repo

```bash
git clone https://github.com/HyperFrequency/neuro-link-recursive.git
cd neuro-link-recursive
```

### C.2 — Install Rust + Node + Docker manually

```bash
# Rust 1.75+
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustc --version    # expect 1.75+

# Node 20+
brew install node@20
node --version     # expect v20+

# Docker Desktop
brew install --cask docker
open -a Docker     # one-time, grant permissions
```

### C.3 — Build the binary + plugin

```bash
make build          # cargo build --release in server/
cd obsidian-plugin && npm ci && npm run build && cd ..
```

**Expected:** `server/target/release/neuro-link` exists; `obsidian-plugin/main.js` exists.

### C.4 — Run dependency setup

```bash
bash setup-deps.sh
```

(Same six steps as Path A.3.)

### C.5 — Init Claude wiring

```bash
make install        # runs scripts/init.sh
```

**What this does:** creates the directory tree, symlinks 16 skills into
`~/.claude/skills/`, copies 5 hooks into `~/.claude/hooks/`, registers them in
`~/.claude/settings.json`, persists `NLR_ROOT` to `~/.claude/state/nlr_root`.

### C.6 — Symlink the binary

```bash
ln -sf "$(pwd)/server/target/release/neuro-link" ~/.cargo/bin/neuro-link
neuro-link --version
```

### C.7 — Configure secrets and start

Same as A.4 + A.5.

### C.8 — Verify

Continue to **[Verify install](#verify-install)**.

---

## Verify install

Both `setup-deps.sh` and `install.sh` end with a status check, but the
authoritative test is `test-runtime.sh` (under
`.claude/worktrees/compassionate-franklin-2583d0/`).

### Run the smoke test

```bash
NLR_API_TOKEN=$(grep NLR_API_TOKEN ~/neuro-link/secrets/.env | cut -d= -f2) \
  bash ~/neuro-link/.claude/worktrees/compassionate-franklin-2583d0/test-runtime.sh
```

**Expected output:** 13 numbered checks, all `PASS`, ending with
`All checks passed.`

The 13 checks cover:

| # | Check | Why |
|---|-------|-----|
| 1 | local `/health` | Rust server bound to :8080 |
| 2 | public `/health` via ngrok | tunnel up |
| 3 | local `/api/v1/wiki/pages` | bearer auth + KB readable |
| 4 | local `/api/v1/rag/query` | hybrid RRF returns `source=hybrid-rrf` |
| 5 | public `/api/v1/rag/query` | RAG works through tunnel |
| 6 | MCP stdio `tools/list` | binary exposes ≥30 MCP tools (actual: 34) |
| 7 | MCP-over-HTTP `tools/list` | streamable HTTP MCP works |
| 8 | MCP-over-HTTP `nlr_rag_query` | tool call returns hybrid-rrf result |
| 9 | Qdrant `nlr_wiki` collection | vector index populated |
| 10 | Neo4j `:7474` | graph DB up |
| 11 | Ollama `/api/tags` | embedding daemon reachable |
| 12 | llama-server `:8400` | Octen embedding endpoint up |
| 13 | unauthenticated request returns 401 | bearer auth enforced |

### Per-component manual checks

```bash
neuro-link --version                                              # 0.2.0
curl -sf http://localhost:6333/healthz && echo OK                 # Qdrant
curl -sf http://localhost:7474 > /dev/null && echo OK             # Neo4j
curl -sf http://localhost:11434/api/tags | jq '.models | length'  # Ollama models
curl -sf http://localhost:8400/v1/models > /dev/null && echo OK   # llama-server
ngrok version                                                     # tunnel
ls ~/.claude/skills/neuro-link/SKILL.md                           # skills
grep -c neuro ~/.claude/settings.json                             # hooks registered
claude mcp list | grep neuro-link-recursive                       # MCP registered
```

### Inspect what's wired in

The runtime exposes:

- **34 MCP tools** — knowledge-base CRUD, RAG queries, ingestion, ontology
  generation, harness bridge, task queue. List with:
  `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | neuro-link mcp | jq '.result.tools | length'`
- **5 hooks** — `auto-rag-inject.sh` (UserPromptSubmit RAG injection),
  `harness-bridge-check.sh` (peer health), `neuro-grade.sh` (response scoring),
  `neuro-log-tool-use.sh` (tool telemetry), `neuro-task-check.sh` (task queue).
- **16 skills** — `auto-rag`, `code-docs`, `crawl-ingest`, `harness-bridge`,
  `hyper-sleep`, `job-scanner`, `knowledge-gap`, `neuro-link`,
  `neuro-link-setup`, `neuro-scan`, `neuro-surgery`, `progress-report`,
  `reasoning-ontology`, `self-improve-hitl`, `self-improve-recursive`,
  `wiki-curate`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `cargo build` fails | Rust < 1.75 | `rustup update stable` |
| `neuro-link: command not found` | binary not on PATH | `export PATH="$HOME/.cargo/bin:$PATH"` |
| `[neuro-link postinstall] no binary installed` | unsupported platform | use Path C; build from source |
| Qdrant 6333 refused | container not running | `docker compose up -d qdrant` |
| Neo4j 7474 refused | container not running | `docker compose up -d neo4j` |
| obsidian-headless 8501 blank | container starting | `docker compose logs obsidian-headless`; wait ~30s |
| Ollama `/api/tags` empty | model pulls didn't run | `ollama pull qwen3-embedding:8b-fp16` |
| llama-server :8400 refused | embedding server not running | `bash scripts/embedding-server.sh` |
| ngrok tunnel down | auth token missing | `ngrok config add-authtoken $NGROK_AUTH_TOKEN` |
| MCP tools/list shows < 30 | wrong binary on PATH | `which neuro-link`; rebuild |
| Smoke test step 4 fails (`hybrid-rrf` missing) | Qdrant collection empty | run an `/wiki-curate` to populate, or seed via API |
| Smoke test step 13 returns 200 not 401 | bearer auth disabled | check `--token` flag passed to `neuro-link serve` |
| Hooks don't fire | not registered in settings.json | re-run `bash scripts/init.sh` |
| Obsidian plugin not visible | not copied to vault | `cp -r obsidian-plugin/* /path/to/vault/.obsidian/plugins/neuro-link-recursive/` |
| Claude MCP not connecting | not registered | `claude mcp add neuro-link-recursive -- neuro-link mcp` |
| `secrets/.env` keys missing | not filled | see "Configure secrets" above |

---

## API keys reference

| Key | Where to get | Used for |
|-----|--------------|----------|
| `INFRANODUS_API_KEY` | https://infranodus.com/settings | Reasoning ontologies, gap analysis |
| `FIRECRAWL_API_KEY` | https://firecrawl.dev/app/api-keys | Web crawling in `crawl-ingest` |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys | LLM fallback routing |
| `CONTEXT7_API_KEY` | https://context7.com (optional) | Code-docs lookups |
| `NGROK_AUTH_TOKEN` | https://dashboard.ngrok.com/get-started/your-authtoken | Public tunnel |
| `NEO4J_PASSWORD` | you set when starting the container | Neo4j auth |
| `NLR_API_TOKEN` | auto-generated by install scripts | Bearer auth on the HTTP API |
| `MODAL_TOKEN_ID`, `MODAL_TOKEN_SECRET` | https://modal.com (optional) | Cloud compute |
| `KDENSE_API_KEY` | K-Dense dashboard (optional) | K-Dense harness bridge |

All read from `secrets/.env` at startup. File is `.gitignored`.
