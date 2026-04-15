---
name: neuro-scan
description: >
  Brain scanner for neuro-link-recursive. Scans the knowledge base for: pending tasks in 07-neuro-link-task/,
  stale wiki pages, knowledge gaps via InfraNodus content gap analysis, unresolved failures in deviation log,
  and upstream doc changes. Use when the user says /neuro-scan, asks to check for pending work, wants a brain
  health report, or this is triggered by a scheduled scan. Produces a scan report and queues remediation tasks.
metadata:
  openclaw:
    icon: "magnifying_glass"
    requires:
      bins: [python3]
      mcps: [infranodus]
---

# /neuro-scan

Brain scanner. Finds pending tasks, stale pages, knowledge gaps, failures, and upstream changes.

## When to Use

- User says `/neuro-scan` or "scan the brain" / "check for pending work" / "any issues?"
- Triggered by scheduled cron job or `/loop /neuro-scan`
- Called by `/neuro-link scan`

## When NOT to Use

- For ingesting a specific source — use crawl-ingest
- For curating a specific topic — use wiki-curate
- For fixing a specific failure — use neuro-surgery (Phase 2)

## Procedure

### Step 1 — Load config

Read `config/neuro-scan.md` frontmatter for scan targets, thresholds, and notification rules.
Read `config/neuro-link.md` frontmatter for directory paths.

### Step 2 — Scan task queue

Glob `07-neuro-link-task/*.md`. For each file:
1. Read YAML frontmatter
2. Filter for `status: pending`
3. Sort by `priority` (1 = highest)
4. Count total, by priority, by type

### Step 3 — Check wiki staleness

Glob `02-KB-main/**/*.md` (exclude schema.md, index.md, log.md). For each:
1. Read `last_updated` from frontmatter
2. Compare against `staleness_threshold_days` from config
3. If stale: add to findings, check if any linked pages have been updated more recently (staleness propagation)

### Step 4 — Knowledge gap analysis

If `gap_analysis_method: infranodus` in config:
1. Query InfraNodus for the graph named in `gap_graph_name`
2. Use `generate_content_gaps` to identify topics with sparse connections
3. Use `generate_topical_clusters` to identify cluster boundaries
4. Gaps at cluster boundaries = missing connections between knowledge areas

If InfraNodus is unavailable, fall back to:
1. Read all `open_questions` from wiki page frontmatter
2. Count unresolved questions per domain
3. Identify domains with high question-to-page ratios

### Step 5 — Check failure log

Read `state/deviation_log.jsonl`. For each entry:
1. Check if `resolved: false`
2. Check retry count against `failure_retry_limit`
3. If under limit: mark as retriable
4. If over limit: escalate (add to HITL findings)

### Step 6 — Check upstream docs (if enabled)

For each repo in `upstream_check_repos`:
1. Run `gh api repos/<repo>/releases/latest` to check for new releases
2. Compare release date against last indexed date in `config/adjacent-tools-code-docs.md`
3. If newer: create an ingest task

### Step 7 — Generate scan report

Compile all findings into a structured report:

```
neuro-scan report — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK QUEUE
  Pending: N tasks (P priority-1)
  Oldest: [task name] (created [date])

WIKI HEALTH
  Total pages: N
  Stale (>30d): M pages
  Needs review: K pages (staleness propagation)

KNOWLEDGE GAPS
  Gaps found: G
  New since last scan: N
  Highest priority: [gap description]

FAILURES
  Unresolved: F
  Retriable: R
  Escalated (HITL needed): E

UPSTREAM
  New releases detected: U repos
  
ACTIONS TAKEN
  Tasks created: T
  [list of new task files created]
```

### Step 8 — Create remediation tasks

For each finding that needs action:
1. Create a `.md` job file in `07-neuro-link-task/` with appropriate type, priority, and description
2. For stale pages: type=curate, priority=3
3. For knowledge gaps: type=ingest or curate, priority=2
4. For failures: type=repair, priority=1
5. For upstream changes: type=ingest, priority=3

### Step 9 — Update state

Write scan timestamp to `state/heartbeat.json`.
If `notify_on` conditions met: the `neuro-task-check.sh` hook will pick up the findings on the next prompt.
