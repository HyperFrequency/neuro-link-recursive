"""Ngrok API router bridge — wraps the Rust MCP server with HTTP/SSE via pyngrok."""

from __future__ import annotations

import json
import subprocess
import sys
import threading
from pathlib import Path

import click
from flask import Flask, Response, jsonify, request

from .config import read_config, resolve_nlr_root


def _find_mcp_binary() -> Path:
    root = resolve_nlr_root()
    candidates = [
        root / "server" / "target" / "release" / "neuro-link-mcp",
        root / "server" / "target" / "debug" / "neuro-link-mcp",
    ]
    for c in candidates:
        if c.exists():
            return c
    raise FileNotFoundError(
        "MCP binary not found. Run `cargo build --release` in server/"
    )


class McpBridge:
    """Manages a subprocess running the Rust MCP server on stdin/stdout."""

    def __init__(self):
        binary = _find_mcp_binary()
        self.proc = subprocess.Popen(
            [str(binary)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={"NLR_ROOT": str(resolve_nlr_root())},
        )
        self._lock = threading.Lock()
        self._id_counter = 0
        # Send initialize handshake
        self._send({"jsonrpc": "2.0", "id": 0, "method": "initialize", "params": {}})

    def _send(self, payload: dict) -> dict:
        with self._lock:
            line = json.dumps(payload) + "\n"
            self.proc.stdin.write(line.encode())
            self.proc.stdin.flush()
            resp_line = self.proc.stdout.readline()
            if not resp_line:
                raise RuntimeError("MCP process closed unexpectedly")
            return json.loads(resp_line)

    def call(self, method: str, params: dict | None = None) -> dict:
        self._id_counter += 1
        payload = {
            "jsonrpc": "2.0",
            "id": self._id_counter,
            "method": method,
        }
        if params is not None:
            payload["params"] = params
        return self._send(payload)

    def close(self):
        if self.proc.poll() is None:
            self.proc.terminate()
            self.proc.wait(timeout=5)


def create_app(bridge: McpBridge | None = None) -> Flask:
    app = Flask(__name__)
    app.config["bridge"] = bridge or McpBridge()

    @app.route("/mcp", methods=["POST"])
    def mcp_endpoint():
        body = request.get_json(force=True)
        method = body.get("method", "")
        params = body.get("params")
        req_id = body.get("id")
        result = app.config["bridge"].call(method, params)
        if req_id is not None:
            result["id"] = req_id
        return jsonify(result)

    @app.route("/mcp/sse", methods=["POST"])
    def mcp_sse():
        body = request.get_json(force=True)
        method = body.get("method", "")
        params = body.get("params")

        def generate():
            result = app.config["bridge"].call(method, params)
            yield f"data: {json.dumps(result)}\n\n"

        return Response(generate(), mimetype="text/event-stream")

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    return app


@click.command("ngrok")
@click.option("--port", default=8080, help="Local port to bind")
@click.option("--no-tunnel", is_flag=True, help="Run HTTP server without ngrok tunnel")
def ngrok_main(port: int, no_tunnel: bool):
    """Start the ngrok-bridged MCP HTTP server."""
    bridge = McpBridge()
    app = create_app(bridge)

    if no_tunnel:
        click.echo(f"Starting MCP HTTP bridge on http://localhost:{port}")
        app.run(host="0.0.0.0", port=port)
        return

    try:
        from pyngrok import ngrok
    except ImportError:
        click.echo("pyngrok not installed. Install with: pip install neuro-link-recursive[ngrok]")
        sys.exit(1)

    cfg = read_config("neuro-link-config")
    ngrok_cfg = cfg.get("ngrok", {})
    auth_token_env = ngrok_cfg.get("auth_token_env", "NGROK_AUTH_TOKEN")

    import os

    token = os.environ.get(auth_token_env)
    if token:
        ngrok.set_auth_token(token)

    domain = ngrok_cfg.get("domain") or None
    tunnel = ngrok.connect(port, bind_tls=True, domain=domain)
    click.echo(f"ngrok tunnel: {tunnel.public_url}")
    click.echo(f"MCP endpoint: {tunnel.public_url}/mcp")

    try:
        app.run(host="0.0.0.0", port=port)
    finally:
        ngrok.disconnect(tunnel.public_url)
        bridge.close()


def main():
    ngrok_main()
