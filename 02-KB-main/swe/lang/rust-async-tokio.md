---
title: Rust Async/Await and Tokio
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 246db3dcc5364f091a4194b0ff91e1058f0b8729aa7b25b23ca03bf24774a5c9
---

## Overview
[[Rust async]] is a zero-cost, *poll-based* concurrency model: `async fn` returns an anonymous [[Future]] that does nothing until polled by an [[executor]]. [[Tokio]] is the dominant runtime, providing a multi-threaded scheduler, async I/O, timers, and synchronization primitives. Awaiting a future yields control to the executor, enabling massive concurrency on a small thread pool.

## Conceptual Model
An `async fn` desugars to a state-machine [[Future]] whose `poll()` either returns `Poll::Ready(T)` or `Poll::Pending` plus a [[Waker]]. The [[Tokio runtime]] drives futures via a [[work-stealing scheduler]]; I/O resources register interest with [[mio]]/[[epoll]] and wake their tasks on readiness [source:tokio-docs]. A [[task]] (`tokio::spawn`) is a top-level future the scheduler polls independently — it must be `'static + Send` for the multi-thread runtime.

## Details
- Don't block: `std::thread::sleep`, blocking syscalls, or CPU-heavy loops freeze the worker thread; use `tokio::time::sleep`, async I/O, or `tokio::task::spawn_blocking` for CPU work.
- Cancellation safety: dropping a future cancels it at the next await point; combinators like `tokio::select!` require each branch to be cancel-safe.
- `JoinHandle` is itself a future; `.await` it to get the task's output or join error.
- Channels: `tokio::sync::mpsc` for fan-in, `oneshot` for single-shot reply, `broadcast` for fan-out, `watch` for latest-value.
- Pinning: self-referential generated futures require `Pin<&mut Self>`; usually invisible, but matters when implementing custom futures.
- Common bug: forgetting `.await` — the future is constructed but never polled and silently does nothing.

## Sources
- [source:tokio-docs] *Tokio Tutorial*, https://tokio.rs/tokio/tutorial. Confidence: high.
- [source:async-book] *Asynchronous Programming in Rust*, https://rust-lang.github.io/async-book/. Confidence: high.

