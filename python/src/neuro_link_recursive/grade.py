"""Grading pipeline: score tool invocations and agent performance."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import click

from .config import resolve_nlr_root


def append_score(
    root: Path,
    metric: str,
    value: float,
    target: float | None = None,
    context: str = "",
):
    """Append a score entry to state/score_history.jsonl."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metric": metric,
        "value": value,
    }
    if target is not None:
        entry["target"] = target
    if context:
        entry["context"] = context
    log_path = root / "state" / "score_history.jsonl"
    with open(log_path, "a") as f:
        f.write(json.dumps(entry) + "\n")


def grade_session(root: Path | None = None) -> dict:
    """Analyze session_log.jsonl and produce aggregate grades."""
    root = root or resolve_nlr_root()
    log_path = root / "state" / "session_log.jsonl"
    if not log_path.exists():
        return {"error": "No session log found"}

    entries = []
    for line in log_path.read_text().splitlines():
        if line.strip():
            entries.append(json.loads(line))

    total = len(entries)
    successes = sum(1 for e in entries if e.get("success", False))
    tools_used = {}
    for e in entries:
        tool = e.get("tool", "unknown")
        tools_used[tool] = tools_used.get(tool, 0) + 1

    success_rate = successes / total if total > 0 else 0.0
    grades = {
        "total_invocations": total,
        "success_rate": round(success_rate, 3),
        "tools_distribution": dict(sorted(tools_used.items(), key=lambda x: -x[1])),
        "graded_at": datetime.now(timezone.utc).isoformat(),
    }

    append_score(root, "session_success_rate", success_rate, target=0.95)
    return grades


def grade_wiki(root: Path | None = None) -> dict:
    """Grade wiki health: staleness, gaps, contradictions."""
    root = root or resolve_nlr_root()
    kb = root / "02-KB-main"
    skip = {"schema.md", "index.md", "log.md"}

    import frontmatter

    total_pages = 0
    stale = 0
    with_questions = 0
    with_contradictions = 0

    for md_file in kb.rglob("*.md"):
        if md_file.name in skip:
            continue
        total_pages += 1
        post = frontmatter.load(str(md_file))
        oq = post.get("open_questions", [])
        if oq:
            with_questions += 1
        if "contested" in str(post.get("confidence", "")):
            with_contradictions += 1

    grades = {
        "total_pages": total_pages,
        "pages_with_open_questions": with_questions,
        "pages_with_contradictions": with_contradictions,
        "graded_at": datetime.now(timezone.utc).isoformat(),
    }
    return grades


@click.command()
@click.option("--session", is_flag=True, help="Grade session log")
@click.option("--wiki", is_flag=True, help="Grade wiki health")
def main(session: bool, wiki: bool):
    """Run grading pipeline."""
    root = resolve_nlr_root()
    if session:
        click.echo(json.dumps(grade_session(root), indent=2))
    if wiki:
        click.echo(json.dumps(grade_wiki(root), indent=2))
    if not session and not wiki:
        click.echo("Specify --session and/or --wiki")
