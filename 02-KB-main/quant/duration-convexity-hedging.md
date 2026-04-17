---
title: Duration and Convexity Hedging
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: d5a77ac77afb82788edcacd49236a1f4810a88ad99fb50973f3db59c9f671495
---

---
title: Duration and Convexity Hedging
domain: quant
confidence: high
last_updated: 2026-04-16
wikilinks:
  - "[[Fixed-Income Arbitrage]]"
  - "[[PCA on Rates]]"
  - "[[Yield Curve Modeling Nelson-Siegel Svensson]]"
---

# Duration and Convexity Hedging

## Overview
Duration measures first-order bond price sensitivity to yield; convexity captures the second-order (curvature) effect. Hedging combines duration-matched offsets for parallel shifts and convexity management to reduce approximation error and capture option-like features.

## Conceptual Model
Modified duration $D_{mod} = -\frac{1}{P} \frac{\partial P}{\partial y}$ gives $\Delta P / P \approx -D_{mod} \Delta y$. Convexity $C = \frac{1}{P} \frac{\partial^2 P}{\partial y^2}$ extends this to $\Delta P / P \approx -D_{mod} \Delta y + \frac{1}{2} C (\Delta y)^2$. A bond portfolio is duration-hedged if $\sum_i D_i \cdot \text{MV}_i = 0$; convexity-hedged if the second-order term is also zero.

## Details
Macaulay duration: weighted average time to cash flows, $D_{Mac} = \sum t_i (CF_i / (1+y)^{t_i}) / P$. Modified duration: $D_{mod} = D_{Mac} / (1+y)$ for annual compounding.

DV01 (PVBP, BPV): dollar value of a 1 bp yield change, $\text{DV01} = -\partial P / \partial y \times 10^{-4} = P \cdot D_{mod} \cdot 10^{-4}$. Per-instrument DV01-matching is the practitioner's duration-hedge metric.

Key rate duration (KRD): partial derivatives w.r.t. specific tenor yields; sum equals total modified duration. KRDs anchor hedges against non-parallel shifts (rotations beyond PC1).

Effective duration: numerical derivative under curve shocks, used for bonds with embedded options (callable/putable/MBS where cash flows depend on rates).

Convexity:
- Positive for vanilla bonds (cash flows fixed, discounting convex in yield)
- Negative for MBS (prepayment shortens duration when rates fall)
- Negative for callable bonds near par (issuer call clips upside)

Dollar convexity = $C \cdot P \cdot 10^{-8}$ per bp² — small but accumulates in large portfolios under big rate moves.

Hedging construction: given liability with DV01 $L$ and convexity $C_L$, build asset portfolio with matching DV01 and convexity by solving linear system using 2+ hedge instruments (typically different maturities of on-the-run Treasuries or swaps).

Butterfly hedging: long 5Y belly, short 2Y and 10Y in DV01-weights that zero level and slope — isolates convexity/PC3 exposure. See [[PCA on Rates]].

Limitations:
- Yield-curve shape shifts: duration matching only handles parallel moves
- Jumps and gaps: Taylor expansion fails for large moves
- Cross-gamma: portfolios with options need vega/gamma hedging

Insurance ALM uses cash-flow matching or duration+convexity to immunize against rate-reinvestment risk (Redington immunization: matched duration + asset convexity ≥ liability convexity ensures surplus against small yield moves).

Implementation: banks mark DV01 books hourly via curve bumps; hedge adjustments via swaps/futures. Margin optimization balances convexity cost against hedge tightness.

## Applications
Pension and insurance liability-driven investment (LDI), bank interest-rate risk management (IRRBB), fixed-income relative-value trades, MBS hedging (negative convexity compensation).

## Open Questions
- Dynamic convexity hedging under stochastic volatility
- ML-based curve scenario generation for tail hedging

## Sources
[source:fabozzi-fixed-income] Fabozzi, *The Handbook of Fixed Income Securities*, 8e, McGraw-Hill, 2012. Confidence: high.
[source:tuckman-serrat] Tuckman and Serrat, *Fixed Income Securities*, 3e, Wiley, 2012. Confidence: high.

