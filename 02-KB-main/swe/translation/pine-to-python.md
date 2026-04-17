---
title: Pine Script to Python Translation
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 6b58fe4ca14d8d78a1aa2df89eb91bb35ddc89a2cfa618682e658a8187453200
---

## Overview
Translating [[Pine Script]] to [[Python]] is mostly a shift from *bar-by-bar* execution with implicit series indexing to *vectorized* computation over [[pandas]]/[[numpy]] arrays. The mental swap is: `close[1]` becomes `close.shift(1)`, `var` accumulators become rolling reductions, and the implicit "current bar" becomes an explicit index loop or vector op. Most Pine indicators have one-line vectorized equivalents.

## Conceptual Model
Pine maintains an implicit cursor at the latest bar with `close`, `close[1]` etc. resolved against that cursor. A [[vectorized translation]] in Python operates on whole [[Series]] objects: `ema = close.ewm(span=N, adjust=False).mean()` replaces a manual recursive update [source:pandas-docs]. State that crosses bars (e.g. `var int trade_count = 0`) maps to either a [[scan]]/`reduce` over the Series or, for complex logic, an explicit `for i in range(len(df))` loop — the latter is what backtesting frameworks like [[NautilusTrader]] and [[backtesting.py]] actually do internally.

## Details
- `ta.sma(close, N)` → `close.rolling(N).mean()`.
- `ta.ema(close, N)` → `close.ewm(span=N, adjust=False).mean()`.
- `ta.crossover(a, b)` → `(a > b) & (a.shift(1) <= b.shift(1))`.
- `request.security(sym, "D", close)` → resample on a higher-timeframe DataFrame, merge_asof with `direction="backward"` and shift by 1 to avoid lookahead.
- `barstate.isconfirmed` has no equivalent — historical bars are always confirmed; for live, gate on bar-close timestamp.
- `var x = ...; x := x + 1` for stateful counts → `df["x"] = (some_condition).cumsum()` when possible.
- Strategy fills: Pine fills at next-bar-open by default; replicate by shifting signal: `position = signal.shift(1)`.
- For tick-by-tick / event-driven parity, use [[NautilusTrader]] or [[backtesting.py]] rather than vectorizing.

## Sources
- [source:pandas-docs] *pandas User Guide*, https://pandas.pydata.org/docs/. Confidence: high.
- [source:pine-docs] *Pine Script v6 Reference Manual*, https://www.tradingview.com/pine-script-docs/. Confidence: high.

