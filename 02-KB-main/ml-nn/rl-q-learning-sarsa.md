---
title: RL Foundations: Q-Learning and SARSA
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 77e49830563dfe646126a9fb668517323d0d480a55d56895bc2f3c462690db09
---

---
title: RL Foundations: Q-Learning and SARSA
domain: ml-nn
sources:
  - slug: sutton-barto-2018
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: watkins-dayan-1992
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - When does Expected SARSA outperform both SARSA and Q-learning in practice?
  - How does policy uncertainty shift the Q-learning vs SARSA trade-off under risk constraints?
wikilinks:
  - "[[Deep Q-Network (DQN) + double DQN + dueling]]"
  - "[[policy gradient: REINFORCE + A2C]]"
  - "[[PPO + TRPO + trust regions]]"
  - "[[Bellman equation]]"
  - "[[double Q-learning]]"
  - "[[eligibility traces]]"
---

# RL Foundations: Q-Learning and SARSA

## Overview

[[Q-learning]] and [[SARSA]] are the foundational temporal-difference (TD) [[reinforcement learning]] algorithms. Both estimate the action-value function $$Q(s,a)$$ from sampled transitions. Q-learning is [[off-policy]] — learns the optimal $$Q^*$$ regardless of behaviour; SARSA is [[on-policy]] — learns the value of the executing policy, including exploration.

## Conceptual Model

Both start from the [[Bellman equation]] for $$Q$$:
$$Q^\pi(s,a) = \mathbb{E}[r + \gamma Q^\pi(s', a')]$$
where $$a' \sim \pi(s')$$. TD learning replaces expectation with sampling; bootstraps using current $$Q$$ estimate.

## Details

**Q-learning** update (Watkins, 1989):
$$Q(s,a) \leftarrow Q(s,a) + \alpha [r + \gamma \max_{a'} Q(s',a') - Q(s,a)]$$
Max-operator makes this off-policy: target depends on optimal action, not behaviour. Converges to $$Q^*$$ under tabular representation, visiting all $$(s,a)$$ infinitely often, and Robbins-Monro step-sizes.

**SARSA** (Rummery-Niranjan, 1994) update:
$$Q(s,a) \leftarrow Q(s,a) + \alpha [r + \gamma Q(s', a') - Q(s,a)]$$
Uses actually-taken $$a'$$, so learned $$Q$$ reflects exploration policy — including stochastic epsilon-greedy penalties. Safer in cliff-walking scenarios where Q-learning might learn risky near-cliff paths since it imagines greedy continuation.

**n-step variants**: SARSA($$\lambda$$), Q($$\lambda$$) use [[eligibility traces]] for longer credit assignment. Watkins' Q($$\lambda$$) cuts traces on off-policy deviations.

**Expected SARSA**: replaces $$Q(s', a')$$ with $$\mathbb{E}_\pi[Q(s',a')]$$, lower variance than SARSA, unbiased off-policy when target policy matches — generalises both SARSA and Q-learning.

**Double Q-learning** (van Hasselt, 2010): maintains two Q-networks to eliminate the [[maximisation bias]] in Q-learning's $$\max$$ operator — critical for [[Deep Q-Network (DQN) + double DQN + dueling]].

**Convergence theory**: tabular Q-learning convergence proven (Watkins-Dayan, 1992). Linear function approximation: Q-learning can diverge (deadly triad: bootstrapping + off-policy + function approximation). [[Gradient TD]] (Sutton et al., 2009) and [[GQ]] algorithms restore convergence.

**Exploration**: [[epsilon-greedy]], [[softmax]]/Boltzmann, [[UCB]], [[Thompson sampling]] — see [[exploration: epsilon-greedy + UCB + Thompson]].

Related: [[policy gradient: REINFORCE + A2C]], [[PPO + TRPO + trust regions]], [[DDPG + TD3 + SAC (continuous control)]].

## Open Questions

## Sources
[source:sutton-barto-2018] Sutton & Barto, *Reinforcement Learning: An Introduction* 2e. MIT Press. Confidence: high.
[source:watkins-dayan-1992] Watkins & Dayan, *Q-learning*, Machine Learning 1992. Confidence: high.

