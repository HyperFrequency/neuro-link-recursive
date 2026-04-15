---
title: Goal Hierarchy
domain: system
confidence: medium
last_updated: 2026-04-15
---

# Goal Hierarchy

Defines the goal structure that drives neuro-link-recursive behavior. Goals cascade from strategic to tactical to operational.

## Strategic Goals (User-Defined)

These are set by the user and drive all downstream activity:

1. **Build comprehensive domain knowledge** — curate a persistent, cross-referenced wiki that compounds over time
2. **Automate knowledge maintenance** — the system should self-maintain without constant user intervention
3. **Bridge agent harnesses** — enable work to flow between Claude Code, K-Dense, ForgeCode seamlessly
4. **Improve agent performance** — log, grade, and improve agent behavior through HITL + recursive feedback
5. **Surface what we don't know** — gap analysis and contradiction detection are first-class features

## Tactical Goals (System-Derived)

Derived from strategic goals, these drive skill behavior:

| Goal | Measures | Driven By | Skills |
|------|----------|-----------|--------|
| Keep wiki current | staleness score, pages updated/week | Goal 1+2 | wiki-curate, neuro-scan |
| Fill knowledge gaps | gaps found vs gaps filled ratio | Goal 5 | neuro-scan, knowledge-gap |
| Resolve contradictions | contested pages count | Goal 1+5 | wiki-curate, neuro-surgery |
| Maintain ontology coherence | broken links, orphan nodes | Goal 1 | reasoning-ontology, neuro-scan |
| Ingest new sources | sources/week, domains covered | Goal 1 | crawl-ingest |
| Process task queue | pending tasks, avg completion time | Goal 2 | job-scanner |
| Grade agent performance | score trends, deviation count | Goal 4 | self-improve-hitl (Phase 2) |

## Operational Goals (Per-Invocation)

Each skill invocation has a specific operational goal:

- `/crawl-ingest <url>` → ingest this source with dedup, classify, optionally curate
- `/wiki-curate <topic>` → synthesize a wiki page following the schema
- `/neuro-scan` → identify actionable findings across all scan targets
- `/reasoning-ontology <domain>` → generate/update domain ontology
- `/job-scanner` → process highest-priority pending task

## Goal Monitoring

`state/score_history.jsonl` tracks goal metrics over time. Format:
```json
{"timestamp": "2026-04-15T10:00:00Z", "metric": "wiki_staleness", "value": 0.15, "target": 0.10}
```

`06-progress-reports/` synthesizes these metrics into human-readable reports.
