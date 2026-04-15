"""Heartbeat daemon: periodic health checks and error monitoring."""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path

import click

from .config import resolve_nlr_root


def check_health(root: Path | None = None) -> dict:
    """Run a health check and return status."""
    root = root or resolve_nlr_root()
    errors = []

    # Check critical directories
    for d in ["00-raw", "01-sorted", "02-KB-main", "07-neuro-link-task", "config", "state"]:
        if not (root / d).is_dir():
            errors.append(f"Missing directory: {d}")

    # Check critical files
    for f in ["CLAUDE.md", "02-KB-main/schema.md", "config/neuro-link.md"]:
        if not (root / f).exists():
            errors.append(f"Missing file: {f}")

    # Check state files are writable
    for sf in ["session_log.jsonl", "score_history.jsonl", "deviation_log.jsonl"]:
        state_file = root / "state" / sf
        try:
            with open(state_file, "a"):
                pass
        except OSError as e:
            errors.append(f"Cannot write to state/{sf}: {e}")

    # Check pending tasks
    task_dir = root / "07-neuro-link-task"
    pending = 0
    if task_dir.is_dir():
        for f in task_dir.glob("*.md"):
            content = f.read_text(encoding="utf-8")[:500]
            if "status: pending" in content:
                pending += 1

    status = "error" if errors else "ok"
    result = {
        "status": status,
        "last_check": datetime.now(timezone.utc).isoformat(),
        "errors": errors,
        "pending_tasks": pending,
    }

    # Write heartbeat
    hb_path = root / "state" / "heartbeat.json"
    hb_path.write_text(json.dumps(result, indent=2))
    return result


@click.command()
@click.option("--interval", default=0, help="Repeat every N seconds (0 = once)")
def main(interval: int):
    """Run heartbeat health check."""
    root = resolve_nlr_root()
    while True:
        result = check_health(root)
        click.echo(json.dumps(result, indent=2))
        if interval <= 0:
            break
        time.sleep(interval)
