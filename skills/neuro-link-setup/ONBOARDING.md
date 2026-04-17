# neuro-link-recursive — Onboarding

A short guided walkthrough for a brand-new operator. Adapted from the
meta-harness `ONBOARDING.md` pattern (arxiv:2603.28052, MIT-licensed) and
folded into the `/neuro-link-setup` conversational flow.

The goal: after ten minutes, you can drop a file into `00-raw/`, query the
wiki, and see hybrid-RAG results come back. Everything below is runnable —
copy-paste friendly.

---

## 0. Who this is for

You're a human or harness (Claude Code, K-Dense, ForgeCode, Claw-Code) who
just cloned the repo and wants the whole stack live. If you're *already*
operating the stack, skip this file and use `/neuro-link status`.

---

## 1. One-line install sanity

```bash
curl -fsSL https://raw.githubusercontent.com/HyperFrequency/neuro-link-recursive/master/setup-deps.sh | bash
```

If you prefer to see what's about to run: follow Path A in `INSTALL.md`.

What you get after `setup-deps.sh`:

- `qdrant` (6333), `neo4j` (7474/7687), `ollama` (11434), `llama-server` (8400)
- `neuro-link` binary on PATH
- `~/neuro-link/` runtime folder with the 18 data dirs + `secrets/.env.example`

---

## 2. Secrets

```bash
cd ~/neuro-link
cp secrets/.env.example secrets/.env
$EDITOR secrets/.env
```

Minimum to fill in:

- `NLR_API_TOKEN` — generate via `openssl rand -hex 32`. Every HTTP call from
  harnesses uses this as the bearer token.
- `NEO4J_PASSWORD` — whatever you used in `docker-compose.yml`.
- `FIRECRAWL_API_KEY` — optional; required only if you run `/crawl-ingest`
  against web sources.

---

## 3. First run

```bash
neuro-link start --port 8080 --tunnel
```

Expected output (first 10s):

```
OK HTTP server listening on 0.0.0.0:8080
  POST /mcp           — MCP JSON-RPC
  GET  /health        — health check (no auth)
  GET  /api/v1/...    — REST API
OK Heartbeat daemon spawned (interval=60s)
OK Starting ngrok tunnel...
```

If you see `Heartbeat daemon spawned`, A-fu5 (the in-process heartbeat) is
live — `state/heartbeat.json` will refresh every 60s.

---

## 4. Verify end-to-end

```bash
NLR_API_TOKEN=$(grep NLR_API_TOKEN secrets/.env | cut -d= -f2) \
  bash .claude/worktrees/*/test-runtime.sh
```

The smoke suite has 13 checks. Required to pass before proceeding:

- local + ngrok `/health` → 200
- REST `/api/v1/rag/query` with `source=hybrid-rrf`
- MCP `tools/list` returns ≥34 tools
- `qdrant` + `neo4j` + `ollama` reachable
- llama-server `:8400` `/v1/models` reports Octen-8B
- Unauthed request to any `/api/v1/*` returns 401 (fail-closed)

---

## 5. Your first wiki page

Drop a markdown file into the inbox:

```bash
cat > ~/neuro-link/00-raw/hello.md <<'MD'
# Rust ownership primer

Ownership means every value in Rust has a single variable that owns it.
When the owner goes out of scope, the value is dropped.
MD
```

Within 2 seconds the watcher should:

1. Move it to `00-raw/hello/source.md`
2. Classify into `software-engineering` and move into `01-sorted/software-engineering/hello.md`
3. Drop the `.classified` marker
4. Append an entry to `state/curation_queue.jsonl`

Inspect:

```bash
ls ~/neuro-link/00-raw/hello/            # source.md, .classified, metadata.json
ls ~/neuro-link/01-sorted/software-engineering/
cat ~/neuro-link/state/curation_queue.jsonl | tail -1
```

Then, if you want a real wiki page synthesized from the drop, run
`/wiki-curate` — it consumes the queue and writes to `02-KB-main/`.

---

## 6. Drop a PDF

```bash
cp ~/Downloads/some-paper.pdf ~/neuro-link/00-raw/
```

The PDF pipeline extracts text, embedded images, and renders illustration
pages. Output at `01-sorted/<domain>/<slug>.md` with Obsidian `![[slug/img-NNN.png]]`
embeds. Requires poppler-utils (`brew install poppler`).

---

## 7. Register with Claude Code

Your MCP server ships pre-registered at user scope. Confirm:

```bash
claude mcp list --scope user | grep neuro-link-recursive
```

If it's missing:

```bash
claude mcp add-json neuro-link-recursive '{"type":"stdio","command":"neuro-link","args":["mcp"]}' --scope user
```

Restart Claude Code and the 34 `nlr_*` tools will be available.

---

## 8. Hooks (optional but recommended)

```bash
bash scripts/install-hooks.sh
```

This wires up:

- `auto-rag` — PreToolUse injection of wiki context on matching prompts
- `harness-bridge-check` — suggests delegation when routing patterns match
- `job-scanner` — UserPromptSubmit post-hook surfaces pending tasks

Hooks are idempotent; run the installer again after `git pull` to sync.

---

## 9. Troubleshooting quickstart

| Symptom | First thing to check |
|---------|----------------------|
| `ngrok: command not found` | `brew install ngrok/ngrok/ngrok && ngrok config add-authtoken ...` |
| `state/heartbeat.json` stale | Restart server — heartbeat is spawned inside `Serve` (A-fu5) |
| RAG returns no hits | `neuro-link embed` to rebuild the Qdrant index from current wiki |
| Watcher not firing on drop | `tail /tmp/nlr.log` for "loose drop detected" line; check the dir is 00-raw/ not ~/Downloads/ |
| 401 on REST | `echo $NLR_API_TOKEN` is set and matches `secrets/.env` |

Deeper issues: `INSTALL.md` § Troubleshooting, or `/neuro-link health`.

---

## 10. Where to read next

- `CLAUDE.md` in the repo root — architecture + live commands
- `config/neuro-link.md` — PRD for the orchestrator
- `02-KB-main/schema.md` — wiki page schema
- `.claude/worktrees/*/README.md` — worktree-specific operational notes

Once you can drop a file and see it appear in the wiki, `/neuro-link-setup`
is done. Everything else is iteration.
