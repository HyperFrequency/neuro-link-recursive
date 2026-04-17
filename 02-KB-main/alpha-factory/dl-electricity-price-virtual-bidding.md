---
title: Deep Learning-Based Electricity Price Forecast for Virtual Bidding
domain: alpha-factory
confidence: medium
last_updated: 2026-04-17
sha256: 61747c511001903c7a1bcbb54fe6840c50112d2036a96624851186f2734e64e3
---

---
title: DL Electricity Price Virtual Bidding
domain: alpha-factory
sources:
  - slug: wang-electricity-2025
    type: paper
    ingested: 2026-02-28
    confidence: high
confidence: medium
last_updated: 2026-04-16
wikilinks:
  - "[[Time Series Forecasting]]"
  - "[[Reinforcement Learning]]"
  - "[[Electricity Market Microstructure]]"
---

# Deep Learning-Based Electricity Price Forecast for Virtual Bidding

## Overview
Wang et al. (2025) propose a deep-learning pipeline to forecast day-ahead and real-time electricity prices for use in virtual bidding in wholesale markets. Virtual bids (purely financial INCs/DECs) profit from price spreads between day-ahead and real-time settlements and require accurate short-horizon price prediction.

## Conceptual Model
Virtual bidding P&L at a node: $\pi = (P_{RT} - P_{DA}) \cdot q_{virt}$ where $q_{virt} > 0$ is an INC (sell in DA, buy in RT) and $< 0$ is a DEC (buy in DA, sell in RT). The trader seeks positive expected spread: $\mathbb{E}[P_{RT} - P_{DA}|\mathcal{F}]$ conditional on forecastable features (load, weather, generator outages, historical basis). Deep learning models capture nonlinear interactions and temporal dependencies intractable for classical econometric forecasts.

## Details
**Market structure**: U.S. ISOs (PJM, MISO, CAISO, NYISO, ERCOT, ISO-NE, SPP) clear day-ahead auctions ~24 hours before delivery and real-time auctions every 5 minutes. Price differences (DA vs RT) reflect forecast errors, unit commitment, transmission constraints, reserve deployment, and congestion.

**Features typical for the model**:
- Historical prices at forecast node (DA, RT, lagged)
- System load forecasts (ISO publishes)
- Generation mix forecasts (wind, solar, nuclear baseload)
- Temperature, dew point, cloud cover, wind speed (weather for load and renewable generation)
- Gas and fuel prices
- Transmission and generator outages
- Calendar effects (hour-of-day, day-of-week, holiday flags)

**Model architectures**: the paper uses (variants of) LSTM, CNN-LSTM, Transformer, and ensemble blends. Key comparators include persistence, ARIMA, and gradient-boosted trees (XGBoost, LightGBM).

**Training**: typically uses 2–3 years of historical data, walk-forward cross-validation to avoid look-ahead bias. Loss function often a combination of MSE and quantile (pinball) loss for uncertainty estimation.

**Strategy construction**:
1. Forecast RT – DA spread at each node per hour
2. Rank nodes by forecast magnitude and confidence
3. Size virtual bids subject to transmission limits, credit, and risk policy (VaR, position limits)
4. Include hedging to offset aggregate portfolio risk

**Evaluation**:
- Point forecast metrics: MAE, RMSE
- Probabilistic: CRPS, pinball loss
- Economic: realized P&L after costs, Sharpe, max drawdown
- Out-of-sample walk-forward performance is crucial — synthetic alpha in-sample is common

**Key findings**: deep learning models improve spread forecasting over classical baselines, particularly during renewable-heavy hours and transmission-constrained periods. Profitability narrowly positive after transaction costs and uplift charges.

**Risks and limitations**:
- Regime shifts (fuel price spikes, policy changes like FERC orders)
- Bid timing: ISOs close DA bidding at 10am day-before; forecasts must be locked before all RT data arrives
- Credit and collateral requirements
- Liquidity at individual nodes may be thin
- Tail events (polar vortex, heat domes) rarely in training data

**Walk-forward validation**: paper specifically tagged with walk-forward-validation and strategy-construction, suggesting realistic out-of-sample evaluation.

## Applications
Financial participation in wholesale electricity markets, hedging for utilities and IPPs, transmission arbitrage, storage optimization (informs battery dispatch).

## Open Questions
- Transformer architectures for multi-node joint price forecasting
- Transfer learning across ISOs with different market structures
- Integration with stochastic optimization for bid sizing

## Sources
[source:wang-electricity-2025] Wang et al., "Deep Learning-Based Electricity Price Forecast for Virtual Bidding in Wholesale Electricity Market", arXiv, 2025. Confidence: high.
[source:weron-2014] Weron, "Electricity price forecasting: A review", International Journal of Forecasting, 2014. Confidence: high.

