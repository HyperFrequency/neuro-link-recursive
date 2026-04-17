---
title: LLMs Democratizing Access to Costly Datasets
domain: general
confidence: medium
last_updated: 2026-04-17
sha256: b6bd1d73ce95b28e30785fea53dfbcb8e925d869837176258ff55592039a9171
---

---
title: LLMs Democratizing Access to Costly Datasets
domain: alpha-factory
sources:
  - slug: wang-wang-2024
    url: https://arxiv.org/abs/2412.02065
    type: paper
    ingested: 2026-04-16
    confidence: medium
confidence: high
last_updated: 2026-04-16
open_questions:
  - What is the limit of LLM extraction accuracy for narrative/inferential fields vs mandated numerical disclosures?
  - Can active-learning-style sampling reduce validation cost while maintaining accuracy guarantees?
wikilinks:
  - "[[Open-FinLLMs-Open-Multimodal-Large-Language-Models-for-Financial-Applications]]"
  - "[[Interpretable-Machine-Learning-Models-for-Predicting-the-Next-Targets-of-Activis]]"
  - "[[RAG systems]]"
  - "[[GPT-4o-mini]]"
  - "[[event study]]"
  - "[[information extraction]]"
---

# LLMs Democratizing Access to Costly Datasets

## Overview

Wang and Wang (2024) develop and evaluate a [[GPT-4o-mini]]-based [[RAG]] pipeline to extract data from corporate disclosures. Achieves human-level accuracy: [[CEO pay ratios]] from ~10,000 proxy statements in 9 minutes and [[Critical Audit Matters]] from 12,000+ 10-K filings in 40 minutes, each at under $10. Contrasts dramatically with hundreds of hours of manual labour or thousands of dollars for commercial database subscriptions.

## Conceptual Model

Manual extraction of structured fields from regulatory filings is expensive and access-limited — [[Audit Analytics]], [[WRDS]], [[Bloomberg]] subscriptions cost tens of thousands per year. LLM + RAG pipeline inverts: (1) retrieve relevant passages from filing using keyword/embedding search; (2) prompt LLM to extract target field with grounding citations; (3) validate against held-out human-labelled sample.

## Details

**Pipeline architecture**:
1. Filing ingestion via EDGAR full-text search or direct download.
2. Passage chunking (e.g., 2000 tokens, overlap 200).
3. Retrieval: BM25 + dense embedding (OpenAI text-embedding-3-small or similar).
4. Extraction prompt: structured output (JSON) with field, value, source passage.
5. Validation on ~100-200 human-labelled examples; iterate prompts.

**Results**:
- [[CEO pay ratio]]: extracted from proxy statements' mandatory Section 953(b) disclosure (Dodd-Frank).
  - 10,000 filings processed in 9 minutes.
  - Cost: < $10 via GPT-4o-mini pricing ($0.15/1M input tokens; $0.60/1M output).
  - Accuracy: human-level (~95%+ on labelled sample).
- [[Critical Audit Matters]] (CAMs) from 10-K auditor reports:
  - PCAOB-mandated disclosure since 2019.
  - 12,000+ filings in 40 minutes.
  - More complex extraction — CAMs are narrative.

**Contribution**:
- Open-sources methodology and datasets.
- Empowers researchers at resource-poor institutions.
- Reduces data-access inequality in empirical finance / accounting research.

**Relevance to HyperFrequency**:
- Automated extraction enables custom factor construction beyond commercial databases.
- Complements [[Open-FinLLMs-Open-Multimodal-Large-Language-Models-for-Financial-Applications]] suite.
- Feeds [[event-study]] and [[activist-target-prediction]] features.
- [[Interpretable-Machine-Learning-Models-for-Predicting-the-Next-Targets-of-Activis]] uses similar feature-engineering philosophy.

**Best practices distilled**:
- Start with narrow, well-specified fields (Dodd-Frank-style mandated disclosures easier than inferential).
- Grounding-required prompts reduce hallucination.
- Validate on stratified random samples with inter-annotator agreement measurement.
- Consider [[LLM-as-judge]] for scalable QA.

**Failure modes noted/inferable**:
- Non-standard filings (smaller reporting companies, foreign issuers) lower accuracy.
- Narrative fields (CAMs) more error-prone than numeric.
- Cost monotonic in token count; 10-K filings (~50k tokens) sometimes expensive.
- Model drift: API updates may silently change behaviour.

**Related literature**:
- [[Legal NLP]] (Chalkidis et al., 2020).
- [[Financial text mining]] (Loughran-McDonald dictionaries; FinBERT).
- [[Information extraction]] from semi-structured documents.

**Limitations**: English-language US filings; cross-jurisdictional generalisation untested; GPT-4o-mini knowledge cutoff constrains temporal coverage.

## Open Questions

## Sources
[source:wang-wang-2024] Wang & Wang, *Leveraging LLMs to Democratize Access to Costly Datasets for Academic Research*, arXiv 2412.02065, 2024. Confidence: medium.

