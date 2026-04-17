---
title: Convertible Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: f761f98a42fa182c147dd8f9a07fc55e17bddd4269ed72eceff7d42dfab4e0a0
---

---
title: Convertible Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Merger Arbitrage]]"
  - "[[Fixed-Income Arbitrage]]"
---

# Convertible Arbitrage

## Overview
Convertible arbitrage longs convertible bonds and shorts the issuer's equity in proportion to the convertible's delta, capturing cheapness relative to theoretical value while neutralizing first-order equity exposure. Profit comes from gamma trading (realized vol > implied), credit spread tightening, and carry.

## Conceptual Model
A convertible bond $CB$ is decomposable into a straight bond + a conversion option. Its value depends on stock price $S$, volatility $\sigma$, credit spread $s$, interest rate $r$, dividend $q$, time $T$. The delta-hedged position is:
- Long $N$ convertibles
- Short $N \cdot \Delta_{CB}$ shares where $\Delta_{CB} = \partial CB / \partial S$

Dynamic rebalancing captures long gamma: when stock moves, rehedging buys low / sells high the short.

## Details
Profit decomposition:
$$ d(CB - \Delta S) = \Theta dt + \frac{1}{2}\Gamma (dS)^2 + \nu d\sigma + \frac{\partial CB}{\partial s} ds + \text{carry} $$

where $\Gamma (dS)^2$ is realized-vol capture and $\nu d\sigma$ is vega exposure.

Key risks:
- Credit blowup: issuer default wipes out bond value, short equity provides some offset but imperfect
- Implied vol collapse: vega loss if IV compresses
- Issuer call/put features: early redemption can kill gamma profits
- Borrow squeeze: short rebate evaporating on distressed names
- Liquidity: convertibles often illiquid, bid-ask > 1%

Greeks of a convertible:
- Delta ranges 0–1 depending on moneyness of conversion option
- Gamma peaks at parity (stock near conversion price)
- Vega positive, significant for ATM-ish names
- Rho small but nonzero
- Credit rho: $\partial CB / \partial s < 0$

Valuation models: lattice methods (binomial/trinomial with credit-adjusted discounting), PDE with reflection for conversion boundary (Tsiveriotis–Fernandes), Monte Carlo for path-dependent features. Cheapness = market price / theoretical price; historical median ~97%, with 2008 dislocations driving to 80%.

Strategy crowding: 2005 credit event (GM/Ford downgrade) and 2008 de-leveraging caused convert-arb's worst drawdowns (~-30%) as multiple funds liquidated simultaneously, widening cheapness but forcing sales.

Variants:
- Volatility arb: delta-hedged long to capture vol differential
- Credit arb: long convertible + CDS on issuer to isolate equity option
- Hybrid capital structure arb: convert + equity + senior debt triangle

Position limits: typically 2–5% per issuer, regional/sector diversification, 120–160% gross leverage common.

Primary market edge: fund sources ~70% of new issue supply; pricing concessions (OID, issue yield above comparable straight debt) capture structural alpha.

## Applications
Hedge fund sleeve, primary-issuance participation, structured product hedging, tax-efficient income (if holding periods qualify).

## Open Questions
- Credit-equity correlation regime detection
- Machine-learned cheapness signals from convert order flow

## Sources
[source:woodson-2002] Woodson, *Global Convertible Investing*, Wiley, 2002. Confidence: high.
[source:calamos-2003] Calamos, *Convertible Arbitrage*, Wiley, 2003. Confidence: high.

