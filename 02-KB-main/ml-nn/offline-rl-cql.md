---
title: Offline RL and Conservative Q-Learning
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 813d02a30152f9f9f42fb408034f6da0f5e52440c04cc08568e1b43fcd5f8179
---

---
title: Offline RL and Conservative Q-Learning
domain: ml-nn
sources:
  - slug: kumar-2020
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: kostrikov-2022
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can diffusion-based offline policies reliably outperform IQL on high-dimensional manipulation?
  - What dataset-coverage metric best predicts achievable OOS return in offline RL?
wikilinks:
  - "[[DDPG + TD3 + SAC (continuous control)]]"
  - "[[model-based RL + world models]]"
  - "[[decision transformer]]"
  - "[[D4RL]]"
  - "[[BCQ]]"
  - "[[IQL]]"
---

# Offline RL and Conservative Q-Learning

## Overview

[[Offline RL]] (aka [[batch RL]]) learns a policy from a fixed dataset without further environment interaction. Naive off-policy algorithms catastrophically fail due to [[distributional shift]] — extrapolation errors at out-of-distribution actions cause $$Q$$ overestimation. [[Conservative Q-Learning]] ([[CQL]]; Kumar et al., 2020) adds a pessimism regulariser that lower-bounds $$Q$$ on OOD actions.

## Conceptual Model

Given dataset $$\mathcal{D} = \{(s,a,r,s')\}$$, standard Q-learning target $$r + \gamma \max_{a'} Q(s',a')$$ queries $$Q$$ at actions not in $$\mathcal{D}$$ — exploits function-approximation errors since there's no data to correct. Offline RL mitigates via (1) [[policy constraint]] ($$\pi$$ stays near behaviour); (2) [[value pessimism]] (underestimate OOD $$Q$$); (3) [[uncertainty penalty]].

## Details

**CQL** objective:
$$\mathcal{L}_{CQL} = \mathcal{L}_{TD} + \alpha\left(\mathbb{E}_{s \sim \mathcal{D}}[\log \sum_a \exp Q(s,a)] - \mathbb{E}_{(s,a)\sim\mathcal{D}}[Q(s,a)]\right)$$
The penalty pushes down $$Q$$ on actions with high $$\exp Q$$ (overestimated) while supporting in-data $$Q$$. Provably lower-bounds true $$Q^\pi$$.

**BCQ** (Batch-Constrained Q-learning; Fujimoto et al., 2019): trains a generative model of behaviour policy; $$Q$$-update only considers actions generatively resampled. Forces $$\pi$$ to lie in the support of $$\mu$$.

**BEAR** (Bootstrapping Error Accumulation Reduction; Kumar et al., 2019): penalises policy for MMD distance from behaviour — similar support-constraint philosophy.

**IQL** (Implicit Q-Learning; Kostrikov et al., 2022): avoids explicit policy via [[expectile regression]] of $$Q$$ targets; extract policy via advantage-weighted regression. Simple, strong on D4RL.

**TD3+BC** (Fujimoto-Gu, 2021): standard TD3 with behavioural cloning regularisation — $$\pi = \arg\min \mathcal{L}_{TD3} + \lambda \|\pi - a\|^2$$. Surprisingly strong baseline.

**Diffusion-based policies** (Diffuser, Diffusion-QL; Wang et al., 2023): model $$\pi(a|s)$$ as conditional diffusion — expressive enough to match multimodal behaviour distributions.

**Decision Transformer** (Chen et al., 2021): frames RL as [[sequence modelling]]; conditional on return-to-go token. Avoids Bellman entirely. Works well on sparse-reward tasks where value bootstrapping struggles.

**D4RL** (Fu et al., 2020): benchmark suite — MuJoCo, AntMaze, Kitchen, Adroit. Standard for offline RL evaluation.

**Applications**:
- [[Medical]] decision support from retrospective records.
- [[Recommendation systems]] from logged data.
- [[Trading]] from historical tick data — [[market replay]] avoids live exploration risk.
- [[Robot learning]] from human demonstrations.

**Pitfalls**: offline RL is sensitive to dataset coverage — narrow behaviour distribution bounds achievable performance. [[Offline-to-online]] fine-tuning (Nair et al., 2020; Lee et al., 2022) combines pre-training on offline data with online adaptation.

Related: [[model-based RL + world models]], [[DDPG + TD3 + SAC (continuous control)]].

## Open Questions

## Sources
[source:kumar-2020] Kumar et al., *Conservative Q-Learning for Offline Reinforcement Learning*, NeurIPS 2020. Confidence: high.
[source:kostrikov-2022] Kostrikov et al., *Offline Reinforcement Learning with Implicit Q-Learning*, ICLR 2022. Confidence: high.

