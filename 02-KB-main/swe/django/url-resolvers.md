---
title: Django URL Resolvers
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 590acc37d8d773909d2181fbbfad0a572f9805ff7757a0455b053c14888088aa
---

## Overview
django/urls/resolvers.py matches incoming URLs to view functions. URLResolver (for include()) and URLPattern (for path()/re_path()) form a tree. resolve(path) walks it; reverse(name) does the inverse lookup.

## Conceptual Model
URL config -> tree of URLResolver(URLPattern, ...). path('articles/<int:pk>/', view) compiles to a regex via RoutePattern. re_path uses raw regex. reverse() walks named URLs to construct paths back.

## Details
- RoutePattern.match returns (new_path, args, kwargs) if it matches; None otherwise
- URLResolver.urlconf_module is the include()d module - lazily imported
- Namespaced URLs: reverse('admin:auth_user_changelist') - colon separates namespace from name
- Common bugs: trailing-slash mismatch, regex anchoring, converter not registered, lazy include() import order
- i18n_patterns wraps URLs in a translatable language prefix

## Sources
- [source:django-source] django/urls/resolvers.py
- [source:django-docs] https://docs.djangoproject.com/en/stable/topics/http/urls/

