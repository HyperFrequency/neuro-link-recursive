---
title: Equilibrium Investment under Dynamic Preference Uncertainty
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 8e7213fc0f471fdcb7dfe89abee58391546c56c850d430d7b43611d3f153ecc2
---

---
title: Equilibrium Investment under Dynamic Preference Uncertainty
domain: alpha-factory
sources:
  - slug: aquino-2025
    url: https://arxiv.org/abs/2512.21149
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can preference-factor dynamics be empirically identified from realised household/fund trades?
  - How does equilibrium hedging interact with transaction costs in the resulting portfolio?
wikilinks:
  - "[[Existence-and-uniqueness-of-quadratic-and-linear-mean-variance-equilibria-in-gen]]"
  - "[[Radner-equilibrium-with-population-growth]]"
  - "[[HMM regime detection in finance]]"
  - "[[CRRA]]"
  - "[[Merton problem]]"
  - "[[time-inconsistency]]"
  - "[[subgame-perfect equilibrium]]"
---

# Equilibrium Investment under Dynamic Preference Uncertainty

## Overview

De Gennaro Aquino, Desmettre, Havrylenko, and Steffensen (2025) study continuous-time portfolio choice for an investor whose state-dependent preferences evolve as an Itô-diffusion [[exogenous factor]]. Terminal wealth is evaluated under a set of utility functions corresponding to possible future preference states, converted to [[certainty equivalents]] then nonlinearly aggregated over the conditional distribution of future preferences — an inherently [[time-inconsistent]] objective. Characterises [[subgame-perfect equilibrium]] investment policies via an extended [[HJB]] system — a coupled nonlinear [[PIDE]] (partial integro-differential equation). For [[CRRA]] with arithmetic-Brownian-motion preference factor, semi-explicit policy splits into [[myopic demand]] + [[preference-hedging]] component.

## Conceptual Model

Classical [[Merton]] problem assumes known, fixed utility. Here the utility itself is stochastic: risk aversion $$\gamma_t$$ or horizon curvature evolves. Time-inconsistency: at time $$t$$, future-self will have different preferences, so the current-self's optimal plan is not dynamically consistent. Solution: find [[subgame-perfect equilibrium]] — a policy that no future self can improve upon (game-theoretic fix).

## Details

**Mathematical setup**:
- State: wealth $$W_t$$ + preference factor $$Y_t$$ following Itô diffusion $$dY_t = \mu(Y)dt + \sigma(Y)dZ_t$$.
- Terminal reward aggregated as $$\int CE_\gamma(W_T) dp(\gamma|Y_T)$$ — nonlinearly aggregates certainty equivalents (not just expected utilities).
- Time-inconsistency: aggregation is nonlinear in distribution over future $$\gamma$$.

**Equilibrium via extended HJB**:
- Follows Bjork-Murgoci (2014) framework for time-inconsistent control.
- Value function $$V(t, w, y)$$ satisfies coupled nonlinear PIDE.
- [[Equilibrium policy]] $$\pi^e$$ satisfies no-profitable-deviation condition: at every $$(t, w, y)$$, deviating to any $$\pi'$$ for infinitesimal time is not beneficial if future-self plays equilibrium.

**CRRA + ABM specialisation**:
- Preference factor $$Y_t$$ arithmetic Brownian motion.
- Utility $$U(w; \gamma) = w^{1-\gamma}/(1-\gamma)$$.
- Equilibrium policy: $$\pi^e_t = \pi_{myopic}(Y_t) + \pi_{hedge}(Y_t, t)$$.
  - Myopic: classical Merton $$\pi = (\mu - r)/(\gamma \sigma^2)$$ with current $$\gamma = \gamma(Y_t)$$.
  - Hedge: compensates for covariance between preference shocks and asset returns — shields wealth from future-preference regret.

**Numerical insights**:
- [[Preference drift]]: direction of $$\mu(Y)$$ (aversion trending up vs down) shifts equilibrium risky share.
- [[Correlation]] $$\rho = \text{corr}(dY, dS)$$: if preference shocks correlate with asset moves, hedge demand sign flips.
- [[Hedging magnitude]] can dominate myopic demand under strong preference volatility.

**Relevance to HyperFrequency**:
- Preference uncertainty is realistic — institutional risk aversion evolves with market stress, regulation, career concerns.
- Complements [[Existence-and-uniqueness-of-quadratic-and-linear-mean-variance-equilibria-in-gen]] and [[Radner-equilibrium-with-population-growth]].
- Embedding regime-switching preferences via [[HMM regime detection in finance]] produces empirically testable hedging-demand structure.
- Connects to [[offline RL]] with stochastic reward shaping.

**Related literature**:
- [[Epstein-Zin]] recursive utility.
- [[Hyperbolic discounting]] / [[quasi-geometric]] discounting.
- [[Ambiguity-aversion]] (Hansen-Sargent robust control; Chen-Epstein multiple priors).
- Time-inconsistent control (Bjork-Khapko-Murgoci 2017).

**Limitations**:
- CRRA + ABM specialisation for tractability; general utility + state dynamics harder.
- Subgame-perfect equilibrium may be non-unique; selection criterion matters.
- Empirical identification of preference-factor dynamics challenging.

## Open Questions

## Sources
[source:aquino-2025] De Gennaro Aquino, Desmettre, Havrylenko, Steffensen, *Equilibrium investment under dynamic preference uncertainty*, arXiv 2512.21149, 2025. Confidence: medium.

