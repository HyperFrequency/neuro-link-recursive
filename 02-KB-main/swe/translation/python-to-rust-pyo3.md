---
title: Python to Rust with PyO3
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: ed2e687cef8678a44efbc51fda634ea783e3f9dfaa43b4ad2066afd173f002e5
---

## Overview
[[PyO3]] lets Rust code be called from Python (and vice versa) by generating CPython C-API bindings from `#[pyclass]`/`#[pyfunction]` macros. The typical pattern is to keep orchestration in Python and push CPU-hot loops, parsers, or numerics into a Rust extension built with [[maturin]]. Crossing the [[FFI boundary]] requires explicit acknowledgment of the [[GIL]] and conversion between Rust and Python types.

## Conceptual Model
A `#[pymodule]` function registers `#[pyfunction]`/`#[pyclass]` items with CPython at import time; PyO3 uses a [[GIL token]] (`Python<'py>`) to guarantee the GIL is held while touching Python objects [source:pyo3-guide]. Pure Rust code outside Python objects can release the GIL with `Python::allow_threads(|| heavy_work())`, enabling true parallelism for CPU-bound work. Ownership across the boundary uses `Py<T>` (a smart pointer holding a reference count managed by CPython) on the Rust side.

## Details
- Build with `maturin develop` (editable install) or `maturin build --release` for wheels.
- `#[pyclass]` types must be `Send`; data is moved into a Python-owned heap allocation.
- Convert Python collections via `obj.extract::<Vec<f64>>()` — fast for primitives, slower for general objects.
- For numpy arrays, depend on `numpy` crate: `PyReadonlyArray1<f64>` gives zero-copy views on contiguous arrays.
- Always `allow_threads` around long-running pure-Rust work or you defeat the purpose vs pure Python.
- Errors: define a Rust error type with `From<MyError> for PyErr` to surface as Python exceptions.
- Avoid frequent boundary crossings in hot loops; batch work into one call.

## Sources
- [source:pyo3-guide] *The PyO3 User Guide*, https://pyo3.rs/. Confidence: high.
- [source:maturin-docs] *maturin documentation*, https://www.maturin.rs/. Confidence: high.

