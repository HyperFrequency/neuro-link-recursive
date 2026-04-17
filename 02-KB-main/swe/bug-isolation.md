---
title: Bug Isolation Techniques
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: cd680dd975b4d2c300d40e85eea382165f3539bcaf39c7655f818ba19c018cbf
---

## Overview Isolating a bug means narrowing it from "something is broken" to a single line/condition. Use binary search through commits (git bisect), code paths (printf debugging or breakpoints), and inputs (minimum reproducing example).  ## Conceptual Model 1. Reproduce reliably (write a failing test) 2. Bisect: which commit introduced it? `git bisect start && git bisect bad HEAD && git bisect good <commit>` 3. Bisect within commit: which file/function? Comment out chunks until bug disappears. 4. Find root cause: stack trace + reading the line 5. Fix smallest possible change 6. Add regression test  ## Details - ALWAYS write the failing test before fixing - Read the actual error message — full traceback, not summary - Check assumptions with `assert` or `print(repr(x))` - For flaky tests, run 100x in a loop  ## Sources - [source:debugging-rules] D. Agans, _Debugging_ (book) 
