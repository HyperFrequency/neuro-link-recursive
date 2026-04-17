---
title: KL Divergence and f-Divergences
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 39355ee3c0c249b4bded3ce3b4329793ac909a8a64a30e78b2abfd212c09182e
---

---
title: KL Divergence and f-Divergences
domain: math
sources:
  - slug: cover-thomas-2006
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: amari-2016
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Which f-divergence best matches human-perceived similarity for generative model evaluation?
  - Is reverse-KL mode collapse avoidable via mixture posteriors without normalising flows?
wikilinks:
  - "[[Shannon entropy + cross entropy]]"
  - "[[Wasserstein distance + p-Wasserstein]]"
  - "[[Fisher information + Cramer-Rao bound]]"
  - "[[variational inference]]"
  - "[[PPO + TRPO + trust regions]]"
  - "[[f-GAN]]"
---

# KL Divergence and f-Divergences

## Overview

The [[Kullback-Leibler divergence]] $$D_{KL}(p\|q) = \int p \log(p/q)$$ measures how much $$p$$ differs from $$q$$ in bits. It generalises to the [[f-divergence]] family $$D_f(p\|q) = \int q \cdot f(p/q)$$ for convex $$f$$ with $$f(1)=0$$, unifying KL, reverse KL, total variation, $$\chi^2$$, Hellinger, and Jensen-Shannon.

## Conceptual Model

KL is asymmetric, non-negative, and zero iff $$p=q$$ almost everywhere. It is NOT a metric — no triangle inequality, no symmetry. Forward KL $$D_{KL}(p\|q)$$ is "mean-seeking" (covers all modes), used in [[MLE]] and [[variational inference]] objectives. Reverse KL $$D_{KL}(q\|p)$$ is "mode-seeking" (drops modes), the form in [[variational autoencoders]] and the [[ELBO]].

## Details

The f-divergence framework: given convex $$f$$ with $$f(1)=0$$, pick
- $$f(t)=t\log t$$: KL divergence
- $$f(t)=(t-1)^2$$: Pearson $$\chi^2$$
- $$f(t)=(\sqrt{t}-1)^2$$: squared Hellinger
- $$f(t)=|t-1|/2$$: total variation
- $$f(t)=t\log t - (1+t)\log((1+t)/2)$$: Jensen-Shannon

[[Pinsker's inequality]]: $$\text{TV}(p,q) \leq \sqrt{D_{KL}/2}$$ — KL bounds TV distance. [[Data processing inequality]] holds for all f-divergences. [[Fisher information]] is the local curvature of KL: $$D_{KL}(p_\theta \| p_{\theta+d\theta}) \approx \frac{1}{2}d\theta^\top I(\theta) d\theta$$.

[[Variational representation]] (Nguyen-Wainwright-Jordan, 2010): $$D_f(p\|q) = \sup_T \mathbb{E}_p[T] - \mathbb{E}_q[f^*(T)]$$ where $$f^*$$ is the Fenchel conjugate. This powers [[f-GAN]] training with neural $$T$$.

In RL, [[PPO]] and [[TRPO]] constrain policy updates via KL. In Bayesian deep learning, KL regularises posterior approximations. In finance, KL detects [[regime shifts]] and calibrates [[distributionally-robust portfolios]] via [[Wasserstein distance]] or $$\chi^2$$ ambiguity balls.

## Contradictions

> **Claim A** [source:cover-thomas-2006]: KL is the only divergence satisfying chain-rule and additivity for product measures.
> **Claim B** [source:amari-2016]: [[Renyi divergence]] and $$\alpha$$-divergence also factor additively on independent products.
> **Synthesis**: Both are true under different axioms — KL is unique under Shannon-Khinchin axioms; f-divergences share sub-additivity but not strict tensorisation.

## Open Questions

## Sources
[source:cover-thomas-2006] Cover & Thomas, *Elements of Information Theory*. Confidence: high.
[source:amari-2016] Amari, *Information Geometry and Its Applications*. Confidence: high.

