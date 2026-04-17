---
title: Transaction Cost Modeling
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 5379b1dc733bec8dcc844bb963f26e43a3e87fded72d396d56f4accd90f001a3
---

## Overview
[[Transaction costs]] (TC) are the single biggest reason live trading underperforms backtests. A realistic TC model combines four components: [[bid-ask spread]] paid by takers, [[slippage]] from price drift between decision and fill, [[fees and commissions]] charged by venues/brokers, and [[market impact]] from your own size moving the price. Underestimating any one inflates apparent Sharpe by 0.3-1.0+.

## Conceptual Model
The total round-trip cost is roughly `2 * (½spread + slippage + fee) + impact(size)` where impact scales sub-linearly with order size [source:almgren-chriss]. The [[Almgren-Chriss]] model splits impact into [[temporary]] (spread/queue jumps that recover) and [[permanent]] (information leakage that doesn't); both depend on size relative to [[ADV]] and stock-specific volatility. For [[VWAP]]/[[TWAP]] schedules, impact is integrated over the slicing window.

## Details
- Spread: model as `0.5 * mean(quoted_spread)` for top-of-book takes, larger for through-the-book.
- Slippage: simplest is `k_bps` constant; better is `k * sigma_per_period` (proportional to vol).
- Fees: maker rebates (negative cost) vs taker fees vary by venue; tiered by 30-day volume.
- Market impact (square-root law): `impact = c * sigma * sqrt(qty / ADV)`.
- For small-cap or low-volume tickers, impact dominates — strategies don't scale linearly with capital.
- Backtest with realistic costs *during* development, not as a final adjustment — many "alpha" signals vanish.
- Use [[implementation shortfall]] = `(decision_price - average_fill_price) * sign(qty)` to measure realized TC live.
- Model intraday cost variation: spreads widen at open and into close, narrow midday.

## Sources
- [source:almgren-chriss] Almgren & Chriss, *Optimal Execution of Portfolio Transactions*, J. Risk 2000. Confidence: high.
- [source:kissell-2014] Robert Kissell, *The Science of Algorithmic Trading and Portfolio Management*, Academic Press 2014. Confidence: high.

