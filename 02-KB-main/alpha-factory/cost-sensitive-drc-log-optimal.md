---
title: Cost-Sensitive Distributionally Robust Log-Optimal Portfolio
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 25d125c0884f8137fc595c8879477dd4a3aeff3dc4ebcffd46325b614d81f939
---

---
title: Cost-Sensitive Distributionally Robust Log-Optimal Portfolio
domain: alpha-factory
sources:
  - slug: hsieh-yu-2024
    url: https://arxiv.org/abs/2410.23536
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - How does choice of Wasserstein-1 vs Wasserstein-2 ball affect OOS log-growth empirically?
  - Can the formulation incorporate regime-switching via nested ambiguity sets?
wikilinks:
  - "[[Wasserstein distance + p-Wasserstein]]"
  - "[[Monge-Kantorovich optimal transport]]"
  - "[[Kelly criterion]]"
  - "[[transaction cost modeling]]"
  - "[[distributionally robust optimisation]]"
  - "[[Sinkhorn entropic regularization]]"
---

# Cost-Sensitive Distributionally Robust Log-Optimal Portfolio

## Overview

Hsieh and Yu (2024) formulate a [[log-optimal portfolio]] problem that is both [[distributionally robust]] (DR) — protecting against ambiguity in the return distribution via a [[Wasserstein]] ambiguity ball — and [[cost-sensitive]] — incorporating a general convex transaction-cost model. Empirical study on S&P 500 shows the optimal allocation converges to equal-weighted without costs and tilts toward the risk-free asset under transaction costs.

## Conceptual Model

Classical [[Kelly criterion]] / log-optimal growth: maximise $$\mathbb{E}[\log(W_{t+1}/W_t)]$$. This paper enhances with (1) uncertainty: the true return distribution lies within a [[Wasserstein ball]] of radius $$\epsilon$$ around the empirical distribution; (2) costs: trading from $$w_{t-1}$$ to $$w_t$$ incurs convex cost $$c(w_{t-1}, w_t)$$.

The [[distributionally robust optimisation]] (DRO) problem:
$$\max_{w} \inf_{P \in B_\epsilon(P_n)} \mathbb{E}_P[\log(w^\top r - c(w_{prev}, w))]$$

## Details

**Robustly survivable trades**: the authors establish conditions under which the DR log-optimal strategy remains well-defined (avoids unbounded loss) under cost constraints. Key constraint: $$w$$ satisfies [[budget]], [[leverage]], and [[survivability]] (log argument stays bounded away from zero for all distributions in ball).

**Duality-based reformulation**: via [[Mohajerin Esfahani-Kuhn]] (2018) style DRO duality, the infinite-dimensional inner minimisation collapses to a finite-dimensional convex program:
$$\inf_{\lambda \geq 0}\left\{\lambda \epsilon + \frac{1}{N}\sum_{i=1}^N \sup_\xi[\ell(w, \xi) - \lambda \|\xi - \xi_i\|]\right\}$$
Tractable for mid-sized portfolios.

**Empirical (S&P 500)**:
- Without costs: DR log-optimal $$\to$$ equal-weight portfolio — consistent with literature showing equal-weight is a robust baseline (DeMiguel-Garlappi-Uppal 2009).
- With costs: portfolio shifts toward [[risk-free asset]]; tradeoff between allocation optimality and trading costs.

**Relevance to HyperFrequency**:
- Wasserstein DRO robustness bridges [[impermanent loss + divergence loss]] risk framing for AMM LP strategies.
- Kelly-fraction allocations with [[transaction-cost modeling]] directly applicable to live allocation.
- Complements [[On-Cost-Sensitive-Distributionally-Robust-Log-Optimal-Portfolio]] in this KB's paper-ingest pipeline.

**Related frameworks**:
- [[Moment-based DRO]] (Delage-Ye, 2010) — constrains first two moments.
- [[$$\phi$$-divergence DRO]] — KL or $$\chi^2$$ ball — produces different pessimism structure.
- [[Wasserstein DRO]] — preferred for out-of-sample finite-sample guarantees.

**Computational considerations**:
- Wasserstein-1 ball admits cleaner duality than Wasserstein-2.
- Radius $$\epsilon$$ chosen via [[concentration-of-measure]] bounds: $$\epsilon \asymp n^{-1/d}$$ for $$d$$-dim data.
- Excessively large $$\epsilon \to$$ overly conservative (equal weights regardless of data).

**Limitations**: scalability to 500+ assets challenging; transaction-cost-model convexity restrictive (real impact is often concave — e.g., square-root law); static formulation vs dynamic rebalancing.

## Open Questions

## Sources
[source:hsieh-yu-2024] Hsieh & Yu, *On Cost-Sensitive Distributionally Robust Log-Optimal Portfolio*, arXiv 2410.23536, 2024. Confidence: medium.

