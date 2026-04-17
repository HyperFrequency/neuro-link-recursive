---
title: Mutual Information
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 1e8d1d123cf509462c4789d2eaa394e3876bfdfc8d5ac12bb4decf1ccaa54074
---

---
title: Mutual Information
domain: math
sources:
  - slug: kraskov-2004
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: belghazi-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - When does InfoNCE saturate below true MI and how does this bias downstream representation learning?
  - Can MI-based feature selection replace factor-model regressions for high-cardinality alpha signals?
wikilinks:
  - "[[KL divergence]]"
  - "[[InfoNCE]]"
  - "[[MINE]]"
  - "[[CLIP]]"
  - "[[information bottleneck]]"
  - "[[channel capacity]]"
  - "[[Shannon entropy + cross entropy]]"
---

# Mutual Information

## Overview

Mutual information $$I(X;Y) = D_{KL}(p_{XY}\|p_X p_Y)$$ measures how many bits knowing $$Y$$ reveals about $$X$$. It is non-negative, zero iff independent, and symmetric — a coordinate-free, non-linear generalisation of correlation.

## Conceptual Model

$$I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) = H(X)+H(Y)-H(X,Y)$$. Unlike [[Pearson correlation]], MI captures arbitrary dependencies including sinusoidal, quadratic, and copula structure. It is the backbone of the [[information bottleneck]] (Tishby), [[InfoGAN]], [[InfoNCE]] self-supervised contrastive learning, and [[feature selection]] via [[mRMR]] (max-relevance min-redundancy).

## Details

Estimation from samples is non-trivial. Classical [[plug-in]] estimators use histograms or KDE and suffer curse of dimensionality. [[Kozachenko-Leonenko]] uses $$k$$-nearest-neighbour distances. [[KSG estimator]] (Kraskov-Stoegbauer-Grassberger) mixes joint and marginal kNN for debiasing.

Modern neural estimators include [[MINE]] (Belghazi et al., 2018) maximising the Donsker-Varadhan lower bound $$I(X;Y) \geq \sup_T \mathbb{E}_{p_{XY}}[T] - \log \mathbb{E}_{p_X p_Y}[e^T]$$, and [[InfoNCE]] (van den Oord et al., 2018) which lower-bounds MI using $$K$$ negative samples: $$I \geq \log K - \mathcal{L}_{NCE}$$. InfoNCE powers [[CPC]], [[SimCLR]], and [[CLIP]] contrastive pretraining.

[[Data processing inequality]]: if $$X \to Y \to Z$$ forms a Markov chain, $$I(X;Z) \leq I(X;Y)$$. Any deterministic function of $$Y$$ cannot increase information about $$X$$ — information only degrades through processing.

Applications: [[feature screening]] in high-dim genomics; [[channel capacity]] $$C = \sup_{p_X} I(X;Y)$$; [[independence testing]] via permutation; [[causal discovery]] using conditional MI $$I(X;Y|Z)$$; [[disentanglement]] metrics for representation learning.

Failure modes: MI estimators are upper-bounded by $$\log(\text{batch size})$$ for variational bounds, biased for high true MI, and unstable under high dimensions without smoothing.

## Open Questions

## Sources
[source:kraskov-2004] Kraskov, Stoegbauer, Grassberger, *Estimating mutual information*, Phys Rev E 69. Confidence: high.
[source:belghazi-2018] Belghazi et al., *MINE: Mutual Information Neural Estimation*, ICML 2018. Confidence: high.

