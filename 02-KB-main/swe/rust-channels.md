---
title: Rust Channels: mpsc, oneshot, crossbeam, flume
domain: swe
confidence: high
last_updated: 2026-04-17
sha256: a9f310af2cf589ed1fda872e84f0033e811344e693fc48b1740efa398246af6d
---

## Overview
Rust offers four main channel implementations: stdlib `mpsc`, Tokio's async `mpsc`/`oneshot`, `crossbeam-channel`, and `flume`. Choice depends on sync vs async, single vs multi consumer, and required throughput. Right primitive matters for both correctness (backpressure) and performance.

## Conceptual Model
A channel is a typed FIFO queue with one or more `Sender`s and one or more `Receiver`s. The semantic axes are: [[Bounded vs Unbounded]], [[Single vs Multi Consumer]], [[Sync vs Async]], and ownership of the receiving side. Backpressure is a property of bounded channels: a full bounded channel either blocks ([[Bounded mpsc]]) or `await`s ([[Tokio mpsc]]) the sender. Closure semantics are universal: a receiver completes only when ALL clones of the sender have been dropped — this is the most common source of "hang" bugs.

## Details

### `std::sync::mpsc`
Multi-producer single-consumer. Bounded variant is `sync_channel`. Lock-based; convenient but slow at high throughput.

### `tokio::sync::mpsc` / `oneshot`
- `mpsc`: bounded by default, async send awaits on full. Integrates with the Tokio scheduler.
- `oneshot`: single-value handoff between two tasks. Zero-allocation hot path. Right primitive when modeling a future result.

### `crossbeam-channel`
Synchronous mpmc, fastest in the ecosystem for thread-pool style workers. Supports `select!` over multiple channels (mirrors Go's `select`). Cache-friendly memory layout; benchmarks show 5-10x throughput vs `std::sync::mpsc`.

### `flume`
Sync + async receivers on the same channel. Bridges sync workers and async drivers. Reasonable performance on both sides.

### Decision matrix
| Use case | Pick |
|---|---|
| One-shot reply | `tokio::sync::oneshot` |
| Async producer/consumer | `tokio::sync::mpsc` |
| Thread-pool with multi-consumer | `crossbeam-channel` |
| Bridge sync+async | `flume` |
| stdlib-only | `std::sync::mpsc` |

## Common Pitfalls
- **Lingering sender clones**: a receiver only completes when ALL senders are dropped. Hanging tests usually trace to a clone held in a join handle or future.
- **Unbounded channels mask backpressure bugs**: can lead to OOM under load. Default to bounded.
- **`select!` fairness**: crossbeam picks ready arms pseudo-randomly to avoid starvation. Don't assume left-to-right priority.

## Open Questions
- Async-aware `select!` equivalent for `tokio::sync::mpsc`? (`tokio::select!` is the answer but ergonomics differ from crossbeam.)
- Best practice for graceful shutdown signaling in mpmc fan-out workloads?

## Sources
- [source:test-rust-channels-2026] — manual ingest, 2026-04-16

