use anyhow::{bail, Result};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;

pub fn tool_defs() -> Vec<Value> {
    vec![
        json!({"name":"nlr_ingest","description":"Ingest raw content into 00-raw/","inputSchema":{"type":"object","properties":{"slug":{"type":"string"},"content":{"type":"string"},"url":{"type":"string"},"source_type":{"type":"string"}},"required":["slug","content"]}}),
        json!({"name":"nlr_ingest_classify","description":"Classify ingested material into domain","inputSchema":{"type":"object","properties":{"slug":{"type":"string"},"domain":{"type":"string"}},"required":["slug","domain"]}}),
        json!({"name":"nlr_ingest_dedup","description":"Check SHA256 for duplicate detection","inputSchema":{"type":"object","properties":{"content":{"type":"string"}},"required":["content"]}}),
    ]
}

pub fn call(name: &str, args: &Value, root: &Path) -> Result<String> {
    match name {
        "nlr_ingest" => {
            let slug = args["slug"].as_str().unwrap_or("untitled");
            let content = args["content"].as_str().unwrap_or("");
            let url = args.get("url").and_then(|v| v.as_str()).unwrap_or("");
            let src_type = args.get("source_type").and_then(|v| v.as_str()).unwrap_or("manual");
            let sha = hex::encode(Sha256::digest(content.as_bytes()));
            // Dedup check
            let hashes = root.join("00-raw/.hashes");
            if hashes.exists() {
                let existing = fs::read_to_string(&hashes)?;
                if existing.contains(&sha) { return Ok(json!({"status":"duplicate","sha256":sha}).to_string()); }
            }
            let dir = root.join("00-raw").join(slug);
            fs::create_dir_all(&dir)?;
            fs::write(dir.join("source.md"), content)?;
            let meta = json!({"url": url, "type": src_type, "sha256": sha, "word_count": content.split_whitespace().count()});
            fs::write(dir.join("metadata.json"), serde_json::to_string_pretty(&meta)?)?;
            // Record hash
            let mut f = fs::OpenOptions::new().create(true).append(true).open(&hashes)?;
            use std::io::Write;
            writeln!(f, "{sha} {slug}")?;
            Ok(json!({"status":"ingested","slug":slug,"sha256":sha}).to_string())
        }
        "nlr_ingest_classify" => {
            let slug = args["slug"].as_str().unwrap_or("");
            let domain = args["domain"].as_str().unwrap_or("docs");
            let src = root.join("00-raw").join(slug).join("source.md");
            if !src.exists() { bail!("Source not found: {slug}"); }
            let content = fs::read_to_string(&src)?;
            let dst_dir = root.join("01-sorted").join(domain);
            fs::create_dir_all(&dst_dir)?;
            fs::write(dst_dir.join(format!("{slug}.md")), &content)?;
            Ok(format!("Classified {slug} → {domain}"))
        }
        "nlr_ingest_dedup" => {
            let content = args["content"].as_str().unwrap_or("");
            let sha = hex::encode(Sha256::digest(content.as_bytes()));
            let hashes = root.join("00-raw/.hashes");
            let is_dup = hashes.exists() && fs::read_to_string(&hashes)?.contains(&sha);
            Ok(json!({"sha256": sha, "duplicate": is_dup}).to_string())
        }
        _ => bail!("Unknown ingest tool: {name}"),
    }
}
