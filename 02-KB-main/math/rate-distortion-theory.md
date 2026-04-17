---
title: Rate-Distortion Theory
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 047bb51a20fdb544fbfc072b7b2926d6512fe59153639fb69dee9aac6c395b12
---

---
title: Rate-Distortion Theory
domain: math
sources:
  - slug: cover-thomas-2006
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: balle-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does the information bottleneck interpretation of generalisation survive for transformer training dynamics?
  - Can rate-distortion analysis predict optimal codebook size for RQ-VAE audio models?
wikilinks:
  - "[[channel capacity]]"
  - "[[mutual information]]"
  - "[[information bottleneck]]"
  - "[[VQ-VAE]]"
  - "[[Shannon entropy + cross entropy]]"
---

# Rate-Distortion Theory

## Overview

Rate-distortion theory characterises the minimum bitrate $$R(D)$$ required to represent a source within average distortion $$D$$. Shannon's theorem gives $$R(D) = \min_{p(y|x): \mathbb{E}[d(X,Y)]\leq D} I(X;Y)$$ — the lossy compression limit.

## Conceptual Model

$$R(D)$$ is convex, non-increasing, with $$R(0) = H(X)$$ (lossless) and $$R(D_{\max}) = 0$$. It is dual to the [[distortion-rate function]] $$D(R)$$. [[Blahut-Arimoto]] algorithm iteratively computes $$R(D)$$ by alternating updates of $$p(y|x)$$ and $$p(y)$$ — guaranteed convergence to the optimum.

## Details

Gaussian source with squared-error distortion has closed form: $$R(D) = \frac{1}{2}\log(\sigma^2/D)$$ for $$D \leq \sigma^2$$. Multivariate Gaussian with covariance $$\Sigma$$: [[reverse water-filling]] allocates distortion $$D_i = \min(\lambda, \sigma_i^2)$$ to eigenmode $$i$$, giving $$R(D) = \sum_i \frac{1}{2}\log^+(\sigma_i^2/D_i)$$ — the spectral analogue of [[PCA]] compression.

[[Information bottleneck]] (Tishby et al., 1999) extends rate-distortion by using $$I(Y; \hat X)$$ as distortion: $$\min I(X; T) - \beta I(T; Y)$$ — trades off compression rate against relevance to target $$Y$$. Applied to [[deep learning]] generalisation (Schwartz-Ziv & Tishby, 2017) though interpretation is [[contested]].

[[Vector quantisation]] and [[neural compression]] realise rate-distortion bounds in practice. [[VQ-VAE]] and [[RQ-VAE]] discretise embeddings through learned codebooks. [[Entropy coding]] (arithmetic, ANS) combined with [[autoregressive priors]] achieves state-of-the-art image compression (Balle et al., 2018, Minnen et al., 2018).

[[Gaussian posterior]] entropy bottlenecks in variational autoencoders implicitly trade off reconstruction quality against KL regularisation — a form of amortised rate-distortion. [[$$\beta$$-VAE]] exposes $$\beta$$ as the Lagrange multiplier.

## Open Questions

## Sources
[source:cover-thomas-2006] Cover & Thomas, *Elements of Information Theory*. Confidence: high.
[source:balle-2018] Balle et al., *Variational Image Compression with a Scale Hyperprior*, ICLR 2018. Confidence: high.

