---
title: Sinkhorn Entropic Regularization
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 61e8102a12cf9374260e752a76cb8c9ee1cfc3d8fc143497d9da9d5e18f5ea6f
---

---
title: Sinkhorn Entropic Regularization
domain: math
sources:
  - slug: cuturi-2013
    url: 
    type: paper
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
  - Optimal epsilon schedule for diffusion-based portfolio rebalancing with Sinkhorn loss?
  - Does Greenkhorn's practical speedup translate to high-dimensional GAN training?
wikilinks:
  - "[[Monge-Kantorovich optimal transport]]"
  - "[[Wasserstein distance + p-Wasserstein]]"
  - "[[Sinkhorn divergence]]"
  - "[[SwAV]]"
  - "[[MMD]]"
---

# Sinkhorn Entropic Regularization

## Overview

[[Sinkhorn algorithm]] solves the entropic-regularised optimal-transport problem $$\min_\pi \langle C, \pi\rangle - \varepsilon H(\pi)$$ subject to marginal constraints via alternating matrix scaling. Cuturi (2013) popularised it as a fast, differentiable OT approximation — $$O(n^2)$$ per iteration versus $$O(n^3)$$ for exact LP.

## Conceptual Model

The regularised OT Lagrangian has a unique positive solution of the form $$\pi_{ij} = u_i K_{ij} v_j$$ where $$K = \exp(-C/\varepsilon)$$ is the [[Gibbs kernel]]. Sinkhorn iterates $$u \leftarrow \mu / (Kv)$$ and $$v \leftarrow \nu / (K^\top u)$$ — [[iterative proportional fitting]] / matrix scaling, converging linearly under Hilbert projective metric contraction (Franklin-Lorenz).

## Details

The [[entropic regulariser]] $$-\varepsilon H(\pi) = \varepsilon \sum \pi_{ij} \log \pi_{ij}$$ makes the problem strongly convex, smooths the transport plan (dense rather than sparse), and biases $$W_\varepsilon$$ downward: $$W_\varepsilon \to W$$ as $$\varepsilon \to 0$$, but finite-$$\varepsilon$$ plans differ systematically.

[[Sinkhorn divergence]] $$S_\varepsilon(\mu,\nu) = W_\varepsilon(\mu,\nu) - \frac{1}{2}W_\varepsilon(\mu,\mu) - \frac{1}{2}W_\varepsilon(\nu,\nu)$$ de-biases the estimator and restores metric-like properties (Feydy et al., 2019). At $$\varepsilon = \infty$$ it reduces to [[MMD]]; at $$\varepsilon = 0$$ to Wasserstein.

[[Log-domain stabilisation]] avoids numerical underflow for small $$\varepsilon$$ by working with log-scalings. [[Greenkhorn]] (Altschuler et al., 2017) uses a greedy coordinate update, often faster in practice.

Applications: [[differentiable OT losses]] for deep generative models ([[Sinkhorn autoencoders]]), [[colour transfer]], [[graph matching]] via Gromov-Wasserstein, [[domain adaptation]], and [[self-supervised representation learning]] via Sinkhorn clustering (SwAV, Caron et al., 2020).

Failure modes: entropy bias at large $$\varepsilon$$; ill-conditioning at tiny $$\varepsilon$$ requiring log-domain; poor scaling with batch size when used in mini-batch GAN training (Fatras et al., 2019).

## Open Questions

## Sources
[source:cuturi-2013] Cuturi, *Sinkhorn Distances: Lightspeed Computation of Optimal Transport*, NeurIPS 2013. Confidence: high.
[source:peyre-cuturi-2019] Peyre & Cuturi, *Computational Optimal Transport*. Confidence: high.

