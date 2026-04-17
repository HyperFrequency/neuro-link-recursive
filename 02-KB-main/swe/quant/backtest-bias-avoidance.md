---
title: Backtest Bias Avoidance
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 8d48536931f3a7964e85c44b9ee28142f38d70a4175dc3c2ad2e5543fa99be6e
---

## Overview
A backtest is only as good as the [[biases]] it controls for: [[look-ahead bias]] (using future info), [[survivorship bias]] (only including current constituents), and [[data-snooping bias]] (over-fitting to the test set). Each can inflate apparent returns by orders of magnitude. Discipline plus structurally honest data pipelines are the only durable defenses.

## Conceptual Model
[[Look-ahead bias]] occurs when a signal at time t uses information not available until t+1: misaligned timestamps, restated fundamentals, or `request.security` with `lookahead_on` in [[Pine Script]] [source:bailey-pseudo]. [[Survivorship bias]] arises from datasets that drop delisted/bankrupt symbols, so the backtest universe is implicitly conditioned on having survived. [[Data-snooping bias]] (a.k.a. [[selection bias]]) inflates Sharpe ratios when many strategies are tested on the same data and only winners are reported — Bonferroni or [[Deflated Sharpe Ratio]] adjustments are required to correct.

## Details
- Timestamp every signal with the moment information was *publicly available*, not the as-of date in the cleaned file.
- Use [[point-in-time]] fundamentals (no restatements); trade only on T+1 of release.
- Include delisted symbols ([[CRSP]], [[Norgate Data]], [[QuantConnect]] all offer survivorship-free universes).
- Walk-forward / out-of-sample tests reduce data-snooping but do not eliminate it; track how many configurations you tried.
- [[Combinatorially Purged Cross-Validation]] (López de Prado) addresses overlapping observations in financial CV.
- Embargo periods between train/test prevent label leakage when predictors and labels overlap in time.

## Sources
- [source:bailey-pseudo] Bailey & López de Prado, *Pseudo-Mathematics and Financial Charlatanism*, Notices of the AMS 2014. Confidence: high.
- [source:lopez-mldp] López de Prado, *Advances in Financial Machine Learning*, Wiley 2018. Confidence: high.

