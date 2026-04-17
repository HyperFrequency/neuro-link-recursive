---
title: SymPy Symbolic Debugging
domain: scientific-computing
confidence: high
last_updated: 2026-04-17
sha256: e01d6166e239f5392d58c29b6e100572b979c03f4fc9757e9c053768992fe88d
---

## Overview SymPy is symbolic math. Bugs often: simplification too aggressive (loses domain), assumptions mismatch (real vs complex), printing differs from internal repr.  ## Conceptual Model Everything is a Symbol or expression tree. `sympify(x)` parses; `simplify(x)` reshapes; `expand(x)` distributes; `factor(x)` factors. Use `srepr(x)` to see internal tree, not pretty print.  ## Details - `Symbol("x", real=True)` vs default complex matters for sqrt etc. - `Eq(a,b)` is symbolic equality, not Python == - Pin sympy version: behavior changes between releases - Test by `assert expr.equals(expected)`, not `==`  ## Sources - [source:sympy-docs] https://docs.sympy.org 
