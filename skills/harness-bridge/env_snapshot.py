#!/usr/bin/env python3
"""Capture a runtime-environment snapshot for harness-bridge dispatches.

Port of meta-harness `_gather_env_snapshot` (arxiv:2603.28052, ~97 LOC)
adapted for the neuro-link-recursive runtime. Emits a compact JSON blob that
can be embedded in outbound harness dispatches so the receiving agent starts
with enough context to reproduce local state without having to probe it.

Sections (all best-effort; missing data -> null, never raises):
  - neuro_link.version         — cargo package version
  - neuro_link.heartbeat       — state/heartbeat.json contents (last_check, etc.)
  - mcp_servers                — output of `claude mcp list --scope user`
  - wiki_index_mtime           — most recent .md mtime under 02-KB-main/
  - docker_ps                  — `docker ps --format {{.Names}}\t{{.Status}}`
  - ngrok                      — first https tunnel URL from localhost:4040 (if reachable)
  - processes                  — pgrep for neuro-link, llama-server, ollama, qdrant, neo4j
  - git_head                   — short SHA of the runtime source repo HEAD
  - timestamp                  — UTC ISO8601

Usage:
  python3 env_snapshot.py                # stdout JSON
  python3 env_snapshot.py --root /path   # override runtime root (default: $NLR_ROOT or cwd)
  python3 env_snapshot.py --dest out.json

Called by hooks/harness-bridge-check.sh before dispatch. Output is passed as
the `env_snapshot` field in the outbound envelope.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


def _run(cmd: list[str], timeout: float = 3.0) -> str | None:
    try:
        out = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
        return out.stdout.strip() if out.returncode == 0 else None
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None


def _read_json(path: Path) -> object | None:
    try:
        with path.open() as fh:
            return json.load(fh)
    except Exception:
        return None


def _wiki_index_mtime(root: Path) -> str | None:
    kb = root / "02-KB-main"
    if not kb.is_dir():
        return None
    latest = 0.0
    for p in kb.rglob("*.md"):
        try:
            latest = max(latest, p.stat().st_mtime)
        except OSError:
            continue
    if latest == 0.0:
        return None
    return datetime.fromtimestamp(latest, tz=timezone.utc).isoformat()


def _docker_ps() -> list[str]:
    out = _run(["docker", "ps", "--format", "{{.Names}}\t{{.Status}}"])
    if not out:
        return []
    return [line for line in out.splitlines() if line]


def _ngrok_tunnel() -> str | None:
    try:
        with urllib.request.urlopen(
            "http://localhost:4040/api/tunnels", timeout=1.0
        ) as resp:
            data = json.loads(resp.read().decode())
    except Exception:
        return None
    for t in data.get("tunnels", []):
        url = t.get("public_url", "")
        if url.startswith("https://"):
            return url
    return None


def _running_processes() -> dict[str, bool]:
    names = ["neuro-link", "llama-server", "ollama", "qdrant", "neo4j"]
    out: dict[str, bool] = {}
    for n in names:
        out[n] = _run(["pgrep", "-f", n]) is not None
    return out


def _neuro_link_version() -> str | None:
    # Prefer the binary's own --version (authoritative) over Cargo.toml
    # so packaged rollouts are accurate.
    return _run(["neuro-link", "--version"])


def _git_head(root: Path) -> str | None:
    return _run(["git", "-C", str(root), "rev-parse", "--short", "HEAD"])


def _mcp_servers() -> list[str]:
    out = _run(["claude", "mcp", "list", "--scope", "user"], timeout=5.0)
    if not out:
        return []
    return [line for line in out.splitlines() if line and not line.startswith("#")]


def capture(root: Path) -> dict:
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "root": str(root),
        "neuro_link": {
            "version": _neuro_link_version(),
            "heartbeat": _read_json(root / "state" / "heartbeat.json"),
            "git_head": _git_head(root),
        },
        "wiki_index_mtime": _wiki_index_mtime(root),
        "docker_ps": _docker_ps(),
        "ngrok_tunnel": _ngrok_tunnel(),
        "processes": _running_processes(),
        "mcp_servers": _mcp_servers(),
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--root",
        default=os.environ.get("NLR_ROOT") or os.getcwd(),
        help="runtime root (default: $NLR_ROOT or cwd)",
    )
    parser.add_argument("--dest", help="write JSON here instead of stdout")
    parser.add_argument(
        "--pretty", action="store_true", help="pretty-print output"
    )
    args = parser.parse_args(argv)

    started = time.monotonic()
    snap = capture(Path(args.root).resolve())
    snap["capture_ms"] = int((time.monotonic() - started) * 1000)

    text = json.dumps(snap, indent=2 if args.pretty else None, sort_keys=True)
    if args.dest:
        Path(args.dest).write_text(text + "\n")
    else:
        sys.stdout.write(text + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
