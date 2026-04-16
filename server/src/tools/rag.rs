use anyhow::{bail, Result};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

use crate::bm25;
use crate::embed;

pub fn tool_defs() -> Vec<Value> {
    vec![
        json!({"name":"nlr_rag_query","description":"Hybrid search the knowledge base (BM25 + vector via RRF merge). Falls back to BM25-only if Qdrant is unavailable.","inputSchema":{"type":"object","properties":{"query":{"type":"string"},"limit":{"type":"integer"}},"required":["query"]}}),
        json!({"name":"nlr_rag_rebuild_index","description":"Rebuild the keyword index AND BM25 index from wiki pages","inputSchema":{"type":"object","properties":{}}}),
        json!({"name":"nlr_rag_embed","description":"Embed wiki pages into Qdrant for vector search. Set recreate=true to rebuild the collection.","inputSchema":{"type":"object","properties":{"recreate":{"type":"boolean"}}}}),
    ]
}

pub fn call(name: &str, args: &Value, root: &Path) -> Result<String> {
    match name {
        "nlr_rag_query" => {
            let query = args["query"].as_str().unwrap_or("").to_string();
            let limit = args.get("limit").and_then(|v| v.as_u64()).unwrap_or(5) as usize;

            // 1) BM25 search
            let bm25_results = match bm25::load_index(root) {
                Some(index) => bm25::search(&index, &query, limit * 2),
                None => {
                    // Build on-the-fly if no index exists
                    let index = bm25::build_index(root);
                    let _ = bm25::save_index(&index, root);
                    bm25::search(&index, &query, limit * 2)
                }
            };

            // 2) Vector search via Qdrant (graceful fallback)
            let qdrant_url = std::env::var("QDRANT_URL")
                .unwrap_or_else(|_| "http://localhost:6333".into());

            let vector_results = tokio::task::block_in_place(|| {
                tokio::runtime::Handle::current().block_on(async {
                    embed::search_wiki(&query, &qdrant_url, limit * 2).await
                })
            })
            .ok()
            .unwrap_or_default();

            // 3) RRF merge
            let merged = rrf_merge(&bm25_results, &vector_results, limit);

            let source = if vector_results.is_empty() {
                "bm25-only"
            } else {
                "hybrid-rrf"
            };

            let out: Vec<Value> = merged
                .into_iter()
                .map(|(path, score, preview)| {
                    json!({"path": path, "score": score, "preview": preview, "source": source})
                })
                .collect();

            Ok(serde_json::to_string_pretty(&out)?)
        }

        "nlr_rag_rebuild_index" => {
            // Rebuild keyword index (existing behavior)
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

            // Rebuild BM25 index
            let bm25_index = bm25::build_index(root);
            bm25::save_index(&bm25_index, root)?;

            Ok(format!(
                "Index rebuilt: {} pages, {} keywords, BM25 index ({} docs, {} terms)",
                pages.len(),
                keywords.len(),
                bm25_index.doc_count,
                bm25_index.postings.len()
            ))
        }

        "nlr_rag_embed" => {
            let recreate = args.get("recreate").and_then(|v| v.as_bool()).unwrap_or(false);
            let qdrant_url = std::env::var("QDRANT_URL")
                .unwrap_or_else(|_| "http://localhost:6333".into());

            let count = tokio::task::block_in_place(|| {
                tokio::runtime::Handle::current().block_on(async {
                    embed::embed_wiki(root, &qdrant_url, recreate).await
                })
            })?;

            Ok(format!("Embedded {count} pages into Qdrant (recreate={recreate})"))
        }

        _ => bail!("Unknown rag tool: {name}"),
    }
}

/// Reciprocal Rank Fusion: merges two ranked lists by path.
/// RRF score = sum over lists of 1/(k + rank), where k=60 (standard constant).
fn rrf_merge(
    bm25: &[bm25::SearchResult],
    vector: &[embed::SearchResult],
    limit: usize,
) -> Vec<(String, f64, String)> {
    const K: f64 = 60.0;
    let mut scores: HashMap<String, (f64, String)> = HashMap::new();

    for (rank, r) in bm25.iter().enumerate() {
        let entry = scores.entry(r.path.clone()).or_insert((0.0, r.preview.clone()));
        entry.0 += 1.0 / (K + rank as f64 + 1.0);
    }

    for (rank, r) in vector.iter().enumerate() {
        let entry = scores.entry(r.path.clone()).or_insert((0.0, r.preview.clone()));
        entry.0 += 1.0 / (K + rank as f64 + 1.0);
    }

    let mut results: Vec<_> = scores
        .into_iter()
        .map(|(path, (score, preview))| (path, score, preview))
        .collect();

    results.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    results.truncate(limit);
    results
}
