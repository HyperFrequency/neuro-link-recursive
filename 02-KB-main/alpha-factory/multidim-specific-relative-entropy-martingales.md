---
title: Multidimensional Specific Relative Entropy Between Continuous Martingales
domain: alpha-factory
confidence: medium
last_updated: 2026-04-17
sha256: 0a95a211d54131b5b711c72bc3919f6e4a8eecab41b32cc12397b595882ed15a
---

---
title: Multidim Specific Relative Entropy Martingales
domain: alpha-factory
sources:
  - slug: backhoff-bellotto-2024
    type: paper
    ingested: 2026-02-28
    confidence: high
confidence: medium
last_updated: 2026-04-16
wikilinks:
  - "[[Relative Entropy]]"
  - "[[Wiener Measure]]"
  - "[[Quadratic Variation]]"
---

# Multidimensional Specific Relative Entropy Between Continuous Martingales

## Overview
Backhoff and Bellotto (2024) extend Gantert's notion of specific relative entropy between continuous martingales from one dimension to multiple dimensions. They prove a Gantert-type lower bound in terms of [[Quadratic Variation]] and show it is tight as the convex lower semicontinuous envelope, a novel result even in dimension one.

## Conceptual Model
Laws of continuous martingales are typically mutually singular, so classical relative entropy $D(P \| Q)$ is usually $+\infty$. Gantert's specific relative entropy rescales:
$$ h(P | Q) = \lim_{n \to \infty} \frac{1}{n} D(P^{(n)} \| Q^{(n)}) $$
where $P^{(n)}, Q^{(n)}$ are finite-dimensional marginals at times $k/n$. This yields a non-trivial, additive-in-time functional capturing pathwise divergence information.

## Details
In dimension 1 (Gantert), for a martingale $M$ with quadratic variation $\langle M \rangle_t = \int_0^t \sigma_s^2 ds$, specific relative entropy with respect to Wiener measure obeys:
$$ h(M | W) \ge \mathbb{E}\left[ \int_0^T \phi(\sigma_s^2) ds \right] $$
for an explicit convex $\phi(x) = \frac{1}{2}(x - 1 - \log x)$.

The paper's main mathematical contribution generalizes this to $d$-dimensional martingales $M_t$ with matrix-valued quadratic variation $\langle M \rangle_t = \int_0^t a_s ds$ where $a_s \in S^d_+$ (positive semi-definite). The lower bound becomes an integral of an explicit convex function of $a_s$ against Wiener (Brownian motion) measure with identity covariance.

**Tightness**: the Gantert-type lower bound is the convex lower semicontinuous envelope of the specific relative entropy in the weak topology. Any candidate functional lying between must equal either the lower bound or $h$ itself.

**Closed-form examples**: the paper computes $h(M|W)$ explicitly for multidimensional cases — e.g., rotationally invariant stretching, time-change of Brownian motion, and canonical correlation structures.

**Technical tools**: the proofs use convex duality, Girsanov-type decompositions adapted to martingale measures, and approximation via diffusion processes. Tightness is shown by constructing families of martingales whose specific relative entropy converges to the bound.

**Connection to finance and statistics**:
- Specific relative entropy appears in large-deviations theory for path functionals
- Candidate objective for martingale-learning and likelihood ratio estimation
- Information-theoretic basis for arbitrage bounds, variance risk premium asymptotics, and option-implied distribution discrepancies

**Connection to optimal transport**: the multidimensional extension resonates with entropic optimal transport and martingale optimal transport, where relative entropy plays the role of regularizer.

**Prior work referenced**: Gantert's original one-dimensional result (1991), Föllmer's information-theoretic framework, Backhoff–Beiglböck–Nutz related work on entropic martingale transport.

## Applications
Information-theoretic asset pricing, model calibration tightness bounds, martingale representation theorems under ambiguity, robust hedging with entropy penalties.

## Open Questions
- Explicit formulas beyond Gaussian-type diffusions
- Time-inhomogeneous and jump extensions
- Statistical estimation of specific relative entropy from sampled paths

## Sources
[source:backhoff-bellotto-2024] Backhoff and Bellotto, "Multidimensional specific relative entropy between continuous martingales", arXiv, 2024. Confidence: high.
[source:gantert-1991] Gantert, "Einige große Abweichungen der Brownschen Bewegung", PhD thesis, 1991. Confidence: high.

