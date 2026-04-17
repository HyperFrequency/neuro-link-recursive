---
title: Django Related Fields (FK / M2M / OneToOne)
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: b2703c990bfceeb0fd02153482735a0e37aafabc4f4d0a661c694c979c79c1f1
---

## Overview
django/db/models/fields/related.py implements ForeignKey, ManyToManyField, OneToOneField. They contribute reverse relations to the target model and create implicit through-tables for M2M.

## Conceptual Model
ForeignKey(Author) on Book gives book.author (forward) and author.book_set (reverse, default name from _set). related_name='books' overrides. M2M: tags = ManyToManyField(Tag) creates book_tags through-table; access via book.tags.all() and tag.book_set.all().

## Details
- ForeignKey.contribute_to_class adds the descriptor; contribute_to_related_class adds the reverse manager
- on_delete required since Django 2.0 - ForeignKey() without it raises TypeError
- M2M with extra fields: define a through= model explicitly
- select_related('author') -> SQL JOIN, eager-loads forward FK
- prefetch_related('tags') -> second query + Python join, for reverse/M2M
- Common bug: lazy related_name collision when two FK fields target same model - set distinct related_name

## Sources
- [source:django-source] django/db/models/fields/related.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/ref/models/fields/#module-django.db.models.fields.related

