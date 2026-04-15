use anyhow::{bail, Result};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

pub fn tool_defs() -> Vec<Value> {
    vec![
        json!({"name":"nlr_rag_query","description":"Query the knowledge base for relevant context given a prompt","inputSchema":{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer"}},"required":["query"]}}),
        json!({"name":"nlr_rag_rebuild_index","description":"Rebuild the auto-rag keyword index from wiki pages","inputSchema":{"type":"object","properties":{}}}),
    ]
}

pub fn call(name: &str, args: &Value, root: &Path) -> Result<String> {
    match name {
        "nlr_rag_query" => {
            let query = args["query"].as_str().unwrap_or("").to_lowercase();
            let limit = args.get("limit").and_then(|v| v.as_u64()).unwrap_or(5) as usize;
            let words: Vec<&str> = query.split_whitespace().filter(|w| w.len() > 3).collect();
            let kb = root.join("02-KB-main");
            let skip = ["schema.md", "index.md", "log.md"];
            let mut results = Vec::new();
            for entry in WalkDir::new(&kb).into_iter().filter_map(|e| e.ok()) {
                let path = entry.path();
                if !path.extension().is_some_and(|e| e == "md") || skip.iter().any(|s| path.file_name().is_some_and(|f| f == *s)) { continue; }
                let content = fs::read_to_string(path).unwrap_or_default();
                let lc = content.to_lowercase();
                let score: usize = words.iter().filter(|w| lc.contains(**w)).count();
                if score > 0 {
                    let rel = path.strip_prefix(&kb).unwrap_or(path).display().to_string();
                    let preview: String = content.lines().filter(|l| !l.starts_with("---") && !l.is_empty()).take(5).collect::<Vec<_>>().join(" ");
                    results.push((score, json!({"path": rel, "score": score, "preview": &preview[..preview.len().min(300)]})));
                }
            }
            results.sort_by(|a, b| b.0.cmp(&a.0));
            results.truncate(limit);
            let out: Vec<Value> = results.into_iter().map(|(_, v)| v).collect();
            Ok(serde_json::to_string_pretty(&out)?)
        }
        "nlr_rag_rebuild_index" => {
            let kb = root.join("02-KB-main");
            let skip = ["schema.md", "index.md", "log.md"];
            let mut keywords: HashMap<String, Vec<String>> = HashMap::new();
            let mut pages: HashMap<String, Value> = HashMap::new();
            for entry in WalkDir::new(&kb).into_iter().filter_map(|e| e.ok()) {
                let path = entry.path();
                if !path.extension().is_some_and(|e| e == "md") || skip.iter().any(|s| path.file_name().is_some_and(|f| f == *s)) { continue; }
                let content = fs::read_to_string(path).unwrap_or_default();
                let rel = path.strip_prefix(root).unwrap_or(path).display().to_string();
                let stem = path.file_stem().unwrap_or_default().to_string_lossy().replace('-', " ");
                let overview: String = content.lines().filter(|l| !l.starts_with("---") && !l.starts_with('#') && !l.is_empty()).take(3).collect::<Vec<_>>().join(" ");
                for word in stem.split_whitespace().chain(content.split_whitespace().take(100)) {
                    let w = word.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string();
                    if w.len() > 3 { keywords.entry(w).or_default().push(rel.clone()); }
                }
                pages.insert(rel, json!({"title": stem, "overview": &overview[..overview.len().min(200)]}));
            }
            let index = json!({"keywords": keywords, "pages": pages});
            fs::write(root.join("state/auto-rag-index.json"), serde_json::to_string_pretty(&index)?)?;
            Ok(format!("Index rebuilt: {} pages, {} keywords", pages.len(), keywords.len()))
        }
        _ => bail!("Unknown rag tool: {name}"),
    }
}
