---
title: Reading Test Failures
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 3ba30136bed0b4b8d7f2d1ab7fbefba21ac39d5c73653eacf2114de99d316a73
---

## Overview A test failure has 3 useful parts: (1) which assertion failed, (2) the actual vs expected, (3) the call stack. Skip framework noise; focus on the user-code frame nearest the assertion.  ## Conceptual Model Pytest output structure: ``` FAILED test_x.py::test_y - AssertionError: expected 5, got 3   test_x.py:42: in test_y       assert calc(2,2) == 5   src/calc.py:10: in calc       return a - b   # <-- bug here ```  ## Details - `pytest -vv` shows full diffs for assert equality - `pytest --tb=short` for shorter tracebacks; `--tb=long` for full - `pytest --pdb` drops into debugger on failure - `pytest -p no:cacheprovider` disables cache when debugging weird state  ## Sources - [source:pytest-docs] https://docs.pytest.org/en/stable/how-to/output.html 
