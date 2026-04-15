---
title: Workflow State Definitions
domain: system
confidence: high
last_updated: 2026-04-15
---

# Workflow State Definitions

Defines the lifecycle states for neuro-link-recursive workflows. Agents and skills reference these states to determine what actions are valid.

## Knowledge Lifecycle States

Based on the Cornelius Brain Dependency Graph 7-layer model, adapted for neuro-link-recursive:

| State | Description | Entry Condition | Exit Condition |
|-------|-------------|----------------|----------------|
| **signal** | Raw ingested material in 00-raw/ | Source added via crawl-ingest | Classified to 01-sorted/ |
| **impression** | Classified and sorted material | Placed in 01-sorted/<domain>/ | Selected for curation |
| **insight** | Individual facts/claims extracted | Wiki-curate begins synthesis | Integrated into wiki page |
| **framework** | Structured wiki page with citations | Wiki page created in 02-KB-main/ | Ontology generated |
| **lens** | Reasoning ontology generated | InfraNodus ontology persisted | Cross-referenced with other ontologies |
| **synthesis** | Cross-linked, contradiction-aware | All wikilinks resolved, contradictions logged | Gap analysis complete |
| **index** | Fully integrated into knowledge base | Appears in index.md, searchable via auto-rag | Staleness detected |

## Task Queue States

| State | Description |
|-------|-------------|
| `pending` | Job file created, awaiting processing |
| `running` | Job-scanner has picked up the task |
| `completed` | Task finished successfully |
| `failed` | Task failed; logged to deviation_log.jsonl |
| `blocked` | Depends on another task that hasn't completed |
| `needs_review` | Completed but flagged for human review |

## Agent Workflow States

| State | Description | Applicable To |
|-------|-------------|--------------|
| `idle` | No active task | All agents |
| `researching` | Gathering information, reading sources | Research agents |
| `synthesizing` | Creating wiki pages, ontologies | Wiki-curate, reasoning-ontology |
| `scanning` | Running neuro-scan checks | Neuro-scan |
| `ingesting` | Crawling and classifying sources | Crawl-ingest |
| `repairing` | Fixing failures from deviation log | Neuro-surgery |
| `reviewing` | Waiting for HITL approval | Any agent with HITL task |

## Phase Gating

See `phase-gating.md` for rules about what conditions must be met before transitioning between states.
