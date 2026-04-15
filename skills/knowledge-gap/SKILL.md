---
name: knowledge-gap
description: >
  Runs InfraNodus generate_content_gaps across the full 03-ontology-main/ corpus. Identifies topics
  with sparse connections, cluster boundary gaps, and underrepresented domains. Auto-generates task
  files in 07-neuro-link-task/ for research and ingestion. Use when the user says /knowledge-gap,
  "find gaps", "what don't we know", "content gap analysis", or triggered by hyper-sleep gap_analysis
  schedule.
metadata:
  openclaw:
    icon: "magnifying_glass_tilted_left"
    requires:
      bins: [python3]
      mcps: [infranodus]
---

# /knowledge-gap

Deep content gap analysis across the full ontology corpus.

## Subcommands

| Command | Action |
|---------|--------|
| `/knowledge-gap full` | Full analysis across all ontologies |
| `/knowledge-gap domain <name>` | Gap analysis for a specific domain |
| `/knowledge-gap compare <d1> <d2>` | Find gaps between two domains |
| `/knowledge-gap status` | Show gap tracking state |

Default (no subcommand): run full analysis.

## When to Use

- User says `/knowledge-gap` or "find gaps" / "what don't we know" / "content gap analysis"
- Triggered by `hyper-sleep` gap_analysis schedule
- After a large batch of ingestion/curation to find remaining holes
- When planning research priorities

## When NOT to Use

- For scanning task queue and wiki health — use neuro-scan
- For fixing known issues — use neuro-surgery
- For ingesting a specific source — use crawl-ingest
- For generating a single ontology — use reasoning-ontology

## Procedure

### Step 1 — Load ontology corpus

1. Glob `03-ontology-main/**/*.md` — collect all ontology files
2. Parse each file for wikilink triples: `[[entity1]] relation [[entity2]]`
3. Build a unified entity graph in memory:
   - Nodes: all unique `[[entity]]` references
   - Edges: all relation triples with their codes
   - Metadata: source ontology file, domain, last updated
4. Read `config/neuro-link.md` for gap analysis thresholds

### Step 2 — InfraNodus gap analysis (primary method)

If InfraNodus MCP is available:

1. For each ontology graph registered in InfraNodus:
   a. Run `generate_content_gaps` — returns topics between clusters with sparse connections
   b. Run `generate_topical_clusters` — returns cluster membership and boundary nodes
   c. Run `generate_research_questions` — returns questions that would bridge gaps

2. For the full merged corpus (if a combined graph exists):
   a. Run `generate_content_gaps` on the combined graph
   b. These are the **cross-domain gaps** — topics that would connect two separate knowledge areas

3. Classify each gap:

| Gap Type | Description | Priority |
|----------|-------------|----------|
| `structural` | Missing connection between major clusters | 1 |
| `boundary` | Sparse coverage at cluster boundary | 2 |
| `depth` | Topic exists but has too few triples/details | 3 |
| `orphan` | Entity with no outgoing connections | 3 |
| `cross_domain` | Two domains should be connected but aren't | 2 |

### Step 3 — Fallback gap analysis (no InfraNodus)

If InfraNodus is unavailable:

1. For each wiki page in `02-KB-main/`:
   a. Count `open_questions[]` from frontmatter
   b. Count outgoing `[[wikilinks]]` — pages with <3 links are isolated
   c. Check `confidence` — low-confidence pages indicate gaps
2. For each domain directory in `02-KB-main/`:
   a. Count pages per domain
   b. Identify domains with <3 pages (sparse coverage)
3. Cross-reference `01-sorted/` against `02-KB-main/`:
   a. Find sorted raw material that has no corresponding wiki page
   b. These are ingested-but-not-curated gaps

### Step 4 — Score and rank gaps

For each identified gap:

```json
{
  "gap_id": "gap-20260415-001",
  "type": "structural | boundary | depth | orphan | cross_domain",
  "description": "Missing connection between market microstructure and order routing optimization",
  "entities_involved": ["[[market microstructure]]", "[[order routing]]"],
  "source_ontology": "03-ontology-main/trading/market-structure.md",
  "priority": 1,
  "suggested_action": "ingest | curate | research",
  "suggested_sources": ["search: market microstructure order routing latency", "arxiv:2401.xxxxx"],
  "research_questions": ["How does order routing latency affect market microstructure metrics?"],
  "cluster_a": "Market Structure",
  "cluster_b": "Execution Infrastructure"
}
```

Score each gap:
```
gap_score = (type_weight * 0.4) + (connectivity_impact * 0.3) + (domain_importance * 0.2) + (staleness * 0.1)
```

Where:
- `type_weight`: structural=1.0, boundary/cross_domain=0.8, depth=0.5, orphan=0.3
- `connectivity_impact`: how many other entities would benefit from this gap being filled
- `domain_importance`: based on page count and user activity in the domain
- `staleness`: how long the gap has existed without being addressed

### Step 5 — Generate gap report

```
knowledge-gap report — [timestamp]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ontologies analyzed: N
Entities in graph: E
Relations: R
Clusters: C

GAPS FOUND: G total
  Structural:    S (priority 1)
  Boundary:      B (priority 2)
  Cross-domain:  X (priority 2)
  Depth:         D (priority 3)
  Orphan:        O (priority 3)

TOP 5 GAPS BY SCORE
  1. [gap description] — score: 0.92 — action: [suggested]
  2. [gap description] — score: 0.87 — action: [suggested]
  ...

DOMAIN COVERAGE
  | Domain | Pages | Ontologies | Gaps | Coverage |
  |--------|-------|-----------|------|----------|
  | trading | 45 | 8 | 3 | 92% |
  | ml | 30 | 5 | 7 | 78% |
  ...

RESEARCH QUESTIONS GENERATED: Q
```

### Step 6 — Create task files

For each gap with score > threshold (default 0.5):

1. Create `07-neuro-link-task/<priority>-<type>-<short-desc>.md`:
   ```yaml
   ---
   type: ingest | curate
   status: pending
   priority: 1-3
   created: 2026-04-15
   depends_on: []
   assigned_harness: claude-code
   source: knowledge-gap
   gap_id: gap-20260415-001
   ---
   # [Gap description]

   ## Context
   [Why this gap matters — which clusters it connects]

   ## Suggested Sources
   - [list of search queries, URLs, paper IDs]

   ## Research Questions
   - [InfraNodus-generated questions]

   ## Expected Outcome
   - New wiki page(s) in 02-KB-main/
   - Updated ontology in 03-ontology-main/
   - [N] new entity connections
   ```

2. Avoid creating duplicate tasks — check existing tasks in `07-neuro-link-task/` for matching `gap_id`

### Step 7 — Update gap tracking state

Write to `state/gap_tracking.json`:
```json
{
  "last_analysis": "2026-04-15T10:00:00Z",
  "total_gaps": G,
  "gaps_by_type": {"structural": S, "boundary": B, ...},
  "gaps_addressed_since_last": A,
  "gap_trend": "improving | stable | growing",
  "tasks_created_this_run": T
}
```

### Step 8 — Log to score history

Append to `state/score_history.jsonl`:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "skill": "knowledge-gap",
  "gaps_found": G,
  "tasks_created": T,
  "coverage_score": 0.85
}
```
