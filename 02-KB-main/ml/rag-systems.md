---
title: RAG Systems
domain: machine-learning
confidence: high
last_updated: 2026-04-16
sha256: 733c0171d64399794bb2e410a3779235d6fe135491dea46f9cdf737ff0765935
---

## Overview

Retrieval-Augmented Generation (RAG) augments LLM generation with retrieved context from external knowledge stores [source:rag-retrieval-augmented-generation]. Related to [[transformer-architecture]] since both use self-attention.

## Conceptual Model

Query → embedding → vector search → rerank → condition LLM on top-k chunks → generate.

## Details

- **Hybrid search**: combines BM25 (lexical) and vector search (semantic)
- **Reciprocal Rank Fusion (RRF)**: merges rankings from multiple retrievers
- **Reranking**: cross-encoder refines top-k for final ordering

## Sources

- [[rag-retrieval-augmented-generation]]
