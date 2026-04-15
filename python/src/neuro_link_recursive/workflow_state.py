"""LangGraph-style state machine for multi-step workflows."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

import click

from .config import resolve_nlr_root

# States from 03-ontology-main/workflow/state-definitions.md
KNOWLEDGE_STATES = ["signal", "impression", "insight", "framework", "lens", "synthesis", "index"]
TASK_STATES = ["pending", "running", "completed", "failed", "blocked", "needs_review"]
AGENT_STATES = ["idle", "researching", "synthesizing", "scanning", "ingesting", "repairing", "reviewing"]

ALL_BUILTIN_STATES = set(KNOWLEDGE_STATES + TASK_STATES + AGENT_STATES)


def _workflows_path() -> Path:
    root = resolve_nlr_root()
    p = root / "state" / "workflows.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def _load_workflows() -> dict:
    path = _workflows_path()
    if path.exists():
        return json.loads(path.read_text())
    return {}


def _save_workflows(data: dict):
    path = _workflows_path()
    path.write_text(json.dumps(data, indent=2))


def create_workflow(name: str, states: list[str] | None = None) -> dict:
    """Create a new workflow with the given states (defaults to knowledge lifecycle)."""
    workflows = _load_workflows()
    wf_id = str(uuid.uuid4())[:8]
    state_list = states or KNOWLEDGE_STATES
    now = datetime.now(timezone.utc).isoformat()
    wf = {
        "id": wf_id,
        "name": name,
        "states": state_list,
        "current_state": state_list[0],
        "history": [{"state": state_list[0], "timestamp": now}],
        "created_at": now,
        "updated_at": now,
    }
    workflows[wf_id] = wf
    _save_workflows(workflows)
    return wf


def transition(workflow_id: str, to_state: str) -> dict:
    """Transition a workflow to a new state. Validates adjacency."""
    workflows = _load_workflows()
    wf = workflows.get(workflow_id)
    if wf is None:
        raise KeyError(f"Workflow {workflow_id} not found")

    states = wf["states"]
    current = wf["current_state"]
    current_idx = states.index(current) if current in states else -1
    target_idx = states.index(to_state) if to_state in states else -1

    if target_idx == -1:
        raise ValueError(f"State '{to_state}' not in workflow states: {states}")

    # Allow forward transitions only (or same state re-entry)
    if target_idx < current_idx:
        raise ValueError(
            f"Cannot transition backward from '{current}' to '{to_state}'. "
            f"State order: {states}"
        )

    now = datetime.now(timezone.utc).isoformat()
    wf["current_state"] = to_state
    wf["history"].append({"state": to_state, "timestamp": now})
    wf["updated_at"] = now
    workflows[workflow_id] = wf
    _save_workflows(workflows)
    return wf


def get_current_state(workflow_id: str) -> dict:
    """Get the current state and metadata for a workflow."""
    workflows = _load_workflows()
    wf = workflows.get(workflow_id)
    if wf is None:
        raise KeyError(f"Workflow {workflow_id} not found")
    return {
        "id": wf["id"],
        "name": wf["name"],
        "current_state": wf["current_state"],
        "updated_at": wf["updated_at"],
    }


def check_gate(workflow_id: str, target_state: str) -> dict:
    """Check whether a workflow can transition to the target state."""
    workflows = _load_workflows()
    wf = workflows.get(workflow_id)
    if wf is None:
        raise KeyError(f"Workflow {workflow_id} not found")

    states = wf["states"]
    current = wf["current_state"]
    current_idx = states.index(current) if current in states else -1
    target_idx = states.index(target_state) if target_state in states else -1

    if target_idx == -1:
        return {"allowed": False, "reason": f"State '{target_state}' not in workflow states"}
    if target_idx < current_idx:
        return {"allowed": False, "reason": f"Backward transition from '{current}' to '{target_state}'"}
    if target_idx == current_idx:
        return {"allowed": True, "reason": "Re-entry to current state"}
    if target_idx == current_idx + 1:
        return {"allowed": True, "reason": "Next sequential state"}
    return {"allowed": True, "reason": f"Forward skip from '{current}' to '{target_state}'"}


def list_workflows() -> list[dict]:
    """List all tracked workflows."""
    workflows = _load_workflows()
    return [
        {"id": wf["id"], "name": wf["name"], "current_state": wf["current_state"], "updated_at": wf["updated_at"]}
        for wf in workflows.values()
    ]


# --- CLI ---

@click.group("workflow")
def workflow_main():
    """Workflow state machine commands."""
    pass


@workflow_main.command("create")
@click.argument("name")
@click.option("--states", default=None, help="Comma-separated state names (default: knowledge lifecycle)")
def cli_create(name: str, states: str | None):
    """Create a new workflow."""
    state_list = states.split(",") if states else None
    result = create_workflow(name, state_list)
    click.echo(json.dumps(result, indent=2))


@workflow_main.command("transition")
@click.argument("workflow_id")
@click.argument("to_state")
def cli_transition(workflow_id: str, to_state: str):
    """Transition a workflow to a new state."""
    result = transition(workflow_id, to_state)
    click.echo(json.dumps(result, indent=2))


@workflow_main.command("state")
@click.argument("workflow_id")
def cli_state(workflow_id: str):
    """Get current state of a workflow."""
    result = get_current_state(workflow_id)
    click.echo(json.dumps(result, indent=2))


@workflow_main.command("gate")
@click.argument("workflow_id")
@click.argument("target_state")
def cli_gate(workflow_id: str, target_state: str):
    """Check if a transition is allowed."""
    result = check_gate(workflow_id, target_state)
    click.echo(json.dumps(result, indent=2))


@workflow_main.command("list")
def cli_list():
    """List all workflows."""
    results = list_workflows()
    click.echo(json.dumps(results, indent=2))


def main():
    workflow_main()
