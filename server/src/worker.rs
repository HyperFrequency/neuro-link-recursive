//! Recursive self-improvement worker.
//!
//! Periodically scans LLM logs, grades activity, records aggregate scores,
//! and writes HITL proposals when metrics regress.

use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex, OnceLock};
use tracing::{error, info, warn};

use crate::tools::ToolRegistry;

/// Worker status snapshot exposed via `nlr_worker_status`.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct WorkerStatus {
    pub last_run: Option<String>,
    pub last_run_duration_ms: u64,
    pub run_count: u64,
    pub proposals_generated: u64,
    pub last_metrics: Option<Value>,
    pub last_error: Option<String>,
}

/// Thread-safe status used by the background loop and the MCP tool.
#[derive(Default)]
pub struct WorkerState {
    status: Mutex<WorkerStatus>,
}

impl WorkerState {
    pub fn snapshot(&self) -> WorkerStatus {
        self.status.lock().map(|s| s.clone()).unwrap_or_default()
    }

    fn update<F: FnOnce(&mut WorkerStatus)>(&self, f: F) {
        if let Ok(mut s) = self.status.lock() {
            f(&mut s);
        }
    }
}

/// Global worker state accessible from the MCP tool handler.
static WORKER_STATE: OnceLock<Arc<WorkerState>> = OnceLock::new();

pub fn global_state() -> Arc<WorkerState> {
    WORKER_STATE
        .get_or_init(|| Arc::new(WorkerState::default()))
        .clone()
}

