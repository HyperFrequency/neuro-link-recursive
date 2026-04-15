---
name: self-improve-recursive
description: >
  Automated self-improvement for user tools in neuro-link-recursive. Scans 06-self-improvement-recursive/
  folders for improvement opportunities, executes approved changes, and tracks harness-to-harness
  communication logs. Default mode requires consortium review (K-Dense or multi-harness agreement).
  Use when the user says /self-improve-recursive, "auto-improve tools", "recursive optimization",
  or when triggered by self-improve-hitl validated proposals ready for automation.
metadata:
  openclaw:
    icon: "infinity"
    requires:
      bins: [python3]
      mcps: [infranodus]
---

# /self-improve-recursive

Automated recursive self-improvement pipeline. Executes validated improvements across tools with consortium oversight.

## When to Use

- User says `/self-improve-recursive` or "auto-improve" / "recursive optimization" / "automated improvement"
- Called after `self-improve-hitl` produces validated proposals ready for automation
- Scheduled via `/loop` or `/schedule` for continuous improvement cycles
- When a harness-bridge message requests improvement work

## When NOT to Use

- For initial analysis and proposals — use self-improve-hitl (must run first)
- For manual, one-off fixes — use neuro-surgery
- For tool documentation — use code-docs
- For general system health — use neuro-scan

## Safety Model

This skill operates under a **consortium review** model by default:

1. **Single-harness mode** (claude-code only): requires user approval for every change (same as self-improve-hitl)
2. **Multi-harness mode** (2+ harnesses active): requires agreement from at least 2 harnesses before execution
3. **Override mode**: user can pre-approve specific improvement categories in config

The consortium prevents any single agent from modifying the system without verification.

## Procedure

### Step 1 — Load improvement pipeline state

1. Read `06-self-improvement-recursive/` for:
   - `pipeline.jsonl` — execution log of all automated improvements
   - `approved-patterns/` — pre-approved improvement templates
   - `pending/` — improvements awaiting consortium review
   - `applied/` — completed improvements with before/after snapshots
   - `reverted/` — improvements that were rolled back
2. Read `config/harness-harness-comms.md` — check which harnesses are active
3. Read `state/score_history.jsonl` — current component scores

### Step 2 — Scan for improvement opportunities

Sources of improvement candidates:

1. **Validated HITL proposals**: Read `05-self-improvement-HITL/` for proposals with `status: validated`
   - These proved effective when applied manually — safe for automation
2. **Pattern matching**: Scan `state/deviation_log.jsonl` for recurring failure patterns
   - Same error >5 times in 7 days = candidate for automated fix
3. **Score regression**: Compare current week's scores against previous week
   - Any component dropping >15% = candidate for investigation
4. **Harness suggestions**: Read `06-self-improvement-recursive/pending/` for proposals from other harnesses

### Step 3 — Classify improvement type

| Type | Risk | Requires |
|------|------|----------|
| `config_tune` | low | auto-approve if in approved-patterns/ |
| `prompt_refine` | low | consortium or user approval |
| `hook_optimize` | medium | consortium or user approval |
| `skill_restructure` | high | always user approval |
| `pipeline_change` | critical | always user approval + 24h cooldown |

### Step 4 — Generate improvement plan

For each candidate:

```json
{
  "id": "ri-20260415-001",
  "type": "hook_optimize",
  "target": "hooks/auto-rag-inject.sh",
  "description": "Replace linear keyword scan with precomputed trie for 40% latency reduction",
  "source": "validated_hitl | pattern_match | score_regression | harness_suggestion",
  "before_snapshot": "sha256 of current file",
  "proposed_diff": "unified diff of changes",
  "expected_improvement": {"latency_ms": {"before": 45, "after": 27}},
  "risk_level": "medium",
  "rollback_plan": "restore from before_snapshot"
}
```

### Step 5 — Consortium review (if multi-harness)

If 2+ harnesses are active in `config/harness-harness-comms.md`:

1. Format the improvement plan as a harness-bridge message
2. Dispatch to each active harness via `harness-bridge` skill
3. Collect votes: approve / reject / modify
4. Require majority approval (>50% of active harnesses)
5. Log votes to `06-self-improvement-recursive/pipeline.jsonl`

If single-harness mode:
1. Present to user for approval (same as self-improve-hitl)

### Step 6 — Execute approved improvements

For each approved improvement:

1. Create a backup: copy target file to `06-self-improvement-recursive/applied/<id>/before/`
2. Apply the proposed diff
3. If hook: verify it still passes basic smoke test (echo test JSON | bash hook.sh)
4. If skill: verify SKILL.md YAML frontmatter parses correctly
5. If config: verify YAML frontmatter parses and values are within expected ranges
6. Update `06-self-improvement-recursive/pipeline.jsonl`:
   ```json
   {
     "id": "ri-20260415-001",
     "status": "applied",
     "applied_at": "2026-04-15T10:00:00Z",
     "applied_by": "claude-code",
     "consortium_votes": {"claude-code": "approve", "k-dense": "approve"}
   }
   ```

### Step 7 — Monitor applied improvements

For each recently applied improvement (< 7 days):
1. Read `state/score_history.jsonl` entries since application
2. Compare target component's score against baseline
3. If improved or stable: mark as `status: validated`
4. If degraded (score dropped >10% from baseline):
   a. Trigger automatic rollback
   b. Restore from `applied/<id>/before/`
   c. Mark as `status: reverted`
   d. Log revert to `06-self-improvement-recursive/reverted/<id>.json`

### Step 8 — Harness communication logging

All inter-harness messages are logged to `06-self-improvement-recursive/comms-log.jsonl`:

```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "from": "claude-code",
  "to": "k-dense-byok",
  "type": "consortium_review_request",
  "improvement_id": "ri-20260415-001",
  "payload_summary": "hook_optimize: auto-rag-inject.sh trie optimization",
  "response": "approve",
  "response_at": "2026-04-15T10:02:00Z"
}
```

### Step 9 — Generate recursive improvement report

```
self-improve-recursive report — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mode: single-harness | multi-harness (N active)

Candidates found: C
  From validated HITL: V
  From pattern matching: P
  From score regression: R
  From harness suggestions: H

Consortium reviews: N
  Approved: A
  Rejected: J
  Modified: M

Applied this cycle: X
  Validated: V
  Monitoring: M
  Reverted: R

Improvement velocity: X changes/week (was Y last week)
System composite: 0.XX (delta: +0.0Y)
```

### Step 10 — Update pipeline state

1. Write completion entry to `06-self-improvement-recursive/pipeline.jsonl`
2. Append to `state/score_history.jsonl` with cycle metrics
3. If running via `/loop`: calculate next cycle time based on improvement velocity
   - High velocity (many changes validating): shorter cycles
   - Low velocity (few or no changes): longer cycles
