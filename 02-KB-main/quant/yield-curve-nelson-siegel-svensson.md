---
title: Yield Curve Modeling (Nelson-Siegel and Svensson)
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 17d84ccb3c551427d1c1c0a398d5ad1f70fefd9b570b81c9d240bc6bbd262b68
---

---
title: Yield Curve Modeling Nelson-Siegel Svensson
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[PCA on Rates]]"
  - "[[Fixed-Income Arbitrage]]"
  - "[[Duration and Convexity Hedging]]"
---

# Yield Curve Modeling (Nelson-Siegel and Svensson)

## Overview
Nelson–Siegel (NS) and its Svensson extension provide parsimonious, economically interpretable fits of the yield curve via 4 (NS) or 6 (Svensson) parameters with factors mapping to level, slope, and curvature. Widely used by central banks (BIS, ECB, Fed) and asset managers for curve construction and scenario analysis.

## Conceptual Model
The Nelson–Siegel zero-coupon yield curve is:
$$ y(\tau) = \beta_0 + \beta_1 \frac{1 - e^{-\lambda \tau}}{\lambda \tau} + \beta_2 \left(\frac{1 - e^{-\lambda \tau}}{\lambda \tau} - e^{-\lambda \tau}\right) $$
where $\beta_0$ is the long-rate level, $\beta_1$ the short-minus-long slope, $\beta_2$ the curvature hump, and $\lambda$ the decay rate governing the hump's location. The three factors align roughly with the first three [[PCA on Rates|principal components of the yield curve]].

## Details
Svensson adds a second curvature term to accommodate two humps:
$$ y(\tau) = \beta_0 + \beta_1 \frac{1 - e^{-\lambda_1 \tau}}{\lambda_1 \tau} + \beta_2 \left(\cdot\right) + \beta_3 \left(\frac{1 - e^{-\lambda_2 \tau}}{\lambda_2 \tau} - e^{-\lambda_2 \tau}\right) $$

Estimation: given observed zero yields or bond prices, solve the nonlinear least squares problem for $(\beta, \lambda)$. Common practice fixes $\lambda$ (often $\lambda_1 = 0.0609$ for monthly US data per Diebold–Li) and runs OLS on the resulting basis functions, converting to a tractable linear regression each day.

Diebold–Li dynamic NS: time-series model for the three factors $(\beta_0, \beta_1, \beta_2)_t$ via VAR(1) or state-space:
$$ \begin{pmatrix} L_t \\ S_t \\ C_t \end{pmatrix} = A \begin{pmatrix} L_{t-1} \\ S_{t-1} \\ C_{t-1} \end{pmatrix} + \epsilon_t $$

Forecasting yields: predict factor states, project through NS loading matrix. Outperforms random walk at 12-month horizon for long rates.

Arbitrage-free NS (AFNS, Christensen–Diebold–Rudebusch 2011): imposes no-arbitrage via Jensen's inequality adjustments, adds small yield-adjustment term; preserves factor interpretability.

Alternatives and comparisons:
- Cubic splines (McCulloch): more flexible, less economic interpretation, prone to overfit
- B-splines (Fisher–Nychka–Zervos): smoothing with penalty
- Smith–Wilson (EIOPA/Solvency II): exponential convergence to ultimate forward rate
- Short-rate models (Vasicek, CIR, HJM): dynamic stochastic framework

Critique: NS family is not arbitrage-free without AFNS correction; misfits U.S. curve around 2Y–5Y in low-rate regimes; struggles with ZLB.

Implementation pitfalls: identifiability between $\beta_0$ and $\beta_2$ at short $\lambda$, convergence issues in joint $(\beta, \lambda)$ optimization, boundary distortion at sparse maturities. Weighting by duration or inverse-variance stabilizes fits.

Central bank publications (BIS Papers 25) compare NS/Svensson across national yield curves.

## Applications
Yield-curve construction for discounting, scenario generation for ALM, factor-based portfolio attribution, bond index benchmarking, central bank research.

## Open Questions
- Optimal decay parameter selection across regimes
- AFNS vs machine-learned curve models (NN regression, Gaussian processes)

## Sources
[source:nelson-siegel-1987] Nelson and Siegel, "Parsimonious modeling of yield curves", Journal of Business, 1987. Confidence: high.
[source:svensson-1994] Svensson, "Estimating and interpreting forward rates", NBER WP, 1994. Confidence: high.
[source:diebold-li-2006] Diebold and Li, "Forecasting the term structure", Journal of Econometrics, 2006. Confidence: high.

