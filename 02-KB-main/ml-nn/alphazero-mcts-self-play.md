---
title: AlphaZero, MCTS, and Self-Play
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 486276b9cb3e6524390787691aed382df9c816c77154585edf5f0624d3b972ba
---

---
title: AlphaZero, MCTS, and Self-Play
domain: ml-nn
sources:
  - slug: silver-2017
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: schrittwieser-2020
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can MCTS-style planning improve RLHF reward-model search under reasoning budget?
  - Are MuZero's latent representations more compressible than explicit dynamics models?
wikilinks:
  - "[[model-based RL + world models]]"
  - "[[MuZero]]"
  - "[[MCTS]]"
  - "[[PUCT]]"
  - "[[CFR]]"
  - "[[AlphaFold]]"
  - "[[self-play]]"
---

# AlphaZero, MCTS, and Self-Play

## Overview

[[AlphaZero]] (Silver et al., 2017) unified [[Monte Carlo Tree Search]] (MCTS) with a deep neural network trained purely by [[self-play]] reinforcement learning. Starting from random play, AlphaZero surpassed world-champion-level performance in Chess, Shogi, and Go in under 24 hours of TPU-cluster training — no human game data or domain knowledge beyond rules.

## Conceptual Model

Network $$(p, v) = f_\theta(s)$$: policy head $$p(a|s)$$ + value head $$v(s) \in [-1, 1]$$. MCTS uses network priors to guide search; training targets come from search-improved policy and final game outcome. [[Policy improvement]] + [[policy evaluation]] realised jointly — MCTS is the policy improvement operator, network is policy evaluation.

## Details

**MCTS selection** via [[PUCT]] ([[predictor + UCT]]):
$$a^* = \arg\max_a Q(s,a) + c_{puct} p(a|s) \frac{\sqrt{N(s)}}{1 + N(s,a)}$$
Balances exploitation ($$Q$$), exploration ($$N^{-1}$$), and prior ($$p$$). Constant $$c_{puct} \approx 1.25$$; sometimes scheduled.

**AlphaZero loop**:
1. Self-play: generate games where each move is chosen by $$\pi_t \propto N(s_t,\cdot)^{1/\tau}$$ (softmax over MCTS visit counts).
2. Training: minimise $$(v - z)^2 + \pi^\top \log p + c\|\theta\|^2$$ with $$z \in \{-1, 0, 1\}$$ game outcome, $$\pi$$ the MCTS policy.
3. Update network; repeat.

**MuZero** (Schrittwieser et al., 2020) extends AlphaZero to tasks without a given model of dynamics. Learns a latent representation $$h_\theta(s)$$, dynamics $$g_\theta(s, a) \to (r, s')$$, and prediction $$f_\theta(s) \to (p, v)$$ — plans in latent space; SOTA on Atari + board games.

**Strengths**:
- No need for hand-crafted evaluation functions.
- Generalises: same architecture solves Chess, Go, Shogi.
- Scales with compute elegantly.

**Limitations**:
- Requires [[perfect-information]] / [[deterministic]] environments.
- Large compute (5000 TPUs for original AlphaZero training).
- Imperfect-info extension: [[Player of Games]] (Schmid et al., 2023), [[Student of Games]] — combine MCTS with [[CFR]] (counterfactual regret minimisation).

**Applications beyond games**:
- [[AlphaFold]] (related DeepMind lineage).
- [[Code search]] (AlphaCode-like rollout).
- [[Theorem proving]] ([[AlphaProof]], [[AlphaGeometry]]).
- [[Quantum circuit synthesis]] (AlphaTensor).

**MCTS variants**:
- [[UCT]] — classic MCTS for general game-playing.
- [[PUCT]] — AlphaZero variant.
- [[Regularised MCTS]] (Grill et al., 2020) — mathematical equivalence to policy iteration.
- [[Gumbel MCTS]] (Danihelka et al., 2022) — principled low-visit behaviour.

Related: [[model-based RL + world models]], [[RL foundations: Q-learning + SARSA]].

## Open Questions

## Sources
[source:silver-2017] Silver et al., *Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm*, arXiv 2017. Confidence: high.
[source:schrittwieser-2020] Schrittwieser et al., *Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model*, Nature 2020. Confidence: high.

