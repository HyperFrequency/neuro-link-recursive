---
title: Triple-Barrier Labeling
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: ebf3c1e064a9d85a5c0a5640c9f021e497d8ff4e5532d1fcd145530aab94ecb1
---

## Overview
[[Triple-barrier labeling]] (López de Prado) is a path-dependent way to assign supervised-learning labels to financial time series. From each event timestamp, three barriers are set — an [[upper barrier]] (profit target), [[lower barrier]] (stop loss), and [[vertical barrier]] (time limit). The label is determined by which barrier is touched first, capturing realized [[risk-adjusted]] outcomes rather than naive forward returns.

## Conceptual Model
Conventional fixed-horizon labels (`sign(close[t+H] - close[t])`) ignore the *path* — a strategy that hits a 5% stop loss before reaching the +3% target should not be labeled "profitable" just because the price closed up at H. Triple-barrier reframes labeling as a [[first-passage problem]] on a [[volatility]]-scaled grid: profit and stop barriers are typically `±k * sigma_t` (where sigma is rolling volatility), and the time barrier `H` caps the holding period [source:lopez-mldp]. The label is `+1` if the upper barrier is touched first, `-1` for lower, and `0` (or `sign(close[T] - close[t])`) for vertical.

## Details
- Use [[meta-labeling]]: a primary model emits a [[side]] (long/short) signal, the secondary ML model predicts whether to *act* — recasts the problem as "size, don't pick".
- Volatility-scaled barriers adapt to regime: same `k=1` is loose in high-vol periods, tight in calm.
- [[Sample weights]] should account for label overlap when concurrent events share returns; [[uniqueness weights]] correct that.
- Pair with [[purged k-fold CV]] and [[embargo]] to prevent train/test leakage on overlapping observations.
- Choose events by a [[symmetric CUSUM filter]] rather than fixed time windows to focus on regime breaks.
- Output of triple-barrier feeds directly into [[meta-labeling]] classifiers (gradient boosting, RF) on engineered features.

## Sources
- [source:lopez-mldp] López de Prado, *Advances in Financial Machine Learning*, Wiley 2018, Ch. 3. Confidence: high.
- [source:lopez-meta] López de Prado, *Building Diversified Portfolios that Outperform Out-of-Sample*, J. Portfolio Mgmt 2016. Confidence: medium.

