//! Tool registry: dispatches MCP tool calls to handlers.

pub mod wiki;
pub mod rag;
pub mod ontology;
pub mod ingest;
pub mod tasks;
pub mod harness;
pub mod scan;

use anyhow::{bail, Result};
use serde_json::{json, Value};
use std::path::PathBuf;

use crate::state::StateManager;

pub struct ToolRegistry {
    root: PathBuf,
    state: StateManager,
}

impl ToolRegistry {
    pub fn new(root: PathBuf) -> Self {
        let state = StateManager::new(root.clone());
        Self { root, state }
    }

    pub fn list_tools(&self) -> Vec<Value> {
        let mut tools = Vec::new();
        tools.extend(wiki::tool_defs());
        tools.extend(rag::tool_defs());
        tools.extend(ontology::tool_defs());
        tools.extend(ingest::tool_defs());
        tools.extend(tasks::tool_defs());
        tools.extend(harness::tool_defs());
        tools.extend(scan::tool_defs());
        // State tools
        tools.push(json!({"name": "nlr_state_heartbeat", "description": "Read or update heartbeat status", "inputSchema": {"type": "object", "properties": {"action": {"type": "string", "enum": ["read", "update"]}}, "required": ["action"]}}));
        tools.push(json!({"name": "nlr_state_log", "description": "Append to session log", "inputSchema": {"type": "object", "properties": {"tool": {"type": "string"}, "exit_code": {"type": "integer"}}, "required": ["tool"]}}));
        tools.push(json!({"name": "nlr_config_read", "description": "Read a config file frontmatter", "inputSchema": {"type": "object", "properties": {"name": {"type": "string", "description": "Config filename without extension"}}, "required": ["name"]}}));
        tools
    }

    pub fn call(&self, name: &str, args: &Value) -> Result<String> {
        match name {
            n if n.starts_with("nlr_wiki_") => wiki::call(n, args, &self.root),
            n if n.starts_with("nlr_rag_") => rag::call(n, args, &self.root),
            n if n.starts_with("nlr_ontology_") => ontology::call(n, args, &self.root),
            n if n.starts_with("nlr_ingest") => ingest::call(n, args, &self.root),
            n if n.starts_with("nlr_task_") => tasks::call(n, args, &self.root),
            n if n.starts_with("nlr_harness_") => harness::call(n, args, &self.root),
            n if n.starts_with("nlr_scan_") => scan::call(n, args, &self.root, &self.state),
            "nlr_state_heartbeat" => {
                let action = args.get("action").and_then(|v| v.as_str()).unwrap_or("read");
                match action {
                    "read" => Ok(serde_json::to_string_pretty(&self.state.read_heartbeat()?)?),
                    "update" => { self.state.update_heartbeat("ok", &[])?; Ok("Heartbeat updated".into()) }
                    _ => bail!("Unknown action: {action}"),
                }
            }
            "nlr_state_log" => {
                let tool = args.get("tool").and_then(|v| v.as_str()).unwrap_or("unknown");
                let exit_code = args.get("exit_code").and_then(|v| v.as_i64()).map(|v| v as i32);
                self.state.append_session_log(tool, exit_code)?;
                Ok("Logged".into())
            }
            "nlr_config_read" => {
                let name = args.get("name").and_then(|v| v.as_str()).unwrap_or("neuro-link");
                let path = self.root.join("config").join(format!("{name}.md"));
                let fm = crate::config::parse_frontmatter(&path)?;
                Ok(serde_json::to_string_pretty(&fm)?)
            }
            _ => bail!("Unknown tool: {name}"),
        }
    }
}
