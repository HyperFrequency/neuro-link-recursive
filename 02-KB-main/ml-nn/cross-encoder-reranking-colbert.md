---
title: Cross-Encoder Reranking and ColBERT
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 3c4500b235c3af30848c3c1eed90586fb8650512f852f3aa2227a4060bf09642
---

---
title: Cross-Encoder Reranking and ColBERT
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Embedding Models E5 BGE Nomic]]"
  - "[[HNSW IVF PQ Vector Indexes]]"
---

# Cross-Encoder Reranking and ColBERT

## Overview
Cross-encoder rerankers jointly process query and candidate in a single transformer forward pass to produce relevance scores superior to bi-encoder cosine similarity, at the cost of linear compute per candidate. ColBERT balances this trade-off via late-interaction token-level matching, preserving most of the quality at a fraction of the cost.

## Conceptual Model
Retrieval pipelines use a two-stage cascade: (1) cheap [[Embedding Models E5 BGE Nomic|bi-encoder retrieval]] over an [[HNSW IVF PQ Vector Indexes|ANN index]] pulls top-$k$ candidates ($k \sim 100$); (2) a cross-encoder reranks them by computing a relevance score for each (query, candidate) pair with full cross-attention. ColBERT sits between: token-level representations for each side, late interaction via max-sim sum.

## Details
**Cross-encoder (monoBERT, mT5-XXL rerankers, bge-reranker)**: input = `[CLS] query [SEP] passage [SEP]`, fine-tuned with pointwise (BCE), pairwise (margin), or listwise (LCE) losses. Score = classifier head on CLS or regression head. Typically 10–100× slower than bi-encoder but 3–10 pp MRR/NDCG lift on BEIR.

**ColBERT (Khattab–Zaharia 2020, v2 2021)**: encodes query $Q \in \mathbb{R}^{n_q \times d}$ and document $D \in \mathbb{R}^{n_d \times d}$ as per-token matrices. Late-interaction score:
$$ s(Q, D) = \sum_{i=1}^{n_q} \max_{j=1}^{n_d} Q_i \cdot D_j $$

Offline: precompute and index all document token embeddings. Online: encode query (O(n_q) forward), compute max-sim against candidate docs' token embeddings. Much cheaper than cross-encoder (no joint forward pass) while capturing fine-grained token matches.

ColBERTv2 adds:
- Residual compression: per-token vectors quantized to 2 bits via residual codebook, shrinking index 4–8×
- Centroid-interaction: cluster all tokens, approximate max-sim via centroid lookup for candidate shortlisting
- Denoised supervision via in-batch hard negatives from teacher distillation

PLAID (ColBERT-v2 engine): optimized centroid-based retrieval with fast rerank. Achieves <100ms p95 latency on 500M document corpora.

**Alternatives**: SPLADE (learned sparse, inverted-index-friendly), DRAGON (dense retrieval with distilled rerankers), coCondenser (Condenser-style pre-training), monoT5 (encoder-decoder reranker).

**Training recipes**:
- Knowledge distillation from BERT/T5 cross-encoder teachers
- Margin-MSE: $(t_\theta - t_{student})^2$ against teacher margin scores
- RocketQA/RocketQAv2: cross-batch and augmented negatives

**Latency-quality Pareto** (typical BEIR numbers):
- BM25: 0ms online, baseline
- Bi-encoder (E5-base): 5ms online, +5 NDCG
- ColBERT: 30ms online, +8 NDCG
- Cross-encoder (bge-reranker-large) on top 100: 500ms online, +12 NDCG

**When to use which**: if latency budget permits, stack bi-encoder → cross-encoder. Use ColBERT for latency-sensitive semantic search with better-than-bi-encoder quality. Sparse methods (SPLADE, uniCOIL) when lexical overlap matters.

## Applications
Search ranking (web, enterprise, e-commerce), RAG re-ranking stage, entity linking, claim verification, code search.

## Open Questions
- Efficient cross-encoders (distilled, early-exit) closing gap to ColBERT latency
- Multi-vector retrieval at billion-scale with bounded index size

## Sources
[source:nogueira-cho-2019] Nogueira and Cho, "Passage Re-ranking with BERT", arXiv, 2019. Confidence: high.
[source:khattab-zaharia-2020] Khattab and Zaharia, "ColBERT: Efficient and Effective Passage Search", SIGIR, 2020. Confidence: high.
[source:santhanam-2021] Santhanam et al., "ColBERTv2", arXiv, 2021. Confidence: high.

