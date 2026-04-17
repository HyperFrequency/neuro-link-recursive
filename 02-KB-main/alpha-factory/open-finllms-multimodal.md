---
title: Open-FinLLMs: Multimodal Financial LLMs
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: 0245c681a86955123d39802cf54d69f83c2383a8833fbc1c971b3aa0db17b79a
---

---
title: Open-FinLLMs: Multimodal Financial LLMs
domain: alpha-factory
sources:
  - slug: huang-2024
    url: https://arxiv.org/abs/2408.11878
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - Does Open-FinLLMs generalise to non-English filings and emerging-market charts?
  - What hallucination-mitigation techniques transfer from general LLMs to financial domain?
wikilinks:
  - "[[multimodal: CLIP + BLIP + LLaVA + Flamingo]]"
  - "[[Leveraging-Large-Language-Models-to-Democratize-Access-to-Costly-Datasets-for-Ac]]"
  - "[[RAG systems]]"
  - "[[FinLLaMA]]"
  - "[[LLaVA]]"
  - "[[LLaMA]]"
---

# Open-FinLLMs: Multimodal Financial LLMs

## Overview

Huang et al. (2024) introduce [[Open-FinLLMs]] — a suite of open-source multimodal financial LLMs comprising FinLLaMA (52B-token financial pretraining), FinLLaMA-Instruct (573k instruction tuning), and [[FinLLaVA]] (1.43M multimodal tuning pairs covering text, tabular, time-series, and chart data). Claims outperformance vs GPT-4 on 14 financial NLP + decision-making + multimodal tasks across 30 datasets.

## Conceptual Model

Three-stage recipe mirroring standard open-source LLM development but specialised on financial corpora: (1) domain-adaptive pretraining on filings, news, transcripts; (2) instruction tuning on curated financial prompts; (3) multimodal integration via CLIP-vision-encoder connected to LLM through a learned projector ([[LLaVA]]-style). Evaluation covers zero-shot, few-shot, and supervised fine-tuning.

## Details

**FinLLaMA** (text base):
- 52B tokens: SEC filings (10-K, 10-Q, S-1), news (Reuters, Bloomberg mirror corpora), earnings transcripts, research reports.
- Built on LLaMA foundation; continued pretraining preserves general knowledge.

**FinLLaMA-Instruct** (instruction-tuned):
- 573K financial task pairs: sentiment analysis, NER, RE (FinRE), QA, summarisation, credit scoring, forecasting.
- Standard SFT; no RLHF mentioned.

**FinLLaVA** (multimodal):
- 1.43M multimodal pairs spanning financial charts (candlesticks, line, bar), tables (earnings spreadsheets, balance sheets), and time-series plots.
- Vision encoder → projector → frozen FinLLaMA-Instruct.

**Benchmarks**:
- [[FinBen]] / [[PIXIU2]] umbrella evaluation.
- Tasks: FPB sentiment, FinQA, TATQA, ConvFinQA, numeric reasoning.
- Two new multimodal benchmarks introduced (chart understanding + table reasoning).
- Claimed outperformance vs GPT-4 on aggregate; some individual tasks competitive.

**Relevance to HyperFrequency**:
- Financial chart understanding could enable automated [[technical-analysis]] feature engineering.
- Multimodal reasoning over filings + charts underpins [[activist-target]] prediction (compare [[Interpretable-Machine-Learning-Models-for-Predicting-the-Next-Targets-of-Activis]]) and [[event-study]] alpha.
- Open-source access allows custom fine-tuning and auditability vs proprietary LLM-based alpha.

**Concerns / Contradictions**:
> **Claim A** [source:huang-2024]: FinLLaMA outperforms GPT-4 on 14 financial tasks.
> **Claim B** [general literature]: GPT-4-class models dominate on cross-domain reasoning benchmarks, suggesting Open-FinLLMs edge may be dataset-specific.
> **Synthesis**: Domain-specific fine-tuning usually beats general models on in-distribution eval; generalisation to noisy live data requires OOS testing.

**Limitations noted or inferable**:
- Hallucination remains (multimodal especially).
- Evaluation datasets may leak training data.
- Zero RLHF risks instruction-following inconsistency vs closed models.

Related: [[Leveraging-Large-Language-Models-to-Democratize-Access-to-Costly-Datasets-for-Ac]], [[multimodal: CLIP + BLIP + LLaVA + Flamingo]], [[RAG systems]].

## Open Questions

## Sources
[source:huang-2024] Huang et al., *Open-FinLLMs: Open Multimodal Large Language Models for Financial Applications*, arXiv 2408.11878, 2024. Confidence: medium.

