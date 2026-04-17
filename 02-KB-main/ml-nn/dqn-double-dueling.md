---
title: Deep Q-Network (DQN), Double DQN, and Dueling
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: e4599311c914f40b9d11fee79324217f6f1af24e4b49536530b53273a96c524e
---

---
title: Deep Q-Network (DQN), Double DQN, and Dueling
domain: ml-nn
sources:
  - slug: mnih-2015
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: hessel-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - What is the smallest Rainbow component subset that retains 95% of full-stack Atari median?
  - Do distributional DQN methods generalise better than expected-value DQN under reward noise?
wikilinks:
  - "[[RL foundations: Q-learning + SARSA]]"
  - "[[policy gradient: REINFORCE + A2C]]"
  - "[[distributional RL]]"
  - "[[C51]]"
  - "[[experience replay]]"
  - "[[Atari]]"
---

# Deep Q-Network (DQN), Double DQN, and Dueling

## Overview

[[Deep Q-Network]] (Mnih et al., 2015) scaled Q-learning to high-dimensional pixel observations using convolutional networks and two stabilisation tricks — [[experience replay]] and [[target networks]]. [[Double DQN]] (van Hasselt et al., 2016) reduces maximisation bias; [[Dueling DQN]] (Wang et al., 2016) factorises $$Q$$ into state-value plus advantage.

## Conceptual Model

DQN parameterises $$Q_\theta(s,a)$$ as a CNN with $$|A|$$ outputs. Loss:
$$\mathcal{L}(\theta) = \mathbb{E}_{(s,a,r,s')\sim D}[(r + \gamma \max_{a'} Q_{\theta^-}(s',a') - Q_\theta(s,a))^2]$$
with $$\theta^-$$ a periodically-updated [[target network]]; $$D$$ a [[replay buffer]]. Both decorrelate samples and stabilise bootstrapping.

## Details

**Double DQN** decouples action selection from evaluation:
$$y^{DDQN} = r + \gamma Q_{\theta^-}(s', \arg\max_{a'} Q_\theta(s',a'))$$
Standard DQN's $$\max Q_{\theta^-}(s',\cdot)$$ selects and evaluates with the same biased estimator, overestimating returns. Double DQN uses online $$\theta$$ for action, target $$\theta^-$$ for value — empirically reduces Atari overestimation by $$\sim 30$$%.

**Dueling DQN** architecture: shared feature trunk $$\phi(s)$$ splits into two heads: state-value $$V(s)$$ and advantage $$A(s,a)$$. Combine as
$$Q(s,a) = V(s) + (A(s,a) - \frac{1}{|A|}\sum_{a'} A(s,a'))$$
The subtraction identifies $$A$$ up to a constant, aiding optimisation. Useful when many actions have similar values — separating $$V$$ lets the network focus on relative ranking.

**Prioritised experience replay** (Schaul et al., 2016): samples transitions with probability $$\propto |\delta|^\alpha$$ (TD error magnitude), corrected by importance weights $$(1/N p)^\beta$$. Accelerates Atari by $$\sim 2\times$$.

**Rainbow DQN** (Hessel et al., 2018) combines Double, Dueling, Prioritised, [[multi-step]], [[noisy networks]], [[distributional]] ([[C51]]) — saturates Atari at near-human level on median metric. Each component contributes roughly $$5$$-$$10$$% to final score.

**Distributional RL** ([[C51]], [[QR-DQN]], [[IQN]]) estimates the full return distribution, not just mean — captures higher moments useful for risk-aware control.

**Hyperparameters**: replay $$10^6$$, target sync $$10^4$$ steps, $$\gamma=0.99$$, $$\epsilon$$ annealed $$1.0\to 0.1$$. Adam $$2.5\times 10^{-4}$$; gradient clipping at 10.

**Applications**: Atari, StarCraft micro, board games (pre-AlphaZero), [[trading execution]] via order-placement as discrete action space.

Related: [[policy gradient: REINFORCE + A2C]], [[exploration: epsilon-greedy + UCB + Thompson]], [[RL foundations: Q-learning + SARSA]].

## Open Questions

## Sources
[source:mnih-2015] Mnih et al., *Human-level control through deep reinforcement learning*, Nature 2015. Confidence: high.
[source:hessel-2018] Hessel et al., *Rainbow: Combining Improvements in Deep RL*, AAAI 2018. Confidence: high.

