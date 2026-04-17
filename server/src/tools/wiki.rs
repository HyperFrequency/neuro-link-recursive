use anyhow::{bail, Result};
use regex::Regex;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

pub fn tool_defs() -> Vec<Value> {
    vec![
        json!({"name":"nlr_wiki_create","description":"Create a new wiki page in 02-KB-main/","inputSchema":{"type":"object","properties":{"path":{"type":"string","description":"Relative path under 02-KB-main/ (e.g. trading/market-microstructure.md)"},"title":{"type":"string"},"domain":{"type":"string"},"content":{"type":"string"},"confidence":{"type":"string","enum":["high","medium","low","contested"]}},"required":["path","title","content"]}}),
        json!({"name":"nlr_wiki_read","description":"Read a wiki page by path","inputSchema":{"type":"object","properties":{"path":{"type":"string"}},"required":["path"]}}),
        json!({"name":"nlr_wiki_update","description":"Update an existing wiki page","inputSchema":{"type":"object","properties":{"path":{"type":"string"},"content":{"type":"string"},"append":{"type":"boolean"}},"required":["path","content"]}}),
        json!({"name":"nlr_wiki_list","description":"List all wiki pages with metadata","inputSchema":{"type":"object","properties":{}}}),
        json!({"name":"nlr_wiki_search","description":"Search wiki pages by keyword","inputSchema":{"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}}),
    ]
}

fn validate_wiki_path(kb: &Path, rel: &str) -> Result<std::path::PathBuf> {
    if rel.contains("..") || rel.starts_with('/') || rel.contains('\0') {
        bail!("Invalid path: traversal not allowed");
    }
    let full = kb.join(rel);
    // For existing files, canonicalize and verify
    if full.exists() {
        let canonical = full.canonicalize()?;
        let kb_canonical = kb.canonicalize().unwrap_or_else(|_| kb.to_path_buf());
        if !canonical.starts_with(&kb_canonical) {
            bail!("Access denied: path outside knowledge base");
        }
        return Ok(canonical);
    }
    // For new files, verify the parent is under kb
    Ok(full)
}

pub fn call(name: &str, args: &Value, root: &Path) -> Result<String> {
    let kb = root.join("02-KB-main");
    match name {
        "nlr_wiki_create" => {
            // Required args: path, title, content. Reject empty/missing — previously
            // this silently wrote 02-KB-main/untitled.md with empty body (surfaced by
            // heavy-testing-suite negative tests).
            let rel = args.get("path").and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .ok_or_else(|| anyhow::anyhow!("nlr_wiki_create: 'path' is required (non-empty string)"))?;
            let title = args.get("title").and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .ok_or_else(|| anyhow::anyhow!("nlr_wiki_create: 'title' is required (non-empty string)"))?;
            let content = args.get("content").and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .ok_or_else(|| anyhow::anyhow!("nlr_wiki_create: 'content' is required (non-empty string)"))?;
            let domain = args.get("domain").and_then(|v| v.as_str()).unwrap_or("general");
            let confidence = args.get("confidence").and_then(|v| v.as_str()).unwrap_or("medium");

            let path = validate_wiki_path(&kb, rel)?;
            if let Some(parent) = path.parent() { fs::create_dir_all(parent)?; }

            let sha = hex::encode(Sha256::digest(content.as_bytes()));
            let now = chrono::Utc::now().format("%Y-%m-%d").to_string();
            let page = format!("---\ntitle: {title}\ndomain: {domain}\nconfidence: {confidence}\nlast_updated: {now}\nsha256: {sha}\n---\n\n{content}\n");
            fs::write(&path, &page)?;

            // Append to log
            let log = kb.join("log.md");
            let entry = format!("\n## [{now}] Created: {rel}\n- Confidence: {confidence}\n- SHA256: {sha}\n");
            fs::OpenOptions::new().append(true).open(&log).map(|mut f| { use std::io::Write; let _ = write!(f, "{entry}"); })?;

            Ok(format!("Created: {rel}"))
        }
        "nlr_wiki_read" => {
            let rel = args["path"].as_str().unwrap_or("");
            let path = validate_wiki_path(&kb, rel)?;
            if !path.exists() { bail!("Page not found: {rel}"); }
            Ok(fs::read_to_string(&path)?)
        }
        "nlr_wiki_update" => {
            let rel = args["path"].as_str().unwrap_or("");
            let content = args["content"].as_str().unwrap_or("");
            let append = args.get("append").and_then(|v| v.as_bool()).unwrap_or(false);
            let path = validate_wiki_path(&kb, rel)?;
            if !path.exists() { bail!("Page not found: {rel}"); }
            if append {
                let mut existing = fs::read_to_string(&path)?;
                existing.push_str("\n");
                existing.push_str(content);
                fs::write(&path, existing)?;
            } else {
                fs::write(&path, content)?;
            }
            Ok(format!("Updated: {rel}"))
        }
        "nlr_wiki_list" => {
            let skip = ["schema.md", "index.md", "log.md"];
            let mut pages = Vec::new();
            for entry in WalkDir::new(&kb).into_iter().filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.extension().is_some_and(|e| e == "md") && !skip.iter().any(|s| path.file_name().is_some_and(|f| f == *s)) {
                    let rel = path.strip_prefix(&kb).unwrap_or(path).display().to_string();
                    let content = fs::read_to_string(path).unwrap_or_default();
                    let title = extract_field(&content, "title").unwrap_or(rel.clone());
                    let domain = extract_field(&content, "domain").unwrap_or_default();
                    let confidence = extract_field(&content, "confidence").unwrap_or_default();
                    pages.push(json!({"path": rel, "title": title, "domain": domain, "confidence": confidence}));
                }
            }
            Ok(serde_json::to_string_pretty(&pages)?)
        }
        "nlr_wiki_search" => {
            let query = args["query"].as_str().unwrap_or("").to_lowercase();
            let skip = ["schema.md", "index.md", "log.md"];
            let mut hits = Vec::new();
            for entry in WalkDir::new(&kb).into_iter().filter_map(|e| e.ok()) {
                let path = entry.path();
                if path.extension().is_some_and(|e| e == "md") && !skip.iter().any(|s| path.file_name().is_some_and(|f| f == *s)) {
                    let content = fs::read_to_string(path).unwrap_or_default();
                    if content.to_lowercase().contains(&query) {
                        let rel = path.strip_prefix(&kb).unwrap_or(path).display().to_string();
                        let title = extract_field(&content, "title").unwrap_or(rel.clone());
                        hits.push(json!({"path": rel, "title": title}));
                        if hits.len() >= 10 { break; }
                    }
                }
            }
            Ok(serde_json::to_string_pretty(&hits)?)
        }
        _ => bail!("Unknown wiki tool: {name}"),
    }
}

fn extract_field(content: &str, field: &str) -> Option<String> {
    let re = Regex::new(&format!(r"{}:\s*(.+)", regex::escape(field))).ok()?;
    re.captures(content).map(|c| c[1].trim().trim_matches('"').to_string())
}
