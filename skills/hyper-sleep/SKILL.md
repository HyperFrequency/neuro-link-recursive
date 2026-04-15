---
name: hyper-sleep
description: >
  Background maintenance daemon for neuro-link-recursive. Runs via /loop or /schedule. Performs:
  garbage collection of old raw files, ontology reindexing, upstream doc change detection, log
  compaction, index regeneration, health checks, and gap analysis. Use when the user says
  /hyper-sleep, "run maintenance", "background tasks", or when triggered by /loop /hyper-sleep
  or a scheduled cron trigger. Reads config/hyper-sleep.md for task schedules and HITL guards.
metadata:
  openclaw:
    icon: "crescent_moon"
    requires:
      bins: [python3]
      mcps: [infranodus]
---

# /hyper-sleep

Background maintenance daemon. Keeps the knowledge base clean, indexed, and up-to-date.

## When to Use

- User says `/hyper-sleep` or "run maintenance" / "background tasks" / "clean up"
- Triggered by `/loop /hyper-sleep` for continuous self-paced execution
- Triggered by `/schedule` cron job
- After a large batch ingest to clean up and reindex

## When NOT to Use

- For active knowledge work — use wiki-curate, crawl-ingest
- For scanning and diagnosis — use neuro-scan
- For fixing specific failures — use neuro-surgery
- For self-improvement — use self-improve-hitl or self-improve-recursive

## Procedure

### Step 1 — Load schedule config

1. Read `config/hyper-sleep.md` frontmatter for task schedules and HITL guards
2. Read `state/heartbeat.json` for last execution timestamps per task
3. Determine which tasks are due based on `interval_hours` since last run
4. If `enabled: false`: report status only, do not execute (unless user explicitly invoked)

### Step 2 — Determine task order

Prioritize due tasks:
1. `health_check` (always first — validates environment)
2. `regenerate_indexes` (fast, foundational for other tasks)
3. `compact_logs` (free up disk, speed up log reads)
4. `check_upstream_docs` (detect external changes)
5. `reindex_ontologies` (rebuild graph indexes)
6. `garbage_collect_raw` (cleanup, potentially destructive)
7. `gap_analysis` (expensive, runs last)

### Step 3 — Health check

1. Test MCP server connectivity: InfraNodus, TurboVault, Context7, Auggie, Firecrawl
2. Verify critical directories exist: `00-raw/` through `09-business-docs/`, `config/`, `state/`
3. Verify critical state files are writable: `heartbeat.json`, `session_log.jsonl`, `deviation_log.jsonl`, `score_history.jsonl`
4. Check disk space on NLR_ROOT volume
5. Update `state/heartbeat.json`:
   ```json
   {
     "timestamp": "2026-04-15T10:00:00Z",
     "mcp_status": {"infranodus": "ok", "turbovault": "ok", "context7": "ok"},
     "disk_free_gb": 42.5,
     "health": "ok"
   }
   ```

### Step 4 — Regenerate indexes

1. Glob `02-KB-main/**/*.md` (exclude schema.md, index.md, log.md)
2. For each page: read frontmatter (title, domain, confidence, last_updated, open_questions count)
3. Regenerate `02-KB-main/index.md` with full page listing
4. Verify all `[[wikilinks]]` in wiki pages resolve to existing pages
5. Log broken wikilinks to `state/deviation_log.jsonl` with `category: broken_ontology`
6. Rebuild `state/auto-rag-index.json` (same as `/auto-rag rebuild`)

### Step 5 — Compact logs

1. Read `state/session_log.jsonl` — identify entries older than 30 days
2. Read `state/score_history.jsonl` — identify entries older than 90 days
3. For each file with old entries:
   a. Write old entries to `state/archive/<filename>-<date>.jsonl.gz` (gzip compressed)
   b. Rewrite the active file with only recent entries
4. Report: N entries archived from session_log, M from score_history
5. Never compact `state/deviation_log.jsonl` — it is the audit trail

### Step 6 — Check upstream docs

1. Read `config/adjacent-tools-code-docs.md` for tracked upstream repos
2. Read `config/forked-repos-with-changes.md` for tracked forks
3. For each repo: `gh api repos/<owner>/<repo>/releases/latest`
4. Compare release date against `Last Indexed` column
5. For each new release detected:
   a. Create a task in `07-neuro-link-task/`: type=ingest, priority=3
   b. Include release URL, changelog summary
6. For forks: compute divergence stats and update config table

### Step 7 — Reindex ontologies

1. Glob `03-ontology-main/**/*.md`
2. For each ontology file:
   a. Parse wikilink triples
   b. Count entities, relations, orphaned nodes
   c. If InfraNodus available: push updated graph data
3. Report: N ontologies reindexed, M orphaned nodes detected
4. If `hitl_for_ontology_updates: true`: log orphaned nodes but do not auto-fix

### Step 8 — Garbage collect raw files

**Requires HITL if `hitl_for_deletions: true` in config.**

1. Glob `00-raw/**/*`
2. For each file:
   a. Check age against `max_age_days` (default 90)
   b. Check if SHA256 appears in any wiki page `sources[].sha256`
   c. Check if it is the sole source for any active wiki page
3. Candidates for deletion: old AND fully curated AND not sole source
4. If HITL required: present list and wait for approval
5. If approved: move to `state/archive/raw/` (soft delete, not hard delete)
6. Report: N files archived, M GB freed

### Step 9 — Gap analysis

1. If InfraNodus available:
   a. Run `generate_content_gaps` on the primary knowledge graph
   b. Run `generate_topical_clusters` to identify cluster boundaries
   c. Gaps at cluster boundaries = topics connecting two knowledge areas with sparse coverage
2. Fallback: count `open_questions` per domain, flag domains with >5 unresolved questions
3. For each significant gap:
   a. Create a task in `07-neuro-link-task/`: type=ingest or curate, priority=2
   b. Include gap description, suggested sources, connected topics
4. Report: G gaps identified, T tasks created

### Step 10 — Generate maintenance report

```
hyper-sleep maintenance report — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tasks executed: N / M due

HEALTH CHECK
  MCP servers: all ok | [list failures]
  Disk: X GB free
  State files: writable

INDEXES
  Wiki pages indexed: P
  Broken wikilinks found: B
  Auto-RAG index rebuilt: yes/no

LOG COMPACTION
  session_log: N entries archived
  score_history: M entries archived

UPSTREAM
  New releases: U repos
  Fork divergence updated: F repos

ONTOLOGIES
  Reindexed: O ontologies
  Orphaned nodes: N

GARBAGE COLLECTION
  Files eligible: G
  Files archived: A (X MB freed)
  Skipped (sole source): S

GAP ANALYSIS
  Gaps found: G
  Tasks created: T

Next maintenance: [earliest due task timestamp]
```

### Step 11 — Update heartbeat and schedule next run

1. Write completion timestamp for each executed task to `state/heartbeat.json`
2. Calculate next due time for each task
3. If running via `/loop`: sleep until the earliest next-due task
4. If running via `/schedule`: exit (cron will re-trigger)
