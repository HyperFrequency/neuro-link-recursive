---
title: Clustered Network Connectedness
domain: alpha-factory
confidence: medium
last_updated: 2026-04-17
sha256: d920da4d55cb57139fb3d23aa9b90072480d0d5382e0e601c66e85b1e3e39a4f
---

---
title: Clustered Network Connectedness
domain: alpha-factory
sources:
  - slug: buchwalter-diebold-yilmaz-2025
    url: https://arxiv.org/abs/2502.15458
    type: paper
    ingested: 2026-02-28
    confidence: high
confidence: medium
last_updated: 2026-04-16
wikilinks:
  - "[[Diebold-Yilmaz Spillover Index]]"
  - "[[Vector Autoregression]]"
  - "[[PCA on Rates]]"
---

# Clustered Network Connectedness

## Overview
Buchwalter, Diebold, and Yilmaz (2025) generalize the Diebold–Yilmaz spillover framework by allowing vector autoregression (VAR) shocks to be orthogonal across pre-specified clusters (asset classes, industries, regions) but correlated within each cluster. This interpolates between Sims-style full orthogonalization and Koop–Pesaran–Shin generalized identification.

## Conceptual Model
Classical connectedness measures project forecast error variance decompositions from a VAR; but orthogonalization choice is binary (Cholesky or generalized). This paper treats clustering as structural prior: within cluster $c$, shocks are correlated (within-cluster ordering is irrelevant); across clusters, shocks are orthogonal (cross-cluster ordering matters). The [[Diebold-Yilmaz Spillover Index|spillover index]] becomes:
$$ \mathcal{S}_{ij}^H = \frac{\sum_{h=0}^{H-1} (e_i^\top A_h \Sigma^{1/2}_C e_j)^2}{\sum_{h=0}^{H-1} e_i^\top A_h \Sigma_C A_h^\top e_i} $$
where $\Sigma_C$ is block-diagonal with cluster blocks retaining within-cluster covariance.

## Details
Clusters partition the $N$ variables into $K$ groups. The identification scheme orders clusters but not individuals within a cluster. Standard Cholesky corresponds to $K = N$ singleton clusters; generalized (KPPS) corresponds to $K = 1$ single cluster.

Empirical application: 16 country equity markets grouped into three global regions (Americas, Europe, Asia-Pacific). Within-region shocks are treated as correlated (reflecting shared regional dynamics); across-region shocks orthogonalized. The total connectedness index and directional measures (from-/to-others, net) are compared against full-ordering and generalized identifications.

Key findings:
- Clustered connectedness recovers economically meaningful regional structure invisible to either extreme
- Total spillover differs materially from both Sims and KPPS benchmarks
- Regional net-transmitter/net-receiver classification stable under cluster choice but sensitive to within-cluster correlation

Connection to factor models: if clusters correspond to principal components, the approach relates to [[PCA on Rates|PCA-based decompositions]]. Here, clusters are economically pre-specified rather than statistically extracted.

Methodological novelty: provides a principled knob between "full structure" and "no structure", formalizing what practitioners often do ad hoc when choosing Cholesky orderings.

Computational aspects: VAR identification cost scales as $O(N^3)$ for Cholesky; clustered requires block Cholesky of cluster blocks, same complexity. Bootstrap confidence bands for spillover indices use wild-bootstrap VAR residuals.

## Applications
Systemic risk measurement, equity spillover monitoring, macro-financial networks, interbank contagion, commodity inter-market analysis.

## Open Questions
- Data-driven cluster selection
- Time-varying clustering for regime-dependent spillovers
- Extension to non-Gaussian VARs

## Sources
[source:buchwalter-diebold-yilmaz-2025] Buchwalter, Diebold, Yilmaz, "Clustered Network Connectedness", arXiv:2502.15458, 2025. Confidence: high.
[source:diebold-yilmaz-2014] Diebold and Yilmaz, "On the network topology of variance decompositions", Journal of Econometrics, 2014. Confidence: high.

