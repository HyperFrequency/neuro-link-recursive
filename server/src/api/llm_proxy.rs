// LLM API passthrough proxy with logging, RAG injection, and cost tracking.
//
// Exposes:
//   POST /llm/v1/chat/completions  (OpenAI-compatible, routes via OpenRouter/OpenAI/etc.)
//   POST /llm/v1/messages           (Anthropic native format, used by Claude Code)
//   POST /llm/v1/embeddings         (routes to local embedding server or cloud)
//   GET  /llm/v1/models             (list of available models)
//
// Client usage:
//   ANTHROPIC_BASE_URL=http://localhost:8080/llm/v1 claude
//   OPENAI_API_BASE=http://localhost:8080/llm/v1    <other-cli>
//
// Logs every request+response to state/llm_logs/<token_hash>/<YYYY-MM-DD>.jsonl

use axum::{
    body::Body,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use std::time::Instant;
use tokio::io::AsyncWriteExt;

use crate::tools::ToolRegistry;

pub fn routes() -> Router<Arc<ToolRegistry>> {
    Router::new()
        .route("/chat/completions", post(chat_completions))
        .route("/messages", post(messages))
        .route("/embeddings", post(embeddings))
        .route("/models", get(list_models))
}

// ── Log entry ──

#[derive(Debug, Serialize, Deserialize)]
struct LlmLogEntry {
    timestamp: String,
    client_token_hash: String,
    provider: String,
    model: String,
    endpoint: String,
    request: Value,
    response: Value,
    rag_context_injected: bool,
    rag_pages: Vec<String>,
    tokens: TokenCounts,
    latency_ms: u64,
    cost_usd: f64,
    session_id: String,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
struct TokenCounts {
    input: u64,
    output: u64,
}

// ── Provider resolution ──

fn resolve_provider_key(provider: &str) -> Option<String> {
    let env_var = match provider {
        "openrouter" => "OPENROUTER_API_KEY",
        "anthropic" => "ANTHROPIC_API_KEY",
        "openai" => "OPENAI_API_KEY",
        _ => return None,
    };
    std::env::var(env_var).ok().filter(|s| !s.is_empty())
}

fn provider_base_url(provider: &str) -> &'static str {
    match provider {
        "openrouter" => "https://openrouter.ai/api/v1",
        "anthropic" => "https://api.anthropic.com/v1",
        "openai" => "https://api.openai.com/v1",
        _ => "https://openrouter.ai/api/v1", // default
    }
}

fn detect_provider_from_headers(headers: &HeaderMap) -> String {
    // Explicit override
    if let Some(p) = headers.get("x-nlr-provider").and_then(|v| v.to_str().ok()) {
        return p.to_string();
    }
    // Anthropic clients set anthropic-version header
    if headers.contains_key("anthropic-version") {
        return "anthropic".to_string();
    }
    // Default to OpenRouter (OpenAI-compatible routing to any model)
    "openrouter".to_string()
}

fn token_hash(headers: &HeaderMap) -> String {
    let auth = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .strip_prefix("Bearer ")
        .unwrap_or("");
    let hash = Sha256::digest(auth.as_bytes());
    hex::encode(&hash[..8]) // first 16 hex chars = 8 bytes
}

// ── Logging ──

async fn append_log(root: &std::path::Path, entry: &LlmLogEntry) -> anyhow::Result<()> {
    let dir = root.join("state/llm_logs").join(&entry.client_token_hash);
    tokio::fs::create_dir_all(&dir).await?;
    let date = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let path = dir.join(format!("{date}.jsonl"));
    let line = serde_json::to_string(entry)? + "\n";
    let mut f = tokio::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .await?;
    f.write_all(line.as_bytes()).await?;
    Ok(())
}

// ── RAG injection ──

async fn inject_rag_context(
    registry: &ToolRegistry,
    request: &mut Value,
    endpoint: &str,
) -> (bool, Vec<String>) {
    // Extract the user's query text
    let query_text = match endpoint {
        "/chat/completions" => request
            .get("messages")
            .and_then(|m| m.as_array())
            .and_then(|arr| arr.iter().rev().find(|m| m.get("role").and_then(|r| r.as_str()) == Some("user")))
            .and_then(|m| m.get("content"))
            .and_then(|c| c.as_str())
            .unwrap_or("")
            .to_string(),
        "/messages" => request
            .get("messages")
            .and_then(|m| m.as_array())
            .and_then(|arr| arr.iter().rev().find(|m| m.get("role").and_then(|r| r.as_str()) == Some("user")))
            .and_then(|m| m.get("content"))
            .map(|c| {
                if c.is_string() {
                    c.as_str().unwrap_or("").to_string()
                } else if let Some(arr) = c.as_array() {
                    arr.iter()
                        .filter_map(|item| item.get("text").and_then(|t| t.as_str()))
                        .collect::<Vec<_>>()
                        .join(" ")
                } else {
                    String::new()
                }
            })
            .unwrap_or_default(),
        _ => String::new(),
    };

    if query_text.is_empty() {
        return (false, vec![]);
    }

    // Query RAG via the existing tool
    let rag_result = registry.call(
        "nlr_rag_query",
        &json!({ "query": query_text, "limit": 3 }),
    );

    let rag_text = match rag_result {
        Ok(t) => t,
        Err(_) => return (false, vec![]),
    };

    // Parse pages from the result
    let parsed: Vec<Value> = serde_json::from_str(&rag_text).unwrap_or_default();
    if parsed.is_empty() {
        return (false, vec![]);
    }

    let pages: Vec<String> = parsed
        .iter()
        .filter_map(|p| p.get("path").and_then(|v| v.as_str()).map(String::from))
        .collect();

    let context_block = format!(
        "\n\n[neuro-link RAG context — {} wiki pages]\n{}",
        pages.len(),
        parsed
            .iter()
            .map(|p| {
                let path = p.get("path").and_then(|v| v.as_str()).unwrap_or("");
                let preview = p.get("preview").and_then(|v| v.as_str()).unwrap_or("");
                format!("## {path}\n{preview}\n")
            })
            .collect::<Vec<_>>()
            .join("\n")
    );

    // Inject into system prompt
    if endpoint == "/messages" {
        // Anthropic: prepend to `system` string or add one
        let existing = request.get("system").and_then(|s| s.as_str()).unwrap_or("").to_string();
        request["system"] = json!(format!("{existing}{context_block}"));
    } else {
        // OpenAI: prepend a system message
        if let Some(messages) = request.get_mut("messages").and_then(|m| m.as_array_mut()) {
            messages.insert(0, json!({"role": "system", "content": context_block}));
        }
    }

    (true, pages)
}

// ── Cost calculation (rough) ──

fn estimate_cost(provider: &str, model: &str, input_tokens: u64, output_tokens: u64) -> f64 {
    // Per-million-token rates, rough estimates (real pricing varies)
    let (in_rate, out_rate) = match (provider, model) {
        ("anthropic", m) if m.contains("opus") => (15.0, 75.0),
        ("anthropic", m) if m.contains("sonnet") => (3.0, 15.0),
        ("anthropic", m) if m.contains("haiku") => (0.25, 1.25),
        ("openai", m) if m.contains("gpt-4") => (2.5, 10.0),
        ("openai", m) if m.contains("gpt-3.5") => (0.5, 1.5),
        _ => (1.0, 3.0), // default fallback
    };
    (input_tokens as f64 * in_rate + output_tokens as f64 * out_rate) / 1_000_000.0
}

// ── Handlers ──

async fn chat_completions(
    State(registry): State<Arc<ToolRegistry>>,
    headers: HeaderMap,
    Json(mut request): Json<Value>,
) -> Response {
    passthrough(&registry, &headers, &mut request, "/chat/completions").await
}

async fn messages(
    State(registry): State<Arc<ToolRegistry>>,
    headers: HeaderMap,
    Json(mut request): Json<Value>,
) -> Response {
    passthrough(&registry, &headers, &mut request, "/messages").await
}

async fn embeddings(
    State(_registry): State<Arc<ToolRegistry>>,
    Json(request): Json<Value>,
) -> Response {
    // Route to local embedding server (llama-server on 8400) by default
    let url = std::env::var("EMBEDDING_API_URL")
        .unwrap_or_else(|_| "http://localhost:8400/v1/embeddings".into());
    let client = reqwest::Client::new();
    match client.post(&url).json(&request).send().await {
        Ok(resp) => {
            let status = resp.status();
            let body = resp.bytes().await.unwrap_or_default();
            Response::builder()
                .status(status)
                .header("content-type", "application/json")
                .body(Body::from(body))
                .unwrap_or_else(|_| (StatusCode::INTERNAL_SERVER_ERROR, "build error").into_response())
        }
        Err(e) => (StatusCode::BAD_GATEWAY, format!("embedding server unreachable: {e}")).into_response(),
    }
}

async fn list_models(headers: HeaderMap) -> Response {
    let provider = detect_provider_from_headers(&headers);
    let api_key = match resolve_provider_key(&provider) {
        Some(k) => k,
        None => return (StatusCode::INTERNAL_SERVER_ERROR, format!("no API key for {provider}")).into_response(),
    };
    let url = format!("{}/models", provider_base_url(&provider));
    let client = reqwest::Client::new();
    match client.get(&url).bearer_auth(&api_key).send().await {
        Ok(resp) => {
            let status = resp.status();
            let body = resp.bytes().await.unwrap_or_default();
            Response::builder()
                .status(status)
                .header("content-type", "application/json")
                .body(Body::from(body))
                .unwrap_or_else(|_| (StatusCode::INTERNAL_SERVER_ERROR, "build error").into_response())
        }
        Err(e) => (StatusCode::BAD_GATEWAY, format!("upstream: {e}")).into_response(),
    }
}

// ── Core passthrough logic ──

async fn passthrough(
    registry: &Arc<ToolRegistry>,
    headers: &HeaderMap,
    request: &mut Value,
    endpoint: &str,
) -> Response {
    let started = Instant::now();
    let hash = token_hash(headers);
    let provider = detect_provider_from_headers(headers);
    let session_id = uuid::Uuid::new_v4().to_string();
    let auto_rag = headers
        .get("x-nlr-auto-rag")
        .and_then(|v| v.to_str().ok())
        == Some("true");

    // Optional RAG injection
    let (rag_injected, rag_pages) = if auto_rag {
        inject_rag_context(registry, request, endpoint).await
    } else {
        (false, vec![])
    };

    // Provider auth
    let api_key = match resolve_provider_key(&provider) {
        Some(k) => k,
        None => {
            let err = format!("No API key configured for provider '{provider}'. Set {}_API_KEY in secrets/.env",
                provider.to_uppercase());
            return (StatusCode::INTERNAL_SERVER_ERROR, err).into_response();
        }
    };

    // Build upstream request
    let url = format!("{}{}", provider_base_url(&provider), endpoint);
    let client = reqwest::Client::new();
    let mut req = client.post(&url).json(&request);

    // Provider-specific auth
    req = match provider.as_str() {
        "anthropic" => {
            req.header("x-api-key", &api_key)
                .header(
                    "anthropic-version",
                    headers
                        .get("anthropic-version")
                        .and_then(|v| v.to_str().ok())
                        .unwrap_or("2023-06-01"),
                )
        }
        _ => req.bearer_auth(&api_key),
    };

    // Forward request
    let upstream = match req.send().await {
        Ok(r) => r,
        Err(e) => {
            let latency = started.elapsed().as_millis() as u64;
            let entry = LlmLogEntry {
                timestamp: chrono::Utc::now().to_rfc3339(),
                client_token_hash: hash.clone(),
                provider: provider.clone(),
                model: request.get("model").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                endpoint: endpoint.to_string(),
                request: request.clone(),
                response: json!(null),
                rag_context_injected: rag_injected,
                rag_pages: rag_pages.clone(),
                tokens: TokenCounts::default(),
                latency_ms: latency,
                cost_usd: 0.0,
                session_id: session_id.clone(),
                error: Some(format!("upstream: {e}")),
            };
            let _ = append_log(registry.root(), &entry).await;
            return (StatusCode::BAD_GATEWAY, format!("upstream error: {e}")).into_response();
        }
    };

    let status = upstream.status();
    let body_bytes = upstream.bytes().await.unwrap_or_default();

    // Parse response for logging/token extraction
    let response_json: Value = serde_json::from_slice(&body_bytes).unwrap_or(json!(null));
    let tokens = extract_tokens(&response_json, &provider);
    let model = request.get("model").and_then(|v| v.as_str()).unwrap_or("").to_string();
    let cost = estimate_cost(&provider, &model, tokens.input, tokens.output);
    let latency = started.elapsed().as_millis() as u64;

    let entry = LlmLogEntry {
        timestamp: chrono::Utc::now().to_rfc3339(),
        client_token_hash: hash,
        provider,
        model,
        endpoint: endpoint.to_string(),
        request: request.clone(),
        response: response_json,
        rag_context_injected: rag_injected,
        rag_pages,
        tokens,
        latency_ms: latency,
        cost_usd: cost,
        session_id,
        error: if status.is_success() { None } else { Some(format!("HTTP {status}")) },
    };
    let _ = append_log(registry.root(), &entry).await;

    Response::builder()
        .status(status)
        .header("content-type", "application/json")
        .body(Body::from(body_bytes))
        .unwrap_or_else(|_| (StatusCode::INTERNAL_SERVER_ERROR, "build error").into_response())
}

fn extract_tokens(response: &Value, provider: &str) -> TokenCounts {
    match provider {
        "anthropic" => TokenCounts {
            input: response["usage"]["input_tokens"].as_u64().unwrap_or(0),
            output: response["usage"]["output_tokens"].as_u64().unwrap_or(0),
        },
        _ => TokenCounts {
            input: response["usage"]["prompt_tokens"].as_u64().unwrap_or(0),
            output: response["usage"]["completion_tokens"].as_u64().unwrap_or(0),
        },
    }
}
