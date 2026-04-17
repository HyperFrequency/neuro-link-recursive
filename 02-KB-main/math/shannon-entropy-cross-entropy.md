---
title: Shannon Entropy and Cross Entropy
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: c280dac220350761b03f7f4bbe30bcc3bd5af0bc70ff84a545212727bd27cd99
---

---
title: Shannon Entropy and Cross Entropy
domain: math
sources:
  - slug: cover-thomas-2006
    url: 
    type: book
    ingested: 2026-04-16
    confidence: high
confidence: high
last_updated: 2026-04-16
open_questions:
  - Why does label smoothing sometimes hurt calibration in overparametrised models?
  - Can differential entropy estimators (Kozachenko-Leonenko) be used as MI lower bounds for high-dim alpha features?
wikilinks:
  - "[[KL divergence]]"
  - "[[mutual information]]"
  - "[[perplexity]]"
  - "[[Renyi entropy]]"
  - "[[maximum entropy principle]]"
  - "[[Huffman coding]]"
  - "[[language models]]"
---

# Shannon Entropy and Cross Entropy

## Overview

Shannon entropy $$H(X) = -\sum_x p(x)\log p(x)$$ quantifies the minimum expected bits to encode samples from $$p$$. Cross entropy $$H(p, q) = -\sum_x p(x)\log q(x)$$ measures the expected bits used when the coder assumes distribution $$q$$ but data follows $$p$$ — the fundamental objective underlying [[maximum likelihood estimation]].

## Conceptual Model

[[Shannon]]'s 1948 source coding theorem establishes $$H(X)$$ as the lower bound for lossless compression. Any uniquely decodable code satisfies $$\mathbb{E}[L] \geq H(X)$$; [[Huffman coding]] and [[arithmetic coding]] approach the bound. Cross entropy decomposes as $$H(p,q) = H(p) + D_{KL}(p\|q)$$, revealing that minimising cross entropy under fixed $$p$$ is equivalent to minimising [[KL divergence]] to the target — the training objective for [[softmax classification]] and [[language models]].

## Details

For continuous variables, differential entropy $$h(X) = -\int f(x)\log f(x)\,dx$$ can be negative and is not coordinate-invariant. Gaussian has the maximum differential entropy among distributions with fixed variance: $$h(\mathcal{N}(\mu,\sigma^2))=\frac{1}{2}\log(2\pi e \sigma^2)$$ — underpinning [[maximum entropy principle]] and [[Laplace]]'s principle of insufficient reason.

Joint $$H(X,Y)$$, conditional $$H(Y|X)=H(X,Y)-H(X)$$, and [[mutual information]] $$I(X;Y)=H(X)-H(X|Y)$$ form a Venn-like algebra. Chain rule: $$H(X_{1:n}) = \sum_i H(X_i | X_{<i})$$ — the basis for autoregressive likelihood decomposition.

In ML, minimising cross entropy $$-\frac{1}{N}\sum_i \log q_\theta(y_i|x_i)$$ equals MLE. Label smoothing replaces the one-hot target $$p$$ with $$(1-\epsilon)p + \epsilon/K$$, adding an entropy regulariser that improves calibration. [[Perplexity]] $$2^{H(p,q)}$$ is the exponentiated cross entropy — the standard [[language-model]] metric.

[[Renyi entropy]] $$H_\alpha = \frac{1}{1-\alpha}\log \sum p^\alpha$$ and [[Tsallis entropy]] generalise to parametric families, useful in anomaly detection and physics.

## Open Questions

## Sources
[source:cover-thomas-2006] Cover & Thomas, *Elements of Information Theory* 2e. Wiley. Confidence: high.

