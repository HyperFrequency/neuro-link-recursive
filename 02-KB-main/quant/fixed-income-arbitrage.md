---
title: Fixed-Income Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 3e31e938a2025548ed24cd4d02e2a2b80cc0e361f82c7a48dffd9f3a1ad228cc
---

---
title: Fixed-Income Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Yield Curve Modeling Nelson-Siegel Svensson]]"
  - "[[Duration and Convexity Hedging]]"
  - "[[PCA on Rates]]"
---

# Fixed-Income Arbitrage

## Overview
Fixed-income arbitrage (FI arb) exploits relative mispricings among bonds, swaps, futures, and derivatives of similar credit and duration but different liquidity, tax, or instrument conventions. Trades are typically near-duration-neutral with returns from spread convergence amplified by leverage.

## Conceptual Model
FI arb identifies pairs/baskets of instruments that should price to the same discount curve modulo known wedges (convexity, financing, tax). When market prices deviate beyond fair-value bands, the arbitrageur longs cheap / shorts rich, waits for convergence, and hedges interest-rate risk via [[Duration and Convexity Hedging]].

## Details
Classic sub-strategies:

1. **On-the-run vs off-the-run Treasuries**: newly-issued (on-the-run) bonds trade at a liquidity premium vs older (off-the-run) bonds with similar maturity. Arb: long off-the-run, short on-the-run, DV01-matched. LTCM's main trade; profitable in calm markets, ruinous in flight-to-liquidity episodes.

2. **Swap spread**: LIBOR/SOFR swap rate minus Treasury yield at same tenor. Compresses/widens with credit conditions and hedging demand. Trade: receive swap + short Treasury (or vice-versa). Weekly P&L driven by repo specialness and bank capital changes.

3. **Basis trade**: cash Treasury vs Treasury futures. The futures invoice price reflects the cheapest-to-deliver (CTD) bond plus delivery options. Long cash / short futures captures the net basis = forward price − futures price. Repo and CTD switches drive the trade.

4. **Butterflies on the curve**: e.g., long 5Y, short 2Y and 10Y in DV01-weighted 2:1 ratio (butterfly) profits from curvature changes. See [[Yield Curve Modeling Nelson-Siegel Svensson]] and [[PCA on Rates]].

5. **Cross-currency basis**: EUR/USD FX swap implied rates vs on-shore money rates. Persistent negative basis (EUR side cheaper to fund) offers carry, but reflects regulatory/balance-sheet costs.

6. **TIPS vs Treasury breakevens**: real yield + inflation swap vs nominal yield triangulation.

Risk characteristics: Sharpe 1–2 in benign environments with 8–15x leverage; tail risk from funding shocks (2008, 2020) where repo freezes force unwinds. LTCM's 1998 collapse remains the canonical failure.

Implementation: requires prime broker margin, repo access, ISDA master agreements, collateral management, and real-time curve analytics. Operational tax is substantial.

Modeling: Nelson–Siegel/Svensson curve fits, cubic B-splines, dynamic factor models (DFM-rates), Kalman filter state-space updates. Residuals flag opportunities.

Market making overlap: dealer franchise often runs FI arb internally as natural offset to client flow.

## Applications
Hedge fund sleeves (relative value), bank proprietary trading under regulatory limits, insurance and pension ALM residual optimization.

## Open Questions
- Post-SLR balance-sheet constraints on arb capacity
- Machine-learned convergence-time forecasting

## Sources
[source:duarte-2007] Duarte, Longstaff, Yu, "Risk and return in fixed income arbitrage", RFS, 2007. Confidence: high.
[source:lowenstein-ltcm] Lowenstein, *When Genius Failed*, 2000. Confidence: high.

