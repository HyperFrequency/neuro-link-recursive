---
title: Calendar Spreads and Time Decay
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: bb95a5508d564dc644423b409908a304847cdad3e91bd41c7866cd3ea0334d5e
---

---
title: Calendar Spreads and Time Decay
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Iron Condor and Butterfly]]"
  - "[[Black Scholes]]"
---

# Calendar Spreads and Time Decay

## Overview
A calendar (horizontal/time) spread sells a near-term option and buys a longer-dated option of the same strike, profiting from the faster theta decay of the near leg relative to the far leg. Diagonals vary the strikes; double calendars combine call and put calendars.

## Conceptual Model
Under [[Black Scholes]], theta $\Theta \propto -1/\sqrt{T-t}$ for ATM options, so near-expiry options lose time value faster than distant ones. A long calendar is net positive theta and net positive vega (far leg dominates vega because $\mathrm{Vega} \propto \sqrt{T-t}$).

## Details
Payoff at front-month expiry (where front = short leg): if $S_T = K$, short leg expires worthless, long back-month leg still has time value — maximum profit. Deep ITM/OTM yields losses because both legs converge in value with the back month retaining some extrinsic value.

Net P&L at front expiry:
$$ \mathrm{P\&L} = V_{back}(S_T, T_{back} - T_{front}; \sigma_{back}) - \max(S_T - K, 0) - (C_{back,0} - C_{front,0}) $$

Greeks:
- Delta: ≈ 0 if ATM
- Gamma: small because long $\Gamma_{back}$ offsets short $\Gamma_{front}$ (but short gamma dominates near expiry as front leg's gamma explodes)
- Vega: positive and concentrated in back-month
- Theta: positive, front-month decay subsidizes back-month slower decay

Key risks:
- Volatility crush on back month (e.g., post-earnings IV contraction) — Vega risk asymmetric.
- Large move before front expiry breaches the profit zone.
- Term structure shifts (contango ↔ backwardation).

Double calendar: centers one long/short call calendar and one long/short put calendar at different strikes to widen the profit zone. Used when expecting post-event IV to remain elevated but direction uncertain.

Diagonal = calendar with different strikes — adds directional bias. "Poor man's covered call" is a deep ITM LEAPS call + near-term OTM short call, synthetic covered call with less capital.

Volatility term structure: calendars profit when term structure is flat or inverts (VIX term structure in contango favors the trade). Front-month skew vs back-month skew (skew of skew) matters for moneyness selection.

Implementation: typically opened 30–45 DTE for the short leg and 60–90 DTE for long, rolled at front expiry. Margin = cost basis (debit spread). No overnight margin call risk beyond the debit paid.

## Applications
Pre-earnings bets on IV expansion, systematic term-structure arb, synthetic income strategies, volatility surface trading.

## Open Questions
- Machine-learned IV term structure forecasting
- Calendar-spread variance risk premium quantification

## Sources
[source:hull-options] Hull, *Options, Futures, and Other Derivatives*, 11e, Pearson, 2021. Confidence: high.
[source:sinclair-vol] Sinclair, *Volatility Trading*, 2e, Wiley, 2013. Confidence: high.

