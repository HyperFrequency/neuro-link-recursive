---
name: neuro-link
description: >
  Main orchestrator for neuro-link-recursive — unified context, memory & behavior control plane.
  Use when the user says /neuro-link, asks about brain status, wants to trigger a scan, ingest a source,
  curate a wiki topic, check task queue, or get a system overview. Subcommands: status, scan, ingest <src>,
  curate <topic>, tasks, config, health. This is the primary entry point for all neuro-link-recursive operations.
metadata:
  openclaw:
    icon: "brain"
    requires:
      bins: [python3]
      env: []
      mcps: [infranodus, turbovault]
---

# /neuro-link

Main orchestrator for the neuro-link-recursive system. Routes to sub-skills based on subcommand.

## Subcommands

| Command | Action | Delegates To |
|---------|--------|-------------|
| `/neuro-link status` | System health + component status | (inline) |
| `/neuro-link scan` | Run brain scan | neuro-scan skill |
| `/neuro-link ingest <source>` | Ingest a source | crawl-ingest skill |
| `/neuro-link curate <topic>` | Synthesize wiki page | wiki-curate skill |
| `/neuro-link tasks` | List pending tasks | job-scanner skill |
| `/neuro-link config` | Show current config | (inline) |
| `/neuro-link health` | Deep health check with MCP connectivity | (inline) |
| `/neuro-link ontology <domain>` | Generate/update reasoning ontology | reasoning-ontology skill |

## When to Use

- User says `/neuro-link` or `neuro-link` followed by a subcommand
- User asks "what's the brain status" / "how's the knowledge base" / "any pending tasks"
- User wants a system overview or to trigger any neuro-link operation

## When NOT to Use

- For direct wiki editing — edit the files directly
- For questions about a specific tool — use deep-tool-wiki
- For general code questions — use standard tools

## Procedure

### Step 1 — Parse subcommand

Extract the subcommand from the user's input. If no subcommand, default to `status`.

### Step 2 — Route

#### `status`

Read and report:
1. `state/heartbeat.json` — last health check, any errors
2. Count files in each directory: `00-raw/` through `09-business-docs/`
3. Count pending tasks in `07-neuro-link-task/` (grep for `status: pending`)
4. Count wiki pages in `02-KB-main/` (exclude schema.md, index.md, log.md)
5. Count ontologies in `03-ontology-main/`
6. Read `config/neuro-link.md` frontmatter for active settings

Format as a concise status table:
```
neuro-link-recursive status
━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw sources:     N files
Sorted:          N files
Wiki pages:      N pages (M stale)
Ontologies:      N graphs
Pending tasks:   N (P priority-1)
Knowledge gaps:  N open
Last scan:       timestamp
Auto-RAG:        on/off
Auto-curate:     on/off
Health:          ok/warning/error
```

#### `scan`
Invoke the neuro-scan skill. Pass through any additional arguments.

#### `ingest <source>`
Invoke the crawl-ingest skill with the source argument.

#### `curate <topic>`
Invoke the wiki-curate skill with the topic argument.

#### `tasks`
Glob `07-neuro-link-task/*.md` and display a task table:
```
| # | Title | Type | Priority | Status | Created |
```

#### `config`
Read `config/neuro-link.md` frontmatter and display current settings.

#### `health`
Deep check:
1. Verify each required MCP server in `config/neuro-link-config.md` is reachable
2. Check all skill files exist in `~/.claude/skills/`
3. Check all hook scripts exist and are executable in `~/.claude/hooks/`
4. Check `~/.claude/settings.json` has our hooks registered
5. Check state files are writable
6. Update `state/heartbeat.json` with results

#### `ontology <domain>`
Invoke the reasoning-ontology skill with the domain argument.
