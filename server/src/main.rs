mod cli;
mod config;
mod crawl;
mod embed;
mod grade;
mod graph;
mod heartbeat;
mod init;
mod ngrok_bridge;
mod protocol;
mod state;
mod tools;
mod workflow;

use anyhow::Result;
use clap::Parser;
use colored::Colorize;
use serde_json::Value;
use std::io::{self, BufRead, Write};
use tracing::{error, info};

use cli::{Cli, Commands, GraphAction, TaskAction, WorkflowAction};
use protocol::{JsonRpcRequest, JsonRpcResponse};
use tools::ToolRegistry;

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        None | Some(Commands::Mcp) => run_mcp_server(),
        Some(cmd) => run_cli(cmd).await,
    }
}

// ── MCP server (existing behavior, unchanged) ──

fn run_mcp_server() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter("neuro_link_mcp=info")
        .with_writer(io::stderr)
        .init();

    let nlr_root = config::resolve_nlr_root()?;
    info!("NLR_ROOT: {}", nlr_root.display());

    let registry = ToolRegistry::new(nlr_root);
    let stdin = io::stdin();
    let mut stdout = io::stdout();

    for line in stdin.lock().lines() {
        let line = match line {
            Ok(l) => l,
            Err(e) => {
                error!("stdin read error: {e}");
                break;
            }
        };

        if line.trim().is_empty() {
            continue;
        }

        let request: JsonRpcRequest = match serde_json::from_str(&line) {
            Ok(r) => r,
            Err(e) => {
                let err_resp = JsonRpcResponse::error(
                    Some(Value::Null),
                    -32700,
                    format!("Parse error: {e}"),
                );
                let _ = writeln!(stdout, "{}", serde_json::to_string(&err_resp)?);
                let _ = stdout.flush();
                continue;
            }
        };

        if request.method == "notifications/initialized" {
            info!("Client initialized");
            continue;
        }

        let id = request.id.clone();

        let response = match request.method.as_str() {
            "initialize" => handle_initialize(id),
            "tools/list" => handle_tools_list(id, &registry),
            "tools/call" => handle_tools_call(id, &request, &registry),
            _ => JsonRpcResponse::error(
                id,
                -32601,
                format!("Method not found: {}", request.method),
            ),
        };

        writeln!(stdout, "{}", serde_json::to_string(&response)?)?;
        stdout.flush()?;
    }

    Ok(())
}

fn handle_initialize(id: Option<Value>) -> JsonRpcResponse {
    JsonRpcResponse::success(
        id,
        serde_json::json!({
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": "neuro-link-recursive",
                "version": env!("CARGO_PKG_VERSION")
            }
        }),
    )
}

fn handle_tools_list(id: Option<Value>, registry: &ToolRegistry) -> JsonRpcResponse {
    let tools = registry.list_tools();
    JsonRpcResponse::success(id, serde_json::json!({ "tools": tools }))
}

fn handle_tools_call(
    id: Option<Value>,
    req: &JsonRpcRequest,
    registry: &ToolRegistry,
) -> JsonRpcResponse {
    let params = req.params.as_ref();

    let tool_name = params
        .and_then(|p| p.get("name"))
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let arguments = params
        .and_then(|p| p.get("arguments"))
        .cloned()
        .unwrap_or(Value::Object(Default::default()));

    match registry.call(tool_name, &arguments) {
        Ok(result) => JsonRpcResponse::success(
            id,
            serde_json::json!({
                "content": [{
                    "type": "text",
                    "text": result
                }]
            }),
        ),
        Err(e) => JsonRpcResponse::success(
            id,
            serde_json::json!({
                "content": [{
                    "type": "text",
                    "text": format!("Error: {e}")
                }],
                "isError": true
            }),
        ),
    }
}

// ── CLI dispatch ──

