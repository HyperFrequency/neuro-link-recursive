---
title: Impermanent Loss and Divergence Loss
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 673ce564ee0b2a1992a05791f9e80d071ed121cf64d5585d50e5be719e46f9e8
---

---
title: Impermanent Loss and Divergence Loss
domain: quant
sources:
  - slug: milionis-2022
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: heimbach-2022
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can optimal range selection in v3 outperform LVR theoretical lower bound in practice?
  - Does dynamic-fee design empirically eliminate LVR for ETH-USDC without harming volume?
wikilinks:
  - "[[automated market maker]]"
  - "[[MEV + sandwich attacks + arbitrage]]"
  - "[[orderbook vs AMM liquidity comparison]]"
  - "[[LVR]]"
  - "[[Uniswap v3]]"
  - "[[gamma exposure]]"
---

# Impermanent Loss and Divergence Loss

## Overview

[[Impermanent loss]] (IL) — also called [[divergence loss]] — is the opportunity cost a [[liquidity provider]] (LP) incurs in an [[automated market maker]] (AMM) when the relative price of pooled assets diverges from entry. It is "impermanent" because prices may revert; it becomes realised upon withdrawal.

## Conceptual Model

For a Uniswap-v2 constant-product $$xy = k$$ pool, if the price ratio changes by factor $$p = P_1/P_0$$, the LP's pool value relative to holding is $$V_{\text{LP}}/V_{\text{HODL}} = \frac{2\sqrt{p}}{1+p}$$. IL $$= 1 - V_{\text{LP}}/V_{\text{HODL}}$$. A 2x price move yields ~5.7% IL; a 5x move, ~25%.

## Details

Concentrated liquidity (Uniswap v3) amplifies IL: LPs select price ranges and receive $$k$$ times the capital efficiency, but IL scales identically within the active range, with full asymmetric exposure at range boundaries. Active range management is required to remain in-range, adding gas costs and [[adverse selection]] versus informed arbitrageurs.

[[Divergence loss]] decomposes into two terms: (1) [[gamma exposure]] — LPs are short gamma, losing to volatility, and (2) [[fee income]] — LPs receive $$\gamma \cdot V$$ from trade volume. Net profit requires fees > IL. Empirical studies (Loesch et al., 2021; Heimbach et al., 2022) show most ETH-USDC v3 LPs are net-negative after IL accounting.

[[Loss-versus-rebalancing]] (LVR; Milionis et al., 2022) reframes IL as the cost of being [[adversely selected]] by arbitrageurs with off-chain price feeds. LVR rate $$= \frac{\sigma^2}{2} \cdot \text{pool value}$$ for a constant-product pool — independent of pool parameters, inherent to AMM design.

Mitigations: [[dynamic fees]] proportional to volatility; [[oracle-guarded AMMs]] that pause during large moves; [[batch auctions]] ([[CoW Swap]]) that internalise arbitrage; [[proactive market making]] (DODO) using external price oracles.

Related: [[MEV + sandwich attacks + arbitrage]], [[orderbook vs AMM liquidity comparison]], [[constant function market makers]].

## Open Questions

## Sources
[source:milionis-2022] Milionis et al., *Automated Market Making and Loss-Versus-Rebalancing*, 2022. Confidence: high.
[source:heimbach-2022] Heimbach et al., *Risks and Returns of Uniswap V3 Liquidity Providers*, AFT 2022. Confidence: high.

