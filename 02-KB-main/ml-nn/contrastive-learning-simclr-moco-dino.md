---
title: Contrastive Learning: SimCLR, MoCo, DINO
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 3d1dd2f064460467ab992bbc3b02e1d2071eceac8b0f13cfa905fc874f472035
---

---
title: Contrastive Learning
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Self-Supervised Pretext Tasks]]"
  - "[[Embedding Models E5 BGE Nomic]]"
---

# Contrastive Learning: SimCLR, MoCo, DINO

## Overview
Contrastive learning pulls embeddings of related views together and pushes unrelated samples apart, without labels. SimCLR, MoCo, and DINO represent three paradigms: in-batch negatives + augmentation, queue-based momentum encoders, and self-distillation without negatives — each producing strong transferable representations for vision and multimodal tasks.

## Conceptual Model
Given two augmented views $x_i, x_j$ of the same image (positive pair), encoders produce $z_i, z_j$. The InfoNCE loss maximizes mutual information by contrasting against a set of negatives $\{z_k\}$:
$$ \mathcal{L}_{ij} = -\log \frac{\exp(\mathrm{sim}(z_i, z_j)/\tau)}{\sum_{k \ne i} \exp(\mathrm{sim}(z_i, z_k)/\tau)} $$
The variations between methods come from where negatives are sourced (batch, queue, none) and how asymmetry between branches is introduced.

## Details
**SimCLR (Chen et al. 2020)**: symmetric Siamese, in-batch negatives. Critical components:
- Strong augmentation: random crop + color jitter + Gaussian blur (composition matters more than any single aug)
- Projection head $g: h \to z$ (MLP with ReLU) — contrast in $z$ space, but transfer via $h$
- Large batch size (4096+) for sufficient negatives
- Temperature $\tau \approx 0.1$

Limitations: memory-hungry, sensitive to batch size.

**MoCo v1/v2/v3 (He et al. 2019–2021)**: momentum encoder maintains a large dynamic dictionary of negatives decoupled from batch size. Key encoder $f_k$ is EMA of query encoder $f_q$: $\theta_k \leftarrow m \theta_k + (1-m)\theta_q$, $m \approx 0.999$. Queue stores 65K keys, providing many negatives cheaply. MoCov2 adds SimCLR's projection head + augmentation. MoCov3 switches to ViT backbone with stop-gradient trick.

**BYOL (Grill et al. 2020)**: no negatives at all — just a predictor head + EMA teacher. Online network predicts teacher's projections; asymmetry prevents collapse. Surprising that it works (requires batch norm or careful architecture).

**SimSiam (Chen–He 2020)**: like BYOL but without momentum encoder — just stop-gradient on one branch. Demonstrates that stop-gradient alone suffices to avoid collapse.

**DINO (Caron et al. 2021)**: self-distillation with ViT. Student sees local crops + global crops; teacher sees only global crops. Soft distillation via cross-entropy with centering + sharpening. Produces emergent object segmentation maps in attention — property critical for downstream dense prediction.

**CLIP (Radford et al. 2021)**: cross-modal contrastive (image-text pairs), symmetric InfoNCE. Enabled zero-shot classification via text prompts. Trained on 400M pairs.

**DINOv2 (2023)**, **I-JEPA (2023)**, **MAE (2021)**: competing paradigms; MAE uses masked reconstruction rather than contrastive, yielding complementary features.

Key considerations:
- Temperature $\tau$: smaller = more uniform on sphere, larger = more concentrated
- Projection head: breaks feature-invariance tension (projection enforces invariance while features retain information)
- Hard negatives vs random: too hard = false-negative collision; random = easy-dominated loss
- Multi-crop (SwAV, DINO): small local + large global crops improves efficiency

## Applications
Foundation vision models (DINOv2 as feature extractor), self-supervised pre-training for medical/remote sensing, text embeddings (E5/BGE style), multimodal alignment (CLIP, SigLIP).

## Open Questions
- Theoretical understanding of collapse-avoidance mechanisms
- Scaling contrastive to $10^{10}+$ image-text pairs

## Sources
[source:chen-simclr-2020] Chen et al., "A Simple Framework for Contrastive Learning of Visual Representations", ICML, 2020. Confidence: high.
[source:he-moco-2020] He et al., "Momentum Contrast for Unsupervised Visual Representation Learning", CVPR, 2020. Confidence: high.
[source:caron-dino-2021] Caron et al., "Emerging Properties in Self-Supervised Vision Transformers", ICCV, 2021. Confidence: high.

