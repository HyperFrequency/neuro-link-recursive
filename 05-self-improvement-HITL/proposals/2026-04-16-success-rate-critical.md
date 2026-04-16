---
type: self-improvement
priority: 1
status: pending
created: 2026-04-16
metric: success_rate
regression_detected: true
current_value: 0
previous_value: 0.0000
recommended_action: Error rate above 10%. Inspect recent failing LLM calls, check provider health, and verify API keys and rate limits.
---
# Regression detected: success_rate

Automated worker pass at `2026-04-16T06:33:41.430351+00:00` flagged `success_rate` as **Critical**.

- Current value: `0` (error rate 100.00%)
- Previous value: `0.0000`
- Severity: `Critical`

## Recommended action

Error rate above 10%. Inspect recent failing LLM calls, check provider health, and verify API keys and rate limits.

## Notes

- Source: `neuro-link worker` (recursive self-improvement)
- Inputs: `nlr_llm_logs_grade` + `nlr_llm_logs_summary` (last 24h)
- Approve this proposal in `05-self-improvement-HITL/overview.md` before acting.
