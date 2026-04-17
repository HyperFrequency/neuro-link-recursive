---
title: Exploration: Epsilon-Greedy, UCB, and Thompson Sampling
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 57397750a9d30ce90c09757244c0da11e0be933f80a6496d8f37e3eaa4e01804
---

---
title: Exploration: Epsilon-Greedy, UCB, and Thompson Sampling
domain: ml-nn
sources:
  - slug: auer-2002
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: russo-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does Thompson sampling retain its empirical edge over UCB in non-stationary contextual bandits?
  - How does exploration-strategy choice interact with curriculum learning in deep RL?
wikilinks:
  - "[[RL foundations: Q-learning + SARSA]]"
  - "[[Deep Q-Network (DQN) + double DQN + dueling]]"
  - "[[multi-armed bandits]]"
  - "[[noisy networks]]"
  - "[[ICM]]"
  - "[[Bayesian optimisation]]"
---

# Exploration: Epsilon-Greedy, UCB, and Thompson Sampling

## Overview

Three canonical [[exploration strategies]] govern the [[exploration-exploitation tradeoff]] in sequential decision making. [[Epsilon-greedy]] takes random actions with probability $$\epsilon$$; [[UCB]] (upper confidence bound) optimistically bonuses under-sampled actions; [[Thompson sampling]] draws from posterior over action values.

## Conceptual Model

For multi-armed bandits with $$K$$ arms, reward $$r \sim \mathcal{D}_a$$ with mean $$\mu_a$$:
- $$\epsilon$$-greedy: $$a_t = \arg\max_a \hat\mu_a$$ w.p. $$1-\epsilon$$, uniform else.
- UCB1 (Auer et al., 2002): $$a_t = \arg\max_a \hat\mu_a + \sqrt{2\log t / n_a}$$.
- [[Thompson sampling]] (Thompson, 1933): sample $$\tilde\mu_a \sim p(\mu_a | \text{data})$$; $$a_t = \arg\max_a \tilde\mu_a$$.

## Details

**Regret bounds**:
- $$\epsilon$$-greedy: $$O(T)$$ linear regret for fixed $$\epsilon$$; $$O(\log T)$$ with decaying $$\epsilon_t = \min(1, K/t)$$ (rare in practice).
- UCB1: $$O(\sqrt{KT \log T})$$ worst-case; problem-dependent $$O(\log T)$$.
- Thompson sampling: Bayesian regret $$O(\sqrt{KT})$$; matches UCB asymptotically, empirically often better.

**Bayesian Thompson sampling** (Bernoulli bandit):
- Prior $$\mu_a \sim \text{Beta}(\alpha_a, \beta_a)$$.
- After arm $$a$$ pull with reward $$r$$: update $$\alpha_a \mathrel{+}= r$$, $$\beta_a \mathrel{+}= 1-r$$.
- Per decision: sample $$\tilde\mu_a \sim \text{Beta}(\alpha_a, \beta_a)$$; select arg-max.

Simple, near-optimal, and extensions to [[contextual bandits]] (linear Thompson, neural Thompson) straightforward.

**Contextual bandits**:
- LinUCB (Li et al., 2010): UCB with linear reward models — used in news recommendation.
- Neural Thompson (Riquelme et al., 2018): Bayesian neural net posterior draws.
- Bootstrap DQN: ensembles induce posterior samples for deep RL exploration.

**Deep RL exploration**:
- $$\epsilon$$-greedy in DQN: anneals $$1 \to 0.1$$.
- [[Noisy networks]] (Fortunato et al., 2018): learned stochastic linear layers.
- [[Parameter-space noise]] (Plappert et al., 2018).
- [[Intrinsic motivation]]: [[ICM]] (Pathak et al., 2017), [[RND]] (Burda et al., 2019) use prediction error as exploration bonus.
- [[Bootstrapped DQN]] (Osband et al., 2016) for deep-RL Thompson-like exploration.

**Information-theoretic**:
- [[Bayes-adaptive]] exploration: optimal but intractable; [[BAMCP]] (Guez et al.) approximates.
- [[Information gain]]-based exploration: maximise $$I(\theta; \text{observation})$$.

**Practical finance/trading application**: Thompson for [[order routing]] choice; UCB for [[A/B testing]] of execution algorithms; $$\epsilon$$-greedy baseline in factor-model ensemble selection.

Related: [[RL foundations: Q-learning + SARSA]], [[Deep Q-Network (DQN) + double DQN + dueling]].

## Open Questions

## Sources
[source:auer-2002] Auer et al., *Finite-time Analysis of the Multiarmed Bandit Problem*, Machine Learning 2002. Confidence: high.
[source:russo-2018] Russo et al., *A Tutorial on Thompson Sampling*, FnT ML 2018. Confidence: high.

