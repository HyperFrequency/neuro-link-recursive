---
name: neuro-surgery
description: >
  Failure remediation and HITL self-improvement coordinator for neuro-link-recursive. Reviews neuro-scan
  reports, reads state/deviation_log.jsonl, categorizes failures, proposes fixes, resolves ontological
  inconsistencies, and re-synthesizes source-of-truth wiki pages with human approval. Use when the user
  says /neuro-surgery, asks to "fix scan failures", "resolve deviations", "repair the knowledge base",
  or when job-scanner encounters type=repair tasks. All destructive operations require HITL confirmation
  per config/neuro-surgery.md rules.
metadata:
  openclaw:
    icon: "wrench"
    requires:
      bins: [python3]
      mcps: [infranodus, turbovault]
---

# /neuro-surgery

Failure remediation engine. Reads deviation logs, categorizes issues, proposes and executes fixes with HITL approval.

## When to Use

- User says `/neuro-surgery` or "fix failures" / "resolve deviations" / "repair KB"
- Called by `job-scanner` for `type: repair` tasks
- Called by `neuro-scan` when escalated failures are detected
- After a wiki-curate or crawl-ingest failure that needs manual intervention

## When NOT to Use

- For routine wiki updates — use wiki-curate
- For scanning without fixing — use neuro-scan
- For self-improvement proposals — use self-improve-hitl
- For background maintenance — use hyper-sleep

## Procedure

### Step 1 — Load config and deviation log

1. Read `config/neuro-surgery.md` frontmatter for HITL rules and fix categories
2. Read `state/deviation_log.jsonl` — parse all entries with `resolved: false`
3. Read `config/neuro-link.md` for directory paths and thresholds
4. If invoked with a specific task file, read that task from `07-neuro-link-task/`

### Step 2 — Categorize deviations

For each unresolved deviation, classify into one of:

| Category | Description | Default HITL? |
|----------|-------------|---------------|
| `stale_page` | Wiki page not updated past threshold | auto |
| `broken_ontology` | Ontology has orphaned nodes or broken references | HITL |
| `failed_ingest` | crawl-ingest failed (network, parse, dedup) | auto |
| `contradicted_claim` | Two wiki pages make opposing claims | HITL |
| `missing_source` | Wiki page cites a source that no longer exists in 00-raw/ | auto |
| `hook_failure` | A hook script returned non-zero or timed out | auto |
| `skill_error` | A skill invocation failed mid-procedure | auto |

Group deviations by category. Count severity: critical (blocks other work), warning (degraded quality), info (cleanup needed).

### Step 3 — Generate fix proposals

For each deviation, generate a structured fix proposal:

```
FIX PROPOSAL — [category]: [short description]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deviation: [deviation_id from log]
Category: [category]
Severity: critical | warning | info
Root cause: [analysis]
Proposed fix: [specific action]
Files affected: [list]
HITL required: yes | no (per config)
Side effects: [staleness propagation, downstream tasks]
```

### Step 4 — Check HITL requirements

Cross-reference each proposal against `config/neuro-surgery.md`:
1. If the operation is in `hitl_required` list: queue for user approval
2. If in `auto_approved` list: mark for immediate execution
3. If bulk operation (>5 pages): always require HITL regardless of category

Present all proposals to the user in a summary table:
```
neuro-surgery proposals
━━━━━━━━━━━━━━━━━━━━━━
| # | Category | Severity | Description | HITL? |
|---|----------|----------|-------------|-------|
```

### Step 5 — Execute approved fixes

For each approved (or auto-approved) fix:

**stale_page:**
1. Re-read source material from `00-raw/` or `01-sorted/`
2. Invoke wiki-curate for the affected topic
3. Update deviation log: `resolved: true`, `resolution: re-curated`

**broken_ontology:**
1. Read the ontology file from `03-ontology-main/`
2. Identify orphaned nodes (entities with no connections)
3. Identify broken references (wikilinks to nonexistent wiki pages)
4. If InfraNodus available: run `generate_topical_clusters` to check coherence
5. Propose targeted edits — add missing connections or remove orphans
6. With HITL approval: write updated ontology

**failed_ingest:**
1. Read the original task or crawl-ingest command from deviation context
2. Diagnose: network failure? parse error? duplicate detected?
3. If network: retry with exponential backoff (1 retry only)
4. If parse: log the unparseable content, suggest manual review
5. If duplicate: mark as resolved, update dedup index

**contradicted_claim:**
1. Read both wiki pages making opposing claims
2. Read their source material
3. Present both positions with confidence levels and source quality
4. Propose resolution: merge (synthesize both views), retract (remove weaker claim), or flag (keep both with explicit contradiction section)
5. With HITL approval: update the affected wiki pages

**missing_source:**
1. Check if the source was garbage-collected or never existed
2. If garbage-collected: restore from `state/archive/` if available
3. If never existed: mark the citation as `[source:missing]` in the wiki page
4. Create a task to re-ingest the source if a URL is available

**hook_failure:**
1. Read the error from session_log.jsonl
2. Check hook script exists and is executable
3. Test with a minimal input to reproduce
4. If timeout: check for slow operations (network calls, large file reads)
5. Log diagnosis, suggest fix to the user

**skill_error:**
1. Read the error context from deviation log
2. Identify which step in the skill procedure failed
3. If data issue: fix the data and re-run
4. If skill bug: log for self-improve-hitl

### Step 6 — Propagate staleness

After any wiki page fix:
1. Read `wikilinks[]` from all wiki pages that link to the fixed page
2. Set `needs_review: true` on those pages
3. Create priority-3 curate tasks for downstream pages

### Step 7 — Update deviation log

For each processed deviation:
```json
{
  "deviation_id": "dev-20260415-001",
  "resolved": true,
  "resolution": "re-curated | ontology-fixed | retried | retracted | flagged",
  "resolved_at": "2026-04-15T10:00:00Z",
  "resolved_by": "neuro-surgery",
  "hitl_approved": true
}
```
Append the resolution entry to `state/deviation_log.jsonl`.

### Step 8 — Generate surgery report

```
neuro-surgery report — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Processed: N deviations
  Fixed (auto):     A
  Fixed (HITL):     B
  Deferred:         C (awaiting approval)
  Unfixable:        D (logged for manual review)

Staleness propagated to: M pages
New tasks created: K
```

### Step 9 — Score and log

Append to `state/score_history.jsonl`:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "skill": "neuro-surgery",
  "deviations_processed": N,
  "fix_rate": 0.85,
  "hitl_ratio": 0.3
}
```
