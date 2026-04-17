---
title: PPO, TRPO, and Trust Regions
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: de1a91fc39b782546390f27aa2d988011e533df948de99fd1e1c86214ef8de6a
---

---
title: PPO, TRPO, and Trust Regions
domain: ml-nn
sources:
  - slug: schulman-2017
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: schulman-2015
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does GRPO's value-free approach generalise to robot locomotion or is it LLM-specific?
  - What set of implementation tricks recovers 80%+ of PPO's advantage over A2C?
wikilinks:
  - "[[policy gradient: REINFORCE + A2C]]"
  - "[[KL divergence + f-divergences]]"
  - "[[GRPO]]"
  - "[[RLHF]]"
  - "[[natural gradient]]"
  - "[[GAE]]"
---

# PPO, TRPO, and Trust Regions

## Overview

[[Trust-region]] policy optimisation bounds policy updates to prevent destructive large steps. [[TRPO]] (Schulman et al., 2015) solves a constrained optimisation with [[KL divergence]] trust region; [[PPO]] (Schulman et al., 2017) approximates TRPO via a clipped surrogate objective — dominant modern on-policy algorithm.

## Conceptual Model

TRPO objective:
$$\max_\theta \mathbb{E}_{\pi_{\theta_{old}}}[\frac{\pi_\theta(a|s)}{\pi_{\theta_{old}}(a|s)} A^{\pi_{old}}(s,a)] \text{ s.t. } \mathbb{E}[D_{KL}(\pi_{\theta_{old}} \| \pi_\theta)] \leq \delta$$
The surrogate objective is a first-order approximation to expected improvement; KL constraint guarantees bounded policy drift — ensuring [[monotonic improvement]] under Kakade-Langford (2002) conservative policy iteration.

## Details

**TRPO implementation** (Schulman et al., 2015):
1. Compute [[natural gradient]] direction $$\tilde g = F^{-1}\nabla \mathcal{L}$$ via conjugate gradient on Fisher $$F$$.
2. Line search with exponential decay until KL constraint and improvement both hold.
Expensive second-order method; requires Hessian-vector products.

**PPO** (Schulman et al., 2017) simplifies via clipped surrogate:
$$\mathcal{L}^{CLIP}(\theta) = \mathbb{E}[\min(r_t(\theta) A_t, \text{clip}(r_t(\theta), 1-\epsilon, 1+\epsilon) A_t)]$$
with $$r_t(\theta) = \pi_\theta / \pi_{\theta_{old}}$$ and $$\epsilon \approx 0.2$$. Clipping penalises any update that would move the ratio outside $$[1-\epsilon, 1+\epsilon]$$ — approximate trust region via first-order optimisation.

PPO runs $$K$$ epochs of minibatch SGD on the same rollout data — improved sample efficiency over A2C/A3C. Typical hyperparams: $$\gamma=0.99$$, $$\lambda_{GAE}=0.95$$, $$\epsilon=0.2$$, $$K=10$$, $$n=2048$$ steps per update, batch $$64$$, LR $$3\times 10^{-4}$$.

**PPO vs PPO2 (PPO-Penalty)**: PPO-Penalty adds $$-\beta D_{KL}$$ with adaptive $$\beta$$; PPO-Clip (the dominant variant) uses the clipped objective above.

**Implementation details matter** (Engstrom et al., 2020; Andrychowicz et al., 2021): value-function clipping, advantage normalisation, orthogonal init, gradient clipping — each contributes materially; ablations show clipping objective contributes less than many of the tricks.

**Extensions**:
- [[PPO-Continuous]] with Gaussian policy — standard MuJoCo/Locomotion.
- [[GRPO]] (DeepSeek-V3) removes value network, uses group-relative advantage from multiple rollouts — basis of [[RLHF]] in modern LLM training.
- [[ReMax]], [[RLOO]] — variance-reduced on-policy variants for LLM RLHF.

**Applications**: locomotion (MuJoCo, IsaacGym), StarCraft II (AlphaStar), [[RLHF]] for LLMs (InstructGPT, Claude, ChatGPT), game-playing (OpenAI Five Dota 2).

Related: [[policy gradient: REINFORCE + A2C]], [[KL divergence + f-divergences]], [[Fisher information + Cramer-Rao bound]].

## Open Questions

## Sources
[source:schulman-2017] Schulman et al., *Proximal Policy Optimization*, arXiv 2017. Confidence: high.
[source:schulman-2015] Schulman et al., *Trust Region Policy Optimization*, ICML 2015. Confidence: high.

