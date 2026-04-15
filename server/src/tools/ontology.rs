use anyhow::{bail, Result};
use serde_json::{json, Value};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

pub fn tool_defs() -> Vec<Value> {
    vec![
        json!({"name":"nlr_ontology_generate","description":"Generate reasoning ontology triples from text","inputSchema":{"type":"object","properties":{"text":{"type":"string"},"name":{"type":"string"},"type":{"type":"string","enum":["domain","agent","workflow"]}},"required":["text","name"]}}),
        json!({"name":"nlr_ontology_query","description":"Read an existing ontology","inputSchema":{"type":"object","properties":{"name":{"type":"string"},"tier":{"type":"string","enum":["summary","detailed"]}},"required":["name"]}}),
        json!({"name":"nlr_ontology_gaps","description":"Find gaps in ontology coverage","inputSchema":{"type":"object","properties":{}}}),
    ]
}

pub fn call(name: &str, args: &Value, root: &Path) -> Result<String> {
    let ont_dir = root.join("03-ontology-main");
    match name {
        "nlr_ontology_generate" => {
            let text = args["text"].as_str().unwrap_or("");
            let ont_name = args["name"].as_str().unwrap_or("unnamed");
            let ont_type = args.get("type").and_then(|v| v.as_str()).unwrap_or("domain");
            let dir = ont_dir.join(ont_type).join(ont_name);
            fs::create_dir_all(&dir)?;
            // Write the raw text as input for LLM ontology generation
            fs::write(dir.join("input.md"), text)?;
            // Placeholder for summary and detailed — actual generation done by LLM skill
            if !dir.join("summary.md").exists() {
                fs::write(dir.join("summary.md"), format!("# {ont_name} — Summary Ontology\n\n*Pending generation by reasoning-ontology skill.*\n"))?;
            }
            if !dir.join("detailed.md").exists() {
                fs::write(dir.join("detailed.md"), format!("# {ont_name} — Detailed Ontology\n\n*Pending generation by reasoning-ontology skill.*\n"))?;
            }
            let meta = json!({"name": ont_name, "type": ont_type, "input_length": text.len(), "generated_at": chrono::Utc::now().to_rfc3339()});
            fs::write(dir.join("metadata.json"), serde_json::to_string_pretty(&meta)?)?;
            Ok(format!("Ontology scaffold created: {ont_type}/{ont_name}"))
        }
        "nlr_ontology_query" => {
            let ont_name = args["name"].as_str().unwrap_or("");
            let tier = args.get("tier").and_then(|v| v.as_str()).unwrap_or("summary");
            // Search across all types
            for ont_type in ["domain", "agent", "workflow"] {
                let path = ont_dir.join(ont_type).join(ont_name).join(format!("{tier}.md"));
                if path.exists() { return Ok(fs::read_to_string(&path)?); }
            }
            bail!("Ontology not found: {ont_name}")
        }
        "nlr_ontology_gaps" => {
            let mut ontologies = Vec::new();
            for entry in WalkDir::new(&ont_dir).max_depth(3).into_iter().filter_map(|e| e.ok()) {
                if entry.file_name() == "metadata.json" {
                    let meta = fs::read_to_string(entry.path())?;
                    let v: Value = serde_json::from_str(&meta)?;
                    ontologies.push(v);
                }
            }
            // Check which wiki domains have no ontology
            let kb = root.join("02-KB-main");
            let mut domains = std::collections::HashSet::new();
            for entry in WalkDir::new(&kb).max_depth(1).into_iter().filter_map(|e| e.ok()) {
                if entry.file_type().is_dir() && entry.depth() == 1 {
                    domains.insert(entry.file_name().to_string_lossy().to_string());
                }
            }
            let covered: std::collections::HashSet<String> = ontologies.iter().filter_map(|v| v["name"].as_str().map(String::from)).collect();
            let gaps: Vec<String> = domains.difference(&covered).cloned().collect();
            Ok(json!({"total_ontologies": ontologies.len(), "wiki_domains": domains.len(), "uncovered_domains": gaps}).to_string())
        }
        _ => bail!("Unknown ontology tool: {name}"),
    }
}
