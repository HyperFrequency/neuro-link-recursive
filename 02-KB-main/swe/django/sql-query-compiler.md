---
title: Django SQL Query and Compiler
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 8e3640ed2fb4127ae58484aef03a4f10c96530345cfc6f4059d36fa8b93befde
---

## Overview
django/db/models/sql/query.py builds the Query AST; compiler.py translates it to backend-specific SQL. QuerySet operations (filter, annotate, values) mutate the Query lazily; final SQL is generated on iteration.

## Conceptual Model
QuerySet -> Query (Python AST: WhereNode tree, joins, annotations) -> SQLCompiler -> backend SQL string + params. Joins tracked in query.alias_map. Subqueries get their own Query. ORM bugs often: wrong join type promoted, alias collision, as_sql quoting mistakes.

## Details
- Query.add_filter builds WhereNode tree from kwargs like field__lookup=value
- Query.setup_joins resolves field paths to LEFT/INNER joins (default LEFT for nullable FK)
- SQLCompiler.compile(node) is the visitor that walks the AST
- Custom Lookups: subclass Lookup and register on the field/transform
- Inspect generated SQL with str(qs.query) or assertNumQueries(N) in tests

## Sources
- [source:django-source] django/db/models/sql/query.py, compiler.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/topics/db/queries/