#[derive(Debug, Clone, Serialize)]
struct MetricSeverity {
    metric: &'static str,
    value: f64,
    previous: Option<f64>,
    severity: Severity,
    note: String,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Severity {
    Good,
    Warn,
    Critical,
}

impl Severity {
    fn priority(self) -> u8 {
        match self {
            Severity::Critical => 1,
            Severity::Warn => 3,
            Severity::Good => 5,
        }
    }
}

/// Run the worker loop forever.
pub async fn run(root: PathBuf, interval_minutes: u64) -> Result<()> {
    let registry = Arc::new(ToolRegistry::new(root.clone()));
    let interval_secs = interval_minutes.saturating_mul(60).max(60);
    let mut ticker = tokio::time::interval(std::time::Duration::from_secs(interval_secs));
    // First tick fires immediately; we want the worker to do one pass on startup.
    ticker.tick().await;

    info!(
        "Self-improvement worker started (interval={}m, root={})",
        interval_minutes,
        root.display()
    );

    // Kick off first pass immediately.
    run_once(&root, &registry).await;

    loop {
        ticker.tick().await;
        run_once(&root, &registry).await;
    }
}

/// Run a single grading + proposal pass.
pub async fn run_once(root: &Path, registry: &ToolRegistry) {
    let started = std::time::Instant::now();
    let state = global_state();
    let timestamp = Utc::now().to_rfc3339();

    let result = (|| -> Result<(Value, u64)> {
        let grade_json = registry
            .call(
                "nlr_llm_logs_grade",
                &json!({ "days": 1 }),
            )
            .context("nlr_llm_logs_grade failed")?;
        let grade: Value = serde_json::from_str(&grade_json)
            .context("invalid JSON from nlr_llm_logs_grade")?;

        let summary_json = registry
            .call(
                "nlr_llm_logs_summary",
                &json!({ "days": 1 }),
            )
            .context("nlr_llm_logs_summary failed")?;
        let summary: Value = serde_json::from_str(&summary_json)
            .context("invalid JSON from nlr_llm_logs_summary")?;

        let metrics = assemble_metrics(&grade, &summary);
        let previous = load_previous_metrics(root);
        let severities = grade_metrics(&metrics, previous.as_ref());

        // Append aggregate scores.
        append_scores(root, &metrics, &timestamp)?;

        // High-cost flag (advisory only, non-regression).
        let high_cost_calls = count_high_cost_calls(root, 1, 0.10);

        let metrics_record = json!({
            "timestamp": timestamp,
            "metrics": metrics,
            "severities": severities,
            "previous": previous,
            "high_cost_calls": high_cost_calls,
        });

        // Regression proposals.
        let mut proposals_written = 0u64;
        for sev in &severities {
            if sev.severity == Severity::Critical
                || (sev.severity == Severity::Warn && regressed(sev.value, sev.previous, sev.metric))
            {
                if let Err(e) = write_proposal(root, sev, &timestamp) {
                    warn!("Proposal write failed for {}: {}", sev.metric, e);
                } else {
                    proposals_written += 1;
                }
            }
        }
        if high_cost_calls > 0 {
            if let Err(e) = write_cost_proposal(root, high_cost_calls, &timestamp) {
                warn!("High-cost proposal write failed: {}", e);
            } else {
                proposals_written += 1;
            }
        }

        Ok((metrics_record, proposals_written))
    })();

    let duration_ms = started.elapsed().as_millis() as u64;
    match result {
        Ok((metrics_record, proposals_written)) => {
            info!(
                "Worker pass complete in {}ms (proposals={})",
                duration_ms, proposals_written
            );
            state.update(|s| {
                s.last_run = Some(timestamp.clone());
                s.last_run_duration_ms = duration_ms;
                s.run_count += 1;
                s.proposals_generated += proposals_written;
                s.last_metrics = Some(metrics_record);
                s.last_error = None;
            });
        }
        Err(e) => {
            error!("Worker pass failed: {e:#}");
            let msg = format!("{e:#}");
            state.update(|s| {
                s.last_run = Some(timestamp.clone());
                s.last_run_duration_ms = duration_ms;
                s.run_count += 1;
                s.last_error = Some(msg);
            });
        }
    }
}

fn assemble_metrics(grade: &Value, summary: &Value) -> Value {
    let total_calls = grade["total_calls"].as_u64().unwrap_or(0);
    let success_rate = grade["success_rate"].as_f64().unwrap_or(1.0);
    let error_rate = 1.0 - success_rate;
    let rag_hit_rate = grade["rag_injection_rate"].as_f64().unwrap_or(0.0);
    let avg_latency_ms = grade["avg_latency_ms"].as_u64().unwrap_or(0);
    let max_latency_ms = grade["max_latency_ms"].as_u64().unwrap_or(0);
    // p95 is unavailable from summary; approximate with max as a conservative upper bound.
    let p95_latency_ms = max_latency_ms;
    let total_cost = summary["total_cost_usd"].as_f64().unwrap_or(0.0);

    json!({
        "total_calls": total_calls,
        "success_rate": success_rate,
        "error_rate": error_rate,
        "rag_hit_rate": rag_hit_rate,
        "avg_latency_ms": avg_latency_ms,
        "p95_latency_ms": p95_latency_ms,
        "total_cost_usd": total_cost,
    })
}

fn grade_metrics(metrics: &Value, previous: Option<&Value>) -> Vec<MetricSeverity> {
    let mut out = Vec::new();

    let error_rate = metrics["error_rate"].as_f64().unwrap_or(0.0);
    out.push(MetricSeverity {
        metric: "success_rate",
        value: metrics["success_rate"].as_f64().unwrap_or(1.0),
        previous: previous
            .and_then(|p| p.get("success_rate"))
            .and_then(|v| v.as_f64()),
        severity: if error_rate > 0.10 {
            Severity::Critical
        } else if error_rate > 0.05 {
            Severity::Warn
        } else {
            Severity::Good
        },
        note: format!("error rate {:.2}%", error_rate * 100.0),
    });

    let p95 = metrics["p95_latency_ms"].as_u64().unwrap_or(0);
    out.push(MetricSeverity {
        metric: "latency_p95",
        value: p95 as f64,
        previous: previous
            .and_then(|p| p.get("p95_latency_ms"))
            .and_then(|v| v.as_f64()),
        severity: if p95 > 10_000 {
            Severity::Critical
        } else if p95 > 3_000 {
            Severity::Warn
        } else {
            Severity::Good
        },
        note: format!("p95 latency {}ms", p95),
    });

    // Only surface RAG hit rate if we actually saw calls.
    if metrics["total_calls"].as_u64().unwrap_or(0) > 0 {
        let rag = metrics["rag_hit_rate"].as_f64().unwrap_or(0.0);
        out.push(MetricSeverity {
            metric: "rag_hit_rate",
            value: rag,
            previous: previous
                .and_then(|p| p.get("rag_hit_rate"))
                .and_then(|v| v.as_f64()),
            severity: if rag < 0.10 {
                Severity::Critical
            } else if rag < 0.30 {
                Severity::Warn
            } else {
                Severity::Good
            },
            note: format!("RAG hit rate {:.1}%", rag * 100.0),
        });
    }

    out
}

/// Returns true if the metric worsened relative to the previous sample.
fn regressed(current: f64, previous: Option<f64>, metric: &str) -> bool {
    let Some(prev) = previous else { return false };
    match metric {
        // Higher is better.
        "success_rate" | "rag_hit_rate" => current + 1e-6 < prev,
        // Lower is better.
        "latency_p95" | "cost" => current > prev + 1e-6,
        _ => false,
    }
}

fn load_previous_metrics(root: &Path) -> Option<Value> {
    let path = root.join("state/score_history.jsonl");
    let content = fs::read_to_string(&path).ok()?;
    let mut latest: Option<Value> = None;
    for line in content.lines().rev() {
        if line.trim().is_empty() {
            continue;
        }
        let entry: Value = match serde_json::from_str(line) {
            Ok(v) => v,
            Err(_) => continue,
        };
        if entry.get("source").and_then(|v| v.as_str()) == Some("worker")
            && entry.get("metric").and_then(|v| v.as_str()) == Some("aggregate")
        {
            latest = entry.get("metrics").cloned();
            break;
        }
    }
    latest
}

fn append_scores(root: &Path, metrics: &Value, timestamp: &str) -> Result<()> {
    let state_dir = root.join("state");
    fs::create_dir_all(&state_dir).ok();
    let path = state_dir.join("score_history.jsonl");
    let mut file = fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .with_context(|| format!("open {}", path.display()))?;
    let entry = json!({
        "timestamp": timestamp,
        "source": "worker",
        "metric": "aggregate",
        "metrics": metrics,
    });
    writeln!(file, "{}", serde_json::to_string(&entry)?)?;
    Ok(())
}

fn count_high_cost_calls(root: &Path, days: i64, threshold_usd: f64) -> u64 {
    let logs_dir = root.join("state/llm_logs");
    if !logs_dir.is_dir() {
        return 0;
    }
    let cutoff = Utc::now() - chrono::Duration::days(days);
    let mut flagged = 0u64;
    for entry in walkdir::WalkDir::new(&logs_dir).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if !path.extension().is_some_and(|e| e == "jsonl") {
            continue;
        }
        let content = fs::read_to_string(path).unwrap_or_default();
        for line in content.lines() {
            let v: Value = match serde_json::from_str(line) {
                Ok(v) => v,
                Err(_) => continue,
            };
            let ts = v.get("timestamp").and_then(|x| x.as_str()).unwrap_or("");
            if let Ok(dt) = DateTime::parse_from_rfc3339(ts) {
                if dt.with_timezone(&Utc) < cutoff {
                    continue;
                }
            }
            if v["cost_usd"].as_f64().unwrap_or(0.0) > threshold_usd {
                flagged += 1;
            }
        }
    }
    flagged
}

