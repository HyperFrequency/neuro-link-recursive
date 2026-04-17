---
title: Differential Privacy, DP-SGD, Moments Accountant
domain: ml-nn
confidence: high
last_updated: 2026-04-17
sha256: 9b11a29dff72d9f363867b53063a4c098dfe0391511847e60c19946994a4c145
---

---
title: Differential Privacy DP-SGD
domain: ml-nn
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Federated Learning FedAvg FedProx]]"
---

# Differential Privacy, DP-SGD, Moments Accountant

## Overview
Differential privacy (DP) quantifies individual-level privacy as bounded influence of any single data point on the output distribution. DP-SGD adds calibrated noise to clipped gradients, providing rigorous ML privacy guarantees. The moments accountant (and later Rényi DP / privacy profiles) tracks privacy budget across iterations more tightly than naive composition.

## Conceptual Model
A randomized mechanism $\mathcal{M}$ is $(\varepsilon, \delta)$-differentially private if for all adjacent datasets $D, D'$ (differ in one record) and all $S \subseteq \mathrm{Range}(\mathcal{M})$:
$$ \Pr[\mathcal{M}(D) \in S] \le e^{\varepsilon} \Pr[\mathcal{M}(D') \in S] + \delta $$
Small $\varepsilon$ → strong privacy; $\delta$ bounds failure probability (typically $\delta < 1/n$). For ML, we apply DP to the training algorithm, not just outputs.

## Details
**Core mechanisms**:
- **Laplace**: add $\mathrm{Lap}(\Delta_1 / \varepsilon)$ noise, gives pure $\varepsilon$-DP.
- **Gaussian**: add $\mathcal{N}(0, (\Delta_2 \sigma)^2)$ with $\sigma \ge \sqrt{2 \ln(1.25/\delta)} / \varepsilon$, gives $(\varepsilon, \delta)$-DP.
- **Exponential**: select from candidates weighted by utility (used in DP-PCA, synthetic data).

**Sensitivity $\Delta$**: maximum change in mechanism output from one record change. Bounded via clipping in ML.

**DP-SGD (Abadi et al. 2016)**:
1. Sample minibatch at fixed rate $q = L/N$ (Poisson sampling)
2. Compute per-example gradients $g_i$
3. Clip: $\bar g_i = g_i \cdot \min(1, C / \|g_i\|_2)$
4. Aggregate + noise: $\tilde g = \frac{1}{L}(\sum_i \bar g_i + \mathcal{N}(0, C^2 \sigma^2 I))$
5. Update: $w \leftarrow w - \eta \tilde g$

Clipping provides sensitivity bound $2C/L$; Gaussian noise gives per-step privacy.

**Privacy accounting**:
- **Naive composition**: sequential $T$ steps with $\varepsilon_0$ each gives $T\varepsilon_0$ — loose.
- **Strong composition**: $O(\sqrt{T} \varepsilon_0)$ — tighter for adaptive sequence.
- **Moments accountant (Abadi 2016)**: tracks log moment generating function of privacy loss random variable; tighter bounds for DP-SGD with subsampling amplification, yielding $\varepsilon \approx \sigma^{-1}\sqrt{T q^2}$ for small $\delta$.
- **Rényi Differential Privacy (Mironov 2017)**: RDP parameter $\alpha$, privacy $(\alpha, \varepsilon(\alpha))$; easy composition; converts to $(\varepsilon, \delta)$ at end.
- **Privacy profile / PRV accountant (2021)**: numerical convolution of privacy loss; typically tightest bounds (Opacus default).

**Subsampling amplification**: uniform sampling of rate $q$ amplifies privacy roughly by factor $q$ when $q \ll 1$.

**Privacy–utility trade-off**:
- Small $\varepsilon$ (< 1): strong privacy, significant accuracy loss
- Moderate $\varepsilon$ (1–8): reasonable for most ML
- Large $\varepsilon$ (>10): weak guarantees, effectively no privacy at worst cases

**Practical tuning**:
- Large batches (1000s) help — noise averages out
- Clip norm $C$: tune to ~median gradient norm
- Momentum/Adam: use DP-friendly variants (differ in clipping unit)
- Pretrained models help enormously — fine-tuning under DP is easier than training from scratch

**LLM DP training**: DP fine-tuning of GPT-2/Llama studied (Yu et al. 2021, Li et al. 2022). Gap to non-private has narrowed with large batch training and careful clipping.

**Federated DP**: user-level vs sample-level DP; see [[Federated Learning FedAvg FedProx]] for cross-device DP setups (Google Gboard uses user-level DP).

**Libraries**: Opacus (PyTorch), TensorFlow Privacy, JAX dp-jax.

**Attacks motivating DP**:
- Membership inference (Shokri et al.)
- Training data extraction from LLMs (Carlini et al.)
- Model inversion

## Applications
Apple iOS keyboard, Google RAPPOR, US Census 2020 disclosure avoidance, medical imaging federated learning with DP, enterprise NLU with guaranteed privacy.

## Open Questions
- Tight composition for adaptive training heuristics
- Private pretraining at foundation-model scale
- Better utility at $\varepsilon \le 1$

## Sources
[source:dwork-roth] Dwork and Roth, "The Algorithmic Foundations of Differential Privacy", Foundations and Trends, 2014. Confidence: high.
[source:abadi-dpsgd-2016] Abadi et al., "Deep Learning with Differential Privacy", CCS, 2016. Confidence: high.
[source:mironov-rdp-2017] Mironov, "Rényi Differential Privacy", CSF, 2017. Confidence: high.

