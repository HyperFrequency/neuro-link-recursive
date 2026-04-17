---
title: Monte Carlo Bootstrap of Historical Paths
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 8fa5c1286ebf4123f01f78f7f7c87b10a31d0e83e8d7144bcc26ed9df304da15
---

## Overview
[[Monte Carlo simulation]] over historical paths quantifies the *distribution* of strategy outcomes rather than the single realized one. Plain [[bootstrap]] samples returns with replacement — destroying autocorrelation. [[Block bootstrap]] preserves short-range dependence by sampling contiguous blocks. The resulting distribution gives realistic [[confidence intervals]] on Sharpe, drawdown, and tail risk.

## Conceptual Model
The single observed equity curve is one draw from the joint distribution of returns; reporting only its Sharpe pretends the future will perfectly resemble that one path [source:politis-romano]. [[IID bootstrap]] resamples returns independently with replacement to generate alternate histories — valid only if returns are truly serially independent (rarely true). [[Block bootstrap]] (Politis-Romano [[stationary bootstrap]] or fixed-length [[moving block]]) samples blocks of length `L` to preserve autocorrelation, where `L` is calibrated to match the dependency horizon (often via the Politis-White rule).

## Details
- IID: `sample(returns, size=N, replace=True)` — fastest, biased low on max drawdown for trending strategies.
- Block bootstrap with block length `L`: pick start indices uniformly, take `L` consecutive returns, concatenate.
- Stationary bootstrap: random block lengths from a geometric distribution with mean `L` — preserves stationarity at boundaries.
- Calibrate `L` via [[Politis-White]] automatic block length: based on the autocorrelation function of returns.
- For trade-level analysis, bootstrap *trades* (or trade returns), not bar returns — preserves the strategy's conditional structure.
- Use thousands of resamples (5k-10k typical) and report 5/50/95 percentiles of equity, drawdown, Sharpe.
- Doesn't fix structural risks (regime change, model breakdown, tail risk beyond historical worst case).
- Combine with [[stress testing]]: scenario shocks beyond observed history.

## Sources
- [source:politis-romano] Politis & Romano, *The Stationary Bootstrap*, JASA 1994. Confidence: high.
- [source:lahiri-bootstrap] S.N. Lahiri, *Resampling Methods for Dependent Data*, Springer 2003. Confidence: high.

