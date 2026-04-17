---
title: Embedding Models: E5, BGE, Octen, nomic
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 6fec437c65d97892124098bdda402f6147567a02a5a97996b3c611e0b082d525
---

---
title: Embedding Models E5 BGE Nomic
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Cross-Encoder Reranking and ColBERT]]"
  - "[[HNSW IVF PQ Vector Indexes]]"
  - "[[Contrastive Learning]]"
---

# Embedding Models: E5, BGE, Octen, nomic

## Overview
Modern dense retrieval relies on general-purpose embedding models that map text to fixed-dimensional vectors where cosine similarity correlates with semantic relatedness. E5 (Microsoft), BGE (BAAI), Octen, and nomic-embed represent leading open-weight families competing with OpenAI's text-embedding-3 and Cohere embed-v3.

## Conceptual Model
All use bi-encoder architectures: encoder processes query and passage independently, cosine similarity (or dot product) between pooled representations approximates relevance. Trained via [[Contrastive Learning]] on large web-mined query-passage pairs with mined hard negatives, then instruction-tuned for task prefixes (e.g., "query: ", "passage: ").

## Details
**E5 (Microsoft, 2022–2024)**: "EmbEddings from bidirEctional Encoder representations". Trained on ~270M text pairs mined from web (CCPairs), with supervised fine-tuning on MSMARCO, NQ, NLI. Backbone: MiniLM, base-BERT, or Large. E5-mistral-7b-instruct (2024) scaled to decoder-only 7B with synthetic instruction data, state-of-art on MTEB at release.

**BGE (Beijing Academy of AI, 2023–2024)**: BGE-small/base/large (English and Chinese), M3-embedding (multi-function: dense + sparse + multi-vector), BGE-reranker, BGE-M3 supports 100+ languages and 8K context. Training: 100M+ pairs + RetroMAE pre-training (denoising with asymmetric encoder-decoder). Top MTEB performer throughout 2024.

**nomic-embed (Nomic AI, 2024)**: open-source with transparent data (235M pairs), 8192 token context, 768-dim, trained via Matryoshka representation learning (variable truncation without retraining). Claimed to beat OpenAI ada-002 on MTEB.

**Octen / Jina / Mxbai / GTE / Stella**: additional competitive open-weight entrants with distinct training recipes. MTEB leaderboard churns monthly with new SOTA.

Training objectives:
- InfoNCE contrastive loss: $\mathcal{L} = -\log \frac{\exp(\mathrm{sim}(q, p^+)/\tau)}{\sum_{p \in \mathcal{B}} \exp(\mathrm{sim}(q, p)/\tau)}$
- Hard negative mining using previous checkpoint or BM25 candidates
- Optional distillation from cross-encoders (teacher-student)

Key design choices:
- **Pooling**: mean-pooling (E5, BGE), CLS-token pooling, weighted layer aggregation
- **Instruction tuning**: task-specific prefixes ("Represent this sentence for retrieval:")
- **Matryoshka**: train head to preserve relevance at truncated dimensions (128/256/512/768/1024)
- **Long context**: ALiBi/RoPE position encoding extensions for 8K+ input

Evaluation: MTEB benchmark (56 datasets across retrieval, classification, clustering, STS). Retrieval subset most relevant for RAG.

Practical considerations:
- **Quantization**: int8/binary embeddings reduce storage 4–32x with <5% relevance drop
- **Dimension**: 768 typical; 1536 for OpenAI-3; Matryoshka enables adaptive trade-offs
- **Domain mismatch**: general web embeddings underperform on medical/legal/code; fine-tune or use domain-specialized (BioLORD, CodeBERT)

## Applications
Retrieval-augmented generation (RAG), semantic search, clustering, classification (via k-NN), deduplication.

## Open Questions
- Task-universal embeddings vs task-specialist trade-offs
- Multilingual transfer quality across low-resource languages

## Sources
[source:wang-e5-2022] Wang et al., "Text Embeddings by Weakly-Supervised Contrastive Pre-training", arXiv, 2022. Confidence: high.
[source:xiao-bge-2023] Xiao et al., "C-Pack: Packaged Resources to Advance General Chinese Embedding", arXiv, 2023. Confidence: high.
[source:nussbaum-nomic-2024] Nussbaum et al., "Nomic Embed: Training a Reproducible Long Context Text Embedder", arXiv, 2024. Confidence: high.

