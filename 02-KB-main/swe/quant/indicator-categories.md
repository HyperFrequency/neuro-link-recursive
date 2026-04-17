---
title: Indicator Categories
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 59d2b8cae738f0ee8d9cdb5a27fa0889c64ddc6aceacd22900d0cdd7c4717dcb
---

## Overview
Technical indicators fall into four broad categories — [[trend]], [[momentum]], [[volatility]], and [[volume]] — each measuring a different facet of price behavior. Combining indicators *across* categories (e.g. trend + volatility) is generally more informative than stacking redundant ones within a category. Most "new" indicators are linear or non-linear transforms of these primitives.

## Conceptual Model
[[Trend indicators]] (SMA, EMA, [[MACD]]) smooth price to expose direction. [[Momentum indicators]] ([[RSI]], [[Stochastic]], [[ROC]]) measure speed of change. [[Volatility indicators]] ([[ATR]], [[Bollinger Bands]], [[Keltner Channels]]) measure dispersion. [[Volume indicators]] ([[OBV]], [[VWAP]], [[ADV]], [[CVD]]) confirm participation behind price moves [source:murphy-1999]. The key analytical move is asking: "What does this indicator add that the others don't already say?"

## Details
- Trend: SMA(N), EMA(N), MACD = EMA(12) − EMA(26) plus signal=EMA(9 of MACD), [[ADX]] for trend *strength*.
- Momentum: RSI(14), Stochastic %K %D, ROC(N) = `100 * (close - close[N]) / close[N]`.
- Volatility: ATR(14) = mean(true range), Bollinger = SMA(20) ± 2·std(20), [[Keltner]] = EMA(20) ± k·ATR.
- Volume: OBV cumulates `sign(Δclose) * volume`, VWAP = `Σ(price·volume) / Σvolume` (intraday), [[CVD]] cumulates [[delta]] (buy − sell volume).
- Most indicators have lookahead pitfalls only when poorly translated: e.g. centered SMA leaks future.
- [[Wilders smoothing]] used in RSI/ATR is a slightly different EMA — be consistent across your codebase.
- Beware: chaining many indicators of the same family (RSI + Stoch + ROC) creates illusion of confluence with minimal incremental info.

## Sources
- [source:murphy-1999] John Murphy, *Technical Analysis of the Financial Markets*, NYIF 1999. Confidence: high.
- [source:wilder-1978] J. Welles Wilder, *New Concepts in Technical Trading Systems*, 1978. Confidence: high.

