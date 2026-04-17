---
title: Backtest Overfitting (PBO Metric)
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 0de58a39bd9851c41cb7cacf45c5ed217139b9661675750015df04b529287f72
---

---
title: Backtest Overfitting (PBO Metric)
domain: quant
sources:
  - slug: bailey-lopez-2015
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: lopez-2018
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can block-CSCV match walk-forward performance while preserving multiplicity correction?
  - How does PBO scale when strategies share common factor exposures?
wikilinks:
  - "[[walk-forward analysis]]"
  - "[[out-of-sample Sharpe degradation]]"
  - "[[deflated Sharpe ratio]]"
  - "[[combinatorial purged CV]]"
  - "[[HMM regime detection in finance]]"
---

# Backtest Overfitting (PBO Metric)

## Overview

[[Backtest overfitting]] occurs when strategy parameters are selected to maximise in-sample performance, yielding Sharpe ratios that degrade dramatically out-of-sample. [[Probability of backtest overfitting]] (PBO; Bailey-Lopez de Prado, 2015) quantifies this via combinatorially symmetric cross-validation (CSCV).

## Conceptual Model

Given $$N$$ strategy variants evaluated on $$T$$ time periods, PBO measures the fraction of CSCV splits in which the in-sample best strategy is below-median out-of-sample. PBO near 0 suggests robust selection; PBO near 0.5 indicates selection by chance. A PBO > 0.5 means selection is *worse* than random — pathological overfitting.

## Details

**CSCV construction**: Split $$T$$ periods into $$S$$ non-overlapping segments ($$S$$ even). Each CSCV split partitions $$S$$ segments into $$S/2$$ training, $$S/2$$ testing. Total splits: $$\binom{S}{S/2}$$. For each: identify in-sample best strategy (top-1 by Sharpe), evaluate its OOS rank. PBO $$= \frac{1}{|CSCV|}\sum_c \mathbb{1}[\text{rank}_{OOS}(c) > N/2]$$ or a logit variant.

**Related metrics**:
- [[Deflated Sharpe Ratio]] (Bailey-Lopez de Prado, 2014): adjusts Sharpe for multiple-testing burden and non-normality.
- [[Haircut Sharpe Ratio]] (Harvey-Liu, 2015): factor-model adjusted.
- [[Minimum Backtest Length]]: Sharpe-dependent lower bound on required data to reject null of luck.
- [[False Strategy Theorem]] (Bailey et al., 2014): bounds expected max Sharpe from $$N$$ random strategies.

**CSCV advantages**: no look-ahead by construction; produces distribution of OOS performance, not just point estimate; detects both [[parameter overfit]] and [[strategy-universe overfit]] (when researchers cherry-pick from many backtests).

**Pitfalls**:
- PBO can be computed but not the count of tried strategies — researchers must report $$N$$ faithfully.
- Time dependence violates CSCV's exchangeability assumption; [[block-CSCV]] variants preserve adjacency.
- Non-stationary regimes ([[HMM regime detection in finance]]) break segment independence.

**Complementary mitigations**:
- [[Walk-forward analysis]]: sequential train/test with rolling windows — realistic but produces fewer observations.
- [[Combinatorial purged cross-validation]] (Lopez de Prado): handles overlapping labels.
- [[Out-of-sample Sharpe degradation]]: explicit comparison IS vs OOS Sharpe.
- [[Feature selection with purged groups]]: respects temporal dependence.

**Tooling**: MlFinLab (closed source); `pyfolio-reloaded`; manual implementations straightforward.

Related: [[out-of-sample Sharpe degradation]], [[walk-forward analysis]], [[White's reality check]].

## Open Questions

## Sources
[source:bailey-lopez-2015] Bailey & Lopez de Prado, *The Probability of Backtest Overfitting*, JCF 2015. Confidence: high.
[source:lopez-2018] Lopez de Prado, *Advances in Financial Machine Learning*, Wiley 2018. Confidence: high.

