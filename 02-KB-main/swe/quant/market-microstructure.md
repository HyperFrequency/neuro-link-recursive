---
title: Market Microstructure
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 1bdbc037b44a19d6374d7713b3f7a9528599fc57dcdb3149d9cabb449633c9e0
---

## Overview
[[Market microstructure]] studies how trades actually happen at the venue level: the [[bid-ask spread]], [[order book depth]], [[order flow]], [[latency]], and the strategic interaction of market makers, takers, and exchanges. It explains why a backtest assuming mid-price fills is wrong, and why the same strategy can be alpha at one timescale and noise at another.

## Conceptual Model
The [[limit order book]] is a stack of resting buy ([[bid]]) and sell ([[ask]]) limit orders sorted by price-time priority; the difference between the best bid and best ask is the [[spread]] [source:harris-2003]. Market orders consume liquidity and pay the spread; limit orders provide liquidity. [[Latency arbitrage]] arises when faster participants react to public information (a print on a related venue) before slower participants update their quotes — every [[colocation]] dollar a market maker spends is to win this race [source:budish-2015].

## Details
- Effective spread = `2 * |trade_price - midpoint|` at trade time; quoted spread can mislead on illiquid books.
- [[Order book imbalance]] (bid_size - ask_size at top) is a short-horizon predictor of next-print direction.
- [[Microstructure noise]] dominates returns at sub-second scales; volatility estimators must use realized-kernel or pre-averaging methods.
- [[Iceberg orders]] hide true size; only the displayed tip is visible in L2.
- [[Hidden orders]] never show in L2; you only see them when they fill.
- Tick size matters: a one-cent minimum spread on a $5 stock is 20 bps — huge cost for HFT.
- [[Adverse selection]] is the cost a market maker pays when an informed taker hits their quote just before the price moves against them.

## Sources
- [source:harris-2003] Larry Harris, *Trading and Exchanges*, Oxford University Press 2003. Confidence: high.
- [source:budish-2015] Budish, Cramton & Shim, *The High-Frequency Trading Arms Race*, QJE 2015. Confidence: high.

