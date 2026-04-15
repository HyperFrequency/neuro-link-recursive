"""Web crawling and ingestion pipeline using Firecrawl."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import click
import yaml
from firecrawl import FirecrawlApp

from .config import resolve_nlr_root


def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


def _check_dedup(root: Path, sha: str) -> str | None:
    """Return existing slug if hash already ingested, else None."""
    hashes_file = root / "00-raw" / ".hashes"
    if not hashes_file.exists():
        return None
    for line in hashes_file.read_text().splitlines():
        parts = line.strip().split(" ", 1)
        if len(parts) == 2 and parts[0] == sha:
            return parts[1]
    return None


def _record_hash(root: Path, sha: str, slug: str):
    hashes_file = root / "00-raw" / ".hashes"
    with open(hashes_file, "a") as f:
        f.write(f"{sha} {slug}\n")


def _slugify(text: str) -> str:
    return text.lower().strip().replace(" ", "-").replace("/", "-")[:80]


def ingest_url(
    url: str,
    root: Path | None = None,
    api_key: str | None = None,
    domain: str | None = None,
) -> dict:
    """Ingest a URL via Firecrawl. Returns metadata dict."""
    root = root or resolve_nlr_root()

    app = FirecrawlApp(api_key=api_key) if api_key else FirecrawlApp()
    result = app.scrape_url(url, params={"formats": ["markdown"]})

    content = result.get("markdown", "")
    title = result.get("metadata", {}).get("title", url.split("/")[-1])
    slug = _slugify(title)
    sha = _sha256(content)

    existing = _check_dedup(root, sha)
    if existing:
        return {"status": "duplicate", "slug": existing, "sha256": sha}

    # Write to 00-raw/
    raw_dir = root / "00-raw" / slug
    raw_dir.mkdir(parents=True, exist_ok=True)
    (raw_dir / "source.md").write_text(content)

    meta = {
        "url": url,
        "type": "web",
        "extracted_at": datetime.now(timezone.utc).isoformat(),
        "sha256": sha,
        "title": title,
        "word_count": len(content.split()),
    }
    (raw_dir / "metadata.yaml").write_text(yaml.dump(meta))
    _record_hash(root, sha, slug)

    # Classify and sort
    domain = domain or _classify(url, root)
    sorted_dir = root / "01-sorted" / domain
    sorted_dir.mkdir(parents=True, exist_ok=True)

    frontmatter_block = yaml.dump(
        {"title": title, "domain": domain, "source_slug": slug,
         "ingested": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "status": "sorted"}
    )
    sorted_content = f"---\n{frontmatter_block}---\n\n{content}"
    (sorted_dir / f"{slug}.md").write_text(sorted_content)

    return {"status": "ingested", "slug": slug, "sha256": sha, "domain": domain, "title": title}


def _classify(url: str, root: Path) -> str:
    """Classify URL into a domain based on config rules."""
    rules = [
        ("arxiv.org", "arxiv"),
        ("medium.com", "medium"),
        ("huggingface.co", "huggingface"),
        ("github.com", "github"),
        (".pdf", "docs"),
        ("youtube.com", "docs"),
        ("youtu.be", "docs"),
    ]
    url_lower = url.lower()
    for pattern, domain in rules:
        if pattern in url_lower:
            return domain
    return "docs"


@click.command()
@click.argument("url")
@click.option("--domain", default=None, help="Override auto-classification")
@click.option("--api-key", envvar="FIRECRAWL_API_KEY", default=None)
def main(url: str, domain: str | None, api_key: str | None):
    """Ingest a URL into neuro-link-recursive."""
    result = ingest_url(url, api_key=api_key, domain=domain)
    click.echo(json.dumps(result, indent=2))
