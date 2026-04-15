---
name: progress-report
description: >
  Synthesizes state/session_log.jsonl, state/score_history.jsonl, and the wiki mutation log into
  daily, weekly, and monthly reports in 06-progress-reports/. Includes metrics: pages created,
  gaps filled, tasks completed, grading trends, harness activity, and improvement velocity.
  Use when the user says /progress-report, "give me a report", "what happened this week",
  "monthly summary", or triggered by /schedule for automatic periodic reports.
metadata:
  openclaw:
    icon: "bar_chart"
    requires:
      bins: [python3]
---

# /progress-report

Synthesizes system activity into structured reports with metrics and trends.

## Subcommands

| Command | Action |
|---------|--------|
| `/progress-report daily` | Report for last 24 hours |
| `/progress-report weekly` | Report for last 7 days |
| `/progress-report monthly` | Report for last 30 days |
| `/progress-report custom <start> <end>` | Report for custom date range |
| `/progress-report trend <metric>` | Show trend chart for a specific metric |

Default (no subcommand): generates the most appropriate period based on last report date.

## When to Use

- User says `/progress-report` or "give me a report" / "what happened this week" / "monthly summary"
- Triggered by `/schedule` for automatic periodic reports
- After a major batch operation to review results
- Called by neuro-link orchestrator

## When NOT to Use

- For real-time system status — use `/neuro-link status`
- For scanning issues — use neuro-scan
- For improvement analysis — use self-improve-hitl

## Procedure

### Step 1 — Determine report period

1. Parse subcommand for period (daily/weekly/monthly/custom)
2. If no subcommand: read `06-progress-reports/` for latest report date, generate for the gap period
3. Calculate `start_ts` and `end_ts` for the reporting window

### Step 2 — Gather data sources

Read and filter by date range:

1. `state/session_log.jsonl` — tool usage events
2. `state/score_history.jsonl` — component scores and improvement metrics
3. `state/deviation_log.jsonl` — failures and resolutions
4. `02-KB-main/log.md` — wiki creation and update events
5. `07-neuro-link-task/` — task completions and failures (from frontmatter dates)
6. `05-self-improvement-HITL/` — improvement proposals and their outcomes
7. `06-self-improvement-recursive/pipeline.jsonl` — automated improvement activity

### Step 3 — Compute wiki metrics

From `02-KB-main/log.md` and wiki page frontmatter:

```json
{
  "pages_created": 12,
  "pages_updated": 8,
  "pages_total": 156,
  "domains_active": ["trading", "ml", "infrastructure"],
  "avg_confidence": 0.82,
  "open_questions_total": 34,
  "open_questions_resolved": 7,
  "contradictions_found": 3,
  "contradictions_resolved": 1,
  "wikilinks_added": 45,
  "sources_ingested": 18
}
```

### Step 4 — Compute task metrics

From `07-neuro-link-task/` frontmatter:

```json
{
  "tasks_created": 25,
  "tasks_completed": 19,
  "tasks_failed": 3,
  "tasks_pending": 8,
  "avg_completion_time_hours": 2.3,
  "by_type": {
    "ingest": 10,
    "curate": 8,
    "repair": 4,
    "ontology": 3
  },
  "by_priority": {
    "1": 5,
    "2": 12,
    "3": 8
  }
}
```

### Step 5 — Compute tool usage metrics

From `state/session_log.jsonl`:

```json
{
  "total_tool_calls": 450,
  "unique_tools": 28,
  "top_tools": [
    {"tool": "Read", "count": 120},
    {"tool": "Bash", "count": 95},
    {"tool": "Edit", "count": 78}
  ],
  "skill_invocations": {
    "wiki-curate": 12,
    "crawl-ingest": 8,
    "neuro-scan": 5
  },
  "error_rate": 0.03,
  "sessions": 14
}
```

### Step 6 — Compute grading trends

From `state/score_history.jsonl`:

```json
{
  "system_composite": 0.78,
  "system_composite_prev": 0.74,
  "trend": "improving",
  "by_skill": {
    "wiki-curate": {"score": 0.85, "prev": 0.80, "trend": "improving"},
    "crawl-ingest": {"score": 0.72, "prev": 0.75, "trend": "declining"},
    "neuro-scan": {"score": 0.91, "prev": 0.90, "trend": "stable"}
  },
  "improvements_applied": 3,
  "improvements_validated": 2,
  "improvements_reverted": 0
}
```

### Step 7 — Compute deviation metrics

From `state/deviation_log.jsonl`:

```json
{
  "deviations_total": 15,
  "deviations_resolved": 11,
  "deviations_pending": 4,
  "mean_resolution_hours": 4.2,
  "by_category": {
    "failed_ingest": 5,
    "stale_page": 4,
    "hook_failure": 3,
    "skill_error": 2,
    "broken_ontology": 1
  },
  "escalated_to_hitl": 3
}
```

### Step 8 — Generate report

Write to `06-progress-reports/<period>-<date>.md`:

```markdown
---
period: daily | weekly | monthly
start: 2026-04-08
end: 2026-04-15
generated: 2026-04-15T10:00:00Z
---
# Progress Report: [Period] [Date Range]

## Summary

[2-3 sentence executive summary: what happened, key wins, key issues]

## Knowledge Base

| Metric | Value | Delta |
|--------|-------|-------|
| Total wiki pages | 156 | +12 |
| Pages created | 12 | — |
| Pages updated | 8 | — |
| Average confidence | 0.82 | +0.03 |
| Open questions | 34 | -7 |
| Sources ingested | 18 | — |

## Task Queue

| Metric | Value |
|--------|-------|
| Created | 25 |
| Completed | 19 (76%) |
| Failed | 3 (12%) |
| Pending | 8 |
| Avg completion time | 2.3h |

### By Type
[breakdown table]

## Tool Usage

| Tool | Calls | Error Rate |
|------|-------|-----------|
[top 10 tools]

## System Health

| Component | Score | Trend |
|-----------|-------|-------|
[by-skill breakdown]

System composite: **0.78** (was 0.74, improving)

## Deviations

| Category | Count | Resolved |
|----------|-------|----------|
[by-category breakdown]

Mean resolution time: 4.2 hours

## Self-Improvement

- Proposals generated: P
- Applied: A
- Validated: V
- Reverted: R

## Recommendations

[Auto-generated list of suggested actions based on data:
- Skills with declining scores
- Unresolved high-priority deviations
- Domains with many open questions
- High-frequency failure patterns]
```

### Step 9 — Display to user

Print the report to the terminal. If `weekly` or `monthly`: also highlight the most significant changes with brief commentary.

### Step 10 — Update state

1. Log report generation to `state/session_log.jsonl`
2. Append report metadata to `state/score_history.jsonl`:
   ```json
   {
     "timestamp": "2026-04-15T10:00:00Z",
     "skill": "progress-report",
     "period": "weekly",
     "system_composite": 0.78,
     "pages_total": 156,
     "tasks_completion_rate": 0.76
   }
   ```
