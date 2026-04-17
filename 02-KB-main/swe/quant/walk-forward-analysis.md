---
title: Walk-Forward Analysis
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 46035a9db1cab48e37cde440f6861534a0b615ba5129a5bf03551f723dc63ff4
---

## Overview
[[Walk-forward analysis]] is a time-series-aware variant of [[cross-validation]] that respects the arrow of time: optimize on a window, test on the next out-of-sample window, then roll forward. It produces a more honest estimate of live performance than a single train/test split because it averages over many distinct out-of-sample regimes and includes the cost of re-fitting.

## Conceptual Model
A static train/test split assumes the future resembles the single test window — it usually doesn't [source:pardo-walkforward]. Walk-forward slides a [[fitting window]] and an immediately-following [[test window]] across the full history; rolling-window walk-forward keeps the fit window length constant, while anchored ([[expanding-window]]) walk-forward grows it. The aggregate out-of-sample [[equity curve]] across all test windows is the realistic estimate of forward performance.

## Details
- Choose window size by the [[regime]] timescale: too short overfits per-window, too long misses regime changes.
- Always include the full re-optimization step in each walk; otherwise you've leaked future params back into the past.
- [[Anchored walk-forward]] is appropriate when more data is strictly better (slowly-evolving alpha).
- [[Rolling walk-forward]] suits regime-dependent alpha (e.g. volatility-state-dependent).
- Report performance on the *concatenated out-of-sample series*, not the average of per-window Sharpes.
- Combine with [[purged k-fold]] or [[CPCV]] (López de Prado) when training labels overlap test windows.
- Walk-forward does *not* fix data-snooping at the meta-level (how many strategies you tried before settling on this one).

## Sources
- [source:pardo-walkforward] Robert Pardo, *The Evaluation and Optimization of Trading Strategies*, Wiley 2008. Confidence: high.
- [source:lopez-mldp] López de Prado, *Advances in Financial Machine Learning*, Wiley 2018. Confidence: high.

