---
title: Pruning: Magnitude, Structured, Lottery Ticket
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 7767fa103fdabfa3cd8d941ef594d00a7509320ca774a1337d04607d01783c63
---

---
title: Pruning Magnitude Structured Lottery Ticket
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Knowledge Distillation DistilBERT TinyBERT]]"
  - "[[Neural Architecture Search and DARTS]]"
---

# Pruning: Magnitude, Structured, Lottery Ticket

## Overview
Network pruning removes parameters to reduce size and compute. Unstructured (magnitude) pruning zeros individual weights; structured pruning removes whole filters/heads/layers for hardware speedups; the Lottery Ticket Hypothesis claims sparse sub-networks exist that match the dense model when retrained from original initialization.

## Conceptual Model
A trained network $f_\theta$ has weights with highly skewed magnitude distribution. Many can be zeroed with negligible accuracy loss, especially after fine-tuning. The sparsity pattern can be (a) scattered across individual weights (unstructured, masks multiply, little hardware win) or (b) aligned to computational blocks — channels, heads, layers — enabling real speedup on standard GPUs.

## Details
**Magnitude pruning (Han et al. 2015)**: prune weights with $|w| < \tau$. Iterative schedule: train dense → prune $x$% → retrain → repeat. Unstructured; reaches 90–95% sparsity on ResNet-50 with small accuracy drop but needs sparse kernels (cuSPARSE, SparseNN) for inference speedup.

**Global vs layerwise magnitude**:
- Layerwise: prune $x$% per layer; preserves balance
- Global: single threshold across all layers; usually higher accuracy at fixed sparsity

**Structured pruning**:
- **Filter/channel pruning**: zero entire conv filters → smaller feature maps
- **Head pruning**: remove entire attention heads (Voita et al., Michel et al. 2019)
- **Layer dropping**: LayerDrop train-time + pick subset at inference
- **Block sparsity**: 2:4 N:M patterns supported natively on NVIDIA Ampere/Hopper (2 of every 4 weights zero)

Importance criteria beyond magnitude:
- Taylor approximation: $|\partial L / \partial w \cdot w|$
- SNIP (single-shot): gradients at initialization
- Fisher information / Hessian-based (WoodFisher, OBS, optimal brain surgeon)
- Activation-based: L1 of BN $\gamma$ for channels

**Lottery Ticket Hypothesis (Frankle–Carbin 2018)**: for dense $f_\theta$ with initialization $\theta_0$ reaching accuracy $A$ in $T$ steps, there exists a mask $m$ such that $f_{m \odot \theta_0}$ — trained from $\theta_0$ — matches accuracy $A$ in $\le T$ steps. Found via iterative magnitude pruning + rewinding.

LTH refinements:
- **Weight rewinding**: reset to an early-training iterate, not original init (more robust at scale, Frankle et al. 2020)
- **Stable LTH on ImageNet**: rewinding works for ResNet-50; original init rarely does at scale
- **Multi-prize tickets**: multiple sparsity levels share same ticket structure
- **Strong LTH (Ramanujan et al. 2020)**: sufficiently overparameterized random network contains subnet matching any target function without training

**Dynamic sparsity (sparse training)**:
- RigL (2020): periodically drop low-magnitude + grow random/large-gradient
- SET, top-K gradient: maintain fixed-sparsity mask while training
- Avoids dense pretraining cost

**Post-training vs during-training**:
- Post-training: simple, limited sparsity
- During-training: reaches higher sparsity, requires tuning
- Pre-training: SparseGPT, Wanda prune LLMs in one-shot with calibration data

**Hardware realization**:
- Unstructured: needs sparse kernels; often gives little speedup
- 2:4 semi-structured: natively accelerated on A100/H100
- Structured (filter/head): actual FLOP reduction, easy deployment

**LLM pruning (2023–2024)**:
- SparseGPT, Wanda: 50–60% unstructured sparsity in one-shot
- LLM-Pruner: structured pruning with small calibration
- Attention head pruning: 20–30% reduction possible

## Applications
Edge deployment, mobile inference, LLM serving cost reduction, embedded sensors, neural co-processors.

## Open Questions
- Theoretical justification for LTH at scale
- Matching distillation quality via pure pruning

## Sources
[source:han-2015] Han et al., "Deep Compression", ICLR, 2016. Confidence: high.
[source:frankle-carbin-2018] Frankle and Carbin, "The Lottery Ticket Hypothesis", ICLR, 2019. Confidence: high.
[source:evci-rigl-2020] Evci et al., "Rigging the Lottery", ICML, 2020. Confidence: high.

