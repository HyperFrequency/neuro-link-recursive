---
title: Python Regex Anchors: caret-dollar vs A-Z
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 8fcbabc79e4584c7ec0447d719914f88e71ee92584639ebfb0b55e87118db814
---

## Overview
Python re module: caret (^) and dollar ($) are NOT pure string anchors. Dollar matches at end-of-string AND immediately before a trailing newline (even without re.MULTILINE). For absolute string boundaries use \A and \Z.

## Conceptual Model
re.search('^abc$', 'abc\n') -> MATCHES (surprising; the newline is allowed past dollar)
re.search('\Aabc\Z', 'abc\n') -> does NOT match
re.MULTILINE flag makes caret/dollar match at internal newline boundaries too - different scope than the trailing-newline behavior.

## Details
- This bit Django auth: UnicodeUsernameValidator(regex='^[\w.@+-]+$') allowed 'user\n' past validation
- Fix: use \A...\Z for full-string match in validators
- re.fullmatch(pattern, string) is equivalent to wrapping in \A...\Z
- For tokenizers/lexers: prefer \A and \Z to avoid trailing-newline pitfalls
- re.match anchors at start (like \A) but does NOT anchor at end - partial match returns

## Sources
- [source:python-docs] https://docs.python.org/3/library/re.html#regular-expression-syntax
- [source:django-issue] https://code.djangoproject.com/ticket/30609