async fn run_cli(cmd: Commands) -> Result<()> {
    let root = config::resolve_nlr_root().unwrap_or_else(|_| {
        std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."))
    });

    match cmd {
        Commands::Mcp => unreachable!(),

        Commands::Init => {
            init::init(&root)?;
            println!("{} Initialized at {}", "OK".green().bold(), root.display());
        }

        Commands::Status => {
            let health = heartbeat::check_health(&root)?;
            let icon = if health.status == "ok" {
                "OK".green().bold()
            } else {
                "ERR".red().bold()
            };
            println!("{icon} {}", root.display());
            println!("  wiki pages:    {}", health.wiki_pages);
            println!("  pending tasks: {}", health.pending_tasks);
            if !health.errors.is_empty() {
                for e in &health.errors {
                    println!("  {}: {e}", "!".red());
                }
            }
        }

        Commands::Ingest { sources, parallel } => {
            if sources.is_empty() {
                anyhow::bail!("Provide at least one URL or file path");
            }
            let client = reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()?;

            if parallel && sources.len() > 1 {
                let pb = indicatif::ProgressBar::new(sources.len() as u64);
                pb.set_style(
                    indicatif::ProgressStyle::default_bar()
                        .template("{spinner} [{bar:30}] {pos}/{len} {msg}")?
                        .progress_chars("=> "),
                );
                let results = crawl::parallel_crawl(&sources, 5).await;
                for r in &results {
                    if let Some(err) = &r.error {
                        println!("{} {} — {err}", "FAIL".red(), r.url);
                    } else {
                        let slug = slug_from_url(&r.url);
                        match crawl::ingest_content(&root, &slug, &r.text, &r.url) {
                            Ok(ing) if ing.duplicate => {
                                println!("{} {} (duplicate)", "SKIP".yellow(), r.url)
                            }
                            Ok(ing) => println!(
                                "{} {} -> {}/{}",
                                "OK".green(),
                                r.url,
                                ing.domain,
                                ing.slug
                            ),
                            Err(e) => println!("{} {} — {e}", "FAIL".red(), r.url),
                        }
                    }
                    pb.inc(1);
                }
                pb.finish_and_clear();
            } else {
                for src in &sources {
                    if src.starts_with("http://") || src.starts_with("https://") {
                        let r = crawl::crawl_url(src, &client).await;
                        if let Some(err) = &r.error {
                            println!("{} {src} — {err}", "FAIL".red());
                            continue;
                        }
                        let slug = slug_from_url(src);
                        match crawl::ingest_content(&root, &slug, &r.text, src) {
                            Ok(ing) if ing.duplicate => {
                                println!("{} {src} (duplicate)", "SKIP".yellow())
                            }
                            Ok(ing) => println!(
                                "{} {src} -> {}/{}",
                                "OK".green(),
                                ing.domain,
                                ing.slug
                            ),
                            Err(e) => println!("{} {src} — {e}", "FAIL".red()),
                        }
                    } else {
                        let path = std::path::Path::new(src);
                        if !path.exists() {
                            println!("{} {src} — file not found", "FAIL".red());
                            continue;
                        }
                        let content = std::fs::read_to_string(path)?;
                        let slug = path
                            .file_stem()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string();
                        match crawl::ingest_content(&root, &slug, &content, src) {
                            Ok(ing) if ing.duplicate => {
                                println!("{} {src} (duplicate)", "SKIP".yellow())
                            }
                            Ok(ing) => println!(
                                "{} {src} -> {}/{}",
                                "OK".green(),
                                ing.domain,
                                ing.slug
                            ),
                            Err(e) => println!("{} {src} — {e}", "FAIL".red()),
                        }
                    }
                }
            }
        }

        Commands::Curate { topic } => {
            println!(
                "To curate '{}', use the {} skill in Claude Code:",
                topic.bold(),
                "wiki-curate".cyan()
            );
            println!("  /wiki-curate {topic}");
        }

        Commands::Search { query, limit } => {
            let kb = root.join("02-KB-main");
            let skip = ["schema.md", "index.md", "log.md"];
            let query_lc = query.to_lowercase();
            let mut hits = Vec::new();
            for entry in walkdir::WalkDir::new(&kb)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                let path = entry.path();
                if !path.extension().is_some_and(|e| e == "md")
                    || skip
                        .iter()
                        .any(|s| path.file_name().is_some_and(|f| f == *s))
                {
                    continue;
                }
                let content = std::fs::read_to_string(path).unwrap_or_default();
                if content.to_lowercase().contains(&query_lc) {
                    let rel = path
                        .strip_prefix(&kb)
                        .unwrap_or(path)
                        .display()
                        .to_string();
                    hits.push(rel);
                    if hits.len() >= limit {
                        break;
                    }
                }
            }
            if hits.is_empty() {
                println!("No results for '{query}'");
            } else {
                for h in &hits {
                    println!("  {h}");
                }
            }
        }

        Commands::Embed { recreate } => {
            let qdrant_url = std::env::var("QDRANT_URL")
                .unwrap_or_else(|_| "http://localhost:6333".into());
            let count = embed::embed_wiki(&root, &qdrant_url, recreate).await?;
            println!("{} Embedded {count} pages into Qdrant", "OK".green());
        }

        Commands::Grade { session, wiki } => {
            let do_both = !session && !wiki;
            if session || do_both {
                let sg = grade::grade_session(&root)?;
                println!("{}", "Session Grades".bold());
                println!(
                    "  calls: {} | success: {} ({:.0}%)",
                    sg.total_calls,
                    sg.success_count,
                    sg.success_rate * 100.0
                );
                if !sg.tool_distribution.is_empty() {
                    let mut tools: Vec<_> = sg.tool_distribution.iter().collect();
                    tools.sort_by(|a, b| b.1.cmp(a.1));
                    for (tool, count) in tools.iter().take(10) {
                        println!("    {tool}: {count}");
                    }
                }
                grade::append_score(&root, "session_success_rate", sg.success_rate, Some(0.95))?;
            }
            if wiki || do_both {
                let wg = grade::grade_wiki(&root)?;
                println!("{}", "Wiki Grades".bold());
                println!("  pages: {}", wg.total_pages);
                println!("  open questions: {}", wg.open_questions);
                println!("  contradictions: {}", wg.contradictions);
                println!("  stale (>30d): {}", wg.stale_pages);
                println!("  confidence mode: {}", wg.avg_confidence);
            }
        }

        Commands::Heartbeat { interval } => {
            println!("Starting heartbeat daemon (interval: {interval}s)");
            heartbeat::run_daemon(&root, interval).await;
        }

        Commands::Scan => {
            let health = heartbeat::check_health(&root)?;
            println!("{}", "Brain Scan".bold());
            println!("  status:        {}", health.status);
            println!("  wiki pages:    {}", health.wiki_pages);
            println!("  pending tasks: {}", health.pending_tasks);
            if !health.errors.is_empty() {
                println!("  {}", "Issues:".red());
                for e in &health.errors {
                    println!("    - {e}");
                }
            }
            // Staleness
            let kb = root.join("02-KB-main");
            let now = chrono::Utc::now().date_naive();
            let mut stale_count = 0;
            for entry in walkdir::WalkDir::new(&kb)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                let path = entry.path();
                if !path.extension().is_some_and(|e| e == "md") {
                    continue;
                }
                let content = std::fs::read_to_string(path).unwrap_or_default();
                if let Some(line) = content.lines().find(|l| l.starts_with("last_updated:")) {
                    let date_part = line.split(':').nth(1).unwrap_or("").trim();
                    if let Ok(date) = chrono::NaiveDate::parse_from_str(date_part, "%Y-%m-%d") {
                        if (now - date).num_days() > 30 {
                            stale_count += 1;
                        }
                    }
                }
            }
            println!("  stale pages:   {stale_count}");
        }

        Commands::Tasks { action } => match action {
            None => {
                let filter = "all";
                let task_dir = root.join("07-neuro-link-task");
                if !task_dir.is_dir() {
                    println!("No tasks directory");
                    return Ok(());
                }
                let mut count = 0;
                for entry in std::fs::read_dir(&task_dir)? {
                    let path = entry?.path();
                    if path.extension().is_some_and(|e| e == "md") {
                        let fname = path
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string();
                        println!("  {fname}");
                        count += 1;
                    }
                }
                if count == 0 {
                    println!("No tasks matching filter '{filter}'");
                }
            }
            Some(TaskAction::List { status }) => {
                let filter = status;
                let task_dir = root.join("07-neuro-link-task");
                if !task_dir.is_dir() {
                    println!("No tasks directory");
                    return Ok(());
                }
                let mut count = 0;
                for entry in std::fs::read_dir(&task_dir)? {
                    let path = entry?.path();
                    if path.extension().is_some_and(|e| e == "md") {
                        let content = std::fs::read_to_string(&path).unwrap_or_default();
                        if filter != "all" && !content.contains(&format!("status: {filter}")) {
                            continue;
                        }
                        let fname = path
                            .file_name()
                            .unwrap_or_default()
                            .to_string_lossy()
                            .to_string();
                        println!("  {fname}");
                        count += 1;
                    }
                }
                if count == 0 {
                    println!("No tasks matching filter '{filter}'");
                }
            }
            Some(TaskAction::Create {
                title,
                task_type,
                priority,
            }) => {
                let args = serde_json::json!({
                    "title": title,
                    "type": task_type,
                    "priority": priority,
                });
                let result = tools::tasks::call("nlr_task_create", &args, &root)?;
                println!("{} {result}", "OK".green());
            }
        },

        Commands::Config { name } => {
            let name = name.as_deref().unwrap_or("neuro-link");
            let path = root.join("config").join(format!("{name}.md"));
            if !path.exists() {
                anyhow::bail!("Config not found: {name}");
            }
            let fm = config::parse_frontmatter(&path)?;
            for (k, v) in &fm {
                println!("  {}: {}", k.bold(), v);
            }
        }

        Commands::Ngrok { port } => {
            ngrok_bridge::start_bridge(&root, port).await?;
        }

        Commands::Graph { action } => match action {
            GraphAction::AddFact {
                subject,
                predicate,
                object,
            } => {
                let valid_from = chrono::Utc::now().to_rfc3339();
                graph::add_fact(&subject, &predicate, &object, &valid_from).await?;
                println!(
                    "{} ({subject})-[{predicate}]->({object})",
                    "OK".green()
                );
            }
            GraphAction::Query { topic } => {
                let facts = graph::query_facts(&topic).await?;
                if facts.is_empty() {
                    println!("No facts found for '{topic}'");
                } else {
                    for f in &facts {
                        println!(
                            "  ({}) -[{}]-> ({})  [{}]",
                            f.subject, f.predicate, f.object, f.valid_from
                        );
                    }
                }
            }
        },

        Commands::Workflow { action } => match action {
            WorkflowAction::Create { name } => {
                let id = workflow::create_workflow(&root, &name)?;
                println!("{} workflow '{name}' id={id}", "OK".green());
            }
            WorkflowAction::Transition { id, state } => {
                workflow::transition(&root, &id, &state)?;
                println!("{} {id} -> {state}", "OK".green());
            }
            WorkflowAction::List => {
                let wfs = workflow::list_workflows(&root)?;
                if wfs.is_empty() {
                    println!("No workflows");
                } else {
                    for wf in &wfs {
                        println!(
                            "  {} {} [{}] ({})",
                            wf.id, wf.name, wf.state, wf.created
                        );
                    }
                }
            }
        },
    }

    Ok(())
}

fn slug_from_url(url: &str) -> String {
    url.split('/')
        .last()
        .unwrap_or("page")
        .split('?')
        .next()
        .unwrap_or("page")
        .split('#')
        .next()
        .unwrap_or("page")
        .replace(|c: char| !c.is_alphanumeric() && c != '-' && c != '_', "-")
        .trim_matches('-')
        .to_string()
}
