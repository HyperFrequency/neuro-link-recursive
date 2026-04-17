---
title: Python to C++ with pybind11
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: c3d5308ef7eab853f84560e3e4bb4ce86e182d41b864b0130d0d3819bf34ceb5
---

## Overview
[[pybind11]] is a header-only C++ library that binds C++ classes/functions to Python via templates and [[CPython]] C API. It mirrors [[Boost.Python]] without the Boost dependency and is the de-facto choice for new C++ extensions. Performance gains over pure Python come from native code plus *releasing the GIL* during compute-heavy sections.

## Conceptual Model
`PYBIND11_MODULE(name, m) { m.def("foo", &foo); }` registers C++ functions; `py::class_<MyClass>(m, "MyClass").def(py::init<...>())` exposes classes with constructors and methods [source:pybind11-docs]. The [[GIL]] is held by default on entry; release it with `py::call_guard<py::gil_scoped_release>()` on a function binding, or RAII-style with `py::gil_scoped_release release;` inside C++. Numpy interop uses `py::array_t<T>` for typed, optionally [[zero-copy]] views over numpy arrays via the [[buffer protocol]].

## Details
- Build with `setup.py` + `pybind11.get_include()`, or modern `pyproject.toml` + `scikit-build-core`.
- Container conversions are automatic: `std::vector<int>` ↔ Python `list`, `std::map` ↔ `dict`, `std::optional` ↔ `None`/value.
- For numpy: `py::array_t<double, py::array::c_style | py::array::forcecast> a` gives a contiguous, castable view; access with `a.unchecked<1>()` for skip-bounds-check inner loops.
- Release GIL only around pure C++ work that does not touch Python objects.
- Smart pointers: `std::unique_ptr<T>` is supported as a holder; `std::shared_ptr<T>` requires `py::class_<T, std::shared_ptr<T>>`.
- Inheritance from a Python class in C++ uses [[trampoline classes]] to forward overrides back to Python.
- Use `py::pickle()` to make C++-defined classes picklable.

## Sources
- [source:pybind11-docs] *pybind11 documentation*, https://pybind11.readthedocs.io/. Confidence: high.
- [source:scikit-build] *scikit-build-core*, https://scikit-build-core.readthedocs.io/. Confidence: medium.

