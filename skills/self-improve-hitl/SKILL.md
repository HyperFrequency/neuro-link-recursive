---
name: self-improve-hitl
description: >
  Human-in-the-loop self-improvement for neuro-link-recursive. Reads grading data from
  state/score_history.jsonl, identifies lowest-scoring patterns in skills, hooks, prompts, and code,
  proposes modifications with before/after metrics, and writes proposals to 05-self-improvement-HITL/.
  Always requires human approval. Use when the user says /self-improve-hitl, "how can the system
  improve", "what's underperforming", "optimize skills", or when triggered by neuro-scan detecting
  persistent low scores.
metadata:
  openclaw:
    icon: "chart_with_upwards_trend"
    requires:
      bins: [python3]
---

# /self-improve-hitl

Analyzes system performance and proposes improvements. Every change requires human approval.

## When to Use

- User says `/self-improve-hitl` or "how can the system improve" / "what's underperforming" / "optimize skills"
- Called when neuro-scan detects persistent low scores (>3 consecutive below threshold)
- After a major batch operation to review effectiveness
- Periodically (weekly) as part of maintenance cycle

## When NOT to Use

- For automated improvement execution — use self-improve-recursive (Phase 2 automated pipeline)
- For fixing a specific known failure — use neuro-surgery
- For general system health — use neuro-scan or hyper-sleep

## Procedure

### Step 1 — Load scoring data

1. Read `state/score_history.jsonl` — all entries from last 30 days
2. Read `state/session_log.jsonl` — tool usage patterns from last 30 days
3. Read `state/deviation_log.jsonl` — failure patterns from last 30 days
4. Read `config/neuro-link.md` for `improvement_threshold` (default: 0.7)

### Step 2 — Compute performance metrics per component

For each skill:
```json
{
  "skill": "wiki-curate",
  "invocations": 45,
  "success_rate": 0.91,
  "avg_score": 0.78,
  "trend": "declining",
  "common_failures": ["source parse error", "staleness propagation missed"],
  "avg_duration_s": 12.3
}
```

For each hook:
```json
{
  "hook": "auto-rag-inject.sh",
  "fires": 320,
  "hit_rate": 0.42,
  "avg_latency_ms": 23,
  "timeout_count": 0,
  "error_count": 2
}
```

### Step 3 — Identify improvement targets

Rank all components by a composite score:
```
composite = (success_rate * 0.4) + (avg_score * 0.3) + (trend_factor * 0.2) + (usage_weight * 0.1)
```

Where:
- `trend_factor`: 1.0 = improving, 0.5 = stable, 0.0 = declining
- `usage_weight`: higher for frequently-used components (improvement has more impact)

Flag components where `composite < improvement_threshold`.

### Step 4 — Analyze failure patterns

For each flagged component:
1. Read the SKILL.md or hook script source
2. Read deviation_log entries related to this component
3. Identify repeating failure modes:
   - Same error message appearing >3 times
   - Same step in procedure consistently failing
   - Timeouts or performance degradation over time
4. Cross-reference with session_log for context (what was the user doing when it failed?)

### Step 5 — Generate improvement proposals

For each flagged component, write a proposal to `05-self-improvement-HITL/`:

Filename: `proposal-<component>-<date>.md`

```yaml
---
target: skill | hook | config | prompt
component: component-name
created: 2026-04-15
status: proposed
composite_score: 0.52
improvement_type: fix | optimize | restructure | retune
estimated_impact: high | medium | low
---
# Improvement Proposal: [component-name]

## Current Performance
- Success rate: X%
- Average score: Y
- Trend: declining/stable
- Top failure modes: [list]

## Root Cause Analysis
[Analysis of why this component is underperforming]

## Proposed Changes

### Before
[Current code/config/prompt snippet]

### After
[Proposed modification]

## Expected Impact
- Success rate: X% -> Z% (estimated)
- Failure mode [X] eliminated
- [Other benefits]

## Risk Assessment
- Reversible: yes/no
- Side effects: [list]
- Testing plan: [how to validate]
```

### Step 6 — Present proposals

Display a summary table to the user:

```
self-improve-hitl proposals — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
| # | Component | Type | Score | Impact | Risk |
|---|-----------|------|-------|--------|------|
| 1 | wiki-curate | fix | 0.52 | high | low |
| 2 | auto-rag-inject.sh | optimize | 0.61 | medium | low |
```

For each proposal, show the before/after diff and ask for approval.

### Step 7 — Apply approved proposals

For each approved proposal:
1. Read the current file (skill, hook, or config)
2. Apply the proposed changes
3. Update the proposal file: `status: applied`, add `applied_at` timestamp
4. Update `state/score_history.jsonl` with a baseline marker for comparison

For each rejected proposal:
1. Update the proposal file: `status: rejected`, add user's reason
2. Do not re-propose the same change for 14 days

### Step 8 — Track improvement over time

After applying changes, create a monitoring entry:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "component": "wiki-curate",
  "proposal_id": "proposal-wiki-curate-20260415",
  "baseline_score": 0.52,
  "target_score": 0.75,
  "check_after_days": 7
}
```

On subsequent invocations, check if applied proposals met their targets:
- If improved: mark proposal as `status: validated`
- If not improved: mark as `status: ineffective`, consider reverting

### Step 9 — Generate improvement report

```
self-improve-hitl report — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Components analyzed: N
Below threshold: M
Proposals generated: P
Proposals approved: A
Proposals rejected: R

Previously applied proposals:
  Validated (improved): V
  Ineffective (no change): I
  Reverted: X

System composite score: 0.XX (was 0.YY last month)
```

### Step 10 — Log to score history

Append to `state/score_history.jsonl`:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "skill": "self-improve-hitl",
  "components_analyzed": N,
  "proposals_generated": P,
  "system_composite": 0.XX
}
```
