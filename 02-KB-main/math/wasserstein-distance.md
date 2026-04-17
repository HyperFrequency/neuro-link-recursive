---
title: Wasserstein Distance and p-Wasserstein
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 2100df09feeae5ff93d915b8b5e90b7c748009e0f7c89daacc57088da9e6ec25
---

---
title: Wasserstein Distance and p-Wasserstein
domain: math
sources:
  - slug: villani-2009
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: peyre-cuturi-2019
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does sliced Wasserstein retain the favourable DRO guarantees of full W_p in high-dim alpha spaces?
  - Is the curse-of-dimensionality rate avoidable via entropic regularisation without biasing economic decisions?
wikilinks:
  - "[[Monge-Kantorovich optimal transport]]"
  - "[[Sinkhorn entropic regularization]]"
  - "[[Wasserstein GAN]]"
  - "[[sliced Wasserstein]]"
  - "[[On-Cost-Sensitive-Distributionally-Robust-Log-Optimal-Portfolio]]"
  - "[[flow matching]]"
---

# Wasserstein Distance and p-Wasserstein

## Overview

The [[p-Wasserstein distance]] $$W_p(\mu, \nu) = \left(\inf_{\pi \in \Pi(\mu,\nu)} \int \|x-y\|^p d\pi\right)^{1/p}$$ turns [[optimal transport]] into a proper metric on probability measures. Unlike [[KL divergence]], it is symmetric, satisfies triangle inequality, and is well-defined for measures with disjoint support.

## Conceptual Model

$$W_1$$ (Earth Mover's Distance) has the [[Kantorovich-Rubinstein duality]]: $$W_1(\mu,\nu) = \sup_{\|f\|_{Lip}\leq 1} \mathbb{E}_\mu f - \mathbb{E}_\nu f$$ — the basis of [[WGAN]] training using 1-Lipschitz critics enforced by gradient penalty or spectral normalisation.

$$W_2$$ has Riemannian structure: the space $$\mathcal{P}_2$$ of square-integrable measures with $$W_2$$ metric is a [[geodesic space]] with [[displacement interpolation]] $$\mu_t = ((1-t)\text{id} + t T)_\# \mu$$ where $$T$$ is the Brenier map.

## Details

One-dimensional $$W_p$$ has closed form via [[quantile functions]]: $$W_p(\mu,\nu)^p = \int_0^1 |F^{-1}_\mu(u) - F^{-1}_\nu(u)|^p du$$ — the $$L^p$$ distance between inverse CDFs. This makes 1D OT trivially computable and motivates [[sliced Wasserstein]] distances $$\text{SW}_p(\mu,\nu) = \int_{\mathbb{S}^{d-1}} W_p(\theta_\# \mu, \theta_\# \nu)^p d\sigma(\theta)$$ — tractable in high dimensions.

Statistical rates: empirical $$W_p$$ converges at $$n^{-1/d}$$ in $$d$$-dim (Dudley-Fournier-Guillin), curse of dimensionality unless using entropic regularisation ($$n^{-1/2}$$ at cost of bias) or sliced version.

[[Wasserstein gradient flows]] (JKO scheme) interpret Fokker-Planck diffusion as gradient descent of relative entropy in $$\mathcal{P}_2$$. This underpins [[score-based diffusion]], [[neural ODEs]], and [[flow matching]].

In [[finance]], [[Wasserstein DRO]] places a ball of radius $$\varepsilon$$ in $$W_p$$ around the empirical distribution and solves the worst-case expected loss — reduces to tractable convex programs via duality (Mohajerin Esfahani & Kuhn, 2018). Used in [[On-Cost-Sensitive-Distributionally-Robust-Log-Optimal-Portfolio]].

## Open Questions

## Sources
[source:villani-2009] Villani, *Optimal Transport*. Springer. Confidence: high.
[source:peyre-cuturi-2019] Peyre & Cuturi, *Computational Optimal Transport*. Foundations and Trends. Confidence: high.

