---
title: Iron Condor and Butterfly
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 77772f6b1fa2404550b6d1e25c45cb16fb6cc62f88e3c5dab721c4a259cb37ff
---

---
title: Iron Condor and Butterfly
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Risk Reversal and Collar]]"
  - "[[Calendar Spreads and Time Decay]]"
---

# Iron Condor and Butterfly

## Overview
Iron condors and butterflies are defined-risk, non-directional spreads that profit from realized volatility staying below implied. Condors use four strikes forming a wide plateau; butterflies use three strikes forming a peak. Both harvest theta while capping both wings' losses.

## Conceptual Model
Iron condor: short strangle $+$ long strangle farther OTM, so short put at $K_2$, long put at $K_1 < K_2$, short call at $K_3$, long call at $K_4 > K_3$, with $K_1 < K_2 < K_3 < K_4$. Iron butterfly: short straddle at ATM $K$ + long wings at $K \pm w$. Both are short vega, short gamma, long theta positions benefiting when price pins between short strikes.

## Details
Iron condor max profit = net credit received = $(P_2 - P_1) + (C_3 - C_4)$, achieved when $K_2 \le S_T \le K_3$. Max loss = width $(K_2 - K_1)$ or $(K_4 - K_3)$ minus credit. Break-evens: $K_2 - \text{credit}$ and $K_3 + \text{credit}$.

Greeks at inception (ATM-centered, balanced strikes):
- Delta: near zero
- Gamma: negative, peaks between short strikes
- Vega: negative (short volatility)
- Theta: positive, maximum near middle

Iron butterfly has higher theta and vega exposure than condor of similar width but narrower profit zone.

Risk characteristics: theta benefit is front-loaded in last 30 days. Gamma risk accelerates as spot approaches short strikes near expiry ("gamma scalping against you"). Vega spike during earnings or crises can cause temporary mark-to-market drawdowns even if realized vol ends up fine.

Position sizing: treat max loss as the capital at risk, not the margin. Credit-to-max-loss ratios of 25–35% are typical quotes for one-standard-deviation condors at ~45 DTE (days to expiry).

Management tactics: close at 50% of max profit (Tom Sosnoff rule of thumb), roll untested side inward, adjust with an opposing spread when breached.

Relation to other strategies: iron condor = short strangle + protective wings (long strangle). Broken-wing butterfly skews risk to one side by shifting one wing. Jade lizard = short put + short call spread = condor minus one put.

Volatility regime sensitivity: profitable when implied vol rank is high (implied > realized) and price stays range-bound. Loses when vol expands (e.g., surprise macro events) or directional move breaches short strikes.

## Applications
Monthly income overlays on SPX/SPY, earnings announcement plays on names with elevated implied vol, systematic short-vol strategies diversified across tickers.

## Open Questions
- Optimal strike placement under stochastic vol with jumps
- Crash-conditional loss distributions under non-Gaussian returns

## Sources
[source:mcmillan-options] McMillan, *Options as a Strategic Investment*, 5e, New York Institute of Finance, 2012. Confidence: high.
[source:tastytrade-research] Tastytrade research videos on condor mechanics. Confidence: medium.

