"""Cloud dispatch — abstract dispatcher for Modal, Ray, Dask compute."""

from __future__ import annotations

import json
import os
import uuid

import click

from .config import read_config


def _get_provider_config(provider: str) -> dict:
    cfg = read_config("neuro-link-config")
    cloud = cfg.get("cloud_dispatch", {})
    return cloud.get(provider, {})


def submit_job(provider: str, task: dict, config: dict | None = None) -> dict:
    """Submit a compute job to the specified provider."""
    job_id = str(uuid.uuid4())
    provider_cfg = config or _get_provider_config(provider)

    if provider == "modal":
        return _submit_modal(job_id, task, provider_cfg)
    elif provider == "ray":
        return _submit_ray(job_id, task, provider_cfg)
    elif provider == "dask":
        return _submit_dask(job_id, task, provider_cfg)
    else:
        raise ValueError(f"Unknown provider: {provider}. Use modal, ray, or dask.")


def _submit_modal(job_id: str, task: dict, cfg: dict) -> dict:
    import httpx

    url = cfg.get("url", "https://api.modal.com")
    token = os.environ.get(cfg.get("token_env", "MODAL_TOKEN_ID"), "")
    secret = os.environ.get(cfg.get("secret_env", "MODAL_TOKEN_SECRET"), "")

    with httpx.Client(base_url=url, timeout=60) as client:
        resp = client.post(
            "/v1/functions/call",
            headers={"Authorization": f"Token {token}:{secret}"},
            json={"function": task.get("function", ""), "args": task.get("args", {})},
        )
        resp.raise_for_status()
        data = resp.json()
    return {"job_id": job_id, "provider": "modal", "remote_id": data.get("call_id", ""), "status": "submitted"}


def _submit_ray(job_id: str, task: dict, cfg: dict) -> dict:
    import httpx

    url = cfg.get("url", "http://localhost:8265")
    with httpx.Client(base_url=url, timeout=60) as client:
        resp = client.post(
            "/api/jobs/",
            json={
                "entrypoint": task.get("entrypoint", "python job.py"),
                "runtime_env": task.get("runtime_env", {}),
                "metadata": {"nlr_job_id": job_id},
            },
        )
        resp.raise_for_status()
        data = resp.json()
    return {"job_id": job_id, "provider": "ray", "remote_id": data.get("job_id", ""), "status": "submitted"}


def _submit_dask(job_id: str, task: dict, cfg: dict) -> dict:
    import httpx

    url = cfg.get("url", "http://localhost:8786")
    with httpx.Client(base_url=url, timeout=60) as client:
        resp = client.post(
            "/api/v1/submit",
            json={
                "function": task.get("function", ""),
                "args": task.get("args", []),
                "kwargs": task.get("kwargs", {}),
            },
        )
        resp.raise_for_status()
        data = resp.json()
    return {"job_id": job_id, "provider": "dask", "remote_id": data.get("key", ""), "status": "submitted"}


def check_status(job_id: str, provider: str | None = None) -> dict:
    """Check status of a submitted job. Provider auto-detected if not given."""
    if provider == "ray" or provider is None:
        return _check_ray(job_id)
    elif provider == "modal":
        return _check_modal(job_id)
    elif provider == "dask":
        return _check_dask(job_id)
    return {"job_id": job_id, "status": "unknown", "error": f"Unknown provider: {provider}"}


def _check_ray(job_id: str) -> dict:
    import httpx

    cfg = _get_provider_config("ray")
    url = cfg.get("url", "http://localhost:8265")
    with httpx.Client(base_url=url, timeout=30) as client:
        resp = client.get(f"/api/jobs/{job_id}")
        resp.raise_for_status()
        return resp.json()


def _check_modal(job_id: str) -> dict:
    import httpx

    cfg = _get_provider_config("modal")
    url = cfg.get("url", "https://api.modal.com")
    token = os.environ.get(cfg.get("token_env", "MODAL_TOKEN_ID"), "")
    secret = os.environ.get(cfg.get("secret_env", "MODAL_TOKEN_SECRET"), "")
    with httpx.Client(base_url=url, timeout=30) as client:
        resp = client.get(
            f"/v1/functions/call/{job_id}",
            headers={"Authorization": f"Token {token}:{secret}"},
        )
        resp.raise_for_status()
        return resp.json()


def _check_dask(job_id: str) -> dict:
    import httpx

    cfg = _get_provider_config("dask")
    url = cfg.get("url", "http://localhost:8786")
    with httpx.Client(base_url=url, timeout=30) as client:
        resp = client.get(f"/api/v1/status/{job_id}")
        resp.raise_for_status()
        return resp.json()


def get_results(job_id: str, provider: str | None = None) -> dict:
    """Get results of a completed job."""
    status = check_status(job_id, provider)
    if status.get("status") not in ("completed", "SUCCEEDED", "finished"):
        return {"job_id": job_id, "status": status.get("status", "unknown"), "results": None}
    return status


# --- CLI ---

@click.group("cloud")
def cloud_main():
    """Cloud compute dispatch (Modal / Ray / Dask)."""
    pass


@cloud_main.command("submit")
@click.argument("provider", type=click.Choice(["modal", "ray", "dask"]))
@click.option("--task-json", required=True, help="JSON string describing the task")
def cli_submit(provider: str, task_json: str):
    """Submit a job to a cloud provider."""
    task = json.loads(task_json)
    result = submit_job(provider, task)
    click.echo(json.dumps(result, indent=2))


@cloud_main.command("status")
@click.argument("job_id")
@click.option("--provider", type=click.Choice(["modal", "ray", "dask"]), default=None)
def cli_status(job_id: str, provider: str | None):
    """Check job status."""
    result = check_status(job_id, provider)
    click.echo(json.dumps(result, indent=2))


@cloud_main.command("results")
@click.argument("job_id")
@click.option("--provider", type=click.Choice(["modal", "ray", "dask"]), default=None)
def cli_results(job_id: str, provider: str | None):
    """Get job results."""
    result = get_results(job_id, provider)
    click.echo(json.dumps(result, indent=2))


def main():
    cloud_main()
