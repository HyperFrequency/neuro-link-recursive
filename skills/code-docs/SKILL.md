---
name: code-docs
description: >
  Extends the deep-tool-wiki pattern to any codebase. Registers repos from config/main-codebase-tools.md,
  queries Context7 + Auggie for semantic understanding, generates deepwiki-style documentation in
  08-code-docs/. Tracks fork divergence from config/forked-repos-with-changes.md. Use when the user
  says /code-docs, "document this repo", "generate code docs", "update fork docs", "what changed
  upstream", or when neuro-scan detects new repos or upstream releases.
metadata:
  openclaw:
    icon: "file_folder"
    requires:
      bins: [python3, gh]
      mcps: [infranodus, turbovault]
---

# /code-docs

Deepwiki-style code documentation generator. Works for registered repos and HyperFrequency forks.

## Subcommands

| Command | Action |
|---------|--------|
| `/code-docs index <repo-path>` | Generate docs for a repo |
| `/code-docs update <repo-path>` | Re-index changed files only |
| `/code-docs fork-diff <fork>` | Compute fork divergence from upstream |
| `/code-docs list` | Show all registered repos and their status |
| `/code-docs search <query>` | Search across all generated code docs |

Default (no subcommand): show `list`.

## When to Use

- User says `/code-docs` or "document this repo" / "generate code docs" / "update fork docs"
- Called by `neuro-scan` when new repos are added to `config/main-codebase-tools.md`
- Called by `hyper-sleep` when upstream releases are detected
- When working in a registered codebase and needing architectural understanding

## When NOT to Use

- For looking up a specific HF-forked tool in the combined deepwiki — use deep-tool-wiki
- For library API docs only — use docs-dual-lookup (Context7 + Auggie)
- For wiki pages about concepts — use wiki-curate
- For code changes or implementation — use the codebase directly

## Procedure

### Step 1 — Load registry

1. Read `config/main-codebase-tools.md` — registered codebases (own repos)
2. Read `config/forked-repos-with-changes.md` — HyperFrequency forks
3. Read `config/adjacent-tools-code-docs.md` — upstream tools used but not forked
4. Determine target based on subcommand argument or process all pending repos

### Step 2 — Gather code intelligence (for `index` or `update`)

For the target repo, run in parallel:

**Context7 query:**
1. Look up the upstream library name from config
2. Query Context7 for API signatures, code examples, architecture docs
3. Extract: module structure, public API surface, configuration options

**Auggie query:**
1. Submit repo path to Auggie for semantic analysis
2. Extract: code patterns, architectural decisions, dependency relationships, hot paths

**Local analysis:**
1. Read directory structure (top 3 levels)
2. Identify entry points: `main.py`, `__init__.py`, `setup.py`, `Cargo.toml`, `package.json`
3. Read README if present
4. Count files by language, estimate codebase size
5. Identify test directories and configuration files

### Step 3 — Generate documentation structure

Create `08-code-docs/<repo-category>/<repo-name>/`:

```
08-code-docs/
  my-repos/
    alpha-factory/
      index.md          # overview + architecture
      modules/          # per-module docs
      api/              # public API reference
      config/           # configuration docs
      decisions/        # architectural decisions
  my-forks/
    nautilus-trader/
      index.md
      fork-changes.md   # HF-specific modifications
      upstream-diff.md  # divergence tracking
      modules/
  upstream-tools/
    vectorbt-pro/
      index.md
      api/
```

### Step 4 — Generate index page

Write `08-code-docs/<category>/<repo>/index.md`:

```yaml
---
repo: repo-name
category: my-repos | my-forks | upstream-tools
upstream: owner/repo (if fork)
last_indexed: 2026-04-15
files_indexed: 234
languages: [python, rust]
context7_available: true
auggie_available: true
---
# [Repo Name]

## Overview
[3-5 sentences: what it does, how it's used in the HyperFrequency ecosystem, key architectural pattern]

## Architecture
[Conceptual model with [[wikilinks]] to related entities]

## Module Map
| Module | Purpose | Key Classes/Functions | Lines |
|--------|---------|----------------------|-------|

## Dependencies
[Key external and internal dependencies]

## Configuration
[How to configure, key env vars, config files]

## Entry Points
[How to run, key commands, main scripts]
```

### Step 5 — Generate module docs

For each significant module (>100 lines or contains public API):

1. Read the module source code
2. Cross-reference with Context7 API docs and Auggie analysis
3. Write `modules/<module-name>.md`:
   - Purpose and responsibility
   - Public API surface (functions, classes, types)
   - Internal architecture (key data flows)
   - Usage examples (from Context7 or inline extraction)
   - Wikilinks to related modules and wiki pages

### Step 6 — Fork divergence analysis (for `fork-diff`)

For HyperFrequency forks:

1. Read `config/forked-repos-with-changes.md` for upstream info
2. Fetch upstream HEAD: `gh api repos/<upstream>/commits?per_page=1`
3. Compute diff summary: `git diff <upstream-ref>..HEAD --stat`
4. Categorize changes:
   - **Added files**: new modules, scripts, configs unique to fork
   - **Modified files**: behavioral changes to upstream code
   - **Deleted files**: upstream features removed
   - **Config changes**: different defaults, new config options
5. Write `08-code-docs/my-forks/<repo>/fork-changes.md`:

```yaml
---
fork: HyperFrequency/repo-name
upstream: owner/repo
upstream_latest: v2.1.0 (2026-04-10)
divergence_files: 45
divergence_insertions: 1200
divergence_deletions: 300
last_diff: 2026-04-15
---
# Fork Changes: [repo-name]

## Summary
[2-3 sentences: what the fork changes and why]

## Added (HF-only)
| File/Module | Purpose |
|-------------|---------|

## Modified
| File | Change Summary | Reason |
|------|---------------|--------|

## Upstream Changes Not Yet Merged
| Upstream Commit | Description | Impact |
|----------------|-------------|--------|
```

### Step 7 — Generate ontology entries

For repos with substantial docs (>5 modules documented):
1. Extract entity-relationship triples from the architecture
2. Write to `03-ontology-main/code/<repo-name>.md` in wikilink triple format
3. Connect to existing ontologies via shared entities

### Step 8 — Update indexes

1. Regenerate `08-code-docs/index.md` with all documented repos:
   ```
   | Repo | Category | Last Indexed | Modules | Fork Divergence |
   ```
2. Update `config/main-codebase-tools.md` Status and Last Indexed columns
3. Update `config/forked-repos-with-changes.md` Divergence and Last Diff columns

### Step 9 — Log and score

Append to `state/score_history.jsonl`:
```json
{
  "timestamp": "2026-04-15T10:00:00Z",
  "skill": "code-docs",
  "repos_indexed": 1,
  "modules_documented": 12,
  "fork_divergence_files": 45
}
```

Append to `02-KB-main/log.md`:
```
## [timestamp] Code docs: indexed [repo-name]
- Modules: N
- Category: my-repos | my-forks | upstream-tools
- Context7: available | unavailable
- Auggie: available | unavailable
```
