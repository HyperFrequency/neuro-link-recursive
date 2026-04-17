---
title: Interpretable ML for Activist Fund Target Prediction
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: c570babb4ffaf5bd2e64c6b5ed0b71471d5573eb401b75572c0984dae630cd11
---

---
title: Interpretable ML for Activist Fund Target Prediction
domain: alpha-factory
sources:
  - slug: kim-2024
    url: https://arxiv.org/abs/2404.16169
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - How does AUC-ROC translate to tradeable precision at top-k target ranks?
  - Does combining SHAP-ranked features with LLM-derived news signals improve OOS performance?
wikilinks:
  - "[[SHAP]]"
  - "[[SMOTE]]"
  - "[[structural break tests (Chow + Bai-Perron)]]"
  - "[[Open-FinLLMs-Open-Multimodal-Large-Language-Models-for-Financial-Applications]]"
  - "[[event study]]"
  - "[[interpretable ML]]"
---

# Interpretable ML for Activist Fund Target Prediction

## Overview

Kim, Benabderrahmane, and Rahwan (2024) build an interpretable ML pipeline to predict [[activist fund]] targets from Russell 3000 constituents (2016-2022). Best model achieves AUC-ROC of 0.782 across 123 evaluated configurations — imputation strategies, oversampling (SMOTE variants), and classifier choice. Uses [[SHAP]] values to surface the factors driving activist-target selection.

## Conceptual Model

Binary classification: given company features at time $$t$$, predict probability of becoming an activist-fund target within a future horizon. Class imbalance is severe (small fraction of firms are targeted); techniques include [[SMOTE]], ADASYN, and class-weighted loss. [[Shapley values]] decompose individual predictions into feature contributions, complying with Banks' interpretability regulations.

## Details

**Data**: Russell 3000 panel 2016-2022. Covariates span:
- [[Corporate governance]]: board independence, CEO-chair duality, staggered boards, classified elections.
- [[Financial performance]]: ROA, ROE, operating margin, free cash flow, industry-adjusted measures.
- [[Valuation]]: Tobin's Q, M/B, P/E.
- [[Ownership structure]]: institutional ownership concentration, insider ownership, prior activist stakes.
- [[Capital allocation]]: share buybacks, dividend yield, R&D intensity.
- [[Operational metrics]]: SG&A ratio, working-capital efficiency.

**Pipeline design space (123 configurations)**:
- Imputation: mean, median, KNN, MICE.
- Oversampling: SMOTE, ADASYN, SVMSMOTE, none.
- Classifier: Logistic, RF, XGBoost, LightGBM, CatBoost, MLP.

**Best model**: AUC-ROC 0.782. Combination probably XGBoost/LightGBM + KNN impute + SMOTE variant.

**SHAP findings** (inferred from activist literature):
- Undervaluation (low Tobin's Q, high cash-to-market-cap) most predictive.
- Board-quality proxies (independence, tenure diversity) secondary.
- Prior activist attention, sector characteristics (consumer discretionary + industrials over-represented) also material.
- Firm size: non-monotonic — mid-cap firms most targeted (small-caps too illiquid; large-caps too defended).

**Relevance to HyperFrequency**:
- Activist [[13D filing]] event typically produces significant abnormal returns (Brav et al., 2008): ~7% in 20-day window.
- Front-running activists via feature-based prediction constitutes [[event-driven alpha]].
- Combine with [[structural break tests (Chow + Bai-Perron)]] on fundamentals to detect pre-targeting anomalies.
- Integrates with [[multimodal]] signal stacks — quantitative features + news/filings (see [[Open-FinLLMs]]).

**Limitations**:
- Non-stationary: activist-fund strategies evolve (current focus on ESG activism differs from 2016).
- [[Look-ahead bias]]: features must be lagged to data-release dates.
- Survivorship: delisted firms missing; could bias toward surviving activist targets.
- Class-imbalance corrections may distort calibration.

**Interpretability vs accuracy tradeoff**: Shapley explanations regulatory-valuable but may mask model instability. Compare [[interpretable ML]] vs black-box GBDT accuracy frontier.

## Open Questions

## Sources
[source:kim-2024] Kim, Benabderrahmane, Rahwan, *Interpretable Machine Learning Models for Predicting the Next Targets of Activist Funds*, arXiv 2404.16169, 2024. Confidence: medium.

