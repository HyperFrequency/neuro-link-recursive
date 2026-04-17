---
title: Orderbook vs AMM Liquidity Comparison
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: ecdf15cae7563fdea4671ad8cfa56ea93374542d2915990d0e3828ab31a8210b
---

---
title: Orderbook vs AMM Liquidity Comparison
domain: quant
sources:
  - slug: lehar-parlour-2022
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: capponi-jia-2021
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - At what liquidity threshold does CLOB dominate AMM for a given asset pair empirically?
  - Can hybrid hook-AMMs close the capital-efficiency gap without losing composability?
wikilinks:
  - "[[automated market maker]]"
  - "[[central limit order book]]"
  - "[[impermanent loss + divergence loss]]"
  - "[[MEV + sandwich attacks + arbitrage]]"
  - "[[Uniswap v3]]"
  - "[[market microstructure]]"
---

# Orderbook vs AMM Liquidity Comparison

## Overview

[[Central limit order books]] (CLOBs) and [[automated market makers]] (AMMs) represent two paradigms for matching buyers and sellers. CLOBs aggregate discrete limit orders at explicit prices; AMMs provide continuous liquidity via deterministic bonding curves. Each has distinct economic properties, capital efficiency, and latency profiles.

## Conceptual Model

CLOB quotes are discrete: an order book is a sorted array of price-level-quantity tuples. Spread is determined by competition among [[market makers]] who post limit orders. AMMs price continuously: $$p = x/y$$ for constant-product pools, with effective price changing infinitesimally with each trade. Slippage on AMM for trade size $$\Delta x$$ is $$\Delta y = k/(x + \Delta x) - y$$.

## Details

**Capital efficiency**: CLOB market makers can quote narrow spreads with little inventory because they manage risk actively — pulling quotes, hedging elsewhere. AMM LPs lock capital across the entire curve, of which only a tiny fraction sees volume — dramatically worse utilisation. [[Uniswap v3]] mitigates via concentrated liquidity but introduces range-management risk.

**Adverse selection**: Both face [[toxic flow]] from informed traders. CLOB MMs can immediately cancel on news; AMMs cannot, becoming the [[residual counterparty]] to arbitrageurs — manifested as [[LVR]] (loss-versus-rebalancing). This makes AMMs structurally worse for volatile assets absent oracle guards.

**Price discovery**: CLOBs surface information via order flow. AMMs follow external price (oracle or arbitrageur). Recent hybrid designs ([[hook-enabled AMMs]] like Uniswap v4, [[dynamic-fee AMMs]]) blend both: continuous liquidity with CLOB-like responsiveness.

**Gas / latency**: AMMs require 1 transaction for a swap (~100-200k gas). CLOB swaps on-chain (dYdX v3, Serum) required order placement + cancellation — higher gas but cheaper in aggregate for active LPs. Off-chain CLOBs ([[dYdX v4]] using Cosmos consensus) avoid Ethereum gas entirely.

**Composability**: AMMs excel — atomic, deterministic, pool-state readable. CLOBs with off-chain matching lose composability.

Empirical studies (Lehar-Parlour, 2022; Capponi-Jia, 2021) show CLOBs dominate for high-activity pairs when accessible; AMMs win for long-tail assets where coordination costs are high.

Related: [[impermanent loss + divergence loss]], [[MEV + sandwich attacks + arbitrage]], [[market microstructure]].

## Open Questions

## Sources
[source:lehar-parlour-2022] Lehar & Parlour, *DEX vs CEX*, 2022. Confidence: high.
[source:capponi-jia-2021] Capponi & Jia, *AMM Efficiency*, 2021. Confidence: high.

