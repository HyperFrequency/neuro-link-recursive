---
title: Django Lookups and Transforms
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: aeacee161469e0576b51ac34e1af6f6bbd61dd5d20414b36ede159009932015a
---

## Overview
django/db/models/lookups.py defines query lookups (__exact, __icontains, __gt) and Transforms (__year, __lower, __length). Custom lookups subclass Lookup and register on a field.

## Conceptual Model
field__lookup=value -> Field.get_lookup('lookup') returns Lookup class -> instantiated with (lhs, rhs) -> as_sql(compiler, connection) emits SQL. Transforms wrap values: field__year__gt=2020 -> YearTransform(field).get_lookup('gt').

## Details
- Register a custom lookup: Field.register_lookup(MyLookup)
- Lookups used in WHERE clauses; Transforms used to transform values for further lookups
- IntegerField.register_lookup(LikeLookup) adds __like
- Lookup as_sql must escape user input via connection.ops.quote_name and parameterized queries
- Geo/JSONField use lookup classes heavily for __contains, __overlap, __has_key

## Sources
- [source:django-source] django/db/models/lookups.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/howto/custom-lookups/

