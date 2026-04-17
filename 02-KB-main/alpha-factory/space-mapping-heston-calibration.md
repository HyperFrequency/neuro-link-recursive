---
title: Space-Mapping Calibration for the Heston Model
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 4c62c8541e91b84b832fdb6bd9f12bb22c9df8d5466670500ce4b753285799bb
---

---
title: Space-Mapping Calibration for the Heston Model
domain: alpha-factory
sources:
  - slug: clevenhaus-2025
    url: https://arxiv.org/abs/2501.14521
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does space-mapping outperform neural calibration for intraday vol-surface re-fitting under live data?
  - Can the adjoint PDE approach extend to rough-volatility models (rBergomi)?
wikilinks:
  - "[[Heston]]"
  - "[[stochastic volatility]]"
  - "[[PDE-constrained optimisation]]"
  - "[[Markov-switching GARCH]]"
  - "[[neural calibration]]"
  - "[[Monte Carlo]]"
  - "[[space-mapping]]"
---

# Space-Mapping Calibration for the Heston Model

## Overview

Clevenhaus, Totzeck, and Ehrhardt (2025) propose a [[space-mapping]] calibration method for the Heston stochastic-volatility model when pricing Asian options. The idea: exploit a cheap surrogate (European option under Heston PDE) to correct a fine, expensive model (Asian option under Heston SDE), enabling tractable optimisation over non-linear Heston parameters.

## Conceptual Model

Space mapping (Bandler et al., 1994; adapted from electromagnetic design) aligns a [[coarse model]] $$C(\cdot)$$ and a [[fine model]] $$F(\cdot)$$ via an iterative mapping $$p \mapsto P$$ such that $$C(P) \approx F(p)$$. Calibrating $$p$$ to market data reduces to optimising the coarse model while correcting via the fine-model residual.

In this paper: fine model = Asian option under Heston SDE (Monte Carlo, expensive); coarse model = European option under Heston PDE (tractable, admits gradient-based optimisation). The authors derive a [[gradient descent]] algorithm for the PDE-constrained calibration using standard [[PDE-constrained optimisation]] techniques (adjoint method).

## Details

**Heston model** (1993): stochastic-volatility SDE
$$dS_t = r S_t dt + \sqrt{v_t} S_t dW_t^{(1)}$$
$$dv_t = \kappa(\theta - v_t) dt + \xi\sqrt{v_t} dW_t^{(2)}, \quad dW^{(1)} dW^{(2)} = \rho dt$$
Parameters: mean-reversion $$\kappa$$, long-run variance $$\theta$$, vol-of-vol $$\xi$$, correlation $$\rho$$, initial variance $$v_0$$. Non-linear and partly unobservable from spot data.

**Calibration challenge**: market prices of liquid vanilla options (European) do NOT uniquely identify parameters for exotic pricing (Asian, barrier). Residuals in parameter space are non-convex with multiple local optima; standard [[Levenberg-Marquardt]] or [[differential evolution]] can miss the globally relevant minimum.

**Space-mapping advantage**: direct optimisation on the fine Monte Carlo model is slow and high-variance. Using PDE European as surrogate leverages closed-form Fourier-based pricing (Heston characteristic function) for gradients, then corrects with residuals from the slow Asian model.

**Contributions**:
- Formal derivation of gradient descent for PDE-constrained calibration.
- Algorithmic framework combining fine (SDE Monte Carlo) and coarse (PDE) models.
- Numerical experiments showing feasibility and efficiency gains.

**Relevance to HyperFrequency**: calibration quality of stochastic-volatility models is a key driver of exotic-option edge. Space-mapping could accelerate recalibration cycles for intraday volatility-surface fitting, feeding [[alpha signals]] derived from mispricings. Compatible with [[Markov-switching GARCH]] regime detection for adaptive coarse-model selection.

**Contradictions / Alternatives**:
- [[Neural calibration]] (Horvath et al., 2021): pre-train neural surrogates for direct Heston/rough-vol parameter inversion; faster at inference but less interpretable.
- [[Differential machine learning]] (Huge-Savine, 2020): learn pricing + sensitivities jointly.

## Open Questions

## Sources
[source:clevenhaus-2025] Clevenhaus, Totzeck, Ehrhardt, *A Space Mapping approach for the calibration of financial models with application to the Heston model*, arXiv 2501.14521, 2025. Confidence: medium.

