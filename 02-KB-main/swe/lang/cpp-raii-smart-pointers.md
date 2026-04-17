---
title: C++ RAII, Smart Pointers, and Move Semantics
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 6b1d449a3f6fa105353059e4fa3fc8fafb1bab07a06321e4f1cc78fc15826be2
---

## Overview
[[RAII]] (Resource Acquisition Is Initialization) ties resource lifetime to object lifetime: the constructor acquires, the destructor releases — exception-safe and deterministic. [[Smart pointers]] (`unique_ptr`, `shared_ptr`) apply RAII to heap memory, replacing raw `new`/`delete`. [[Move semantics]] (C++11+) let ownership transfer cheaply without copying.

## Conceptual Model
An [[RAII type]] owns a resource (heap memory, file, socket, mutex) acquired in its constructor and released in its destructor; stack unwinding during exceptions guarantees release [source:stroustrup]. `std::unique_ptr<T>` is a non-copyable, movable owner — zero overhead vs raw pointer. `std::shared_ptr<T>` adds a [[reference count]] (atomic) for shared ownership; cycles are broken with `weak_ptr`. [[Move semantics]] introduce [[rvalue references]] (`T&&`) and `std::move` to convert an lvalue to an xvalue, enabling the move constructor / move assignment to steal resources instead of deep-copying.

## Details
- Prefer `std::make_unique<T>(args)` over `unique_ptr<T>(new T(args))` (exception safety, no double allocation).
- `unique_ptr` is the default; reach for `shared_ptr` only when ownership is genuinely shared.
- `shared_ptr` is *not* free: 16 bytes + atomic ref-count operations on copy/destroy.
- Rule of zero: design types so the compiler-generated special members are correct; reach for [[Rule of Five]] only for resource-owning types.
- `std::move(x)` is a cast, not a move — it just enables the move overload to be selected.
- Don't dereference moved-from objects (state is "valid but unspecified"); reassign first.
- Lock guards (`std::lock_guard`, `std::unique_lock`, `std::scoped_lock`) are RAII for mutexes.

## Sources
- [source:stroustrup] Bjarne Stroustrup, *The C++ Programming Language*, 4th ed. Confidence: high.
- [source:cppref-smart] *cppreference: Smart Pointers*, https://en.cppreference.com/w/cpp/memory. Confidence: high.
- [source:meyers-effective] Scott Meyers, *Effective Modern C++*, O'Reilly 2014. Confidence: high.

