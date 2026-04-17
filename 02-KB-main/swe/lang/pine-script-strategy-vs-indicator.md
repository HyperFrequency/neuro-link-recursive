---
title: Pine Script Strategy vs Indicator
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 331a3f7155fe8f1561509576c9fee84f307b4217a820bc07ae5f8ef5e0787921
---

## Overview
A Pine [[indicator()]] script computes and plots series for visualization or alerts; a [[strategy()]] script additionally simulates a [[broker]] with order placement, fills, equity tracking, and a built-in performance report. Order semantics, fill assumptions, and alert conditions differ subtly between them and are common bug sources.

## Conceptual Model
`indicator()` exposes `alertcondition()` and `alert()` for signal emission but cannot place orders. `strategy()` exposes `strategy.entry/exit/order/close` to a [[backtest engine]] that fills market orders at the next bar's open by default and limit/stop orders on touch within the bar's high-low range [source:pine-strategy]. `process_orders_on_close=true` fills at the *current* bar close instead — closer to live behavior but easy to misuse for [[lookahead bias]]. `calc_on_every_tick=true` recalculates intra-bar (live), introducing repaint risk during development.

## Details
- `strategy.entry("L", strategy.long, qty)` queues a market order; `strategy.order` is more flexible (per-direction, per-id).
- `pyramiding=N` lets you stack N entries in the same direction; default is 1.
- Built-in stats: `strategy.equity`, `strategy.openprofit`, `strategy.netprofit`, accessible as series.
- Alerts: `strategy.entry/exit` automatically generate alerts when wired to "Any alert() function call".
- Default `commission_type=strategy.commission.percent, commission_value=0.0` — set realistic fees.
- `slippage` is in ticks, applied to market orders only; no built-in spread model — bake into limit prices manually.
- Repaint sources: `barstate.isnew` not gated, `request.security` with `lookahead_on`, intra-bar recalc; always validate on bar close before live use.

## Sources
- [source:pine-strategy] *Strategies — Pine Script v6 User Manual*, https://www.tradingview.com/pine-script-docs/en/v6/concepts/Strategies.html. Confidence: high.
- [source:tv-blog-strategy] TradingView Blog, *Strategy Tester*, https://www.tradingview.com/blog/. Confidence: medium.

