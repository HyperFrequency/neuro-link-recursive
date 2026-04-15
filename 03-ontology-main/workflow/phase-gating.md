---
title: Phase Gating Rules
domain: system
confidence: high
last_updated: 2026-04-15
---

# Phase Gating Rules

Defines conditions that must be met before transitioning between workflow states.

## Knowledge Lifecycle Gates

### signal → impression
- Source has been SHA256-hashed and recorded in `00-raw/.hashes`
- Source metadata (URL, type, date) captured in frontmatter
- No duplicate hash found

### impression → insight
- Source classified into a domain in `01-sorted/`
- Source is readable (not corrupted, not behind a paywall)
- Domain matches an existing wiki domain OR a new domain is approved

### insight → framework
- At least one authoritative source supports the claims
- Confidence level assigned per claim
- Contradictions with existing wiki pages identified and documented

### framework → lens
- Wiki page has all required schema sections (see `02-KB-main/schema.md`)
- All inline citations `[source:slug]` resolve to entries in Sources section
- High-level ontology (30-60 triples) generated and validated

### lens → synthesis
- Ultra-detailed ontology (200-400 triples) generated
- Both ontologies persisted to InfraNodus under `neuro-link-recursive-<topic>`
- All `[[wikilinks]]` in the page resolve to existing pages or are flagged as stubs

### synthesis → index
- Page appears in `02-KB-main/index.md`
- Auto-rag keyword index updated to include this page's topics
- No unresolved contradictions (all logged in Contradictions section)
- Gap analysis run: no critical missing connections

## Task Queue Gates

### pending → running
- No blocking dependencies (`depends_on` array is empty or all deps completed)
- Priority is highest among eligible tasks
- Assigned harness is available

### running → completed
- Task output produced (wiki page, ontology, report, etc.)
- Output passes schema validation
- Log entry appended to relevant log file

### running → failed
- Error logged to `state/deviation_log.jsonl`
- Retry count incremented
- If retry count > `failure_retry_limit` (from neuro-scan.md): mark as failed, escalate to HITL

## HITL Gates

Actions requiring human approval (per `config/neuro-surgery.md`):
- Cannot proceed until user responds via terminal prompt
- Timeout: per `approval_timeout_minutes` (0 = indefinite)
- Denied actions are logged and the task is marked `needs_review`
