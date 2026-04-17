use anyhow::{bail, Result};
use chrono::Utc;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Write;
use std::path::Path;

fn classify_slug_content(content: &str) -> &'static str {
    let lower = content.to_lowercase();
    if ["rust", "cargo", "borrow checker", "ownership", "tokio", "serde"]
        .iter()
        .any(|kw| lower.contains(kw))
    {
        "software-engineering"
    } else if ["sympy", "numpy", "scipy", "jupyter", "matplotlib"]
        .iter()
        .any(|kw| lower.contains(kw))
    {
        "scientific-computing"
    } else {
        "docs"
    }
}

fn wiki_dir_for_domain(domain: &str) -> &str {
    match domain {
        "software-engineering" => "swe",
        "scientific-computing" => "scientific-computing",
        other => other,
    }
}

pub fn ingest_loose_file(root: &Path, slug: &str, content: &str) -> Result<()> {
    let loose_path = root.join("00-raw").join(format!("{slug}.md"));
    let dir = root.join("00-raw").join(slug);
    let source_path = dir.join("source.md");
    fs::create_dir_all(&dir)?;

    if loose_path.exists() {
        fs::rename(&loose_path, &source_path)?;
    } else {
        fs::write(&source_path, content)?;
    }

    let sha = hex::encode(Sha256::digest(content.as_bytes()));
    let meta = json!({
        "sha256": sha,
        "source_type": "loose-drop",
        "ingested": Utc::now().to_rfc3339(),
    });
    fs::write(dir.join("metadata.json"), serde_json::to_string_pretty(&meta)?)?;

    let hashes = root.join("00-raw/.hashes");
    let mut f = fs::OpenOptions::new().create(true).append(true).open(hashes)?;
    writeln!(f, "{sha} {slug}")?;
    Ok(())
}

pub async fn auto_classify_and_curate(root: &Path, slug: &str) -> Result<()> {
    let src = root.join("00-raw").join(slug).join("source.md");
    if !src.exists() {
        bail!("Source not found: {slug}");
    }

    let content = fs::read_to_string(&src)?;
    let domain = classify_slug_content(&content);
    let args = json!({ "slug": slug, "domain": domain });
    let _ = call("nlr_ingest_classify", &args, root)?;

    let wiki_dir = root.join("02-KB-main").join(wiki_dir_for_domain(domain));
    fs::create_dir_all(&wiki_dir)?;
    let wiki_path = wiki_dir.join(format!("{slug}.md"));
    if !wiki_path.exists() {
        let now = Utc::now().format("%Y-%m-%d").to_string();
        let page = format!(
            "---\ntitle: {slug}\ndomain: {domain}\nconfidence: low\nlast_updated: {now}\n---\n\nTODO: Auto-created stub page from inbox watcher. Curate this topic.\n"
        );
        fs::write(wiki_path, page)?;
    }

    Ok(())
}

pub fn tool_defs() -> Vec<Value> {
    vec![
        json!({"name":"nlr_ingest","description":"Ingest raw content into 00-raw/","inputSchema":{"type":"object","properties":{"slug":{"type":"string"},"content":{"type":"string"},"url":{"type":"string"},"source_type":{"type":"string"}},"required":["slug","content"]}}),
        json!({"name":"nlr_ingest_classify","description":"Classify ingested material into domain","inputSchema":{"type":"object","properties":{"slug":{"type":"string"},"domain":{"type":"string"}},"required":["slug","domain"]}}),
        json!({"name":"nlr_ingest_dedup","description":"Check SHA256 for duplicate detection","inputSchema":{"type":"object","properties":{"content":{"type":"string"}},"required":["content"]}}),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_root() -> tempfile::TempDir {
        let tmp = tempfile::tempdir().unwrap();
        for dir in [
            "00-raw",
            "01-sorted",
            "02-KB-main",
        ] {
            fs::create_dir_all(tmp.path().join(dir)).unwrap();
        }
        tmp
    }

    #[test]
    fn ingest_loose_file_moves_drop_and_writes_metadata() {
        let tmp = setup_root();
        let root = tmp.path();
        let slug = "codex-test";
        let content = "Rust ownership and borrowing with tokio.";
        fs::write(root.join("00-raw").join(format!("{slug}.md")), content).unwrap();

        ingest_loose_file(root, slug, content).unwrap();

        let source = root.join("00-raw").join(slug).join("source.md");
        let meta = root.join("00-raw").join(slug).join("metadata.json");
        assert!(source.exists());
        assert!(meta.exists());
        assert_eq!(fs::read_to_string(&source).unwrap(), content);
        let metadata: Value = serde_json::from_str(&fs::read_to_string(meta).unwrap()).unwrap();
        assert_eq!(metadata["source_type"], "loose-drop");
        assert!(!root.join("00-raw").join(format!("{slug}.md")).exists());
    }

    #[tokio::test]
    async fn auto_classify_and_curate_creates_sorted_copy_and_stub() {
        let tmp = setup_root();
        let root = tmp.path();
        let slug = "rust-ownership";
        let content = "Rust ownership, borrowing, cargo, and serde.";
        fs::write(root.join("00-raw").join(format!("{slug}.md")), content).unwrap();
        ingest_loose_file(root, slug, content).unwrap();

        auto_classify_and_curate(root, slug).await.unwrap();

        assert!(root.join("01-sorted/software-engineering").join(format!("{slug}.md")).exists());
        assert!(root.join("02-KB-main/swe").join(format!("{slug}.md")).exists());
    }
}

pub fn call(name: &str, args: &Value, root: &Path) -> Result<String> {
    match name {
        "nlr_ingest" => {
            // Required: slug, content. Empty args previously silently recorded a
            // duplicate of the empty-content sha256 (heavy-testing-suite surfaced).
            let slug = args.get("slug").and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .ok_or_else(|| anyhow::anyhow!("nlr_ingest: 'slug' is required (non-empty string)"))?;
            let content = args.get("content").and_then(|v| v.as_str())
                .filter(|s| !s.is_empty())
                .ok_or_else(|| anyhow::anyhow!("nlr_ingest: 'content' is required (non-empty string)"))?;
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