fn write_proposal(root: &Path, sev: &MetricSeverity, timestamp: &str) -> Result<()> {
    let dir = root.join("05-self-improvement-HITL/proposals");
    fs::create_dir_all(&dir)?;

    let date = &timestamp[..10];
    let slug = format!(
        "{metric}-{severity}",
        metric = sev.metric.replace('_', "-"),
        severity = match sev.severity {
            Severity::Good => "ok",
            Severity::Warn => "warn",
            Severity::Critical => "critical",
        }
    );
    let path = dir.join(format!("{date}-{slug}.md"));

    let previous = sev
        .previous
        .map(|p| format!("{:.4}", p))
        .unwrap_or_else(|| "null".to_string());
    let recommended = recommended_action(sev);

    let body = format!(
        "---\n\
type: self-improvement\n\
priority: {priority}\n\
status: pending\n\
created: {date}\n\
metric: {metric}\n\
regression_detected: true\n\
current_value: {current}\n\
previous_value: {previous}\n\
recommended_action: {recommended}\n\
---\n\
# Regression detected: {metric}\n\
\n\
Automated worker pass at `{timestamp}` flagged `{metric}` as **{severity:?}**.\n\
\n\
- Current value: `{current}` ({note})\n\
- Previous value: `{previous}`\n\
- Severity: `{severity:?}`\n\
\n\
## Recommended action\n\
\n\
{recommended}\n\
\n\
## Notes\n\
\n\
- Source: `neuro-link worker` (recursive self-improvement)\n\
- Inputs: `nlr_llm_logs_grade` + `nlr_llm_logs_summary` (last 24h)\n\
- Approve this proposal in `05-self-improvement-HITL/overview.md` before acting.\n",
        priority = sev.severity.priority(),
        date = date,
        metric = sev.metric,
        current = sev.value,
        previous = previous,
        recommended = recommended,
        timestamp = timestamp,
        severity = sev.severity,
        note = sev.note,
    );

    fs::write(&path, body).with_context(|| format!("write {}", path.display()))?;
    info!("wrote proposal: {}", path.display());
    Ok(())
}

