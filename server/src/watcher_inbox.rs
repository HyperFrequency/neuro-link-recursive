use anyhow::{Context, Result};
use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde_json::json;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::time::{Duration, Instant};
use tracing::{error, info, warn};

const DEBOUNCE_WINDOW: Duration = Duration::from_secs(2);

pub async fn run(root: PathBuf) -> Result<()> {
    tokio::task::spawn_blocking(move || blocking_run(root)).await?
}

fn blocking_run(root: PathBuf) -> Result<()> {
    // Canonicalize root so parent-equality checks work when root contains symlinks.
    // macOS FSEvents delivers events with resolved paths; if root has symlinks the
    // parent comparison `parent == root.join("00-raw")` would fail silently.
    let root = std::fs::canonicalize(&root).unwrap_or(root);
    let raw_dir = root.join("00-raw");
    let task_dir = root.join("07-neuro-link-task");
    let (tx, rx) = mpsc::channel();

    let mut watcher: RecommendedWatcher = notify::recommended_watcher(move |res| {
        let _ = tx.send(res);
    })?;
    watcher.watch(&raw_dir, RecursiveMode::NonRecursive)?;
    watcher.watch(&task_dir, RecursiveMode::NonRecursive)?;

    let mut seen: HashMap<PathBuf, Instant> = HashMap::new();
    info!(
        "Inbox watcher started: {} and {}",
        raw_dir.display(),
        task_dir.display()
    );

    loop {
        match rx.recv() {
            Ok(Ok(event)) => {
                if let Err(e) = handle_event(&root, &event, &mut seen) {
                    warn!("watcher event handling failed: {e}");
                }
            }
            Ok(Err(e)) => warn!("watcher error: {e}"),
            Err(e) => {
                error!("watcher channel closed: {e}");
                break;
            }
        }
    }

    Ok(())
}

fn handle_event(root: &Path, event: &Event, seen: &mut HashMap<PathBuf, Instant>) -> Result<()> {
    // macOS FSEvents emits Create(Any) and Modify(Name(RenameMode::To)) for editor-saved
    // files (atomic rename pattern). Linux inotify emits Create(File). Match all the real
    // "a new file appeared here" shapes.
    use notify::event::{CreateKind, ModifyKind, RenameMode};
    let is_new_file = matches!(
        event.kind,
        EventKind::Create(CreateKind::File | CreateKind::Any)
            | EventKind::Modify(ModifyKind::Name(RenameMode::To))
    );
    if !is_new_file {
        return Ok(());
    }

    for path in &event.paths {
        if !should_process(path) {
            continue;
        }
        // Confirm the file actually exists + is non-empty before processing — some editors
        // fire events mid-write and the file may be zero-byte.
        match std::fs::metadata(path) {
            Ok(m) if m.is_file() && m.len() > 0 => {}
            _ => continue,
        }
        if is_debounced(path, seen) {
            continue;
        }

        // Canonicalize event path's parent for symlink-safe comparison.
        let parent = path.parent().and_then(|p| std::fs::canonicalize(p).ok());
        let raw_dir = std::fs::canonicalize(root.join("00-raw")).ok();
        let task_dir = std::fs::canonicalize(root.join("07-neuro-link-task")).ok();
        if parent.is_some() && parent == raw_dir {
            tracing::info!("loose drop detected: {}", path.display());
            handle_loose_drop(root, path)?;
        } else if parent.is_some() && parent == task_dir {
            tracing::info!("task drop detected: {}", path.display());
            handle_task_drop(root, path)?;
        } else {
            tracing::debug!(
                "unmatched event parent={:?} raw={:?} task={:?}",
                parent, raw_dir, task_dir
            );
        }
    }

    Ok(())
}

fn should_process(path: &Path) -> bool {
    if path.extension().is_none_or(|ext| ext != "md") {
        return false;
    }
    let Some(name) = path.file_name().and_then(|s| s.to_str()) else {
        return false;
    };
    !(name.starts_with('.') || name.starts_with('_'))
}

fn is_debounced(path: &Path, seen: &mut HashMap<PathBuf, Instant>) -> bool {
    let now = Instant::now();
    if let Some(prev) = seen.get(path) {
        if now.duration_since(*prev) < DEBOUNCE_WINDOW {
            return true;
        }
    }
    seen.insert(path.to_path_buf(), now);
    false
}

