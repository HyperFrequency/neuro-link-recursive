---
type: code-fix
status: completed
priority: 2
created: 2026-04-17
depends_on: []
assigned_harness: claude-code
---
# Watcher init: add tracing subscriber + verify event firing

The notify-based inbox watcher (server/src/watcher_inbox.rs, commit 2b17932) compiles
and is wired into both `serve` and `start` paths, but the smoke test shows files dropped
into 00-raw/ are not being processed — they remain loose in the dir.

Two suspected causes:
1. Tracing subscriber is never initialized in main.rs, so the watcher's `info!`/`warn!`
   calls produce no output — debugging is blind.
2. `tokio::runtime::Handle::try_current()` inside `spawn_blocking` may fail; if so,
   `auto_classify_and_curate` errors and is swallowed.

Action items:
- Add `tracing_subscriber::fmt().init()` near the top of main.rs (or use an env-filter
  via RUST_LOG), so watcher logs surface
- Replace `Handle::try_current()` in handle_loose_drop with passing the handle in via
  the `run()` signature, OR convert auto_classify_and_curate to a blocking helper
- Add `eprintln!` traces at the top of `blocking_run`, `handle_event`, and
  `handle_loose_drop` so we can see exactly which step silently bails
- Run smoke test: drop a fresh .md in 00-raw/ and assert it is moved to <slug>/source.md
  AND a 02-KB-main stub page is created within 10s
