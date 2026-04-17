---
title: Markov-Switching GARCH
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: a37dc710b3643ea9b736029d4402b56a747e766df83775c10adbd8d634606004
---

---
title: Markov-Switching GARCH
domain: quant
sources:
  - slug: gray-1996
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: ardia-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does MS-GARCH deliver better crisis-period VaR than RealGARCH + jump components?
  - What are the compute-scaling limits of MCMC MS-GARCH for multi-asset (N > 50) estimation?
wikilinks:
  - "[[HMM regime detection in finance]]"
  - "[[GARCH]]"
  - "[[stochastic volatility]]"
  - "[[realised volatility]]"
  - "[[Value-at-Risk]]"
  - "[[A-Space-Mapping-approach-for-the-calibration-of-financial-models-with-the-applic]]"
---

# Markov-Switching GARCH

## Overview

[[Markov-switching GARCH]] (MS-GARCH) combines [[HMM]] regime dynamics with [[GARCH]] volatility clustering. Conditional variance $$\sigma_t^2$$ evolves via regime-specific parameters, capturing the empirical observation that volatility persistence and ARCH/GARCH coefficients differ across calm vs crisis periods.

## Conceptual Model

Standard GARCH(1,1): $$\sigma_t^2 = \omega + \alpha \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2$$. MS-GARCH replaces with state-dependent $$(\omega_{S_t}, \alpha_{S_t}, \beta_{S_t})$$ where $$S_t \in \{1,...,K\}$$ is a Markov chain. Gray (1996) introduced the model; Klaassen (2002) refined the path-dependence problem.

## Details

**Path-dependence problem**: GARCH likelihood depends on the entire history of $$\sigma_t$$, which in turn depends on past states. An exact likelihood requires summing over $$K^T$$ paths — intractable. Klaassen's approximation integrates out past states at each step using filtered probabilities.

**MCMC estimation**: Bayesian approaches (Bauwens et al., 2010; Ardia et al., 2018) use Gibbs sampling with forward-filtering-backward-sampling for states. Package `MSGARCH` (R) implements this workflow.

**Applications**:
- [[Value-at-Risk]] estimation: MS-GARCH produces fatter tail forecasts during crisis regimes, improving VaR backtest coverage (Kupiec, Christoffersen tests).
- [[Options pricing]]: state-dependent volatility terms yield more accurate implied-volatility surfaces across regimes.
- [[Portfolio optimisation]]: regime-conditional covariance matrices inform tactical allocation, reducing crisis-period drawdowns.

**Competitor models**:
- [[FIGARCH]] / long-memory GARCH models persistence without regime switches.
- [[Stochastic volatility]] models ([[Heston]], [[Bates]]) with continuous latent variance.
- [[Realised-GARCH]] augments with high-frequency [[realised volatility]] measurements.

**Identifiability**: state labels are permutation-invariant; ordering constraint ($$\omega_1 < \omega_2 < \ldots$$) stabilises MCMC. Two states typically suffice for daily equity returns; more states often overfit.

**Extensions**: MS-APARCH (asymmetric power), MS-EGARCH (exponential), multivariate [[MS-DCC]] (dynamic conditional correlation). The [[A-Space-Mapping-approach-for-the-calibration-of-financial-models-with-the-applic]] paper addresses calibration of related continuous-time analogues ([[Heston]] model).

## Open Questions

## Sources
[source:gray-1996] Gray, *Modeling the Conditional Distribution of Interest Rates as a Regime-Switching Process*, JFE 1996. Confidence: high.
[source:ardia-2018] Ardia et al., *Markov-Switching GARCH Models in R*, JSS 2019. Confidence: high.

