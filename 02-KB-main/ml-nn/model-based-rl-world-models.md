---
title: Model-Based RL and World Models
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 0b69952490b9c14b8619252600012e0f3b0b1f7f7f8eaf40a9d1588846605139
---

---
title: Model-Based RL and World Models
domain: ml-nn
sources:
  - slug: ha-schmidhuber-2018
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: hafner-2023
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Do latent-space world models scale to multi-agent and partially-observable financial trading?
  - What is the optimal ratio of simulated to real experience for Dyna-style RL?
wikilinks:
  - "[[AlphaZero + MCTS + self-play]]"
  - "[[offline RL + conservative Q-learning]]"
  - "[[policy gradient: REINFORCE + A2C]]"
  - "[[PlaNet]]"
  - "[[Dreamer]]"
  - "[[MuZero]]"
  - "[[MPC]]"
---

# Model-Based RL and World Models

## Overview

[[Model-based RL]] learns a model $$\hat p(s', r | s, a)$$ of environment dynamics and uses it for planning or policy improvement. [[World models]] (Ha-Schmidhuber, 2018) introduced the modern paradigm: learn a latent-space dynamics model from pixels, train policies inside the dream.

## Conceptual Model

Model-based pipeline: (1) collect data with exploratory policy; (2) fit dynamics model $$p_\psi$$; (3) plan via [[MPC]] or train policy via simulated rollouts; (4) deploy, collect more data, iterate ([[Dyna]]-style). Benefits: sample efficiency ($$10$$-$$100\times$$ fewer real-env interactions); counterfactual reasoning; transferable model across tasks.

## Details

**Classical**: [[Dyna-Q]] (Sutton, 1990) interleaves real updates with simulated ones; [[PILCO]] (Deisenroth-Rasmussen, 2011) uses Gaussian process dynamics + policy-gradient through analytical moments; [[GPS]] (guided policy search; Levine-Koltun, 2013).

**Deep latent models**:
- [[World Model]] (Ha-Schmidhuber, 2018): VAE + MDN-RNN; train controller in dream via CMA-ES.
- [[PlaNet]] (Hafner et al., 2019): Recurrent State-Space Model (RSSM) with stochastic + deterministic latent; [[cross-entropy method]] (CEM) for planning.
- [[Dreamer]] (v1, v2, v3; Hafner et al., 2020-2023): learn policy + value in latent space via [[backprop through dream]] — solves MuJoCo, DMControl, Atari, Minecraft Diamond.
- [[MuZero]] (Schrittwieser et al., 2020): learn value-equivalent model for MCTS; SOTA on Atari + board games.
- [[TD-MPC]] and [[TD-MPC2]] (Hansen et al., 2022-2024): decision-time MPC with learned value — strong empirical performance across DMControl and real robots.

**Planning methods inside models**:
- [[MPC]] / [[model-predictive control]] with rollout horizon $$H$$.
- [[Cross-entropy method]] (CEM) — sample-based action optimisation.
- [[MCTS]] — discrete action planning ([[AlphaZero + MCTS + self-play]]).
- [[Gradient-based]] planning via pathwise gradients ([[iLQR]], [[SAC-like]]).

**Challenges**:
- [[Model error compounding]]: small per-step errors explode over horizon — motivates short-horizon rollouts + real data mixing.
- [[Exploration]]: latent models tend to underrepresent rarely-visited regions; need epistemic-aware dynamics (probabilistic ensembles; [[PETS]]).
- [[Reward hacking]]: policies exploit model inaccuracies.
- [[Representation learning]]: value-equivalent vs reconstruction objectives trade off.

**Modern SOTA**: Dreamer-V3 solves diverse tasks including Minecraft diamond from pixels without curriculum. MuZero-variants power discrete planning. Applications: [[robot manipulation]] ([[Day Dreamer]]), autonomous driving, [[offline RL]] hybrids.

Related: [[AlphaZero + MCTS + self-play]], [[offline RL + conservative Q-learning]], [[exploration: epsilon-greedy + UCB + Thompson]].

## Open Questions

## Sources
[source:ha-schmidhuber-2018] Ha & Schmidhuber, *World Models*, NeurIPS 2018. Confidence: high.
[source:hafner-2023] Hafner et al., *Mastering Diverse Domains through World Models*, arXiv Dreamer-V3 2023. Confidence: high.

