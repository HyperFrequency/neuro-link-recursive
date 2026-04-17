---
title: Knowledge Distillation: DistilBERT, TinyBERT
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 5ad2efd9857a4f5aa83c8cfdcced076c0c3d242c6a743d1bb3078ae02b3e6f18
---

---
title: Knowledge Distillation DistilBERT TinyBERT
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Pruning Magnitude Structured Lottery Ticket]]"
  - "[[Neural Architecture Search and DARTS]]"
  - "[[Self-Supervised Pretext Tasks]]"
---

# Knowledge Distillation: DistilBERT, TinyBERT

## Overview
Knowledge distillation transfers the predictive behavior of a large "teacher" model to a smaller "student" via soft-label training, often with intermediate-layer matching. DistilBERT and TinyBERT are canonical NLP distillations achieving 60–97% of BERT-base quality at 40–90% fewer parameters.

## Conceptual Model
Teacher $T$ produces logits $z_T$ which softmax at high temperature $\tau$ gives soft probabilities carrying more information than hard labels. Student $S$ minimizes a composite loss:
$$ \mathcal{L} = \alpha \mathcal{L}_{CE}(y, \sigma(z_S)) + (1-\alpha) \tau^2 \mathcal{L}_{KL}(\sigma(z_T/\tau), \sigma(z_S/\tau)) $$
The $\tau^2$ factor preserves gradient magnitude; $\alpha$ balances hard and soft supervision.

## Details
**Hinton–Vinyals–Dean (2015)**: introduced distillation concept. Soft targets carry "dark knowledge" — relative probabilities across wrong classes reveal teacher's learned similarity structure.

**DistilBERT (Sanh et al. 2019)**: 6-layer student from 12-layer BERT-base. 40% fewer parameters, 60% faster, retains 97% of GLUE score. Training: distillation on MLM + unsupervised corpus (Wikipedia+BookCorpus), with layer-initialization from every other teacher layer.

Losses combined:
- MLM loss on masked tokens
- Distillation loss: KL between student and teacher softmaxes
- Cosine loss: align hidden-state directions

**TinyBERT (Jiao et al. 2020)**: deeper distillation matching teacher at multiple levels:
- Embedding layer
- Attention matrices ($\mathcal{L}_{attn} = \frac{1}{h} \sum \mathrm{MSE}(A_T, A_S)$)
- Hidden states (with projection matching dims)
- Prediction layer

Two-stage: general-domain distillation + task-specific distillation. TinyBERT-4 (4 layers, 14.5M params) achieves >96% BERT-base on GLUE.

**MobileBERT (2020)**: bottleneck/inverted-bottleneck architecture with teacher-guided distillation, 4× smaller than BERT-base at comparable quality.

**MiniLM (Wang et al. 2020)**: distills from teacher's self-attention relations (queries-keys and values-values). Generalizes across teacher architectures.

**Distillation variants**:
- **Online distillation (co-distillation, DML)**: train teacher and student jointly
- **Self-distillation**: deeper layers teach shallower (or successive checkpoints)
- **Born-again networks**: identical-architecture student trained via distillation often beats teacher
- **Data augmentation distillation**: generate more training data from teacher predictions on unlabeled or synthetic inputs
- **Chain-of-thought distillation**: teacher produces reasoning traces; student learns both answer and chain (Orca, MetaMath)

**LLM distillation era (2023–2025)**:
- Alpaca, Vicuna: Self-Instruct distillation from GPT-3.5/4 → Llama 7B
- Phi-series (Microsoft): textbook-quality synthetic data + distillation
- DeepSeek-R1 distills reasoning to smaller open models
- Gemma-2 uses logit distillation from larger teacher

**Loss components frequently combined**:
- Logit KL
- Feature map MSE (for vision CNNs)
- Attention matrix MSE
- Rank-preserving losses (RKD)

**When distillation helps**: large quality headroom in teacher, sufficient unlabeled data, student architecture compatible with teacher's inductive biases.

**When it doesn't**: task requiring world knowledge absent from teacher's training; adversarial robustness gaps; long-tail/rare phenomena.

## Applications
Edge deployment (mobile NLU, on-device search), RAG retrievers distilled from cross-encoders, LLM compression for cost efficiency, specialized small models (code, math).

## Open Questions
- Optimal student architecture search for given teacher
- Distillation of emergent LLM capabilities (chain-of-thought, tool use)

## Sources
[source:hinton-distillation-2015] Hinton, Vinyals, Dean, "Distilling the Knowledge in a Neural Network", NeurIPS workshop, 2015. Confidence: high.
[source:sanh-distilbert-2019] Sanh et al., "DistilBERT: a distilled version of BERT", NeurIPS EMC2, 2019. Confidence: high.
[source:jiao-tinybert-2020] Jiao et al., "TinyBERT: Distilling BERT for Natural Language Understanding", EMNLP, 2020. Confidence: high.

