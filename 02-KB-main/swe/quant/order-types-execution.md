---
title: Order Types and Execution Simulation
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: cf78d1047e531049f15a42e315ac8da6fa3a3cb68b47c9a73e8fff987d4c0408
---

## Overview
Order-type semantics are the core abstraction every [[backtest engine]] must model: [[market]], [[limit]], [[stop]], and [[stop-limit]] each have distinct fill conditions and slippage profiles. Realistic simulation requires modeling [[slippage]], the [[bid-ask spread]], and at the limit-of-realism, [[queue position]] within the [[order book]].

## Conceptual Model
A [[market order]] guarantees execution but not price; in a backtest it is filled at the next available print, with [[slippage]] modeled as a function of size and historical volatility/spread [source:harris-2003]. A [[limit order]] guarantees price but not execution; it fills only if the market trades through the limit price (and ideally only if there is enough volume past the price to clear queue position ahead of you). A [[stop order]] is a contingent market: it converts to a market order when the stop price is touched, then suffers market-order slippage.

## Details
- Naive limit-fill rule: filled if `bar.low ≤ limit ≤ bar.high`. Realistic: also require traded volume past the price.
- Stop-limit composes a stop trigger with a limit fill — can leave you unfilled in fast moves.
- Slippage models: fixed bps, volatility-scaled (`k * ATR`), volume-impact (`k * sqrt(qty / ADV)`).
- Maker/taker fees differ on most venues; limit orders that add liquidity often rebate, market orders pay.
- [[Queue position]] modeling assumes you join the back of the queue at the limit price; a `t.fill = elapsed_volume_at_price > queue_ahead` rule approximates it.
- For backtest realism, use bar-OHLC + volume; for higher realism use [[L1]] (top-of-book) or [[L2]] (full depth) tick data.
- Always include partial fills and rejections in your engine — strategies that assume 100% fills look better than they are.

## Sources
- [source:harris-2003] Larry Harris, *Trading and Exchanges*, Oxford University Press 2003. Confidence: high.
- [source:nautilus-orders] *NautilusTrader Order Types Docs*, https://docs.nautilustrader.io/. Confidence: high.

