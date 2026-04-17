---
name: neuro-link-setup
description: >
  Interactive guided setup for neuro-link-recursive. Walks the user through: prerequisites check,
  directory verification, secrets configuration, MCP server connectivity, skill installation,
  hook registration, and first-run verification. Use when the user says /neuro-link-setup,
  "set up neuro-link", "configure the brain", or on first use when state/heartbeat.json shows
  status=initialized. Designed to be conversational — asks questions, validates answers, proceeds step by step.
metadata:
  openclaw:
    icon: "wrench"
    requires:
      bins: [python3, bash]
---

# /neuro-link-setup

Interactive, LLM-guided setup for neuro-link-recursive.

## When to Use

- User says `/neuro-link-setup` or "set up neuro-link" / "configure the brain"
- First run: `state/heartbeat.json` shows `status: initialized`
- After installation issues detected by `/neuro-link health`

## When NOT to Use

- System is already fully configured — use `/neuro-link status` instead
- For ongoing operation — use `/neuro-link` subcommands

## Procedure

Run this as a conversational, step-by-step walkthrough. Ask the user questions at each step and validate before proceeding.

If the user prefers a non-interactive, copy-paste path instead (harness dispatch, fresh laptop), point them at `./ONBOARDING.md` in this skill directory — it's a linear 10-step runbook covering install, secrets, first run, verification, first drop, PDF pipeline, hooks, and troubleshooting. Ported from the meta-harness `ONBOARDING.md` pattern and adapted to this runtime.

### Step 1 — Welcome & Prerequisites

Display:
```
neuro-link-recursive Setup
━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome! Let's get your unified knowledge brain configured.

I'll walk you through:
1. Prerequisites check
2. Directory verification
3. Secrets & API keys
4. MCP server connectivity
5. Skill & hook installation
6. First-run verification
```

Check prerequisites:
- Python 3.11+: `python3 --version`
- Claude Code CLI: `claude --version` (or verify we're running in it)
- Required MCP servers: check `~/.claude.json` for infranodus, firecrawl, turbovault, context7, auggie

Report which are present and which are missing. For missing items, provide specific installation instructions.

### Step 2 — Directory Verification

Check that the full directory tree exists:
```bash
ls neuro-link-recursive/{00-raw,01-sorted,02-KB-main,03-ontology-main,...}
```

If any directories are missing, offer to run `scripts/init.sh` to create them.

### Step 3 — Secrets Configuration

Check if `secrets/.env` exists. If not, create from `.env.example`.

Walk through each key:
```
Let's configure your API keys. I'll check each one:

INFRANODUS_API_KEY: [found in MCP config / not found]
  → If not found: "Get your key at https://infranodus.com/settings"
  → If found in MCP config: "Using key from MCP server config ✓"

FIRECRAWL_API_KEY: [found / not found]
  → "Get your key at https://firecrawl.dev/app/api-keys"

CONTEXT7_API_KEY: [found / not found]
  → Already configured in your MCP setup

OPENROUTER_API_KEY: [found / not found]
  → "Get your key at https://openrouter.ai/keys"
```

For each missing key: ask the user to provide it or skip for now.

### Step 4 — MCP Server Connectivity

Test each required MCP server:
1. **InfraNodus**: Try a simple query (list graphs or create a test graph)
2. **Firecrawl**: Try scraping a simple URL
3. **TurboVault**: Try listing vault contents
4. **Context7**: Try a simple doc lookup
5. **Auggie**: Try a simple search

Report results:
```
MCP Server Connectivity
━━━━━━━━━━━━━━━━━━━━━━
InfraNodus:  ✓ connected (3 existing graphs)
Firecrawl:   ✓ connected
TurboVault:  ✓ connected (vault: /Users/DanBot/Desktop/Obsidian Vault)
Context7:    ✓ connected
Auggie:      ✓ connected
```

### Step 5 — Skill & Hook Installation

Check if skills are installed:
```bash
ls -la ~/.claude/skills/neuro-link/SKILL.md
ls -la ~/.claude/skills/neuro-scan/SKILL.md
# ... for all 8 skills
```

If missing, create symlinks from `neuro-link-recursive/skills/<name>/SKILL.md` to `~/.claude/skills/<name>/SKILL.md`.

Check if hooks are installed:
```bash
ls -la ~/.claude/hooks/auto-rag-inject.sh
ls -la ~/.claude/hooks/neuro-log-tool-use.sh
ls -la ~/.claude/hooks/neuro-task-check.sh
```

If missing, copy from `neuro-link-recursive/hooks/` and make executable.

Check `~/.claude/settings.json` for hook registration. If hooks aren't registered, show the user the JSON that needs to be added and offer to add it.

### Step 6 — Master Config Review

Read `config/neuro-link.md` and walk through key settings:
```
Let's review your master config:

Root directory: /Users/DanBot/Desktop/HyperFrequency/neuro-link-recursive ✓
Obsidian vault: /Users/DanBot/Desktop/Obsidian Vault ✓
Auto-curate: true (new ingestions auto-trigger wiki synthesis)
Auto-RAG: true (wiki context injected into every prompt)
Wiki LLM: claude-sonnet-4-6
Ontology LLM: claude-opus-4-6

Change anything? (or press enter to continue)
```

### Step 7 — First-Run Verification

Run a complete health check:
1. `/neuro-link health` — verify all components
2. Try a test ingestion of a small source
3. Verify the auto-rag hook fires on a test prompt
4. Check that state files are being written

### Step 8 — Summary

```
neuro-link-recursive is ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 8 skills installed
✓ 3 hooks registered
✓ 5 MCP servers connected
✓ Config loaded
✓ State initialized

Next steps:
  /crawl-ingest <url>     — Add your first source
  /neuro-link status      — Check system status
  /neuro-scan             — Run brain scan
  /reasoning-ontology <d> — Create your first ontology

For background maintenance:
  /schedule create --name "neuro-heartbeat" --cron "0 */6 * * *" --prompt "/neuro-scan"
```

Update `state/heartbeat.json` with `status: configured`.
