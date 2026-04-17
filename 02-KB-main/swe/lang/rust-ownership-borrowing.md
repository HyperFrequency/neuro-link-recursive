---
title: Rust Ownership and Borrowing
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: b6446b922e023d50e0a64b351d248101f266d649d19a144bbe2211d8b403e65d
---

## Overview
[[Rust]] enforces memory safety without a garbage collector through compile-time *ownership* rules: every value has a single owner, and the value is dropped when that owner goes out of scope. *Borrowing* lets code temporarily reference a value without taking ownership, governed by the borrow checker. The result is data-race-free concurrency and predictable destruction without runtime overhead.

## Conceptual Model
A [[binding]] owns its value; assignment to a new binding *moves* ownership unless the type is [[Copy]] (e.g. integers). A [[reference]] (`&T`) is a borrow checked against two rules: any number of shared `&T` xor exactly one mutable `&mut T`, and references must not outlive their referent (enforced via [[lifetimes]]). The [[borrow checker]] proves these rules at compile time, eliminating use-after-free and data races without [[GC]] [source:rust-book].

## Details
- Move semantics: `let s2 = s1;` invalidates `s1` for non-`Copy` types like `String`, `Vec`, `Box`.
- Clone vs move: `s1.clone()` deep-copies; cheap moves are preferred.
- Borrow rules block aliased mutation: holding `&mut v` while iterating `&v` is rejected.
- Lifetime elision covers most function signatures; explicit `'a` is needed when multiple references interact.
- `RefCell<T>` defers borrow-checking to runtime for interior mutability; `Rc<T>` / `Arc<T>` enable shared ownership (single-threaded / atomic respectively).
- NLL (non-lexical lifetimes, 2018+) shrinks borrow scope to last use, so many older "fights with the borrow checker" patterns now compile.

## Sources
- [source:rust-book] Klabnik & Nichols, *The Rust Programming Language*, https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html. Confidence: high.
- [source:rustonomicon] *The Rustonomicon*, https://doc.rust-lang.org/nomicon/. Confidence: high.

