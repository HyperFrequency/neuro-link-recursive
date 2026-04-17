---
title: Monge-Kantorovich Optimal Transport
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 6970d2bb8769b2ab18dada33474a9f7665d882b800ab81c5011fa9e5a0e41bcd
---

---
title: Monge-Kantorovich Optimal Transport
domain: math
sources:
  - slug: villani-2009
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: santambrogio-2015
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - How does unbalanced OT compare to standard OT for regime-switching returns with missing mass?
  - Can Brenier maps provide interpretable factor rotations versus neural density transforms?
wikilinks:
  - "[[Wasserstein distance + p-Wasserstein]]"
  - "[[Sinkhorn entropic regularization]]"
  - "[[Wasserstein GAN]]"
  - "[[Brenier map]]"
  - "[[Monge-Ampere]]"
  - "[[distributionally robust optimisation]]"
---

# Monge-Kantorovich Optimal Transport

## Overview

[[Optimal transport]] (OT) seeks the least-cost way to reshape one probability measure into another. [[Monge]]'s 1781 formulation asks for a deterministic map $$T$$ minimising $$\int c(x, T(x)) d\mu(x)$$; [[Kantorovich]]'s 1942 relaxation allows probabilistic couplings $$\pi$$ minimising $$\int c(x,y) d\pi(x,y)$$ — always solvable by linear programming.

## Conceptual Model

The Kantorovich primal: $$\min_{\pi \in \Pi(\mu,\nu)} \int c \, d\pi$$ where $$\Pi$$ is the set of couplings with marginals $$\mu, \nu$$. The [[dual]]: $$\sup_{\phi, \psi} \int \phi \, d\mu + \int \psi \, d\nu$$ subject to $$\phi(x) + \psi(y) \leq c(x,y)$$ — [[c-concave]] potentials.

[[Brenier's theorem]]: for quadratic cost $$c(x,y)=\|x-y\|^2/2$$, the optimal Monge map $$T(x) = \nabla \varphi(x)$$ for some convex $$\varphi$$ — a [[convex gradient map]], unique $$\mu$$-a.e. under absolute continuity.

## Details

[[Semi-discrete OT]] discretises one measure, yielding [[power diagrams]] (weighted Voronoi cells) as optimal assignment regions — efficient via Aurenhammer's algorithm. [[Discrete-discrete OT]] reduces to an $$O(n^3 \log n)$$ network flow problem.

[[Monge-Ampere equation]] characterises the potential: $$\det(D^2 \varphi(x)) = \mu(x)/\nu(\nabla \varphi(x))$$ — a fully nonlinear PDE, connected to [[Ricci flow]] and [[Kahler geometry]].

Applications span [[generative modelling]] ([[Wasserstein GAN]], [[flow matching]], [[rectified flow]]), [[domain adaptation]] (cross-domain OT alignment), [[colour transfer]] in images, [[trajectory inference]] in single-cell biology (Schiebinger et al., 2019), and [[robust portfolio optimisation]] (Wasserstein DRO — see [[distributionally robust optimisation]]).

Computational tools: [[Sinkhorn algorithm]] solves the entropic-regularised OT in $$O(n^2)$$ per iteration via matrix scaling (Cuturi, 2013). [[Unbalanced OT]] (Chizat et al., 2018) relaxes marginal constraints for mass-creation/destruction tasks. [[Gromov-Wasserstein]] extends OT to metric-measure spaces for shape matching.

## Open Questions

## Sources
[source:villani-2009] Villani, *Optimal Transport: Old and New*. Springer. Confidence: high.
[source:santambrogio-2015] Santambrogio, *Optimal Transport for Applied Mathematicians*. Confidence: high.

