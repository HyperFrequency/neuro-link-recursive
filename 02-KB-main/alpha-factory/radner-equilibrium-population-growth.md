---
title: Radner Equilibrium with Population Growth
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 863497c4b17529ce39e8bc3ed6d9f5523a48e7c1a56c2f577427bc74e50577bc
---

---
title: Radner Equilibrium with Population Growth
domain: alpha-factory
sources:
  - slug: choi-weston-2025
    url: https://arxiv.org/abs/2504.18009
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can the population-growth mechanism explain observed long-term-annuity price oscillations in Japan?
  - How does the model extend to CRRA utility without losing analytical tractability?
wikilinks:
  - "[[Existence-and-uniqueness-of-quadratic-and-linear-mean-variance-equilibria-in-gen]]"
  - "[[Equilibrium-investment-under-dynamic-preference-uncertainty]]"
  - "[[Radner equilibrium]]"
  - "[[overlapping generations]]"
  - "[[exponential utility]]"
  - "[[incomplete markets]]"
---

# Radner Equilibrium with Population Growth

## Overview

Choi and Weston (2025) prove existence of a [[Radner equilibrium]] in a model with [[population growth]] at a Poisson rate, where agents receive [[unspanned income]] and choose between consumption and investing in an annuity with infinitely-lived [[exponential preferences]]. They first establish equilibrium existence for truncated populations, then extend to unlimited growth. Numerical experiments show that increasing birth rate reduces oscillation in the annuity's equilibrium price, and when younger agents prioritise the present more than older agents, the equilibrium annuity price rises relative to a uniform demographic.

## Conceptual Model

A [[Radner equilibrium]] (Radner, 1972) generalises general equilibrium to sequential markets with incomplete markets and rational expectations. Agents trade in each period conditional on current state; prices clear contingent markets. Here the novelty: finite but growing population $$N_t \sim \text{Poisson process}$$ with rate $$\lambda$$.

## Details

**Agent problem**:
- Continuous time, infinite horizon.
- Agent $$i$$ born at time $$\tau_i$$, [[exponential preferences]] $$U_i(c) = -\frac{1}{\eta_i} e^{-\eta_i c}$$ with risk aversion $$\eta_i$$.
- Receives [[unspanned income]] stream — income risk not fully hedgeable by available assets.
- Invests in a single annuity paying perpetual rate; chooses consumption to maximise expected discounted utility.

**Equilibrium construction** (two-stage):
1. [[Truncated model]] — fix $$N$$ agents, prove equilibrium exists via standard variational argument.
2. Take $$N \to \infty$$ with Poisson arrivals; prove limiting price process exists using monotonicity + compactness.

**Numerical findings**:
- Higher birth rate $$\lambda$$ smooths annuity price oscillations — new entrants add demand that dampens supply-side volatility.
- If younger agents have higher [[subjective discount rate]] (prioritise present), they consume more now, borrowing from future cohorts via annuity purchases — pushes equilibrium annuity price up.
- Heterogeneous demographics generate non-trivial term-structure-of-annuity-prices dynamics.

**Relevance to HyperFrequency**:
- Aging-demographic dynamics affect [[fixed-income]] and [[annuity]] markets materially (Japan, Europe).
- Equilibrium-price oscillation predictions offer OOS tests for life-insurance firm reserves.
- Combines with [[Existence-and-uniqueness-of-quadratic-and-linear-mean-variance-equilibria-in-gen]] for semimartingale-based pricing.
- Connects to [[Equilibrium-investment-under-dynamic-preference-uncertainty]] preference-heterogeneity framework.

**Technical contributions**:
- Existence proof under Poisson population growth — novel in Radner-equilibrium literature.
- Analytical + numerical characterisation.
- Framework extensible to heterogeneous risk aversion and income processes.

**Related literature**:
- [[Overlapping-generations]] (OLG) models (Samuelson 1958; Diamond 1965).
- [[Heterogeneous-agent]] models with continuous-time (Duffie-Sun 2012; Constantinides-Duffie 1996).
- [[Incomplete markets]] equilibria (Cuoco-He 1994; Zhang 2022).

**Limitations**:
- Single asset (annuity); extending to multi-asset retains technical challenge.
- Exponential utility restrictive; CRRA / Epstein-Zin more realistic but intractable.
- Exogenous income stream; endogenous labour choice would enrich.

## Open Questions

## Sources
[source:choi-weston-2025] Choi & Weston, *Radner equilibrium with population growth*, arXiv 2504.18009, 2025. Confidence: medium.

