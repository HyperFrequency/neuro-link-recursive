---
# type: dispatches to the reasoning-ontology skill (or generates one inline via /api/v1/ontology).
#   Valid: ingest | curate | scan | repair | report | ontology | research
type: ontology

# status: pending → job-scanner will pick this up next time it scans.
status: pending

# priority: 4 — ontologies are usually background enrichment, not blocking work.
priority: 4

# created: ISO date — older jobs of equal priority run first.
created: 2026-04-17

# depends_on: typically wait for the wiki page to exist before generating its ontology.
# Example: depends_on: ["curate-rust-channels.md"]
depends_on: []

# assigned_harness: claude-code is the default; specify k-dense or forgecode if Phase 3 multi-harness is configured.
assigned_harness: claude-code
---
# Ontology example: dual-tier ontology for "rust-channels"

Topic: rust-channels
Source page: 02-KB-main/swe/rust-channels.md
Tier: both    # summary | detailed | both
Persist to InfraNodus: yes

The job-scanner dispatches `type: ontology` to the `reasoning-ontology` skill. Body conventions:

- `Topic:` short slug. Becomes the InfraNodus graph name.
- `Source page:` path under `02-KB-main/` — text source for entity extraction.
- `Tier:` `summary` (high-level, 10-30 nodes), `detailed` (ultra-detailed, 100+ nodes), or `both`.
- `Persist to InfraNodus:` `yes` uploads the ontology as a named graph; `no` writes only to `03-ontology-main/`.

Output lands in `03-ontology-main/<topic>.summary.md` and/or `03-ontology-main/<topic>.detailed.md` using the standard `[[wikilink]]` syntax with the 10 relation codes documented in the reasoning-ontology skill.
