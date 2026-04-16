//! Config resolution and YAML frontmatter parsing.

use anyhow::{Context, Result};
use regex::Regex;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub fn resolve_nlr_root() -> Result<PathBuf> {
    if let Ok(val) = std::env::var("NLR_ROOT") {
        let p = PathBuf::from(&val);
        if p.is_dir() { return Ok(p); }
    }
    if let Ok(home) = std::env::var("HOME") {
        let root_file = PathBuf::from(&home).join(".claude/state/nlr_root");
        if root_file.exists() {
            let content = std::fs::read_to_string(&root_file).context("Reading nlr_root")?;
            let p = PathBuf::from(content.trim());
            if p.is_dir() { return Ok(p); }
        }
    }
    let cwd = std::env::current_dir()?;
    if cwd.join("CLAUDE.md").exists() && cwd.join("02-KB-main").is_dir() {
        return Ok(cwd);
    }
    anyhow::bail!("Cannot resolve NLR_ROOT. Set NLR_ROOT env var or run scripts/init.sh.")
}

/// Default folders the MCP server exposes. Users can customize via config/neuro-link.md
/// by setting `allowed_paths` in YAML frontmatter.
const DEFAULT_ALLOWED_PATHS: &[&str] = &[
    "00-raw",
    "01-sorted",
    "02-KB-main",
    "03-ontology-main",
    "04-KB-agents-workflows",
    "05-insights-gaps",
    "05-self-improvement-HITL",
    "06-self-improvement-recursive",
    "06-progress-reports",
    "07-neuro-link-task",
    "08-code-docs",
    "09-business-docs",
    "config",
];

/// Read allowed_paths from config/neuro-link.md, defaulting to all KB folders.
pub fn allowed_paths(root: &Path) -> Vec<String> {
    let config_path = root.join("config/neuro-link.md");
    if let Ok(content) = std::fs::read_to_string(&config_path) {
        // Parse allowed_paths from YAML frontmatter (comma-separated or YAML list)
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("allowed_paths:") {
                let val = trimmed.strip_prefix("allowed_paths:").unwrap_or("").trim();
                if !val.is_empty() && val != "all" {
                    // Comma-separated: "00-raw, 02-KB-main, 07-neuro-link-task"
                    return val.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
                }
            }
        }
    }
    DEFAULT_ALLOWED_PATHS.iter().map(|s| s.to_string()).collect()
}

/// Check if a relative path (from NLR_ROOT) is within an allowed directory.
pub fn is_path_allowed(root: &Path, rel_path: &str) -> bool {
    let allowed = allowed_paths(root);
    // "all" or empty means everything
    if allowed.is_empty() {
        return true;
    }
    for prefix in &allowed {
        if rel_path.starts_with(prefix.as_str()) {
            return true;
        }
    }
    false
}

pub fn parse_frontmatter(path: &Path) -> Result<HashMap<String, String>> {
    let content = std::fs::read_to_string(path)?;
    let re = Regex::new(r"(?s)^---\n(.+?)\n---")?;
    let caps = re.captures(&content).context("No frontmatter found")?;
    let yaml_str = &caps[1];
    let mut map = HashMap::new();
    for line in yaml_str.lines() {
        if let Some((key, val)) = line.split_once(':') {
            let k = key.trim().to_string();
            let v = val.trim().trim_matches('"').to_string();
            if !k.is_empty() && !v.is_empty() { map.insert(k, v); }
        }
    }
    Ok(map)
}