fn handle_loose_drop(root: &Path, path: &Path) -> Result<()> {
    let slug = path
        .file_stem()
        .and_then(|s| s.to_str())
        .context("missing slug")?;
    let content = read_markdown_with_retry(path)?;
    crate::tools::ingest::ingest_loose_file(root, slug, &content)?;

    let rt = tokio::runtime::Handle::try_current().context("tokio runtime handle unavailable")?;
    rt.block_on(crate::tools::ingest::auto_classify_and_curate(root, slug))?;
    info!("Ingested loose inbox file: {}", path.display());
    Ok(())
}

fn handle_task_drop(root: &Path, path: &Path) -> Result<()> {
    let frontmatter = crate::config::parse_frontmatter(path)?;
    let status = frontmatter.get("status").map(String::as_str).unwrap_or("");
    let harness = frontmatter
        .get("assigned_harness")
        .map(|s| s.trim())
        .unwrap_or("");
    if status != "pending" || harness.is_empty() {
        return Ok(());
    }

    let entry = json!({
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "event": "task_picked_up",
        "file": path.file_name().and_then(|s| s.to_str()).unwrap_or_default(),
        "assigned_harness": harness,
        "status": status,
    });
    let state_path = root.join("state").join("job_log.jsonl");
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(state_path)?;
    use std::io::Write;
    writeln!(file, "{}", serde_json::to_string(&entry)?)?;
    info!("Logged pending task pickup: {}", path.display());
    Ok(())
}

fn read_markdown_with_retry(path: &Path) -> Result<String> {
    let mut last_err = None;
    for _ in 0..10 {
        match std::fs::read_to_string(path) {
            Ok(content) if !content.trim().is_empty() => return Ok(content),
            Ok(_) => last_err = Some(anyhow::anyhow!("file is empty")),
            Err(e) => last_err = Some(e.into()),
        }
        std::thread::sleep(Duration::from_millis(200));
    }
    Err(last_err.unwrap_or_else(|| anyhow::anyhow!("failed to read markdown file")))
}

#[cfg(test)]
mod tests {
    use super::*;
    use notify::event::CreateKind;

    fn setup_root() -> tempfile::TempDir {
        let tmp = tempfile::tempdir().unwrap();
        for dir in ["00-raw", "01-sorted", "02-KB-main", "07-neuro-link-task", "state"] {
            std::fs::create_dir_all(tmp.path().join(dir)).unwrap();
        }
        tmp
    }

    #[test]
    fn create_event_ingests_loose_markdown() {
        let tmp = setup_root();
        let root = tmp.path();
        let path = root.join("00-raw/rust-watch.md");
        std::fs::write(&path, "Rust ownership, borrowing, serde, and cargo").unwrap();

        let event = Event {
            kind: EventKind::Create(CreateKind::File),
            paths: vec![path],
            attrs: Default::default(),
        };
        let rt = tokio::runtime::Runtime::new().unwrap();
        let root_buf = root.to_path_buf();
        rt.block_on(async move {
            tokio::task::spawn_blocking(move || {
                let mut seen = HashMap::new();
                handle_event(&root_buf, &event, &mut seen)
            })
            .await
            .unwrap()
            .unwrap();
        });

        assert!(root.join("00-raw/rust-watch/source.md").exists());
        assert!(root.join("01-sorted/software-engineering/rust-watch.md").exists());
        assert!(root.join("02-KB-main/swe/rust-watch.md").exists());
    }

    #[test]
    fn create_event_logs_pending_task_pickup() {
        let tmp = setup_root();
        let root = tmp.path();
        let path = root.join("07-neuro-link-task/test-task.md");
        std::fs::write(
            &path,
            "---\nstatus: pending\nassigned_harness: claude-code\n---\n\nTask body\n",
        )
        .unwrap();

        let event = Event {
            kind: EventKind::Create(CreateKind::File),
            paths: vec![path],
            attrs: Default::default(),
        };
        let mut seen = HashMap::new();
        handle_event(root, &event, &mut seen).unwrap();

        let log = std::fs::read_to_string(root.join("state/job_log.jsonl")).unwrap();
        assert!(log.contains("\"event\":\"task_picked_up\""));
        assert!(log.contains("\"assigned_harness\":\"claude-code\""));
    }
}
