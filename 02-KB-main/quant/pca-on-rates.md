---
title: PCA on Rates (Level, Slope, Curvature)
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: d25f21350411a6f3509daa1da6937d517f5a264ca4b790c80f3eb8321bc77239
---

---
title: PCA on Rates
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Yield Curve Modeling Nelson-Siegel Svensson]]"
  - "[[Singular Value Decomposition]]"
  - "[[Fixed-Income Arbitrage]]"
---

# PCA on Rates (Level, Slope, Curvature)

## Overview
Principal component analysis applied to a panel of yield-curve changes (or levels) extracts orthogonal factors that typically explain >99% of variance with three components — interpreted as level, slope, and curvature. This empirical regularity underpins curve risk management and butterflies.

## Conceptual Model
Form a $T \times N$ matrix $Y$ of yield changes at $N$ maturities and $T$ dates. Compute covariance $\Sigma = Y^\top Y / (T-1)$ and eigendecompose $\Sigma = V \Lambda V^\top$ (equivalently [[Singular Value Decomposition]] of $Y$). The first three columns of $V$ loadings are approximately flat (level), monotone (slope), and hump-shaped (curvature), mirroring the [[Yield Curve Modeling Nelson-Siegel Svensson|Nelson–Siegel basis functions]].

## Details
Empirical finding (Litterman–Scheinkman 1991): for US Treasury yields, PC1 explains ~85–95% variance with ~uniform loading across maturities ("parallel shifts"), PC2 ~5–10% with tilt (steepening/flattening), PC3 ~1–3% with curvature (belly vs wings).

Level factor is nearly equivalent to a DV01-weighted average yield. Slope PC2 correlates with (10Y − 2Y) spread. Curvature PC3 correlates with the 2s5s10s butterfly.

Practical usage:
- Risk attribution: decompose portfolio P&L into level/slope/curvature contributions
- Butterfly trades: take PC3 exposure by buying the belly (5Y) and selling 2Y and 10Y in DV01-weighted proportions
- Hedging: immunize against PC1 and PC2 while taking view on PC3
- Scenario generation: simulate curves by drawing from factor distribution, preserving realistic covariance structure

Factor time series $F_t = Y_t V$ are approximately uncorrelated by construction. VAR models on $F_t$ feed curve forecasting.

Stability: loadings are reasonably stable through time but regimes matter (ZLB compressed short-end variance; QE-era distorted curvature).

Related decompositions: dynamic factor models (DFM), state-space with Kalman, functional PCA (fPCA) treating the curve as a function-valued time series.

Comparison to NS factors: NS gives parametric, economically-interpretable factors; PCA gives data-driven, orthogonal factors maximizing variance. The three leading PCs rotate into NS factors via a near-identity transformation when the curve is well-behaved.

Multi-curve setting: post-2008, OIS vs LIBOR vs cross-currency basis curves each admit their own PCA; joint analyses add cross-curve factors (e.g., swap spread).

Caveats: PCA on levels is non-stationary (near-unit-root yields); prefer PCA on changes or normalized levels. Positive-definite small-sample estimates require shrinkage (Ledoit–Wolf) for large $N$.

Extensions: sparse PCA for interpretability, robust PCA for outlier resilience, Kernel PCA for nonlinear curve structure.

## Applications
Portfolio risk management, RV trade construction (butterflies, condor on curve), central bank curve decomposition, macroeconomic term-premium analysis.

## Open Questions
- Time-varying PCA factor stability under regime shifts
- Optimal blending of PCA and NS for forecasting

## Sources
[source:litterman-scheinkman-1991] Litterman and Scheinkman, "Common factors affecting bond returns", Journal of Fixed Income, 1991. Confidence: high.
[source:diebold-li-2006] Diebold and Li, "Forecasting the term structure", Journal of Econometrics, 2006. Confidence: high.

