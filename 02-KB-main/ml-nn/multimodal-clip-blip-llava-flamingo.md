---
title: Multimodal Models: CLIP, BLIP, LLaVA, Flamingo
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 2025634dbba5c1abf8d7fd7c7ccb7c259cb8cafcef015042c9053f7ab04e11e2
---

---
title: Multimodal Models: CLIP, BLIP, LLaVA, Flamingo
domain: ml-nn
sources:
  - slug: radford-2021
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
  - slug: alayrac-2022
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can open-weight multimodal models match Gemini/GPT-4V on domain-specific finance charts?
  - What training-data curation policies most reduce visual hallucination without costly RLHF?
wikilinks:
  - "[[CLIP]]"
  - "[[BLIP]]"
  - "[[LLaVA]]"
  - "[[Flamingo]]"
  - "[[InfoNCE]]"
  - "[[Open-FinLLMs-Open-Multimodal-Large-Language-Models-for-Financial-Applications]]"
  - "[[Perceiver]]"
---

# Multimodal Models: CLIP, BLIP, LLaVA, Flamingo

## Overview

[[Multimodal]] vision-language models align image and text representations, enabling zero-shot classification, captioning, visual question answering, and grounded dialogue. [[CLIP]] pioneered contrastive dual-encoder training; [[BLIP]] added captioning heads; [[LLaVA]] connected a vision encoder to an instruction-tuned LLM; [[Flamingo]] introduced cross-attention into frozen LLMs.

## Conceptual Model

- [[CLIP]] (Radford et al., 2021, OpenAI): dual encoders (ViT + BERT-style text), InfoNCE loss over 400M image-text pairs. Produces aligned embeddings usable for retrieval and zero-shot classification via prompt templates.
- [[BLIP]] (Li et al., 2022, Salesforce): unified vision-language architecture combining image-grounded text decoder, image-text contrastive, image-text matching. Bootstraps captions via synthetic augmentation.
- [[LLaVA]] (Liu et al., 2023): connects frozen CLIP vision tower to LLaMA via a learned MLP projector, then instruction-tunes on GPT-4 generated multimodal prompts. Simple, compute-efficient, strong VQA.
- [[Flamingo]] (Alayrac et al., 2022, DeepMind): inserts [[gated cross-attention]] layers into a frozen Chinchilla LLM; [[Perceiver resampler]] compresses variable-length image features to fixed tokens. Few-shot visual in-context learning.

## Details

**CLIP training objective**: symmetric InfoNCE
$$\mathcal{L} = -\frac{1}{2N}\sum_i [\log \frac{e^{s_{ii}/\tau}}{\sum_j e^{s_{ij}/\tau}} + \log \frac{e^{s_{ii}/\tau}}{\sum_j e^{s_{ji}/\tau}}]$$
with $$s_{ij} = \cos(f_I(x_i), f_T(t_j))$$ and learned temperature $$\tau$$. [[Zero-shot classifier]] uses class templates ("a photo of a <class>") and selects argmax cosine similarity.

**LLaVA recipe** (two-stage):
1. Pretrain projector on 558k image-caption pairs with frozen vision and LLM.
2. Instruction-tune projector + LLM (full) on 158k GPT-4-generated VQA and reasoning conversations.

**Flamingo innovations**: variable image count per prompt, interleaved text-image sequences, retains LLM priors via frozen backbone — high compute efficiency but harder to train.

**Benchmarks**: VQA-v2, GQA, TextVQA, MMBench, MMMU, POPE (hallucination), ChartQA. [[Open-FinLLMs-Open-Multimodal-Large-Language-Models-for-Financial-Applications]] extends multimodal reasoning to financial charts and tables.

**Successors**: GPT-4V, Gemini, Claude Opus multimodal (unified models trained natively on images, audio, text). Open-weight trends: [[Qwen-VL]], [[InternVL]], [[Idefics]], [[LLaVA-OneVision]].

**Limitations**: OCR and fine-grained spatial reasoning lag specialists; hallucination on out-of-distribution scenes; poor compositional understanding (CLIP fails on "dog left of cat"). [[Winoground]], [[ARO]] benchmarks probe compositionality.

## Open Questions

## Sources
[source:radford-2021] Radford et al., *Learning Transferable Visual Models From Natural Language Supervision*, ICML 2021. Confidence: high.
[source:alayrac-2022] Alayrac et al., *Flamingo: a Visual Language Model for Few-Shot Learning*, NeurIPS 2022. Confidence: high.

