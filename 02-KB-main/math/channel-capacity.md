---
title: Channel Capacity
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 4ce738f5021127b7d3f5dbcbb5348e88f2d13e32b034eff8b337073e0eb32238
---

---
title: Channel Capacity
domain: math
sources:
  - slug: cover-thomas-2006
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
  - slug: arikan-2009
    url: 
    type: paper
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Can Shannon-Hartley-style bounds be used to set hard upper limits on HFT alpha signal-to-noise ratios?
  - Is feedback capacity of stock returns genuinely different from no-feedback capacity under realistic trader strategies?
wikilinks:
  - "[[mutual information]]"
  - "[[rate-distortion theory]]"
  - "[[Shannon entropy + cross entropy]]"
  - "[[polar codes]]"
  - "[[water-filling]]"
---

# Channel Capacity

## Overview

Channel capacity $$C = \max_{p_X} I(X; Y)$$ is the maximum mutual information over input distributions — the supremum rate at which information flows reliably through a noisy channel. Shannon's [[noisy channel coding theorem]] establishes that rates below $$C$$ admit arbitrarily low error probability with sufficiently long codes; rates above $$C$$ have bounded-away error.

## Conceptual Model

For a [[binary symmetric channel]] with crossover probability $$p$$: $$C = 1 - H_2(p)$$ bits per use. For the [[AWGN]] (additive white Gaussian noise) channel with SNR $$= P/N$$: $$C = \frac{1}{2}\log_2(1 + P/N)$$ per use, giving [[Shannon-Hartley]] $$C = B\log_2(1 + S/N)$$ bits/sec over bandwidth $$B$$.

## Details

MIMO (multiple-input multiple-output) channels generalise via eigenvalue decomposition of the channel matrix: $$C = \sum_i \log_2(1 + \lambda_i P_i / N)$$ with $$P_i$$ allocated by [[water-filling]]. [[Wireless coding]] practice (5G, Wi-Fi 6) relies on [[LDPC codes]] and [[polar codes]] (Arikan, 2009) which achieve capacity with efficient decoders.

[[Feedback]] does not increase memoryless-channel capacity but reduces coding complexity. [[Compound]] and [[arbitrarily-varying]] channels generalise to uncertainty over the channel law — capacity becomes the inf-sup.

In [[neural coding]], information-theoretic bounds inform sensory systems: retinal ganglion cells, cortical spike rates. In [[finance]], capacity-style bounds limit the [[mutual information]] between a [[signal-to-noise]] predictor and future returns — [[Lo]]'s [[information-theoretic efficient market hypothesis]].

For constrained alphabets, [[cost-constrained capacity]] optimises subject to $$\mathbb{E}[c(X)] \leq B$$. Gaussian-with-peak-power and Gaussian-with-average-power differ: peak constraint gives discrete optimal input (Smith, 1971).

## Open Questions

## Sources
[source:cover-thomas-2006] Cover & Thomas, *Elements of Information Theory*. Confidence: high.
[source:arikan-2009] Arikan, *Channel Polarization*, IEEE Trans Info Theory. Confidence: high.

