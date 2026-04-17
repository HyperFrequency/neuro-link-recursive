---
title: Pytest Fixtures and Debugging
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 1fbd6b24b2ef73b971ab064b3ee4d4382049f1735f875a7db139e18fd9f5acd2
---

## Overview Fixtures provide test setup. Scope: function (default) | class | module | session. Yield-based fixtures support teardown.  ## Conceptual Model ```python @pytest.fixture def db():     conn = create_db()     yield conn     conn.close()  def test_x(db):     assert db.query(...) ```  ## Details - `--setup-show` traces fixture setup/teardown - `request.param` for parametrized fixtures - `autouse=True` injects without explicit arg - Find bugs by isolating a fixture: replace it with a minimal value and check  ## Sources - [source:pytest-fixtures] https://docs.pytest.org/en/stable/explanation/fixtures.html 
