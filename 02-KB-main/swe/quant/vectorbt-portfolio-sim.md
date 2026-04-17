---
title: Vectorbt Portfolio Simulation
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: dd44adb8f80f0c32d15acc34e56838194cf2ec06d0fa56bd8d957e942a361fda
---

## Overview
[[vectorbt]] is a Python backtesting library that vectorizes portfolio simulation across many assets, parameter combinations, and signals using [[NumPy]] / [[Numba]]. Its two main entry points are `Portfolio.from_signals` (long/short signals → trades) and `Portfolio.from_orders` (raw order quantities). It excels at parameter sweeps and statistical analysis but lacks the event-driven realism of [[NautilusTrader]] for tick-level simulation.

## Conceptual Model
`from_signals(close, entries, exits, ...)` interprets boolean entry/exit arrays into discrete trades, applying fees, slippage, and accumulation rules in vectorized fashion [source:vectorbt-docs]. `from_orders(close, size, ...)` is more flexible: pass raw size (positive = buy, negative = sell, NaN = no-op) for finer control. Both produce a [[Portfolio]] object exposing trades, equity curves, drawdown series, and 30+ stats. Numba JIT compiles the inner simulation loop, making millions of parameter combinations feasible.

## Details
- `from_signals(..., size=np.inf, fees=0.001, slippage=0.001)` — `np.inf` means use all available cash; size can be fractional.
- `accumulate=True` lets repeated entry signals stack positions; default replaces.
- `direction='longonly' | 'shortonly' | 'both'` controls allowed sides.
- Multi-asset: pass 2D arrays — vectorbt simulates each column independently (no cross-asset cash sharing without `group_by`).
- Parameter sweeps: build a wide DataFrame with `MultiIndex` columns (each combo a column) and run once.
- `vbt.IndicatorFactory` wraps any function into a vectorized indicator with parameter sweeping and caching.
- Limitations: no per-bar order book, no partial fills mid-bar, no realistic queue position; for that, switch to [[NautilusTrader]] or [[backtesting.py]].

## Sources
- [source:vectorbt-docs] *vectorbt documentation*, https://vectorbt.dev/. Confidence: high.
- [source:vectorbtpro-docs] *vectorbtpro documentation*, https://vectorbt.pro/. Confidence: medium.

