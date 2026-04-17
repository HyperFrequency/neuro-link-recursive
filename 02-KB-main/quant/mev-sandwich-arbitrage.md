---
title: MEV, Sandwich Attacks, and Arbitrage
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 3aad910aaafdc3ec43d3fbd450cd50b8c00488c3dac26dedd436c9636a01e5d7
---

---
title: MEV, Sandwich Attacks, and Arbitrage
domain: quant
sources:
  - slug: daian-2020
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: flashbots-docs-2024
    url: 
    type: docs
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does encrypted mempool viability survive MEV-dependent validator economics post-PBS?
  - What share of MEV is structurally unavoidable vs extractable by design improvements?
wikilinks:
  - "[[impermanent loss + divergence loss]]"
  - "[[orderbook vs AMM liquidity comparison]]"
  - "[[flash loan]]"
  - "[[MEV-Boost]]"
  - "[[PBS]]"
  - "[[A-Blessing-in-Disguise-How-DeFi-Hacks-Trigger-Unintended-Liquidity-Injections]]"
---

# MEV, Sandwich Attacks, and Arbitrage

## Overview

[[Maximal extractable value]] (MEV) is the profit that block producers (or searchers paying them) can extract by reordering, inserting, or censoring transactions. [[Sandwich attacks]], [[DEX arbitrage]], and [[liquidations]] are the dominant MEV categories on Ethereum.

## Conceptual Model

A [[sandwich attack]] front-runs a victim's AMM swap with a buy in the same direction (pushing price), lets the victim execute at worse price, then back-runs with a sell — pocketing the spread. Sandwichability is determined by the victim's [[slippage tolerance]]: if slippage $$s$$ is wide enough, attacker profit $$\propto s \cdot V_{\text{victim}}$$.

## Details

[[DEX arbitrage]] exploits cross-venue price discrepancies — e.g., ETH priced higher on Uniswap vs Sushiswap. Searchers execute atomic bundles that buy cheap, sell expensive, revert if unprofitable. [[Flash loan]]-funded arbitrage uses Aave/dYdX/Balancer for capital without pre-funding. [[Cyclic arbitrage]] routes through multiple pools seeking positive product along a cycle.

[[Liquidation MEV]] triggers undercollateralised loans on Aave, Compound, MakerDAO. Searchers race to capture liquidation bonuses (typically 5-15%) plus repayment of debt at discount. [[Priority gas auctions]] (PGA) historically resolved races via gas-price bidding.

[[Flashbots]] / [[MEV-Boost]] introduced sealed-bid auctions for block space. Searchers submit bundles to block builders, who pay validators for right to build the block. This mitigates gas waste and public-mempool sandwiches but concentrates MEV extraction in a few builders (Titan, BeaverBuild, rsync), raising centralisation concerns.

[[Private mempools]] ([[MEV-Share]], [[CoW Protocol]], [[1inch Fusion]]) protect users by routing transactions off-chain. Users get improved execution; some MEV is returned via [[order flow auctions]] — a nascent market for [[backrunning rights]].

[[PBS]] (proposer-builder separation) and [[inclusion lists]] (EIP-7547) are protocol-level responses. [[Encrypted mempools]] ([[threshold encryption]]) and [[verifiable delay functions]] propose stronger commitments but face latency trade-offs.

Related: [[impermanent loss + divergence loss]], [[LVR]], [[orderbook vs AMM liquidity comparison]].

## Open Questions

## Sources
[source:daian-2020] Daian et al., *Flash Boys 2.0: Frontrunning in Decentralized Exchanges*, IEEE S&P 2020. Confidence: high.
[source:flashbots-docs-2024] Flashbots documentation, 2024. Confidence: high.

