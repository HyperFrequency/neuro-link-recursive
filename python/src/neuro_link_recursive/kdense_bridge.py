"""K-Dense bridge — HTTP client for K-Dense BYOK localhost API."""

from __future__ import annotations

import json
import os

import click
import httpx

from .config import read_config


def _get_kdense_config() -> dict:
    cfg = read_config("harness-harness-comms")
    harnesses = cfg.get("harnesses", {})
    byok = harnesses.get("k-dense-byok", {})
    return {
        "url": byok.get("url", "http://localhost:8000"),
        "api_key": os.environ.get(byok.get("api_key_env", "KDENSE_API_KEY"), ""),
        "capabilities": byok.get("capabilities", []),
    }


def _client(cfg: dict) -> httpx.Client:
    headers = {}
    if cfg["api_key"]:
        headers["Authorization"] = f"Bearer {cfg['api_key']}"
    return httpx.Client(base_url=cfg["url"], headers=headers, timeout=120)


def dispatch_research(query: str, context_refs: list[str] | None = None) -> dict:
    """Dispatch a research query to K-Dense BYOK."""
    cfg = _get_kdense_config()
    with _client(cfg) as client:
        resp = client.post(
            "/v1/research",
            json={
                "query": query,
                "context_refs": context_refs or [],
            },
        )
        resp.raise_for_status()
        return resp.json()


def dispatch_consortium(topic: str, rounds: int = 3, agents: list[str] | None = None) -> dict:
    """Dispatch a consortium/expert-panel session to K-Dense."""
    cfg = _get_kdense_config()
    with _client(cfg) as client:
        resp = client.post(
            "/v1/consortium",
            json={
                "topic": topic,
                "rounds": rounds,
                "agents": agents or [],
            },
        )
        resp.raise_for_status()
        return resp.json()


def receive_results(task_id: str) -> dict:
    """Poll for results of a dispatched K-Dense task."""
    cfg = _get_kdense_config()
    with _client(cfg) as client:
        resp = client.get(f"/v1/tasks/{task_id}")
        resp.raise_for_status()
        return resp.json()


# --- CLI ---

@click.group("kdense")
def kdense_main():
    """K-Dense BYOK bridge commands."""
    pass


@kdense_main.command("research")
@click.argument("query")
@click.option("--ref", "refs", multiple=True, help="Context reference paths")
def cli_research(query: str, refs: tuple[str, ...]):
    """Dispatch a research query."""
    result = dispatch_research(query, list(refs) if refs else None)
    click.echo(json.dumps(result, indent=2))


@kdense_main.command("consortium")
@click.argument("topic")
@click.option("--rounds", default=3)
@click.option("--agent", "agents", multiple=True)
def cli_consortium(topic: str, rounds: int, agents: tuple[str, ...]):
    """Dispatch a consortium session."""
    result = dispatch_consortium(topic, rounds, list(agents) if agents else None)
    click.echo(json.dumps(result, indent=2))


@kdense_main.command("results")
@click.argument("task_id")
def cli_results(task_id: str):
    """Get results for a task."""
    result = receive_results(task_id)
    click.echo(json.dumps(result, indent=2))


def main():
    kdense_main()