fn write_cost_proposal(root: &Path, count: u64, timestamp: &str) -> Result<()> {
    let dir = root.join("05-self-improvement-HITL/proposals");
    fs::create_dir_all(&dir)?;
    let date = &timestamp[..10];
    let path = dir.join(format!("{date}-cost-high-spend.md"));
    let body = format!(
        "---\n\
type: self-improvement\n\
priority: 2\n\
status: pending\n\
created: {date}\n\
metric: cost\n\
regression_detected: true\n\
current_value: {count}\n\
previous_value: null\n\
recommended_action: Review high-cost LLM calls in the last 24h and consider model downgrades, prompt shortening, or caching.\n\
---\n\
# High-cost LLM calls detected\n\
\n\
{count} calls exceeded $0.10 in the last 24h (worker pass `{timestamp}`).\n\
\n\
## Recommended action\n\
\n\
- Inspect `state/llm_logs/*/` for entries with `cost_usd > 0.10`.\n\
- Consider routing to a cheaper model (e.g. Haiku, gpt-4o-mini) for low-complexity calls.\n\
- Audit long prompt caches and consider enabling prompt caching or trimming system prompts.\n",
        date = date,
        count = count,
        timestamp = timestamp,
    );
    fs::write(&path, body)?;
    info!("wrote cost proposal: {}", path.display());
    Ok(())
}

fn recommended_action(sev: &MetricSeverity) -> String {
    match sev.metric {
        "success_rate" => match sev.severity {
            Severity::Critical => {
                "Error rate above 10%. Inspect recent failing LLM calls, check provider health, and verify API keys and rate limits.".into()
            }
            Severity::Warn => {
                "Error rate between 5-10%. Review recent errors in `state/llm_logs/` and check for provider degradation or prompt issues.".into()
            }
            Severity::Good => "No action required.".into(),
        },
        "latency_p95" => match sev.severity {
            Severity::Critical => {
                "p95 latency above 10s. Consider lowering max_tokens, switching providers, or enabling streaming.".into()
            }
            Severity::Warn => {
                "p95 latency between 3-10s. Profile slow calls and consider model downgrade for latency-sensitive paths.".into()
            }
            Severity::Good => "No action required.".into(),
        },
        "rag_hit_rate" => match sev.severity {
            Severity::Critical => {
                "RAG injection below 10%. Verify auto-RAG hook is enabled and wiki index is populated; re-run `neuro-link embed`.".into()
            }
            Severity::Warn => {
                "RAG injection between 10-30%. Broaden auto-RAG keyword matching or increase index coverage.".into()
            }
            Severity::Good => "No action required.".into(),
        },
        _ => "Review metric and propose a remediation.".into(),
    }
}
