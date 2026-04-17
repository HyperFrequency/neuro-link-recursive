---
title: Self-Supervised Pretext Tasks
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: a88f8a597395dcb0a14157b11da87741eefd813f739d6d139b5a8370e0d85e3d
---

---
title: Self-Supervised Pretext Tasks
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Contrastive Learning]]"
  - "[[Knowledge Distillation DistilBERT TinyBERT]]"
---

# Self-Supervised Pretext Tasks

## Overview
Self-supervised learning generates training signal from data structure itself, defining "pretext" tasks whose labels come for free. Categories include generative/predictive (masked modeling, next-token prediction), contrastive, and auxiliary pretexts (rotation, jigsaw, colorization). Scaling these predicted-label tasks drove the foundation-model era.

## Conceptual Model
A pretext task transforms unlabeled input $x$ into a paired (input, label) problem solvable from $x$ alone — e.g., masking part of $x$ and predicting it. Representation learned by the pretext network transfers to downstream tasks via fine-tuning, linear probing, or zero-shot prompting. Quality hinges on task's learning signal density and invariances induced.

## Details
**Generative / predictive pretexts**:
- **Autoregressive language modeling**: predict next token given context. GPT family. Dense signal per token, scales to 13T+ tokens.
- **Masked language modeling (MLM)**: BERT — mask 15% of tokens, predict from bidirectional context. Stronger for understanding, weaker for generation.
- **Denoising autoencoding**: BART, T5 — corrupt input (deletion, span mask, shuffle), reconstruct original.
- **Masked image modeling**: MAE (mask 75% patches, reconstruct pixels), BEiT (predict discrete visual tokens), SimMIM. Pixel reconstruction is surprisingly effective with high mask ratio.
- **Audio masked prediction**: wav2vec 2.0 masks latents, predicts with contrastive; HuBERT uses k-means cluster targets.

**Contrastive pretexts** (see [[Contrastive Learning]]): SimCLR, MoCo, CLIP.

**Clustering-based**: DeepCluster, SwAV — alternating cluster assignment and representation updates. Scales to large unlabeled sets.

**Auxiliary geometric/visual pretexts** (earlier era, less effective vs contrastive/MIM):
- RotNet: predict 0°/90°/180°/270° rotation
- Jigsaw: reorder shuffled patches
- Colorization: grayscale → color
- Context prediction (Doersch): predict relative patch position

**Cross-modal predictive**:
- Image-text matching (CLIP, ALIGN): massive web-scraped caption pairs
- Video-text: use narration from instructional videos
- Video prediction: next-frame, future mask reconstruction

**Temporal/structural pretexts**:
- Time-contrastive: pull close-in-time frames together
- Predicting frame order, playback speed
- For graphs: edge masking (GraphMAE), contrastive augmentation (GraphCL)

Design principles:
- **Invariance vs covariance**: contrastive enforces invariance to augmentation; MIM retains more spatial information
- **Bottleneck**: force model to compress; latent predictor rather than pixel predictor for abstract representations
- **Data scale**: scaling unlabeled data typically dominates architecture choices
- **Pretext-downstream mismatch**: overly narrow pretext (e.g., rotation) fails to transfer to fine-grained tasks

**Empirical rankings** (2020–2024):
- Vision: DINOv2 > MAE > MoCo v3 > SimCLR > rotation
- NLP: GPT-style > BERT-style for instruction following; BERT stronger for classification
- Audio: HuBERT > wav2vec 2.0 > contrastive only
- Multimodal: CLIP remains backbone; SigLIP improves sample efficiency

## Applications
Foundation models (LLMs, vision transformers, multimodal), pretrained encoders for medical imaging, low-resource speech, drug discovery molecular reps.

## Open Questions
- Unified pretext task that works across modalities
- Optimal balance of generative + contrastive signals
- Theoretical account of representation quality

## Sources
[source:devlin-bert-2018] Devlin et al., "BERT", NAACL, 2019. Confidence: high.
[source:he-mae-2022] He et al., "Masked Autoencoders Are Scalable Vision Learners", CVPR, 2022. Confidence: high.
[source:radford-clip-2021] Radford et al., "Learning Transferable Visual Models from Natural Language Supervision", ICML, 2021. Confidence: high.

