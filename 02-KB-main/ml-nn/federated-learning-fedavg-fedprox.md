---
title: Federated Learning: FedAvg and FedProx
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 8cee5f8051e0bbbee779d25885f21373177af73a673105f0a90d9ad74eb3843d
---

---
title: Federated Learning FedAvg FedProx
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Differential Privacy DP-SGD]]"
  - "[[Knowledge Distillation DistilBERT TinyBERT]]"
---

# Federated Learning: FedAvg and FedProx

## Overview
Federated learning trains a shared model across distributed clients keeping raw data local. FedAvg (McMahan et al. 2017) averages local-SGD updates each round; FedProx adds proximal regularization to stabilize training under client heterogeneity (systems and statistical). The paradigm underpins mobile keyboard prediction, healthcare collaborations, and on-device personalization.

## Conceptual Model
Let $N$ clients each hold dataset $D_k$ and contribute updates to a global model $w$. A round: server broadcasts $w_t$; each sampled client runs $E$ local epochs of SGD on $D_k$ producing $w_t^k$; server aggregates $w_{t+1} = \sum_k (n_k / n) w_t^k$. Heterogeneity — non-IID data ("statistical") and variable device speeds ("systems") — is the core challenge distinguishing FL from centralized SGD.

## Details
**FedAvg**: clients run SGD locally for $E$ epochs with batch size $B$, then average. Reduces communication rounds by factor $E$ compared to single-step SGD. Under IID data and smooth convex loss, converges at rate similar to minibatch SGD.

Pseudocode:
```
for t = 1..T:
  sample C fraction of clients
  for each client k:
    w^k = ClientUpdate(w_t, E, B)  # local SGD
  w_{t+1} = sum_k (n_k / n) * w^k
```

**Non-IID challenges**: with skewed local distributions, local SGD drifts toward local optima (client drift), harming global convergence. Accuracy loss vs IID can exceed 10 points on Cifar-10 label-skew partitions.

**FedProx (Li et al. 2020)**: modifies local objective with proximal term:
$$ \min_w F_k(w) + \frac{\mu}{2} \|w - w_t\|^2 $$
The proximal term limits client drift from global model $w_t$. Tolerates inexact local solutions (useful for stragglers with limited compute). Includes systems heterogeneity: clients can run fewer local epochs without harming convergence guarantees.

**Other algorithms**:
- **SCAFFOLD (Karimireddy et al. 2020)**: variance reduction with control variates correcting client drift. Convergence independent of client heterogeneity under smoothness.
- **FedNova**: normalized averaging accounts for unequal local steps.
- **FedDyn**: dynamic regularization via linear + quadratic corrections.
- **MOON**: contrastive representation alignment across rounds.
- **Personalized FL**: pFedMe, Ditto, FedPer — balance global and client-specific objectives.

**Communication efficiency**:
- Gradient compression: top-k, quantization, signSGD
- Secure aggregation via cryptographic protocols (SecAgg, Bonawitz et al.)
- Periodic averaging + local training reduces rounds

**Privacy**:
- Aggregation alone doesn't guarantee privacy (model inversion attacks)
- Combine with [[Differential Privacy DP-SGD]] at client or server level
- Homomorphic encryption for aggregated gradients

**Cross-device vs cross-silo**:
- Cross-device (Google Keyboard): millions of phones, high churn, unreliable
- Cross-silo (hospitals, banks): few trusted parties, reliable, strong privacy requirements

**Systems**: TensorFlow Federated, PySyft, Flower, FedML, OpenFL. Open Health Network applies FL to medical imaging.

**Failure modes**:
- Client sampling bias (always-online bias)
- Stale updates in async settings
- Attack surface: Byzantine clients poisoning aggregation (robust aggregation via median, Krum, trimmed mean, Bulyan)

**Empirical results (FedAvg vs FedProx)**: FedProx wins under high statistical heterogeneity and systems heterogeneity; FedAvg competitive otherwise with lower complexity.

## Applications
Google Keyboard (Gboard), Apple QuickType, healthcare (NVIDIA Clara, Owkin), cross-bank fraud detection, vehicle fleet learning.

## Open Questions
- Optimal trade-off between personalization and global performance
- Adversarial robustness at massive client counts

## Sources
[source:mcmahan-fedavg-2017] McMahan et al., "Communication-Efficient Learning of Deep Networks from Decentralized Data", AISTATS, 2017. Confidence: high.
[source:li-fedprox-2020] Li et al., "Federated Optimization in Heterogeneous Networks", MLSys, 2020. Confidence: high.
[source:karimireddy-scaffold-2020] Karimireddy et al., "SCAFFOLD", ICML, 2020. Confidence: high.

