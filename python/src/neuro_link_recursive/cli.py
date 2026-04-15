"""CLI entry point for neuro-link-recursive Python helpers."""

from __future__ import annotations

import json

import click

from .config import resolve_nlr_root


@click.group()
def main():
    """neuro-link-recursive CLI — Python helpers for the unified knowledge brain."""
    pass


@main.command()
def status():
    """Show system status."""
    from .heartbeat import check_health
    result = check_health()
    click.echo(json.dumps(result, indent=2))


@main.command()
@click.argument("url")
@click.option("--domain", default=None)
def ingest(url: str, domain: str | None):
    """Ingest a URL."""
    from .crawl import ingest_url
    result = ingest_url(url, domain=domain)
    click.echo(json.dumps(result, indent=2))


@main.command()
@click.option("--recreate", is_flag=True)
def embed(recreate: bool):
    """Embed wiki pages into Qdrant."""
    from .embed import embed_wiki
    count = embed_wiki(recreate=recreate)
    click.echo(f"Embedded {count} pages")


@main.command()
@click.argument("query")
@click.option("--limit", default=5)
def search(query: str, limit: int):
    """Semantic search across wiki."""
    from .embed import search_wiki
    results = search_wiki(query, limit=limit)
    click.echo(json.dumps(results, indent=2))


@main.command()
@click.option("--session", is_flag=True)
@click.option("--wiki", is_flag=True)
def grade(session: bool, wiki: bool):
    """Run grading pipeline."""
    from .grade import grade_session, grade_wiki
    root = resolve_nlr_root()
    if session:
        click.echo(json.dumps(grade_session(root), indent=2))
    if wiki:
        click.echo(json.dumps(grade_wiki(root), indent=2))


# --- Phase 3 subcommand groups ---

from .ngrok_bridge import ngrok_main
from .temporal_graph import graph_main
from .kdense_bridge import kdense_main
from .cloud_dispatch import cloud_main
from .workflow_state import workflow_main

main.add_command(ngrok_main)
main.add_command(graph_main)
main.add_command(kdense_main)
main.add_command(cloud_main)
main.add_command(workflow_main)
