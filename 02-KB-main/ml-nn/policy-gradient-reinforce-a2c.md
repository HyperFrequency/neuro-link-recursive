---
title: Policy Gradient: REINFORCE and A2C
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: c3d12c1b1e84e39657597c8192d4ece8c70ac94368ded1c785d11a2407725158
---

---
title: Policy Gradient: REINFORCE and A2C
domain: ml-nn
sources:
  - slug: williams-1992
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: sutton-barto-2018
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - When does entropy regularisation hurt final performance despite aiding exploration?
  - Is A2C strictly dominated by PPO in modern on-policy RL benchmarks?
wikilinks:
  - "[[PPO + TRPO + trust regions]]"
  - "[[DDPG + TD3 + SAC (continuous control)]]"
  - "[[RL foundations: Q-learning + SARSA]]"
  - "[[GAE]]"
  - "[[A3C]]"
  - "[[importance sampling]]"
---

# Policy Gradient: REINFORCE and A2C

## Overview

[[Policy-gradient methods]] optimise a parametric policy $$\pi_\theta(a|s)$$ directly via gradient ascent on expected return. [[REINFORCE]] (Williams, 1992) uses Monte-Carlo returns; [[A2C]] ([[advantage actor-critic]]) uses a learned value function to reduce variance.

## Conceptual Model

[[Policy-gradient theorem]]: $$\nabla_\theta J(\theta) = \mathbb{E}_{\pi}[\sum_t \nabla_\theta \log \pi_\theta(a_t|s_t) \cdot G_t]$$ where $$G_t$$ is the return from step $$t$$. The score-function estimator works for any differentiable $$\pi_\theta$$ and any reward function — no need to differentiate dynamics.

## Details

**REINFORCE** (Williams, 1992):
$$\Delta\theta = \alpha \nabla_\theta \log \pi_\theta(a_t|s_t) G_t$$
Unbiased but high variance. [[Baseline subtraction]]: replace $$G_t$$ with $$G_t - b(s_t)$$ for any $$b$$ depending only on state — preserves unbiasedness, reduces variance. Optimal baseline is expected return under $$\pi$$.

**Actor-critic**: learn $$V_\phi(s)$$ concurrently; use as baseline. [[Advantage]] $$A(s_t, a_t) = Q(s_t, a_t) - V(s_t)$$ gives
$$\nabla_\theta J = \mathbb{E}[\nabla_\theta \log \pi_\theta(a|s) A(s,a)]$$
Estimated via TD residual $$\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$$ ([[A2C]]) or [[GAE]] (generalised advantage estimation; Schulman et al., 2016) combining $$n$$-step bootstraps with $$\lambda$$-weighting.

**A2C vs A3C**: [[A3C]] (Mnih et al., 2016) asynchronously parallelises with multiple workers sharing gradient updates; [[A2C]] uses synchronous parallel rollouts — simpler, often outperforms A3C on modern GPUs.

**Entropy regularisation**: add $$\beta H(\pi_\theta(\cdot|s))$$ to objective — prevents premature convergence to deterministic policies, encourages exploration.

**Variance reduction tricks**:
- Reward-to-go (don't multiply $$G_t$$ by past log-probs).
- Normalising advantages per batch.
- [[Importance sampling]] for off-policy correction.
- [[Pathwise gradients]] ([[reparameterisation trick]]) when continuous actions and differentiable policy.

**Continuous action parameterisations**:
- Gaussian $$\pi(\cdot|s) = \mathcal{N}(\mu_\theta(s), \sigma_\theta(s))$$.
- Tanh-squashed Gaussian ([[SAC]]).
- [[Normalising flow]] policies for multimodal actions.

**Convergence**: policy-gradient methods find local optima; under [[compatible function approximation]] guaranteed to improve at each step. Non-convex in general.

**Extensions**: [[PPO]], [[TRPO]] (trust regions); [[DDPG]], [[TD3]], [[SAC]] (off-policy continuous); [[IMPALA]] (distributed with V-trace correction); [[MPO]], [[SAC-X]] (soft optimisation).

Related: [[RL foundations: Q-learning + SARSA]], [[PPO + TRPO + trust regions]], [[DDPG + TD3 + SAC (continuous control)]].

## Open Questions

## Sources
[source:williams-1992] Williams, *Simple Statistical Gradient-Following Algorithms*, Machine Learning 1992. Confidence: high.
[source:sutton-barto-2018] Sutton & Barto, *RL: An Introduction* 2e. Confidence: high.

