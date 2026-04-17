---
title: Risk Reversal and Collar
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: b233acb48f772c0bfda583d85e9e04367ff407ef5e162ec3d7e629c99262075b
---

---
title: Risk Reversal and Collar
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Iron Condor and Butterfly]]"
  - "[[Volatility Skew]]"
---

# Risk Reversal and Collar

## Overview
A risk reversal combines a long out-of-the-money call with a short OTM put (or vice-versa) to synthesize directional exposure at low premium cost; a collar adds an underlying stock position, typically bought stock + long protective put + short upside call. Both express views on direction and [[Volatility Skew]].

## Conceptual Model
Risk reversal = long call $C(K_c)$ + short put $P(K_p)$ with $K_p < S_0 < K_c$. Its payoff replicates synthetic forward exposure concentrated outside the collar range, with minimal time decay at inception if chosen zero-cost. A collar attaches this structure to a long underlying: payoff is truncated between $K_p$ (floor) and $K_c$ (cap). In FX markets, the risk-reversal quote ($\mathrm{RR} = \sigma_{call} - \sigma_{put}$ at fixed delta) is a standard [[Volatility Skew]] proxy.

## Details
P&L at expiry for 25-delta risk reversal:
$$ \mathrm{P\&L}(S_T) = \max(S_T - K_c, 0) - \max(K_p - S_T, 0) - (C - P) $$

Zero-cost structures set $C = P$ by choosing strikes with equal delta magnitudes, making the position fully equivalent to a synthetic forward between the strikes.

Greeks at inception: Delta ~+0.5 to +1.0 (call side) + +0.25 (short put side) = bullish. Vega is small (call vega ~ put vega at similar $|delta|$). Gamma is small except near each strike. Theta slightly negative if long call dominates.

Collar construction: long $S$, long put $P(K_p)$, short call $C(K_c)$.
- Payoff: $\max(K_p, \min(S_T, K_c)) - (\text{net premium}) - S_0$
- Caps upside at $K_c$, floors downside at $K_p$
- Zero-cost collar popular for executive hedging (Section 16 rules).

Skew interpretation: equity indices typically show negative skew (OTM puts richer than calls) — selling a put to buy a call "harvests" this. FX spot-volatility correlation signs vary by pair; USD/JPY risk reversal skews toward JPY puts (USD calls).

Tail risk: zero-cost risk reversals have unlimited loss potential on the short put side if the underlying crashes. Margin requirements treat the short put as naked. Collars bound losses but cap gains.

Transaction cost structure: bid–ask on both legs, plus hedging drift. Roll costs in quarterly execution.

In corporate treasury: zero-cost collars are used to hedge commodity input costs (airline jet fuel, mining FX, farmer grain) without upfront cash outlay, trading upside participation for downside protection.

## Applications
FX volatility trading, executive stock hedging, commodity producer hedging, synthetic leveraged directional exposure, overlay strategies on core equity books.

## Open Questions
- Optimal dynamic rebalancing of collar under jumps
- Machine-learned skew timing for risk reversal entry

## Sources
[source:hull-options] Hull, *Options, Futures, and Other Derivatives*, 11e, Pearson, 2021. Confidence: high.
[source:natenberg] Natenberg, *Option Volatility and Pricing*, McGraw-Hill, 2014. Confidence: high.

