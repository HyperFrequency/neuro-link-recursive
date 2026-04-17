---
title: Fisher Information and Cramer-Rao Bound
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: ea1f0130dfa37f3bc08529b32db9c13651fa96a2dac8600ad093844277f5688e
---

---
title: Fisher Information and Cramer-Rao Bound
domain: math
sources:
  - slug: vandervaart-2000
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: amari-1998
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - When does observed vs expected Fisher information matter for regime-switching financial models?
  - Can natural gradient offer practical benefits over Adam in modern overparametrised regimes?
wikilinks:
  - "[[MLE]]"
  - "[[KL divergence + f-divergences]]"
  - "[[natural gradient]]"
  - "[[Jeffreys prior]]"
  - "[[REINFORCE]]"
  - "[[PPO + TRPO + trust regions]]"
  - "[[information geometry]]"
---

# Fisher Information and Cramer-Rao Bound

## Overview

[[Fisher information]] $$I(\theta) = \mathbb{E}\left[\left(\frac{\partial \log p_\theta}{\partial \theta}\right)^2\right]$$ quantifies how sensitively a likelihood responds to parameter changes. The [[Cramer-Rao bound]] establishes $$\text{Var}(\hat{\theta}) \geq I(\theta)^{-1}$$ for any unbiased estimator — a fundamental precision limit.

## Conceptual Model

Fisher information is the [[negative expected Hessian]] of log-likelihood: $$I(\theta) = -\mathbb{E}[\partial^2_\theta \log p_\theta]$$ under regularity. It equals the local curvature of [[KL divergence]]: $$D_{KL}(p_\theta \| p_{\theta+\epsilon}) = \frac{1}{2}\epsilon^\top I(\theta)\epsilon + O(\epsilon^3)$$ — defining the [[Fisher-Rao metric]] on statistical manifolds, the foundation of [[information geometry]].

## Details

For an IID sample of size $$n$$, Fisher information additively tensorises: $$I_n(\theta) = n I_1(\theta)$$. The [[MLE]] achieves $$\sqrt{n}(\hat\theta_{MLE} - \theta_0) \to \mathcal{N}(0, I(\theta_0)^{-1})$$ — asymptotically efficient, saturating Cramer-Rao.

[[Jeffreys prior]] $$\pi(\theta) \propto \sqrt{\det I(\theta)}$$ is invariant under reparameterisation. [[Natural gradient]] $$\tilde{\nabla} \mathcal{L} = I(\theta)^{-1} \nabla \mathcal{L}$$ (Amari, 1998) replaces Euclidean with Riemannian descent — basis for [[K-FAC]], [[TRPO]], and efficient policy optimisation.

For biased estimators, the [[van Trees inequality]] or generalised Cramer-Rao applies. The [[Bhattacharyya bound]] provides tighter bounds using higher-order derivatives. For constrained parameter spaces, Cramer-Rao may be achieved only approximately.

[[Observed Fisher information]] $$J(\hat\theta) = -\nabla^2 \log L(\hat\theta)$$ differs from expected $$I$$ by a $$O(1/n)$$ term; both are used for standard errors. [[Score function]] $$\nabla \log p_\theta$$ has mean zero under $$p_\theta$$ — drives [[REINFORCE]] gradient estimators.

In [[quantum]] metrology, quantum Fisher information bounds estimator precision at the Heisenberg limit. In [[active learning]], Fisher information drives optimal design of experiments via D-optimal, A-optimal criteria on $$\det I$$, $$\text{tr} I^{-1}$$.

## Open Questions

## Sources
[source:vandervaart-2000] van der Vaart, *Asymptotic Statistics*. Cambridge. Confidence: high.
[source:amari-1998] Amari, *Natural Gradient Works Efficiently in Learning*, Neural Comp 1998. Confidence: high.

