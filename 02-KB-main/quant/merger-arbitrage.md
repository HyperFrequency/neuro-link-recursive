---
title: Merger Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: ad7f192146acf7a923b76f066bbcedd9cdc75dffcc01bf5dee36dd2c0acb5179
---

---
title: Merger Arbitrage
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Dividend Arbitrage]]"
  - "[[Convertible Arbitrage]]"
---

# Merger Arbitrage

## Overview
Merger arbitrage buys the target and (in stock deals) shorts the acquirer after an announced merger, capturing the spread between deal terms and post-announcement market prices. Returns reflect deal-completion probability, timing, and interim hedging costs.

## Conceptual Model
For a cash deal at $K$ per target share, the arbitrageur buys target at $P_t < K$, locking in a spread $K - P_t$ if the deal closes. In a stock-for-stock deal at exchange ratio $\rho$ (acquirer shares per target share), the arbitrageur longs target and shorts $\rho$ acquirer shares per target share, capturing $\rho \cdot P_a - P_t$ minus borrow/financing costs.

## Details
Expected return: $E[R] = p(K - P_t) - (1-p) \cdot L - \mathrm{costs}$, where $p$ is completion probability and $L$ is loss-given-failure (typically target drops to a "deal-break" price near pre-announcement). Annualized IRR depends on expected close date.

Deal types:
- Cash: simple long target
- Stock-for-stock fixed ratio: long target, short $\rho$ acquirer
- Stock collar: exchange ratio varies within a range of acquirer prices
- Mixed cash/stock: decompose and hedge each leg

Risk factors: regulatory (antitrust — DOJ/FTC/EC), shareholder vote, financing contingency (MAC clauses), CFIUS/national security, hostile counter-bids. Average break rate historically ~5–15% depending on deal era and complexity.

Key metrics:
- Gross spread = $K - P_t$ or $\rho P_a - P_t$
- Annualized IRR = spread / days to close × 365
- Risk-reward ratio: spread vs expected downside in break

Hedging: short acquirer in stock deals to neutralize market beta of that leg. Borrow availability and cost (negative rebate rates for hot names) compress returns. Options can cap downside: married puts on target, collars on position.

Portfolio construction: typical merger-arb book holds 30–60 deals, dollar-neutral or cash-deployed, targeting low correlation with broad equities (Sharpe 0.5–1.5 historically, higher in low-rate deal waves).

Event risk correlation: breaks cluster in recessions (e.g., 2001, 2008, 2020) when antitrust scrutiny intensifies and financing withdraws. Diversification benefit diminishes in tail events.

Behavioral regularities: announcement-date run-up + post-announcement drift to deal price ("merger wave momentum"); breakups underperform broad market for ~12 months; collar deals have embedded option value often mispriced.

Contemporary challenges: FTC under Khan (2021–2025) elevated merger challenges; EU DMA and CFIUS expansions increased break risk; SPAC unwinding changed deal composition.

## Applications
Event-driven hedge fund sleeve, alpha diversifier for long-only equity, systematic merger-arb ETFs (MNA, ARB).

## Open Questions
- ML prediction of completion probability from filings and 13D/A activity
- Cross-deal contagion modeling in regulatory waves

## Sources
[source:mitchell-pulvino-2001] Mitchell and Pulvino, "Characteristics of risk and return in risk arbitrage", Journal of Finance, 2001. Confidence: high.
[source:baker-savasoglu-2002] Baker and Savasoglu, "Limited arbitrage in equity markets", JFE, 2002. Confidence: high.

