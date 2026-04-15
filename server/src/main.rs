mod config;
mod protocol;
mod state;
mod tools;

use anyhow::Result;
use serde_json::Value;
use std::io::{self, BufRead, Write};
use tracing::{error, info};

use protocol::{JsonRpcRequest, JsonRpcResponse};
use tools::ToolRegistry;

fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("neuro_link_mcp=info")
        .with_writer(io::stderr)
        .init();

    let nlr_root = config::resolve_nlr_root()?;
    info!("NLR_ROOT: {}", nlr_root.display());

    let registry = ToolRegistry::new(nlr_root);
    let stdin = io::stdin();
    let mut stdout = io::stdout();

    for line in stdin.lock().lines() {
        let line = match line {
            Ok(l) => l,
            Err(e) => {
                error!("stdin read error: {e}");
                break;
            }
        };

        if line.trim().is_empty() {
            continue;
        }

        let request: JsonRpcRequest = match serde_json::from_str(&line) {
            Ok(r) => r,
            Err(e) => {
                let err_resp = JsonRpcResponse::error(
                    Some(Value::Null),
                    -32700,
                    format!("Parse error: {e}"),
                );
                let _ = writeln!(stdout, "{}", serde_json::to_string(&err_resp)?);
                let _ = stdout.flush();
                continue;
            }
        };

        // Handle notifications (no response needed)
        if request.method == "notifications/initialized" {
            info!("Client initialized");
            continue;
        }

        let id = request.id.clone();

        let response = match request.method.as_str() {
            "initialize" => handle_initialize(id),
            "tools/list" => handle_tools_list(id, &registry),
            "tools/call" => handle_tools_call(id, &request, &registry),
            _ => JsonRpcResponse::error(
                id,
                -32601,
                format!("Method not found: {}", request.method),
            ),
        };

        writeln!(stdout, "{}", serde_json::to_string(&response)?)?;
        stdout.flush()?;
    }

    Ok(())
}

fn handle_initialize(id: Option<Value>) -> JsonRpcResponse {
    JsonRpcResponse::success(
        id,
        serde_json::json!({
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": "neuro-link-recursive",
                "version": env!("CARGO_PKG_VERSION")
            }
        }),
    )
}

fn handle_tools_list(id: Option<Value>, registry: &ToolRegistry) -> JsonRpcResponse {
    let tools = registry.list_tools();
    JsonRpcResponse::success(id, serde_json::json!({ "tools": tools }))
}

fn handle_tools_call(
    id: Option<Value>,
    req: &JsonRpcRequest,
    registry: &ToolRegistry,
) -> JsonRpcResponse {
    let params = req.params.as_ref();

    let tool_name = params
        .and_then(|p| p.get("name"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let arguments = params
        .and_then(|p| p.get("arguments"))
        .cloned()
        .unwrap_or(Value::Object(Default::default()));

    match registry.call(tool_name, &arguments) {
        Ok(result) => JsonRpcResponse::success(
            id,
            serde_json::json!({
                "content": [{
                    "type": "text",
                    "text": result
                }]
            }),
        ),
        Err(e) => JsonRpcResponse::success(
            id,
            serde_json::json!({
                "content": [{
                    "type": "text",
                    "text": format!("Error: {e}")
                }],
                "isError": true
            }),
        ),
    }
}
