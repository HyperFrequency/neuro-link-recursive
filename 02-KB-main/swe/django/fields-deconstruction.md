---
title: Django Field Class and deconstruct()
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 43fe8a9f5902cc738e15aba936d5f1edb415906feebf14a9f07ed9c89cca2ed2
---

## Overview
Django model fields (in django/db/models/fields/__init__.py) inherit from Field. The deconstruct() method returns (name, path, args, kwargs) used by migrations to serialize a field back into source code. Subtle bugs often live in deconstruct() not round-tripping non-default kwargs.

## Conceptual Model
Field.__init__ stores attrs (max_length, null, blank, default, validators). deconstruct() returns kwargs that DIFFER from defaults so migrations diff serialized field state. Adding a kwarg requires updating deconstruct() to emit it conditionally; otherwise migrations either churn (false-positive AlterField) or miss real changes.

## Details
- Field.contribute_to_class ties the field to a model
- Field.get_db_prep_value / get_prep_value convert Python <-> DB types
- Field.from_db_value (optional) post-processes loaded values
- Custom field: override deconstruct(), get_internal_type(), conversion methods
- Common bug: validators added in __init__ but not deconstructed -> migration loses them on round-trip

## Sources
- [source:django-source] django/db/models/fields/__init__.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/howto/custom-model-fields/

