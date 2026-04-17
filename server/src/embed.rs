use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub path: String,
    pub score: f64,
    pub preview: String,
}

fn resolve_embedding_config(root: &Path) -> (String, String, usize) {
    // Try to read from config/neuro-link.md frontmatter
    let config_path = root.join("config/neuro-link.md");
    let mut model = String::new();
    let mut dims: usize = 0;

    if let Ok(content) = fs::read_to_string(&config_path) {
        for line in content.lines() {
            if line.starts_with("embedding_model:") {
                model = line.split(':').nth(1).unwrap_or("").trim().to_string();
            }
            if line.starts_with("embedding_dims:") {
                dims = line.split(':').nth(1).unwrap_or("0").trim().parse().unwrap_or(0);
            }
        }
    }

    // Env var overrides
    if let Ok(env_model) = std::env::var("EMBEDDING_MODEL") {
        model = env_model;
    }

    // Defaults — Octen/Octen-Embedding-8B unquantized, 4096 dimensions
    // Served locally via scripts/embedding-server.py on port 8400
    let url = std::env::var("EMBEDDING_API_URL")
        .unwrap_or_else(|_| "http://localhost:8400/v1/embeddings".into());
    if model.is_empty() {
        model = "Octen/Octen-Embedding-8B".to_string();
    }
    if dims == 0 {
        dims = 4096;
    }

    (url, model, dims)
}

/// Pre-flight: verify the llama-server (or configured embedding backend) is
/// reachable before we silently no-op through a pile of pages. Returns an
/// actionable anyhow error when the `/v1/models` probe fails, so CI / the
/// operator sees a loud failure instead of a green "Embedded 0 pages" log.
pub(crate) async fn preflight_embedding_backend(
    client: &reqwest::Client,
    embedding_url: &str,
) -> Result<()> {
    // Derive the `/v1/models` probe URL from the configured embeddings URL.
    // Typical value: "http://localhost:8400/v1/embeddings" → "http://localhost:8400/v1/models".
    let probe_url = if let Some(idx) = embedding_url.rfind("/v1/") {
        let base = &embedding_url[..idx];
        format!("{base}/v1/models")
    } else {
        // Fall back to appending /v1/models on whatever base the user configured.
        let trimmed = embedding_url.trim_end_matches('/');
        format!("{trimmed}/v1/models")
    };

    match client
        .get(&probe_url)
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
    {
        Ok(resp) if resp.status().is_success() => Ok(()),
        Ok(resp) => Err(anyhow::anyhow!(
            "embed: llama-server at {probe_url} returned HTTP {} — start it or set EMBEDDING_API_URL env var",
            resp.status()
        )),
        Err(e) => Err(anyhow::anyhow!(
            "embed: llama-server at {probe_url} unreachable ({e}) — start it or set EMBEDDING_API_URL env var"
        )),
    }
}

pub async fn embed_wiki(root: &Path, qdrant_url: &str, recreate: bool) -> Result<usize> {
    let collection = "nlr_wiki";
    let client = reqwest::Client::new();
    let (embedding_url, embedding_model, embedding_dims) = resolve_embedding_config(root);

    // P06: fail loudly if the embedding backend is unreachable instead of
    // silently exiting with success after embedding 0 pages.
    preflight_embedding_backend(&client, &embedding_url).await?;

    if recreate {
        let _ = client
            .delete(format!("{qdrant_url}/collections/{collection}"))
            .send()
            .await;
        client
            .put(format!("{qdrant_url}/collections/{collection}"))
            .json(&serde_json::json!({
                "vectors": { "size": embedding_dims, "distance": "Cosine" }
            }))
            .send()
            .await
            .context("Failed to create Qdrant collection")?;
    }

    let kb = root.join("02-KB-main");
    let skip = ["schema.md", "index.md", "log.md"];
    let mut count = 0;

    for entry in WalkDir::new(&kb).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if !path.extension().is_some_and(|e| e == "md")
            || skip.iter().any(|s| path.file_name().is_some_and(|f| f == *s))
        {
            continue;
        }
        let content = fs::read_to_string(path).unwrap_or_default();
        let rel = path.strip_prefix(&kb).unwrap_or(path).display().to_string();

        let embed_resp = client
            .post(&embedding_url)
            .json(&serde_json::json!({
                "model": embedding_model,
                "input": &content[..content.len().min(8000)]
            }))
            .send()
            .await;

        let vector = match embed_resp {
            Ok(resp) => {
                let body: serde_json::Value = resp.json().await.unwrap_or_default();
                body["data"][0]["embedding"]
                    .as_array()
                    .map(|a| a.iter().filter_map(|v| v.as_f64()).collect::<Vec<_>>())
                    .unwrap_or_default()
            }
            Err(_) => continue,
        };

        if vector.is_empty() {
            continue;
        }

        let point_id = uuid::Uuid::new_v4().to_string();
        let _ = client
            .put(format!("{qdrant_url}/collections/{collection}/points"))
            .json(&serde_json::json!({
                "points": [{
                    "id": point_id,
                    "vector": vector,
                    "payload": { "path": rel, "preview": &content[..content.len().min(500)] }
                }]
            }))
            .send()
            .await;

        count += 1;
    }

    Ok(count)
}

pub async fn search_wiki(
    query: &str,
    qdrant_url: &str,
    limit: usize,
) -> Result<Vec<SearchResult>> {
    let client = reqwest::Client::new();
    let embedding_url = std::env::var("EMBEDDING_API_URL")
        .unwrap_or_else(|_| "http://localhost:8400/v1/embeddings".into());
    let embedding_model = std::env::var("EMBEDDING_MODEL")
        .unwrap_or_else(|_| "Octen/Octen-Embedding-8B".into());

    let embed_resp = client
        .post(&embedding_url)
        .json(&serde_json::json!({
            "model": embedding_model,
            "input": query
        }))
        .send()
        .await
        .context("Failed to get query embedding")?;

    let embed_body: serde_json::Value = embed_resp.json().await?;
    let vector: Vec<f64> = embed_body["data"][0]["embedding"]
        .as_array()
        .map(|a| a.iter().filter_map(|v| v.as_f64()).collect())
        .unwrap_or_default();

    if vector.is_empty() {
        anyhow::bail!("Empty embedding vector");
    }

    let resp = client
        .post(format!("{qdrant_url}/collections/nlr_wiki/points/search"))
        .json(&serde_json::json!({
            "vector": vector,
            "limit": limit,
            "with_payload": true
        }))
        .send()
        .await
        .context("Qdrant search failed")?;

    let body: serde_json::Value = resp.json().await?;
    let results = body["result"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .map(|r| SearchResult {
                    path: r["payload"]["path"].as_str().unwrap_or("").to_string(),
                    score: r["score"].as_f64().unwrap_or(0.0),
                    preview: r["payload"]["preview"].as_str().unwrap_or("").to_string(),
                })
                .collect()
        })
        .unwrap_or_default();

    Ok(results)
}
