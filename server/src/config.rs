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
