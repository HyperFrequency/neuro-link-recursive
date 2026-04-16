---
name: crawl-ingest
description: >
  Ingest raw sources into neuro-link-recursive. Accepts: web URLs (via Firecrawl), git repo URLs (shallow clone docs),
  local file paths, Obsidian note paths (via TurboVault), YouTube URLs (transcript extraction), and PDFs (via markitdown).
  Classifies sources by domain, deposits in 00-raw/ with SHA256 dedup, sorts to 01-sorted/, and optionally
  auto-triggers wiki-curate. Use when the user says /crawl-ingest <source>, "ingest this", "add this to the brain",
  "crawl this URL", or auto-triggered by job-scanner for type=ingest tasks.
metadata:
  openclaw:
    icon: "inbox"
    requires:
      bins: [python3]
      mcps: [firecrawl, turbovault]
---

# /crawl-ingest

Source ingestion pipeline: detect → extract → dedup → classify → sort → optionally curate.

## When to Use

- User says `/crawl-ingest <source>` or "ingest X" / "add X to the brain" / "crawl this"
- Job-scanner processes a `type: ingest` task
- Auto-triggered from Table 2/3/4 in `config/crawl-ingest-update.md`

## When NOT to Use

- To synthesize material that's already ingested — use wiki-curate
- To update an existing wiki page — use wiki-curate
- For real-time web searches — use parallel-web or perplexity-search

## Accepted Source Types

| Input | Detection | Extraction Strategy |
|-------|-----------|-------------------|
| `https://...` (web URL) | URL pattern | Firecrawl MCP: scrape + extract markdown |
| `github.com/...` or `gh:org/repo` | GitHub URL pattern | Shallow clone → extract README + docs/ + examples/ |
| `/path/to/file.pdf` | Local path + .pdf extension | markitdown conversion |
| `/path/to/file.md` | Local path + .md extension | Direct copy |
| `obsidian://...` or `vault:<note>` | Obsidian URI | TurboVault MCP read |
| `https://youtube.com/...` | YouTube URL | Firecrawl transcript extraction |
| `https://arxiv.org/abs/...` | arXiv URL | Firecrawl + PDF extraction |

## Procedure

### Step 1 — Detect source type

Parse the input to determine source type. Use the detection rules above.

### Step 2 — Extract content

Based on source type, extract content to markdown:

**Web URL:**
```
Use Firecrawl MCP: firecrawl_scrape_url with the URL
Extract: title, content (markdown), metadata
```

**Git Repo:**
```bash
git clone --depth 1 --filter=blob:none <url> /tmp/neuro-link-ingest-<slug>
# Extract: README.md, docs/**/*.md, examples/**/*.py
# Concatenate into a single markdown file with section headers
```

**PDF:**
```
Use markitdown skill to convert PDF → markdown
```

**Local file:**
```
Copy file to 00-raw/<slug>/
```

**Obsidian note:**
```
Use TurboVault MCP: read_note with the note path
```

**YouTube:**
```
Use Firecrawl MCP or yt-dlp to extract transcript
Format as markdown with timestamps
```

### Step 3 — SHA256 dedup

1. Compute SHA256 hash of extracted content
2. Check against `00-raw/.hashes` (one hash per line: `<hash> <slug>`)
3. If hash exists: skip ingestion, report "already ingested as <slug>"
4. If new: append hash to `.hashes`

### Step 4 — Write to 00-raw/

Create `00-raw/<slug>/` directory with:
- `source.md` — the extracted markdown content
- `metadata.yaml` — source metadata:
  ```yaml
  url: original URL
  type: web | git | pdf | local | obsidian | youtube
  extracted_at: timestamp
  sha256: hash
  title: extracted title
  word_count: N
  ```

### Step 5 — Classify

Apply `classification_rules` from `config/crawl-ingest-update.md`:
1. Check URL/path against each rule pattern in order
2. First match determines domain
3. If no match: use `default_domain` (docs)

### Step 6 — Sort to 01-sorted/

Copy `00-raw/<slug>/source.md` to `01-sorted/<domain>/<slug>.md` with frontmatter:
```yaml
---
title: extracted title
domain: classified domain
source_slug: slug
ingested: timestamp
status: sorted
---
```

### Step 7 — LLM-assisted source discovery (if enabled)

If `llm_assisted_source_discovery: true` in config:
1. Analyze the ingested content for references to other sources
2. Extract URLs, paper DOIs, repo references
3. For each discovered source: add a row to Table 2 in `config/crawl-ingest-update.md` with `Status: pending`

### Step 8 — Auto-curate (if enabled)

If `auto_curate: true` in `config/neuro-link.md`:
1. Determine a topic name from the source title/content
2. Invoke wiki-curate skill with that topic
3. This synthesizes the raw material into a wiki page

### Step 9 — Report

Output:
```
Ingested: <title>
Source: <url/path>
Type: <type>
Domain: <domain>
Hash: <sha256>
Deposited: 00-raw/<slug>/
Sorted: 01-sorted/<domain>/<slug>.md
Auto-curate: triggered/skipped
Discovered sources: N new URLs added to crawl queue
```
