"""Parallel web crawling and ingestion via asyncio + Firecrawl or Parallel Chat API."""

from __future__ import annotations

import asyncio
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import click
import httpx
import yaml

from .config import resolve_nlr_root


async def _crawl_single(
    url: str,
    client: httpx.AsyncClient,
    firecrawl_key: str | None = None,
) -> dict:
    """Crawl a single URL. Returns {url, title, content, error}."""
    try:
        if firecrawl_key:
            resp = await client.post(
                "https://api.firecrawl.dev/v1/scrape",
                headers={"Authorization": f"Bearer {firecrawl_key}"},
                json={"url": url, "formats": ["markdown"]},
                timeout=60.0,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            return {
                "url": url,
                "title": data.get("metadata", {}).get("title", url.split("/")[-1]),
                "content": data.get("markdown", ""),
                "error": None,
            }
        else:
            resp = await client.get(url, timeout=30.0, follow_redirects=True)
            resp.raise_for_status()
            return {
                "url": url,
                "title": url.split("/")[-1],
                "content": resp.text[:50000],
                "error": None,
            }
    except Exception as e:
        return {"url": url, "title": "", "content": "", "error": str(e)}


def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


def _slugify(text: str) -> str:
    return text.lower().strip().replace(" ", "-").replace("/", "-")[:80]


def _classify_url(url: str) -> str:
    rules = [
        ("arxiv.org", "arxiv"), ("medium.com", "medium"),
        ("huggingface.co", "huggingface"), ("github.com", "github"),
        (".pdf", "docs"), ("youtube.com", "docs"),
    ]
    for pattern, domain in rules:
        if pattern in url.lower():
            return domain
    return "docs"


async def parallel_ingest(
    urls: list[str],
    root: Path | None = None,
    firecrawl_key: str | None = None,
    max_concurrent: int = 5,
    domain_override: str | None = None,
) -> list[dict]:
    """Crawl multiple URLs in parallel and ingest into 00-raw/."""
    root = root or resolve_nlr_root()
    hashes_file = root / "00-raw" / ".hashes"
    existing_hashes = set()
    if hashes_file.exists():
        for line in hashes_file.read_text().splitlines():
            parts = line.strip().split(" ", 1)
            if parts:
                existing_hashes.add(parts[0])

    sem = asyncio.Semaphore(max_concurrent)
    results = []

    async def _bounded_crawl(url: str, client: httpx.AsyncClient) -> dict:
        async with sem:
            return await _crawl_single(url, client, firecrawl_key)

    async with httpx.AsyncClient() as client:
        tasks = [_bounded_crawl(url, client) for url in urls]
        crawled = await asyncio.gather(*tasks)

    for item in crawled:
        if item["error"]:
            results.append({"url": item["url"], "status": "error", "error": item["error"]})
            continue

        sha = _sha256(item["content"])
        if sha in existing_hashes:
            results.append({"url": item["url"], "status": "duplicate", "sha256": sha})
            continue

        slug = _slugify(item["title"])
        raw_dir = root / "00-raw" / slug
        raw_dir.mkdir(parents=True, exist_ok=True)
        (raw_dir / "source.md").write_text(item["content"])

        meta = {
            "url": item["url"], "type": "web",
            "extracted_at": datetime.now(timezone.utc).isoformat(),
            "sha256": sha, "title": item["title"],
            "word_count": len(item["content"].split()),
        }
        (raw_dir / "metadata.yaml").write_text(yaml.dump(meta))

        with open(hashes_file, "a") as f:
            f.write(f"{sha} {slug}\n")
        existing_hashes.add(sha)

        domain = domain_override or _classify_url(item["url"])
        sorted_dir = root / "01-sorted" / domain
        sorted_dir.mkdir(parents=True, exist_ok=True)
        fm = yaml.dump({"title": item["title"], "domain": domain, "source_slug": slug,
                        "ingested": datetime.now(timezone.utc).strftime("%Y-%m-%d")})
        (sorted_dir / f"{slug}.md").write_text(f"---\n{fm}---\n\n{item['content']}")

        results.append({
            "url": item["url"], "status": "ingested",
            "slug": slug, "sha256": sha, "domain": domain,
        })

    return results


@click.command()
@click.argument("urls", nargs=-1, required=True)
@click.option("--firecrawl-key", envvar="FIRECRAWL_API_KEY", default=None)
@click.option("--max-concurrent", default=5, help="Max parallel crawls")
@click.option("--domain", default=None, help="Override auto-classification")
def main(urls: tuple[str, ...], firecrawl_key: str | None, max_concurrent: int, domain: str | None):
    """Crawl multiple URLs in parallel and ingest."""
    results = asyncio.run(parallel_ingest(
        list(urls), firecrawl_key=firecrawl_key,
        max_concurrent=max_concurrent, domain_override=domain,
    ))
    for r in results:
        status = r.get("status", "unknown")
        url = r.get("url", "")
        click.echo(f"  [{status}] {url}")
    click.echo(f"\nTotal: {len(results)} URLs processed")
