---
title: Pine Script v6 Fundamentals
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 5cef7df1e93929a80ed3b02aa8c4304e80edb38526551b3bf215220ee9e1c5a7
---

## Overview
[[Pine Script v6]] is TradingView's domain-specific language for indicators and strategies. The runtime executes the script *once per bar* on a historical series, with each variable carrying a [[time-series]] history accessible by index (`close[1]` = previous bar's close). Misunderstanding the bar-by-bar execution model and the `request.security()` repaint rules causes most beginner bugs.

## Conceptual Model
A Pine script defines [[series]] (time-aligned arrays) where the current value is implicit and historical values are accessed via the `[]` operator. The runtime calls the script once for each historical bar, then once per [[realtime tick]] on the open bar — values can change until [[bar close]]. `request.security(symbol, tf, expr)` fetches data from another symbol/timeframe but is famously [[repaint]]-prone unless `lookahead=barmerge.lookahead_off` and you offset the result by `[1]` to read only confirmed bars [source:pine-docs].

## Details
- `max_bars_back`: Pine pre-allocates history buffers; if you reference `series[N]` for large N you must declare `max_bars_back=N` or hit "study cannot be loaded" errors.
- `var x = expr` initializes once and persists across bars (counters, accumulators).
- `na` is its own value — propagates through arithmetic; guard with `nz(x, default)`.
- `barstate.isconfirmed` is true only on the historical/closed bar; use it to gate alerts.
- Compile-time vs series: `input.*()` is compile-time; mixing with series-typed args needs care.
- Plotting: `plot()` paints once per bar; `plotshape()` for markers; `bgcolor()` for cell highlights.
- v6 adds `dynamic_requests=true` (default), enabling dynamic symbol/timeframe args, and richer libraries.

## Sources
- [source:pine-docs] *Pine Script v6 Reference Manual*, https://www.tradingview.com/pine-script-docs/. Confidence: high.
- [source:pine-faq] *Pine Script FAQ*, https://www.tradingview.com/pine-script-docs/en/v5/Faq.html. Confidence: medium.

