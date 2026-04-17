---
title: Dividend Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: c5222492f931a9c8ea1099f9031019810d9e727dafd4be1154055b7c67cdbc71
---

---
title: Dividend Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Merger Arbitrage]]"
  - "[[Fixed-Income Arbitrage]]"
---

# Dividend Arbitrage

## Overview
Dividend arbitrage exploits the relationship between a stock's price, its upcoming dividend, and the pricing of deep ITM options (especially American calls) around the ex-dividend date. Classic trade: short deep ITM calls that retail holders fail to exercise, capturing the dividend.

## Conceptual Model
On the ex-dividend date, stock price drops by approximately the dividend amount $D$. American call holders should exercise early iff the dividend exceeds the remaining time value: $D > C_{\mathrm{put parity}}$ equivalent condition $D > \mathrm{Put}(K, T)$. When many retail holders fail to exercise optimally, market makers and arbitrageurs can profit via exercise-and-assign.

## Details
Classic "dividend play": trader longs deep ITM calls on day before ex-div, exercises at day's end to receive stock (and upcoming dividend). Works for American calls where early exercise is optimal.

More sophisticated dividend arbitrage involves options market-making:
1. Sell deep ITM calls before ex-div
2. Retail holders often neglect early exercise (per OCC data, ~10–20% of optimal exercises are missed)
3. If call isn't exercised before ex-div, short call holder keeps the dividend (stock drops by $D$ but calls lose value by $D$)
4. Market makers exploit via "dividend play strategy" — long and short deep ITM calls offset, with net positive expected value from the exercise-failure fraction

Execution requires arranging "dividend play spreads" — matching long and short positions so the arbitrageur is net short undelivered calls. OCC allocation is random, creating a lottery over which shorts get assigned.

Index-level dividend arbitrage: the SPX futures/forward price reflects expected dividends. Divergence between implied-dividend curves from option spot-put-call parity and dealer dividend forecasts creates trade opportunities.

Dividend swaps and dividend futures (Eurex STOXX 50 Dividend Futures) directly trade anticipated dividend streams. Sophisticated desks arb between dividend futures, total-return swaps, and option-implied dividends.

Put-call parity with dividends: $C - P = S_0 e^{-qT} - K e^{-rT}$ where $q$ is the continuous dividend yield. Deviations generate box-spread or reversal/conversion trades when the basis is mispriced.

Tax arbitrage: U.S. qualified dividend rates vs short-term capital gains — dividend capture via long-short positions can be tax-disadvantaged for retail but neutral for tax-exempt entities.

## Regulatory context
SEC and CBOE rules limit net dividend-play positions; OCC's adjustment procedures handle special dividends. Hard-to-borrow squeezes can disrupt hedges.

## Applications
Options market making, special dividend trades, index arbitrage, corporate structured product hedging.

## Open Questions
- Quantifying optimal-exercise failure rate in retail flow
- Dividend curve construction from thin option markets

## Sources
[source:hull-options] Hull, *Options, Futures, and Other Derivatives*, 11e, Pearson, 2021. Confidence: high.
[source:pool-2008] Pool, Stoll, Whaley, "Failure to exercise call options", Journal of Financial Economics, 2008. Confidence: high.

