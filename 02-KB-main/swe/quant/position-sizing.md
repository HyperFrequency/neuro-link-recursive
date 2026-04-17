---
title: Position Sizing
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 6c8d62f378d7c10238cf63593d491e2659d279ef0af79b6ec98b2a9d8c08662d
---

## Overview
[[Position sizing]] determines what fraction of capital each trade risks; it dominates long-run [[geometric returns]] more than entry/exit timing. The three canonical schemes are [[Kelly]] (theoretically optimal under known edge), [[fixed-fractional]] (a percentage of equity per trade), and [[volatility targeting]] (size inversely to recent realized vol).

## Conceptual Model
Bet size affects [[geometric growth rate]] not arithmetically: too small leaves money on the table, too large suffers [[volatility tax]] and risks ruin. The [[Kelly criterion]] gives the size maximizing log-wealth: `f* = (bp - q) / b` for a binary bet, or `f* = μ / σ²` continuously [source:kelly-1956]. Real-world practitioners use [[half-Kelly]] or [[quarter-Kelly]] because edge is overestimated in-sample and full Kelly is brutally volatile [source:thorp-kelly]. [[Vol targeting]] sizes positions so each trade's [[ex-ante]] dollar volatility hits a constant target — typically 10-20% annualized portfolio vol.

## Details
- Fixed-fractional: `qty = (equity * risk_pct) / stop_distance` — risk_pct typically 0.5%-2% per trade.
- Vol target: `qty = (equity * vol_target_annual) / (price * sigma_annual)`.
- Kelly with continuous outcomes: `f* = excess_return / variance` per period.
- Use *out-of-sample* vol estimates (rolling 20/60/252 day) — in-sample inflates the denominator.
- Combine: vol-target + Kelly cap so a high-edge signal doesn't blow risk limits.
- Multiple correlated strategies: scale each by its individual signal then constrain at the portfolio level via [[risk parity]] or covariance-aware sizing.
- Drawdown-based de-risking (e.g. `qty *= 0.5 if drawdown > X`) is implicit Kelly with a regime-conditioned edge estimate.

## Sources
- [source:kelly-1956] J.L. Kelly, *A New Interpretation of Information Rate*, Bell Sys Tech J 1956. Confidence: high.
- [source:thorp-kelly] Edward Thorp, *The Kelly Criterion in Blackjack, Sports Betting, and the Stock Market*, 2007. Confidence: high.

