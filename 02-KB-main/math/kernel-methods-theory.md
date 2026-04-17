---
title: Kernel Methods Theory
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: aae68abb15ff210f73a3d755083f4538d4003dce95460d98d4d274faffc2ba09
---

---
title: Kernel Methods Theory
domain: math
sources:
  - slug: scholkopf-smola-2002
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - How do learned deep kernels compare to hand-crafted RBF on tabular alpha features?
  - Can [[NTK]] regime explain transformer in-context learning as implicit kernel regression?
wikilinks:
  - "[[RKHS]]"
  - "[[SVM]]"
  - "[[Gaussian processes]]"
  - "[[kernel trick]]"
  - "[[Nystrom approximation]]"
  - "[[neural tangent kernel]]"
  - "[[MMD]]"
---

# Kernel Methods Theory

## Overview

Kernel methods transform non-linear problems into linear ones by implicitly mapping data into a high-dimensional reproducing kernel Hilbert space (RKHS). The insight: inner products in the mapped space can be computed without ever materialising the mapping, through a kernel function $$k(x, x') = \langle \phi(x), \phi(x') \rangle$$.

## Conceptual Model

A [[positive definite kernel]] defines an [[RKHS]] via the [[Moore-Aronszajn theorem]]. The [[kernel trick]] lets [[SVM]], [[Gaussian processes]], [[kernel ridge regression]], and [[kernel PCA]] operate in infinite-dimensional feature spaces using only evaluations $$k(x_i, x_j)$$ forming the [[Gram matrix]]. The [[representer theorem]] guarantees optimal solutions lie in the span of training kernels, reducing infinite search to finite coefficients.

## Details

Common kernels include the linear $$k(x,y)=x^\top y$$, polynomial $$(x^\top y + c)^d$$, RBF/Gaussian $$\exp(-\gamma\|x-y\|^2)$$, and Matern. RBF is universal: any continuous function on a compact domain can be approximated arbitrarily well. Kernel selection drives inductive bias — bandwidth $$\gamma$$ controls smoothness, with cross-validation or marginal-likelihood tuning for Gaussian processes.

Computational bottleneck: training scales $$O(n^3)$$ for dense Gram inversion and $$O(n^2)$$ memory. Scalable variants include [[Nystrom approximation]], [[random Fourier features]] (Rahimi-Recht), and [[inducing points]] for sparse GPs. [[Mercer's theorem]] gives the spectral decomposition $$k(x,y)=\sum_i \lambda_i \psi_i(x)\psi_i(y)$$ connecting kernels to integral operators.

Deep kernel learning composes neural feature extractors with kernel heads. [[Neural tangent kernel]] (NTK) shows wide networks behave as kernel machines under gradient descent with fixed features — a bridge between kernel theory and deep learning. [[Conjugate kernel]] and NNGP formalise infinite-width Bayesian correspondence.

Applications span [[structured prediction]] via string/graph kernels (Weisfeiler-Lehman), [[two-sample testing]] via [[MMD]] (maximum mean discrepancy), and distributionally-robust optimisation through kernel-mean embedding of probability measures.

## Open Questions

## Sources
[source:scholkopf-smola-2002] Scholkopf & Smola, *Learning with Kernels*. MIT Press. Confidence: high.

