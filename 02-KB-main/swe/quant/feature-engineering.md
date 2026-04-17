---
title: Feature Engineering for Time Series Alpha
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: ee41d4a7af428b99655ba1379e7c283964f329b09ee9402fe0ff6ed626255eb5
---

## Overview
Feature engineering for financial time series transforms raw OHLCV into [[stationary]], comparable, signal-bearing inputs for models. The most reliable building blocks are [[returns]] / [[log-returns]], [[rolling z-scores]], [[regime flags]], and rank-based transforms. Stationarity and leakage prevention dominate accuracy gains.

## Conceptual Model
Price series are [[non-stationary]] — their mean and variance drift, breaking most ML assumptions. [[Log returns]] (`r_t = ln(p_t / p_{t-1})`) are approximately stationary, additive across time, and symmetric. [[Rolling z-scores]] (`(x - mean_N(x)) / std_N(x)`) make any feature comparable across symbols and regimes. [[Regime flags]] (binary or categorical state inferred from vol/trend/correlation) inform the model that the data-generating process has changed [source:lopez-mldp].

## Details
- Returns: simple `(p_t - p_{t-1})/p_{t-1}` for short horizons; log-returns for any aggregation.
- Always [[winsorize]] or clip extreme returns before z-scoring to limit outlier influence.
- Cross-sectional rank features (`rank(x) / N` per timestamp) are robust to scale and reduce backtest overfit.
- [[Fractional differentiation]] (López de Prado) keeps memory while inducing stationarity — useful when standard differencing destroys signal.
- Volatility regimes: HV(20), realized vol from intraday, [[VIX]] level, [[GARCH]] state.
- Trend regimes: sign(EMA50 - EMA200), [[ADX]] threshold, structural break tests.
- Avoid leakage: any rolling statistic using `window=N` must have `N` past observations available — `min_periods=N` in pandas.
- Time features: hour/dow/month dummies for intraday/seasonal effects; `time_of_day_in_session` captures U-shape volume curve.

## Sources
- [source:lopez-mldp] López de Prado, *Advances in Financial Machine Learning*, Wiley 2018, Ch. 5. Confidence: high.
- [source:tsay-finance] Ruey Tsay, *Analysis of Financial Time Series*, Wiley 2010. Confidence: high.

