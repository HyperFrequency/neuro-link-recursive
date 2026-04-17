---
title: Git Workflow for SWE-Bench
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: f5bcae57253ff21b1e763ec8347bcd8d9b18125314f7ff9214bd971bbcffb9d4
---

## Overview SWE-Bench tasks present a repo at a base_commit and ask you to write a patch that makes failing tests pass. Workflow: clone, checkout base_commit, run tests to confirm failure, edit, run tests to confirm green, generate patch.  ## Conceptual Model ``` git clone https://github.com/<repo> cd <repo> git checkout <base_commit> pip install -e ".[test]" pytest <FAIL_TO_PASS_test>  # confirm RED # ... edit code ... pytest <FAIL_TO_PASS_test>  # confirm GREEN pytest <PASS_TO_PASS_tests> # confirm no regression git diff > patch.diff ```  ## Details - FAIL_TO_PASS: tests currently failing that the patch must make pass - PASS_TO_PASS: tests currently passing that the patch must not break - Patch is unified diff format, applied with `git apply patch.diff`  ## Sources - [source:swe-bench-paper] https://arxiv.org/abs/2310.06770 
