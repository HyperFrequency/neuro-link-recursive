---
name: reasoning-ontology
description: >
  Generate and update InfraNodus reasoning ontologies for neuro-link-recursive. Creates dual-tier
  ontologies (high-level summary + ultra-detailed) for any domain, agent, or workflow. Ontologies use
  [[wikilinks]] syntax with 10 relation codes, persisted to InfraNodus as named graphs queryable by
  any agent in any session. Use when the user says /reasoning-ontology <domain>, "create ontology for X",
  "update the reasoning graph", or auto-triggered by wiki-curate after page synthesis.
  Extends the deep-tool-wiki dual ontology pattern to arbitrary topics.
metadata:
  openclaw:
    icon: "brain"
    requires:
      bins: [python3]
      mcps: [infranodus]
---

# /reasoning-ontology

Generate/update InfraNodus reasoning ontologies for domains, agents, and workflows.

## When to Use

- User says `/reasoning-ontology <domain>` or "create ontology for X" / "update reasoning graph"
- Auto-triggered by wiki-curate after synthesizing a substantial page (>500 words)
- Called by job-scanner for `type: ontology` tasks

## When NOT to Use

- For quick topic lookup — use deep-tool-wiki or auto-rag
- For text network analysis of a URL — use infranodus-cli directly
- For one-off entity extraction — use ontology-creator directly

## Ontology Types

### Domain Ontology
Covers a knowledge domain (e.g., "market-microstructure", "reinforcement-learning").
Source: wiki pages in `02-KB-main/<domain>/`

### Agent Ontology
Covers an agent's reasoning patterns and capabilities.
Source: `04-KB-agents-workflows/<agent>.md` + session logs

### Workflow Ontology
Covers a workflow's states, transitions, and gating rules.
Source: `03-ontology-main/workflow/` + workflow definition files

## Procedure

### Step 1 — Gather source material

Based on ontology type:
- **Domain**: Read all wiki pages in `02-KB-main/` for the specified domain
- **Agent**: Read the agent's knowledge page + recent session logs
- **Workflow**: Read workflow definitions + state definitions

### Step 2 — Generate high-level summary ontology (30-60 triples)

Using the `ontology_llm` from config (default: claude-opus-4-6):

Generate a concise ontology covering ONLY major concepts and their primary relationships.
Follow the ontology-creator format:

```
[[concept1]] primary relationship [[concept2]] [relationCode]
```

**Relation codes** (from ontology-creator skill):
- `[isA]` — class membership
- `[partOf]` — component relationship
- `[hasAttribute]` — properties and characteristics
- `[causedBy]` — causal relationship
- `[relatedTo]` — general association
- `[interactsWith]` — bidirectional interaction
- `[requires]` — dependency
- `[produces]` — output relationship
- `[enables]` — facilitation
- `[contradicts]` — opposing or conflicting

**Rules:**
- Each statement MUST have at least 2 entities in `[[wikilinks]]`
- Each statement MUST have a `[relationCode]`
- Generate network structures, NOT trees (avoid single-hub patterns)
- Minimum 8 paragraphs per relationship type
- Cover the widest possible domain first

### Step 3 — Generate ultra-detailed ontology (200-400 triples)

Same format but covering EVERYTHING in the source material:
- Every entity, concept, method, tool, parameter, metric
- All causal chains and dependency paths
- Cross-domain connections
- Temporal relationships (X happens before Y)
- Confidence qualifiers (X is believed to cause Y [causedBy])

### Step 4 — Persist to InfraNodus

Using InfraNodus MCP (`mcporter`):
1. Graph name: `neuro-link-recursive-<type>-<name>` (e.g., `neuro-link-recursive-domain-market-microstructure`)
2. Upload high-level ontology as the primary graph
3. Upload ultra-detailed ontology as a secondary graph (or append to same graph)
4. Run `generate_topical_clusters` to validate graph structure
5. Run `generate_content_gaps` to identify missing connections

### Step 5 — Save to filesystem

Write both ontologies to `03-ontology-main/`:
- `03-ontology-main/<type>/<name>/summary.md` — high-level (30-60 triples)
- `03-ontology-main/<type>/<name>/detailed.md` — ultra-detailed (200-400 triples)
- `03-ontology-main/<type>/<name>/metadata.yaml`:
  ```yaml
  name: ontology-name
  type: domain | agent | workflow
  source_pages: [list of wiki pages used]
  infranodus_graph: neuro-link-recursive-<type>-<name>
  triple_count_summary: N
  triple_count_detailed: M
  cluster_count: K
  gaps_found: G
  generated_at: timestamp
  generated_by: ontology_llm model name
  ```

### Step 6 — Gap analysis

If InfraNodus returned content gaps:
1. Log gaps to `05-insights-gaps/ontology/`
2. For significant gaps: create task files in `07-neuro-link-task/` to research and fill them
3. Update `05-insights-gaps/gaps-recommended-actions.md`

### Step 7 — Report

```
Reasoning ontology generated: <name>
Type: <domain|agent|workflow>
Summary: N triples
Detailed: M triples
Clusters: K
Gaps found: G
InfraNodus graph: neuro-link-recursive-<type>-<name>
Filesystem: 03-ontology-main/<type>/<name>/
```
