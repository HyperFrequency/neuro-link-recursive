---
title: Neural Architecture Search and DARTS
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: dff8ed976f1ce98a82884fab48200fc7fe048ae7c6de7af091361abe807b81ec
---

---
title: Neural Architecture Search and DARTS
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Pruning Magnitude Structured Lottery Ticket]]"
  - "[[Knowledge Distillation DistilBERT TinyBERT]]"
---

# Neural Architecture Search and DARTS

## Overview
Neural Architecture Search (NAS) automates architecture design by searching over candidate topologies. Early reinforcement-learning and evolutionary NAS consumed thousands of GPU-days; DARTS reduced this to days via differentiable relaxation, enabling gradient-based architecture optimization.

## Conceptual Model
Treat architecture $\alpha$ as a hyperparameter: define a search space, performance estimator, and optimizer. DARTS relaxes the discrete choice of operation at each edge of a directed acyclic graph (DAG) into a softmax over candidates:
$$ o_{(i,j)}(x) = \sum_{k} \frac{\exp(\alpha_{(i,j)}^k)}{\sum_{k'} \exp(\alpha_{(i,j)}^{k'})} o^k(x) $$
Bi-level optimization alternately updates weights $w$ on the training set and architecture $\alpha$ on validation.

## Details
**NAS components**:
- **Search space**: macro (whole architecture) vs cell-based (repeated motif) vs hierarchical
- **Search strategy**: RL (NASNet, ENAS), evolutionary (AmoebaNet), Bayesian, gradient-based (DARTS), one-shot supernet
- **Performance estimator**: full training, weight sharing, low-fidelity proxies, predictors

**Early NAS (2017–2018)**:
- NAS (Zoph–Le 2016): RL controller samples architectures, train each from scratch. 22K GPU-days.
- NASNet: transferable cell motif, 1800 GPU-days for CIFAR-10 then transfer to ImageNet.
- AmoebaNet (Real et al. 2018): regularized evolution with aging selection.

**Efficient NAS**:
- **ENAS (Pham et al. 2018)**: weight sharing — single supernet contains all candidate architectures; controller samples subnets using shared weights. 1000× cheaper.
- **DARTS (Liu et al. 2019)**: differentiable NAS via continuous relaxation. 4 GPU-days on CIFAR. Finds cell matching best RL-searched NASNet-A.
- **PC-DARTS**: partial channel connections reduce memory; trains on ImageNet directly.
- **GDAS, DrNAS, SNAS**: variants regularizing discreteness or Gumbel-softmax to reduce DARTS's tendency toward skip-connection-heavy degeneracy.

**One-shot NAS / Supernet methods**:
- **Once-for-All (Cai et al. 2020)**: train once, deploy many — supernet supports elastic depth, width, kernel size, resolution. Subnet extraction without retraining.
- **BigNAS**: similar supernet with step-training for multiple widths.
- **AttentiveNAS**: adaptive sampling weights important subnets.

**NAS-Bench-101, 201, 301**: precomputed benchmarks enable fair NAS algorithm comparison without compute.

**DARTS pitfalls**:
- Tends to pick skip connections (they dominate early in training)
- Collapsed architectures (trivial shortcuts) common
- Fixes: DARTS+ (early stopping), FairDARTS (sigmoid not softmax), P-DARTS (progressive depth)

**Training-free NAS (Zero-cost proxies)**:
- NAS-WOT (2021): score networks at initialization via activation similarity
- TE-NAS, Zen-NAS: Gaussian processes or activation metrics correlate with final accuracy
- Useful when compute is the constraint

**Hardware-aware NAS**:
- MnasNet, FBNet, ProxylessNAS: include latency on target device (TPU, phone, FPGA) in the objective
- Measured or predicted latency gates accept

**Modern impact**: EfficientNet scaling laws came out of NAS; current LLMs use hand-designed architectures but post-training distillation/pruning fills the efficiency niche.

## Applications
Mobile vision models (MobileNetV3, EfficientNet-Lite), hardware-specific accelerator kernels, dynamic inference (adaptive networks), automated compression pipelines.

## Open Questions
- NAS for transformer/attention architecture choices at LLM scale
- Unified framework for architecture + hyperparameter + data pruning search

## Sources
[source:zoph-le-2016] Zoph and Le, "Neural Architecture Search with Reinforcement Learning", ICLR, 2017. Confidence: high.
[source:liu-darts-2019] Liu, Simonyan, Yang, "DARTS: Differentiable Architecture Search", ICLR, 2019. Confidence: high.
[source:cai-ofa-2020] Cai et al., "Once-for-All: Train One Network and Specialize it for Efficient Deployment", ICLR, 2020. Confidence: high.

