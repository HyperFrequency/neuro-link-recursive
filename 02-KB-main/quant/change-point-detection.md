---
title: Change-Point Detection (CUSUM and PELT)
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: f6febb35cd572e9077b9dc9e0857f355850ce8290e836162f51351dd2869bd93
---

---
title: Change-Point Detection (CUSUM and PELT)
domain: quant
sources:
  - slug: killick-2012
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: truong-2020
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - How do penalty-selection methods for PELT compare when ground-truth change-points are unknown in financial data?
  - Does Bayesian online CPD dominate CUSUM for HFT regime transitions?
wikilinks:
  - "[[structural break tests (Chow + Bai-Perron)]]"
  - "[[HMM regime detection in finance]]"
  - "[[CUSUM]]"
  - "[[PELT]]"
  - "[[wild binary segmentation]]"
  - "[[realised volatility]]"
---

# Change-Point Detection (CUSUM and PELT)

## Overview

[[Change-point detection]] identifies times when the statistical properties of a time series shift. [[CUSUM]] (cumulative sum) detects shifts sequentially via score accumulation; [[PELT]] (Pruned Exact Linear Time) finds multiple change-points offline by dynamic programming with pruning.

## Conceptual Model

Given $$X_1, \ldots, X_n$$ with potential change-points $$\tau_1 < \ldots < \tau_k$$, the segmented model assigns parameters $$\theta_j$$ to segment $$(\tau_{j-1}, \tau_j]$$. The objective minimises $$\sum_j C(X_{(\tau_{j-1},\tau_j]}) + \beta k$$ where $$C$$ is a segment cost (negative log-likelihood, sum-of-squares) and $$\beta$$ penalises segment count (BIC-like).

## Details

**CUSUM** (Page, 1954) is a sequential test. Accumulate $$S_t = \max(0, S_{t-1} + (X_t - \mu_0 - k))$$; alert when $$S_t > h$$. Parameters $$k, h$$ tuned for ARL (average run length) under null and alternative. Widely used in quality control and fraud detection. Extensions: two-sided CUSUM, self-starting CUSUM, EWMA (exponentially-weighted moving average) for smoother response.

**PELT** (Killick et al., 2012) computes optimal multiple-change-point segmentation in $$O(n)$$ expected time (vs $$O(n^2)$$ for dynamic programming) via pruning: if $$F(t) + K > F(t^*)$$ for some $$t^* > t$$, position $$t$$ can never be a change-point and is pruned. Guaranteed exact; requires penalty $$\beta$$ calibration (MBIC, Akaike).

**Binary segmentation** (BS): recursively split at the single best change-point; $$O(n \log n)$$ but greedy, can miss close change-points. [[Wild Binary Segmentation]] (WBS; Fryzlewicz, 2014) randomises sub-intervals, dominant method for many practical problems.

**Bayesian online change-point detection** (Adams-MacKay, 2007) maintains run-length posterior via message passing — natural for streaming.

**Applications in finance**:
- Regime break detection in volatility ([[realised variance]] change-points).
- Corporate event detection (earnings anomalies, merger announcements).
- [[Intraday seasonality]] segmentation.
- Complement to [[structural break tests (Chow + Bai-Perron)]] when break count is unknown.

**Python libraries**: `ruptures` (PELT, BS, WBS, dynamic programming), `changepy`, `bocd`.

**Pitfalls**: CUSUM is sensitive to shift size — small persistent drifts detected only slowly. PELT's penalty $$\beta$$ is critical: too small $$\to$$ over-segmentation; too large $$\to$$ missed breaks. Non-IID serial correlation must be pre-whitened or modelled (via [[HMM regime detection in finance]]).

## Open Questions

## Sources
[source:killick-2012] Killick, Fearnhead, Eckley, *Optimal Detection of Changepoints with a Linear Computational Cost*, JASA 2012. Confidence: high.
[source:truong-2020] Truong, Oudre, Vayatis, *Selective Review of Offline Change Point Detection*, Signal Processing 2020. Confidence: high.

