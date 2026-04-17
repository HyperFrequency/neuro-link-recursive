---
title: Mean-Variance Equilibria in Semimartingale Markets
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 94361ddeaab138ec469054f234692cd379d3b99537d06a69af638638e0430512
---

---
title: Mean-Variance Equilibria in Semimartingale Markets
domain: alpha-factory
sources:
  - slug: czichowsky-2024
    url: https://arxiv.org/abs/2408.03134
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - Do jump-semimartingale equilibria change numerically compared with pure-diffusion Black-Scholes baselines?
  - How does non-uniqueness manifest economically and which equilibrium is selected in practice?
wikilinks:
  - "[[Radner-equilibrium-with-population-growth]]"
  - "[[Equilibrium-investment-under-dynamic-preference-uncertainty]]"
  - "[[semimartingale]]"
  - "[[mean-variance hedging]]"
  - "[[time-inconsistency]]"
  - "[[transaction cost modeling]]"
---

# Mean-Variance Equilibria in Semimartingale Markets

## Overview

Czichowsky, Herdegen, and Martins (2024) prove existence and uniqueness for quadratic and linear [[mean-variance equilibria]] in general [[semimartingale]] markets — discrete and continuous time — with both financial and real assets. The paper bridges a gap: prior results required diffusion or Brownian structure; here the authors extend to arbitrary semimartingale price processes.

## Conceptual Model

A [[Radner equilibrium]] with quadratic preferences: agent $$i$$ with [[quadratic utility]] $$U_i(w) = a_i w - \frac{b_i}{2} w^2$$ solves individual optimisation; equilibrium prices clear markets. [[Linear mean-variance]]: $$U(w) = \mathbb{E}[w] - \frac{\gamma}{2} \text{Var}(w)$$ — the canonical mean-variance utility that is [[time-inconsistent]] because $$\text{Var}$$ is non-linear in the distribution.

## Details

**Setting**:
- Filtered probability space $$(\Omega, \mathcal{F}, (\mathcal{F}_t), P)$$.
- Asset price process $$S$$ a [[semimartingale]] — includes Brownian, jump-diffusion, Levy processes, finite-variation.
- Finite population of agents with endowments $$\xi^i \in L^2$$.
- Financial assets (traded cash flows) + real assets (non-traded endowments).

**Quadratic equilibrium**:
- Individual problem: choose portfolio $$\pi^i$$ maximising $$\mathbb{E}[U_i(\xi^i + (\pi^i \cdot S)_T)]$$.
- Equilibrium: $$\sum_i \pi^i = 0$$ (market clearing).
- Main result: necessary and sufficient conditions for existence; explicit examples where non-uniqueness or non-existence arise.

**Linear MV equivalent quadratic**: under mild assumptions, a linear-mean-variance equilibrium corresponds to a quadratic equilibrium with different preference parameters — allowing tools developed for quadratic setup.

**Fixed-point analysis**: linear MV equilibrium arises as fixed point of a coupled system linking optimal portfolios to market-clearing prices. Authors prove existence (and uniqueness in a suitable admissible class) via [[Banach fixed-point]] or [[Schauder]] arguments adapted to semimartingale setting.

**Dynamic mean-variance hedging**: results rely on fine properties developed by Schweizer, Gourieroux, Follmer-Schied on [[mean-variance hedging]] — minimising quadratic hedging error against a contingent claim via martingale representation in semimartingale markets.

**Relevance to HyperFrequency**:
- Mean-variance equilibria provide benchmark against which empirical trading must be measured.
- Pricing impact in [[transaction cost modeling]] interacts with equilibrium-price formation.
- Connection to [[Radner-equilibrium-with-population-growth]] and [[Equilibrium-investment-under-dynamic-preference-uncertainty]] — the three papers together form a modern equilibrium-theory reading list.
- [[Time-inconsistency]] of MV preferences motivates [[game-theoretic]] equilibrium concepts ([[subgame-perfect]]).

**Contradictions**:
> **Claim A** [source:this paper]: Equilibria exist under general semimartingale prices.
> **Claim B** (standard finance pedagogy): MV equilibria require Brownian (Black-Scholes) or affine (Heston) structure.
> **Synthesis**: The paper shows that the semimartingale assumption — exchange-rate boundedness, integrability — suffices; classical Brownian is a special case.

## Open Questions

## Sources
[source:czichowsky-2024] Czichowsky, Herdegen, Martins, *Existence and uniqueness of quadratic and linear mean-variance equilibria*, arXiv 2408.03134, 2024. Confidence: medium.

