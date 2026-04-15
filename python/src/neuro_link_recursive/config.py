"""Read neuro-link-recursive config files (YAML frontmatter in markdown)."""

from __future__ import annotations

import os
from pathlib import Path

import frontmatter


def resolve_nlr_root() -> Path:
    """Resolve NLR_ROOT: env var > persisted file > cwd heuristic."""
    if env := os.environ.get("NLR_ROOT"):
        return Path(env)
    root_file = Path.home() / ".claude" / "state" / "nlr_root"
    if root_file.exists():
        return Path(root_file.read_text().strip())
    cwd = Path.cwd()
    if (cwd / "CLAUDE.md").exists() and (cwd / "02-KB-main").is_dir():
        return cwd
    raise FileNotFoundError(
        "Cannot resolve NLR_ROOT. Set the NLR_ROOT env var or run scripts/init.sh."
    )


def read_config(name: str, root: Path | None = None) -> dict:
    """Read a config file's YAML frontmatter. Returns the frontmatter dict."""
    root = root or resolve_nlr_root()
    path = root / "config" / name
    if not path.suffix:
        path = path.with_suffix(".md")
    post = frontmatter.load(str(path))
    return dict(post.metadata)


def read_master_config(root: Path | None = None) -> dict:
    """Read config/neuro-link.md frontmatter."""
    return read_config("neuro-link", root)
