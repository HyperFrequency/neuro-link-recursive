---
title: Django Migrations Autodetector
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 71f4a0d11994cd03e4e742eb99447404a6ebbdf2fb97a6c340f3a18385a2f07f
---

## Overview
django/db/migrations/autodetector.py diffs the current model state against the historical migration state to generate new migration ops (CreateModel, AddField, AlterField, etc.).

## Conceptual Model
ProjectState (built from existing migrations) vs ModelState (from current models.py) -> diff produces an ordered list of operations. Topological sort respects FK dependencies. Ambiguous renames trigger interactive prompt; --noinput treats them as add+drop.

## Details
- MigrationAutodetector.changes(graph, trim_to_apps, convert_apps) is the main entry
- Renames detected by matching field signatures (type + key kwargs) - fragile if too many things change at once
- RunPython requires both forward and reverse callable for reversible migrations
- squashmigrations <app> <last> collapses many migrations into one with replaces=[...]
- Common bug: model with ordering change generates AlterModelOptions on every makemigrations even when meta unchanged

## Sources
- [source:django-source] django/db/migrations/autodetector.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/topics/migrations/

