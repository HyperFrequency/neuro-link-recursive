---
name: job-scanner
description: >
  Task queue processor for neuro-link-recursive. Scans 07-neuro-link-task/ for pending markdown job specs
  and dispatches them to appropriate skills. Each .md file in the task directory is a job with YAML frontmatter
  defining type, priority, dependencies, and status. Use when the user says /job-scanner, "process tasks",
  "run pending jobs", or auto-triggered by neuro-scan.
metadata:
  openclaw:
    icon: "clipboard"
    requires:
      bins: [python3]
---

# /job-scanner

Task queue processor. Scans for pending jobs and dispatches to skills.

## When to Use

- User says `/job-scanner` or "process tasks" / "run pending jobs" / "what's in the queue"
- Called by neuro-scan after creating remediation tasks
- Called by `/neuro-link tasks`

## When NOT to Use

- To create new tasks manually — just create a .md file in `07-neuro-link-task/`
- For one-off operations — invoke the specific skill directly

## Job File Format

Each `.md` file in `07-neuro-link-task/` is a job spec:

```yaml
---
type: ingest | curate | scan | repair | report | ontology
status: pending | running | completed | failed
priority: 1-5  # 1 = highest
created: 2026-04-15
depends_on: []  # list of other job filenames
assigned_harness: claude-code  # or k-dense, forgecode (Phase 3)
---
# Job Title

Description of what needs to be done.
Source: URL or path (for ingest/curate)
Target domain: domain-name
Auto-curate: yes/no (for ingest)
```

## Procedure

### Step 1 — Scan for pending jobs

1. Glob `07-neuro-link-task/*.md`
2. Read YAML frontmatter of each file
3. Filter for `status: pending`
4. Check dependencies: skip jobs where any `depends_on` file has `status != completed`
5. Sort eligible jobs by priority (ascending = highest first), then by `created` (oldest first)

### Step 2 — Display queue

Show the task queue:
```
neuro-link-recursive task queue
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| # | File | Type | Pri | Status | Created | Deps |
|---|------|------|-----|--------|---------|------|
| 1 | fix-broken-ingest.md | repair | 1 | pending | 2026-04-15 | — |
| 2 | ingest-nautilus-v2.md | ingest | 2 | pending | 2026-04-15 | — |
...

Total: N pending, M running, K completed, F failed
```

### Step 3 — Process highest-priority job

Take the first eligible job and:

1. Update its frontmatter: `status: running`
2. Based on `type`, dispatch to the appropriate skill:

| Type | Skill | Action |
|------|-------|--------|
| `ingest` | crawl-ingest | Ingest the source specified in the job body |
| `curate` | wiki-curate | Synthesize/update a wiki page for the topic |
| `scan` | neuro-scan | Run a targeted scan |
| `repair` | (inline or neuro-surgery Phase 2) | Fix the issue described |
| `report` | (inline) | Generate a progress report |
| `ontology` | reasoning-ontology | Generate/update an ontology |

3. On success: update frontmatter to `status: completed`, add `completed_at: timestamp`
4. On failure: update frontmatter to `status: failed`, add error details to body, log to `state/deviation_log.jsonl`

### Step 4 — Check for newly eligible jobs

After completing a job, re-scan for jobs that were blocked by dependencies on the completed job. If any are now eligible, process the next one.

### Step 5 — Report

```
Processed: [job title]
Type: [type]
Result: completed | failed
Duration: Ns
Next in queue: [next job title] or "queue empty"
```

## Creating Jobs Programmatically

Other skills create jobs by writing `.md` files to `07-neuro-link-task/`:
- `neuro-scan` creates remediation tasks (repair, curate, ingest)
- `wiki-curate` creates ontology generation tasks
- `crawl-ingest` creates curate tasks (when auto_curate is off)
- Users create tasks by dropping `.md` files into the directory

## Job Naming Convention

`<priority>-<type>-<short-description>.md`
Example: `1-repair-broken-nautilus-ingest.md`, `3-curate-market-microstructure.md`
