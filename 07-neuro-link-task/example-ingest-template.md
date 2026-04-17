---
# type: dispatches the job to a skill — see /Users/DanBot/Desktop/HyperFrequency/neuro-link/skills/job-scanner/SKILL.md
#   Valid: ingest | curate | scan | repair | report | ontology | research
type: ingest

# status: pending → eligible. Set to running before work starts; completed/failed when done.
status: pending

# priority: 1 (highest) — 5 (lowest). job-scanner takes pending jobs in priority order.
priority: 3

# created: ISO date — used for tie-breaking same-priority jobs (oldest first).
created: 2026-04-17

# depends_on: list of OTHER task filenames (not paths). Job is skipped until all deps are completed.
# Example: depends_on: ["1-bootstrap-domain.md"]
depends_on: []

# assigned_harness: which Claude harness should claim it. Leave as claude-code unless multi-harness routing is configured.
assigned_harness: claude-code
---
# Ingest example: Karpathy's nanoGPT README

Source: https://github.com/karpathy/nanoGPT
Target domain: ml
Auto-curate: yes

The job-scanner dispatches `type: ingest` to the `crawl-ingest` skill. Body conventions:

- `Source:` URL, file path, or Obsidian note path. crawl-ingest auto-detects type (web / git / pdf / youtube / vault note).
- `Target domain:` hint for downstream classification (e.g., ml, swe, trading, infrastructure). The classifier may override.
- `Auto-curate:` `yes` chains a `wiki-curate` job after successful ingest. `no` just lands the source in `00-raw/`.

After completion, the file's frontmatter is rewritten with `status: completed` and a `completed_at:` timestamp.
