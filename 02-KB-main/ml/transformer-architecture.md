---
title: Transformer Architecture
domain: machine-learning
confidence: high
last_updated: 2026-04-16
sha256: 4f225b4f0a8f5f9b8ea30e50bd98f48985311d550e851aa4b654c02b575be0c6
---

## Overview

The Transformer is a neural network architecture based entirely on self-attention, introduced in [source:attention-is-all-you-need]. It replaces recurrent networks for sequence tasks.

## Conceptual Model

Each layer has two sub-layers: multi-head self-attention and a feed-forward network. Residual connections and layer normalization wrap each sub-layer.

## Details

- **Self-attention**: computes weighted sum of value vectors using query-key similarity
- **Multi-head**: splits attention into parallel heads for different representation subspaces
- **Positional encoding**: sinusoidal or learned, added to input embeddings

## Open Questions

- How does attention head count scale with model size?

## Sources

- [[attention-is-all-you-need]]
