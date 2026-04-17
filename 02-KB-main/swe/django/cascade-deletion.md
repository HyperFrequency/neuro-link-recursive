---
title: Django Cascade Deletion
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 91baf503514f562c3e1bddea690380966fa2f12abbf2549bd48d437929d6cf33
---

## Overview
django/db/models/deletion.py orchestrates the DELETE cascade. Collector walks reverse FK relations and signal handlers to assemble the full set of objects to delete in dependency order.

## Conceptual Model
Model.delete() -> Collector.collect(objs) -> walks dependencies -> emits per-model DELETE SQL in reverse-dependency order -> fires pre_delete and post_delete signals. on_delete in (CASCADE, PROTECT, SET_NULL, SET_DEFAULT, DO_NOTHING, RESTRICT) controls behavior per FK.

## Details
- Collector.fast_deletes skips signal-fire path for safe single-table deletes (perf)
- Bulk vs single-instance: signals fire on instance.delete(), NOT on qs.delete()
- RESTRICT (Django 3.1+) is like PROTECT but checked AFTER cascade resolution
- Common bug: signal handler raises during delete -> partial cascade leaves DB inconsistent
- Test isolation: TestCase (rolls back) not SimpleTestCase for delete tests

## Sources
- [source:django-source] django/db/models/deletion.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/ref/models/fields/#django.db.models.ForeignKey.on_delete

