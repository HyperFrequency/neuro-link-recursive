---
title: Python Typing, mypy, and Pydantic v2
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 20ec482ccaf142f6368e748493cee9f2f387914adf2fb5d1011c94c1521c4d77
---

## Overview
[[Python typing]] adds optional static-type annotations checked by tools like [[mypy]] or [[pyright]] without affecting runtime behavior. [[Pydantic v2]] uses those annotations to *enforce* types at runtime via a Rust-backed validator (`pydantic-core`), giving fast parsing, validation, and serialization. Together they catch bugs early and make data boundaries explicit.

## Conceptual Model
Annotations live in `__annotations__` and are inert at runtime unless something inspects them; [[mypy]] performs flow-sensitive [[type inference]] over them to find `None` dereferences, wrong arg types, and unreachable branches. [[Pydantic v2]] reads annotations from a `BaseModel` subclass, compiles a [[validator schema]] (core schema), and runs it on each `Model(**data)` call [source:pydantic-v2]. The validator coerces or rejects inputs based on `model_config` (e.g. `strict=True` disables coercion).

## Details
- Modern syntax: `list[int]`, `dict[str, X]`, `int | None` (PEP 604) — no `from typing import List`.
- `TypedDict`, `Protocol`, `Literal`, `NewType`, `ParamSpec`, `Self` cover most edge cases.
- `Annotated[int, Field(gt=0)]` carries metadata Pydantic uses for constraints.
- `mypy --strict` enables `disallow_untyped_defs`, `no_implicit_optional`, and friends — recommended for new code.
- Pydantic v2 changes vs v1: `.model_dump()` instead of `.dict()`, `.model_validate()` instead of `parse_obj()`, faster, stricter `Optional` semantics.
- Validators: `@field_validator("x")` for one field, `@model_validator(mode="after")` for cross-field invariants.
- `Field(..., alias="camelCase")` + `model_config = ConfigDict(populate_by_name=True)` handles JSON casing.

## Sources
- [source:pydantic-v2] *Pydantic v2 Documentation*, https://docs.pydantic.dev/2.0/. Confidence: high.
- [source:mypy-docs] *mypy Documentation*, https://mypy.readthedocs.io/. Confidence: high.
- [source:pep-484] van Rossum et al., *PEP 484*, https://peps.python.org/pep-0484/. Confidence: high.

