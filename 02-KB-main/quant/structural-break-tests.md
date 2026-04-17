---
title: Structural Break Tests (Chow and Bai-Perron)
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 10b8453e5ada5da11201c380fe76d59d9d503c9ea929184d2546ebc9c233edd0
---

---
title: Structural Break Tests (Chow and Bai-Perron)
domain: quant
sources:
  - slug: bai-perron-2003
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: chow-1960
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does Bai-Perron outperform PELT when residuals are serially correlated in macro financial series?
  - Can Bai-Perron breaks be combined with HMM states for two-level structural uncertainty modelling?
wikilinks:
  - "[[change-point detection (CUSUM + PELT)]]"
  - "[[HMM regime detection in finance]]"
  - "[[stationarity tests (ADF + KPSS + Phillips-Perron)]]"
  - "[[Fama-French]]"
  - "[[Bai-Perron]]"
  - "[[Chow test]]"
---

# Structural Break Tests (Chow and Bai-Perron)

## Overview

[[Structural break tests]] evaluate whether regression coefficients change at specified or unknown points in time. [[Chow test]] (1960) tests a single known break-point; [[Bai-Perron]] (1998, 2003) generalises to multiple unknown breaks, providing joint estimation and testing framework.

## Conceptual Model

Model $$y_t = x_t^\top \beta_j + \epsilon_t$$ for $$t \in T_j$$ segments with coefficients $$\beta_1, \ldots, \beta_{m+1}$$ separated by $$m$$ break-points $$T_1, \ldots, T_m$$. Null $$H_0$$: no break ($$m=0$$ or $$\beta_j$$ equal across $$j$$). Test statistic compares restricted (no-break) vs unrestricted (breaking) SSR via F-test or likelihood-ratio.

## Details

**Chow test** for known break at $$t^*$$:
$$F = \frac{(SSR_R - SSR_U)/k}{SSR_U / (n - 2k)}$$
with $$SSR_R$$ from pooled regression, $$SSR_U$$ from two separate regressions. Under $$H_0$$, $$F \sim F(k, n-2k)$$. Assumes homoscedasticity — [[HAC]] (heteroscedasticity-autocorrelation-consistent) variants use [[Newey-West]] standard errors.

**Bai-Perron** addresses multiple unknown breaks:
- $$\sup F$$ test: maximum F-statistic over candidate break-points.
- UDmax, WDmax: maximum over number of breaks (up to a bound).
- SEQ test: sequentially test $$m$$ vs $$m+1$$ breaks.
- Global minimisation via [[dynamic programming]] over segment partitions, $$O(n^2)$$.

Asymptotic distributions are non-standard — functionals of [[Brownian motion]]. Critical values tabulated in Bai-Perron (2003); `strucchange` R package and Python `statsmodels` implement these.

**Applications in finance**:
- Testing break in mean-reversion half-life for pairs.
- Detecting policy regime changes in macro time series (inflation targeting adoption).
- Validating [[Fama-French]] factor model stability.
- Distinguishing structural from transient changes in momentum.

**Relation to other tools**:
- [[CUSUM]] and [[PELT]]: agnostic to regression structure — pure change-point detection.
- [[HMM regime detection in finance]]: latent Markov states vs deterministic break times.
- [[Stationarity tests (ADF + KPSS + Phillips-Perron)]]: pre-test before structural break tests.
- [[Zivot-Andrews]] and [[Perron]] tests: unit-root tests allowing single endogenous break.

**Pitfalls**: Bai-Perron requires specifying the maximum break count $$m_{\max}$$ and a minimum segment length $$h$$. Over-parameterisation (short segments) produces spurious breaks. Power is low for small breaks relative to noise variance.

## Open Questions

## Sources
[source:bai-perron-2003] Bai & Perron, *Computation and Analysis of Multiple Structural Change Models*, JAE 2003. Confidence: high.
[source:chow-1960] Chow, *Tests of Equality between Sets of Coefficients in Two Linear Regressions*, Econometrica 1960. Confidence: high.

