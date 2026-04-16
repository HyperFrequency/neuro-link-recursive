---
type: self-improvement
priority: 1
status: pending
created: 2026-04-16
metric: rag_hit_rate
regression_detected: true
current_value: 0.038461538461538464
previous_value: 0.0000
recommended_action: RAG injection below 10%. Verify auto-RAG hook is enabled and wiki index is populated; re-run `neuro-link embed`.
---
# Regression detected: rag_hit_rate

Automated worker pass at `2026-04-16T06:33:41.430351+00:00` flagged `rag_hit_rate` as **Critical**.

- Current value: `0.038461538461538464` (RAG hit rate 3.8%)
- Previous value: `0.0000`
- Severity: `Critical`

## Recommended action

RAG injection below 10%. Verify auto-RAG hook is enabled and wiki index is populated; re-run `neuro-link embed`.

## Notes

- Source: `neuro-link worker` (recursive self-improvement)
- Inputs: `nlr_llm_logs_grade` + `nlr_llm_logs_summary` (last 24h)
- Approve this proposal in `05-self-improvement-HITL/overview.md` before acting.
