---
title: HNSW, IVF, PQ/OPQ Vector Index Tradeoffs
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 03bc094cb0ce9c47ee4594b2701a68982838f13bd218da485397f0e24f3342ee
---

---
title: HNSW IVF PQ Vector Indexes
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Embedding Models E5 BGE Nomic]]"
  - "[[Cross-Encoder Reranking and ColBERT]]"
---

# HNSW, IVF, PQ/OPQ Vector Index Tradeoffs

## Overview
Approximate nearest neighbor (ANN) indexes trade exact search for sub-linear query time. HNSW (graph-based), IVF (inverted file, coarse quantization), and PQ/OPQ (product quantization, memory compression) are the three dominant primitives, often composed as IVF-PQ or HNSW-PQ in libraries like Faiss, ScaNN, and pgvector.

## Conceptual Model
Given a query $q$ and corpus of $N$ vectors in $\mathbb{R}^d$, exact search is $O(Nd)$ per query. ANN structures exploit geometry or clustering to reduce to $O(\log N)$ or $O(\sqrt{N})$ recall-1 lookups. The recall-latency-memory Pareto is navigated by choosing among graph traversal (HNSW), partitioned scan (IVF), vector compression (PQ/OPQ), or hybrid compositions.

## Details
**HNSW (Hierarchical Navigable Small World, Malkov–Yashunin 2016)**: multi-layer proximity graph. Search begins at top sparse layer, greedy descent with $efSearch$ candidate beam. Build params: $M$ (graph degree, ~16), $efConstruction$ (~200). Recall-latency Pareto dominates IVF at small-mid scale. Memory: stores full vectors + graph, $O(N(d + M \log N))$ bytes. Downside: poor batch construction, high memory, sequential insertion.

**IVF (Inverted File)**: k-means clusters the corpus into $n_{list}$ centroids; each vector assigned to nearest centroid. Query searches only the $n_{probe}$ closest centroids' posting lists. Cost: $O((n_{probe}/n_{list}) N d)$. Typical $n_{list} \approx \sqrt{N}$, $n_{probe} \approx 10$–50. Trade: higher $n_{probe}$ improves recall at linear cost.

**PQ (Product Quantization, Jégou et al. 2011)**: split each $d$-dim vector into $m$ sub-vectors of dimension $d/m$, quantize each via a $k$-entry codebook ($k = 256$ common, giving 1-byte codes per subspace). Asymmetric distance computation (ADC): precompute query-to-codebook lookup table, distance via table sum. Compression ratio $32d / m$ (vs float32). Quality drop tunable by $m$.

**OPQ (Optimized PQ)**: learns an orthogonal rotation $R$ to decorrelate dimensions before PQ, reducing quantization error significantly on anisotropic embedding distributions. Often +5–15% recall at same compression.

**Composed indexes**:
- IVF+PQ (Faiss `IVF4096,PQ32`): coarse partitioning + fine compression. Canonical billion-scale solution.
- HNSW+PQ: HNSW over PQ-compressed centroids for IVF, then PQ-compressed residuals in lists.
- IVFFlat: IVF with no compression (raw float storage); simple, pg_vector's default.
- ScaNN (Google): anisotropic vector quantization with partitioning and reordering, achieving state-of-art recall-latency.

**Choosing defaults**:
- $N < 10^6$: HNSW on full floats, simplest and fastest
- $10^6 < N < 10^8$: IVFFlat or IVF-PQ depending on memory
- $N > 10^8$: IVF-OPQ, ScaNN, or DiskANN (disk-resident graph)

**Recall metrics**: Recall@10 vs QPS curves — always compare at matched recall, not QPS alone.

**Production systems**: Faiss (Meta), ScaNN (Google), Annoy (Spotify), Milvus, Weaviate, Qdrant, pgvector. DiskANN (Vamana graph) supports SSD-resident billion-scale indexes.

**Updates**: HNSW supports incremental insert but not delete cleanly; IVF supports both via posting-list edits; PQ codes are small and easy to rewrite.

## Applications
Semantic search, recommendation, image search, genomic similarity, RAG retrieval at scale.

## Open Questions
- Optimal graph pruning for massive-update workloads
- Hybrid sparse-dense indexing with unified recall guarantees

## Sources
[source:malkov-yashunin-2016] Malkov and Yashunin, "Efficient and robust ANN search using HNSW", TPAMI, 2018. Confidence: high.
[source:jegou-product-quantization-2011] Jégou, Douze, Schmid, "Product Quantization", TPAMI, 2011. Confidence: high.
[source:guo-scann-2020] Guo et al., "Accelerating Large-Scale Inference with Anisotropic Vector Quantization", ICML, 2020. Confidence: high.

