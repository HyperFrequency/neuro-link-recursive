---
title: Stationarity Tests (ADF, KPSS, Phillips-Perron)
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: b7161206982450a9a6cf93f84278abe67e5fc3b69896609d2f06a5244ad2e110
---

---
title: Stationarity Tests (ADF, KPSS, Phillips-Perron)
domain: quant
sources:
  - slug: dickey-fuller-1979
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: kpss-1992
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Which stationarity-test regime optimally triggers regime-aware model re-fitting in live trading?
  - How should one test joint stationarity of 500+ equity factor signals without false-discovery inflation?
wikilinks:
  - "[[structural break tests (Chow + Bai-Perron)]]"
  - "[[cointegration]]"
  - "[[Johansen test]]"
  - "[[fractional integration]]"
  - "[[DF-GLS]]"
  - "[[pairs trading]]"
---

# Stationarity Tests (ADF, KPSS, Phillips-Perron)

## Overview

[[Stationarity]] is a precondition for many time-series methods. Three complementary tests dominate in finance: [[ADF]] (Augmented Dickey-Fuller; unit-root null), [[KPSS]] (trend/level stationarity null), and [[Phillips-Perron]] (ADF with HAC standard errors). Joint use avoids mis-diagnosis because nulls are inverted across tests.

## Conceptual Model

ADF tests $$H_0: \rho = 1$$ (unit root, non-stationary) in $$y_t = \rho y_{t-1} + \sum_{i=1}^{p} \gamma_i \Delta y_{t-i} + \epsilon_t$$. Augmentation via lags controls serial correlation. Reject $$H_0$$ $$\Rightarrow$$ stationary. Fails to reject $$\ne$$ accept — low power against near-unit-root alternatives.

KPSS inverts: $$H_0:$$ [[trend-stationary]] or [[level-stationary]]; $$H_1:$$ unit root present. Reject $$H_0$$ $$\Rightarrow$$ evidence of non-stationarity.

## Details

**ADF Test**:
Test statistic $$\tau = (\hat\rho - 1) / SE(\hat\rho)$$ follows Dickey-Fuller distribution, not Student-t. Critical values tabulated; MacKinnon (1996) provides response-surface approximations. Include constant, trend, or both based on visual inspection.

Lag selection: AIC/BIC on auxiliary regression, or $$12(T/100)^{1/4}$$ rule of Schwert.

**KPSS Test**:
Decompose $$y_t = \xi_t + r_t + \epsilon_t$$ with $$r_t$$ random walk. Test statistic is normalised partial sum of residuals; asymptotic distribution is functional of Brownian bridge. Bandwidth for long-run variance estimation matters: Newey-West or Andrews bandwidth.

**Phillips-Perron**:
Same null as ADF but uses [[HAC]] non-parametric correction for serial correlation instead of lag augmentation. More robust to heteroscedasticity; can be sensitive to bandwidth.

**Joint interpretation table**:
| ADF | KPSS | Interpretation |
|-----|------|----------------|
| Reject | Fail to reject | Strong evidence of stationarity |
| Fail to reject | Reject | Strong evidence of unit root |
| Fail to reject | Fail to reject | Underpowered / indeterminate |
| Reject | Reject | Possibly [[fractional integration]] / structural break |

**Variants for special cases**:
- [[Zivot-Andrews]], [[Perron]]: allow one endogenous structural break under null.
- [[DF-GLS]] (Elliott-Rothenberg-Stock): more powerful ADF via GLS detrending.
- [[Ng-Perron]]: finite-sample improvements.
- [[Panel unit root tests]] (IPS, LLC, Pesaran): cross-sectional extensions.

**Finance applications**: cointegration testing ([[Johansen]], [[Engle-Granger]]) requires establishing integration order; pairs-trading relies on residual stationarity; macroeconomic analyses distinguish difference-stationary vs trend-stationary GDP.

## Open Questions

## Sources
[source:dickey-fuller-1979] Dickey & Fuller, *Distribution of the Estimators*, JASA 1979. Confidence: high.
[source:kpss-1992] Kwiatkowski, Phillips, Schmidt, Shin, *Testing the Null Hypothesis of Stationarity*, JE 1992. Confidence: high.

