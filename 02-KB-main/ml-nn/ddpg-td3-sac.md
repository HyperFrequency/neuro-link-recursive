---
title: DDPG, TD3, and SAC (Continuous Control)
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 043bab2a371919952171ef91c5e1d076124d8aa1c048be20aa5a849a146440d2
---

---
title: DDPG, TD3, and SAC (Continuous Control)
domain: ml-nn
sources:
  - slug: fujimoto-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: haarnoja-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does SAC's auto-tuned temperature robustness generalise across reward scales without manual tuning?
  - Can TD3+BC match SAC sample efficiency on real-robot locomotion?
wikilinks:
  - "[[policy gradient: REINFORCE + A2C]]"
  - "[[PPO + TRPO + trust regions]]"
  - "[[RL foundations: Q-learning + SARSA]]"
  - "[[deterministic policy gradient]]"
  - "[[maximum entropy RL]]"
  - "[[SAC]]"
---

# DDPG, TD3, and SAC (Continuous Control)

## Overview

Continuous-control [[off-policy]] actor-critic algorithms: [[DDPG]] (Lillicrap et al., 2016) extended DPG to deep nets; [[TD3]] (Fujimoto et al., 2018) fixed overestimation; [[SAC]] (Haarnoja et al., 2018) added maximum-entropy regularisation — currently the default for sample-efficient continuous RL.

## Conceptual Model

Deterministic policy gradient (Silver et al., 2014): for deterministic $$\mu_\theta(s)$$,
$$\nabla_\theta J = \mathbb{E}[\nabla_\theta \mu_\theta(s) \nabla_a Q(s,a)|_{a=\mu_\theta(s)}]$$
Backprops through the critic — pathwise gradient, lower variance than score-function estimator but requires differentiable $$Q$$.

## Details

**DDPG**:
- Deterministic actor $$\mu_\theta$$, critic $$Q_\phi$$.
- Exploration via [[Ornstein-Uhlenbeck noise]] or Gaussian noise on actions.
- Target networks (soft update $$\tau=0.005$$) for both actor and critic.
- Replay buffer $$\sim 10^6$$; batch $$256$$; Adam.

Sensitive to hyperparameters and tends to diverge or over-estimate $$Q$$ due to max bootstrap.

**TD3** (Twin Delayed DDPG):
- [[Clipped double Q]]: use $$\min(Q_{\phi_1}, Q_{\phi_2})$$ for target — curbs over-estimation.
- [[Delayed policy update]]: update actor every $$d=2$$ critic steps.
- [[Target policy smoothing]]: add clipped Gaussian noise to target action — acts as regulariser.

Outperforms DDPG consistently on MuJoCo; more stable.

**SAC** (Soft Actor-Critic):
Maximum-entropy objective
$$J(\pi) = \mathbb{E}\left[\sum_t r_t + \alpha H(\pi(\cdot|s_t))\right]$$
Two Q-networks, target network, stochastic policy (tanh-squashed Gaussian). Auto-tuned temperature $$\alpha$$ (Haarnoja et al., 2018b) via dual gradient on entropy constraint. Very sample-efficient; strong on sparse-reward and exploration-heavy tasks.

SAC update:
1. Critic: minimise $$(y - Q_\phi(s,a))^2$$ with $$y = r + \gamma (\min_i Q_{\phi'_i}(s', a') - \alpha \log \pi(a'|s'))$$, $$a' \sim \pi(\cdot|s')$$.
2. Actor: minimise $$\mathbb{E}[\alpha \log \pi(a|s) - \min_i Q_{\phi_i}(s,a)]$$, via reparameterisation.
3. Temperature: $$\alpha \leftarrow \alpha - \lambda (\log \pi(a|s) + \bar H)$$.

**Comparison table**:
| Algorithm | Policy | Q-targets | Strengths |
|-----------|--------|-----------|-----------|
| DDPG | Deterministic | Single | Simplicity |
| TD3 | Deterministic | Clipped double | Stability |
| SAC | Stochastic | Clipped double | Exploration, sample efficiency |

**Applications**: MuJoCo locomotion, manipulation (Panda arm), IsaacGym, Quadruped ([[ANYmal]], [[Cassie]]), [[SB3]] (stable-baselines3) defaults.

Related: [[policy gradient: REINFORCE + A2C]], [[PPO + TRPO + trust regions]], [[exploration: epsilon-greedy + UCB + Thompson]].

## Open Questions

## Sources
[source:fujimoto-2018] Fujimoto et al., *Addressing Function Approximation Error in Actor-Critic Methods*, ICML 2018. Confidence: high.
[source:haarnoja-2018] Haarnoja et al., *Soft Actor-Critic*, ICML 2018. Confidence: high.

