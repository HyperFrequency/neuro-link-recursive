---
title: Risk Metrics: Sharpe, Sortino, Calmar, MAR
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: d8c86ebdcc4535091c5a973e26900dc5e60711ebff6aed0f4a70e7830a6a1922
---

## Overview
[[Risk-adjusted return]] metrics try to summarize a strategy's quality in one number. [[Sharpe]] divides excess return by total volatility; [[Sortino]] only penalizes downside vol; [[Calmar]] / [[MAR]] divide return by max drawdown. Each emphasizes a different definition of "risk", and the right choice depends on the investor's actual loss tolerance.

## Conceptual Model
The [[Sharpe ratio]] = `(mean_return - rf) / std(return)` assumes investors care equally about up- and down-vol, which Markowitz-style mean-variance investors do but most humans do not [source:sharpe-1994]. The [[Sortino ratio]] replaces total std with [[downside deviation]] (only returns below a [[target return]] count), penalizing only adverse vol. The [[Calmar ratio]] = `annualized_return / |max_drawdown|` measures recovery; [[MAR]] is conceptually the same, often computed over the full track record.

## Details
- Sharpe: works when returns are roughly Gaussian and investors hate vol symmetrically. Misleading for skewed strategies (premium-collection / short-vol).
- Sortino: better for asymmetric strategies where occasional big winners aren't "risk".
- Calmar/MAR: investor-facing — drawdown is what causes redemptions in real funds.
- [[Annualization]]: multiply mean by N (periods/yr) and std by sqrt(N); breaks under autocorrelation.
- [[Deflated Sharpe Ratio]] (Bailey-López de Prado) penalizes for the number of trials tested.
- [[Probabilistic Sharpe Ratio]] gives confidence the true Sharpe exceeds a threshold given the sample.
- Always report drawdown duration alongside depth — a 20% drawdown lasting 2 years is worse than 20% lasting 2 weeks.
- [[Omega ratio]] generalizes Sortino over a full distribution threshold.

## Sources
- [source:sharpe-1994] William Sharpe, *The Sharpe Ratio*, J. Portfolio Mgmt 1994. Confidence: high.
- [source:sortino-1994] Sortino & Price, *Performance Measurement in a Downside Risk Framework*, J. Investing 1994. Confidence: high.
- [source:bailey-deflated] Bailey & López de Prado, *The Deflated Sharpe Ratio*, J. Portfolio Mgmt 2014. Confidence: high.

