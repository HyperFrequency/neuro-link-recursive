---
title: Django ORM Patterns
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 514dad0ea5eb093dd592d1f9369e5dda1c2b2e54c0e7d7bb47e9e41572219915
---

## Overview Django ORM common bug surfaces: N+1 queries, querysets are lazy, `.update()` bypasses signals, `select_related()` for FK joins, `prefetch_related()` for reverse/M2M.  ## Conceptual Model Lazy: `qs = Model.objects.filter(...)` does NOT hit DB. Hits on iteration, `len()`, `bool()`, slicing. Use `.exists()` for existence checks (cheaper).  ## Details - Use `assertNumQueries(N)` in tests to catch N+1 - `select_related` does SQL JOIN - `prefetch_related` does extra query + Python-side join - Migrations: `makemigrations` then `migrate`  ## Sources - [source:django-docs] https://docs.djangoproject.com/en/5.0/topics/db/queries/ 
