---
title: Rust Error Handling
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 0967a9deb74025981b3be28a160fec23b4d2cbb0afc3f56e485406bec61879fc
---

## Overview
[[Rust]] models recoverable failure with `Result<T, E>` rather than exceptions, making error paths explicit in the type system. The `?` operator propagates errors with automatic conversion via `From`. Library code typically defines a typed error enum with [[thiserror]]; application/binary code prefers a dynamic, context-rich error with [[anyhow]].

## Conceptual Model
`Result<T, E>` is the canonical [[sum type]] for fallible computation; `panic!` is reserved for unrecoverable bugs. The `?` operator on `Result<T, E1>` desugars to early-return `Err(E1.into())`, requiring an `From<E1> for E2` impl when the function returns `Result<_, E2>`. [[thiserror]] derives `Error` + `Display` + `From` for enum variants — ideal for a [[typed error API]]. [[anyhow]] erases concrete errors into `anyhow::Error` (a boxed `dyn Error + Send + Sync`) with `.context("...")` for human-readable backtraces [source:anyhow-docs].

## Details
- Library: `#[derive(thiserror::Error)] enum MyError { #[error("io: {0}")] Io(#[from] std::io::Error), ... }`.
- Application: `fn run() -> anyhow::Result<()> { let cfg = read_config().context("loading config")?; ... }`.
- Don't unwrap in library code; reserve `unwrap()`/`expect()` for invariants you've proven.
- `?` works on `Option<T>` too (early-returns `None`), and through `Try` for custom types.
- Backtraces: set `RUST_BACKTRACE=1`; anyhow captures one when an error is constructed.
- Avoid `Box<dyn Error>` directly in libraries — prefer thiserror so callers can match on variants.

## Sources
- [source:thiserror-docs] dtolnay, *thiserror*, https://docs.rs/thiserror/. Confidence: high.
- [source:anyhow-docs] dtolnay, *anyhow*, https://docs.rs/anyhow/. Confidence: high.
- [source:rust-book-err] *Rust Book Ch. 9*, https://doc.rust-lang.org/book/ch09-00-error-handling.html. Confidence: high.

