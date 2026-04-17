---
title: Portfolio Optimization under Transaction Costs with Recursive Preferences
domain: alpha-factory
confidence: medium
last_updated: 2026-04-17
sha256: fd5ac6d7962d2745ce4b1142e546bb8f68243a0933f4c6ebc6efbfa21699d1f2
---

---
title: Portfolio Optimization Transaction Costs Recursive Preferences
domain: alpha-factory
sources:
  - slug: herdegen-hobson-tse-2024
    type: paper
    ingested: 2026-02-28
    confidence: high
confidence: medium
last_updated: 2026-04-16
wikilinks:
  - "[[Merton Problem]]"
  - "[[Epstein-Zin Utility]]"
  - "[[HJB Equation]]"
---

# Portfolio Optimization under Transaction Costs with Recursive Preferences

## Overview
Herdegen, Hobson, and Tse (2024) study the Merton portfolio-consumption problem with proportional transaction costs where the investor has recursive (Epstein–Zin style) preferences rather than time-additive expected utility. They characterize optimal trading regions and consumption via a free-boundary system, quantifying the separate roles of elasticity of intertemporal substitution (EIS) and relative risk aversion (RRA).

## Conceptual Model
Classical Merton assumes frictionless markets and constant-relative-risk-aversion (CRRA) utility with additive consumption utility; solutions are closed-form constant fractions. Two departures: (1) transaction costs turn the problem into a stochastic control with a no-trade region; (2) [[Epstein-Zin Utility|recursive preferences]] disentangle EIS $\psi$ from RRA $\gamma$, allowing realistic calibration to asset-pricing puzzles. Combined, the optimal policy is a free-boundary system on a two-dimensional state (risky/riskless wealth ratio).

## Details
Setup: one risky asset with price $dS/S = \mu dt + \sigma dW$, riskless at rate $r$. Proportional cost $\lambda$ on buys and sells. State variable can be taken as the fraction $\theta = S/W$ of wealth in the risky asset. Recursive utility $V$ satisfies an aggregator equation of form:
$$ V_t = \int_t^\infty f(c_s, V_s) ds $$
with Epstein–Zin aggregator $f(c, v) = (1-\gamma) v \left[\frac{(c/\nu(v))^{1-1/\psi} - 1}{1 - 1/\psi}\right]$.

Control problem: maximize $V_0$ over consumption $c_t \ge 0$ and cumulative buy/sell transactions $(L, M)$ subject to wealth dynamics with transaction costs.

**Free-boundary structure**: the state space partitions into:
- No-trade region: optimal to consume from cash, no rebalancing
- Buy region: $\theta$ too low, incrementally buy risky
- Sell region: $\theta$ too high, incrementally sell risky

The HJB equation (see [[HJB Equation]]) inside the no-trade region is a degenerate elliptic-parabolic PDE with free boundaries determined by smooth-pasting conditions.

**Key results**:
- Existence, uniqueness, and smoothness of the optimal free-boundary system under mild parameter conditions
- Comparative statics: no-trade region width increases with $\lambda$ and depends non-monotonically on $(\gamma, \psi)$
- Decomposition of effect: EIS primarily governs consumption response, RRA governs portfolio response; recursive preferences let these adjust independently

**Technical innovations**:
- Treats recursive BSDE-type formulation under transaction costs
- Verification theorem linking viscosity solutions of the HJB free-boundary to candidate value function
- Asymptotic expansions in small $\lambda$ recover Shreve–Soner frictionless limits

**Comparative to literature**:
- Merton (1971): frictionless, additive utility
- Shreve–Soner (1994): frictionless-cost asymptotic expansion
- Davis–Norman (1990): CRRA + transaction costs, proves free-boundary structure
- This paper extends DN to recursive preferences

**Numerical aspects**: PDE solved via projected SOR or variational inequalities. Boundary moves with $\lambda, \mu, \sigma, r$; paper includes sensitivity plots.

## Applications
Household portfolio choice under trading frictions, institutional rebalancing rules, rebalancing threshold design for target-date funds, roboadvisor optimization with tax costs.

## Open Questions
- Multi-asset extensions with correlated transaction costs
- Stochastic investment opportunities (time-varying $\mu, \sigma$)
- Empirical calibration via structural estimation

## Sources
[source:herdegen-hobson-tse-2024] Herdegen, Hobson, Tse, "Portfolio Optimization under Transaction Costs with Recursive Preferences", arXiv, 2024. Confidence: high.
[source:davis-norman-1990] Davis and Norman, "Portfolio selection with transaction costs", Mathematics of Operations Research, 1990. Confidence: high.
[source:duffie-epstein-1992] Duffie and Epstein, "Stochastic differential utility", Econometrica, 1992. Confidence: high.

