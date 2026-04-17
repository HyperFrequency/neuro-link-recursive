---
title: NautilusTrader Architecture
domain: quant
confidence: high
last_updated: 2026-04-17
sha256: 05ad0a94b24e7e1d1e496de743f7340528a6254d80f55e35fdba34f80beac9cb
---

## Overview
[[NautilusTrader]] is a high-performance, [[event-driven]] algorithmic trading platform written in Rust with Python bindings. The same [[Strategy]] code runs unchanged in [[backtest]] or [[live]] mode, sharing the [[event loop]], [[risk engine]], and [[execution engine]]. Components communicate over a [[MessageBus]] in an [[actor]] pattern, enabling deterministic, reproducible simulations.

## Conceptual Model
A [[TradingNode]] hosts a [[MessageBus]], [[Cache]], [[Portfolio]], [[RiskEngine]], [[ExecEngine]], and one or more [[Strategy]] / [[Actor]] instances [source:nautilus-docs]. Market data ([[QuoteTick]], [[TradeTick]], [[Bar]]) flows in from a [[DataClient]], is published on the bus, consumed by strategies, which generate [[Order]] objects routed through risk checks to an [[ExecutionClient]]. The [[backtest engine]] swaps real clients for simulated ones with deterministic event clocks, so a strategy is bit-exact replayable.

## Conceptual Model (cont)
The [[actor model]] means each component reacts to events without sharing mutable state. [[Adapters]] for Binance, Interactive Brokers, Coinbase, dYdX, etc. translate venue-specific messages into Nautilus's normalized [[InstrumentId]]/[[OrderBook]]/[[OrderStatusReport]] types.

## Details
- `Strategy.on_start/on_bar/on_quote_tick/on_event` are the main lifecycle hooks.
- `self.submit_order(order)` queues for risk checks, then routes to exec engine.
- [[Position]] lifecycle: `OrderInitialized → OrderSubmitted → OrderAccepted → OrderFilled → PositionOpened → PositionClosed`.
- Backtest config: [[BacktestEngine]] + [[BacktestVenueConfig]] (account type, starting balance, fee model, latency model).
- Bar specs (e.g. "1-MINUTE-LAST-EXTERNAL") identify aggregation, price type, and source.
- Internal data uses fixed-precision integers (no float drift) — important for tick-level fidelity.
- Built in Rust core for hot paths; Python wraps via PyO3 for ergonomics.

## Sources
- [source:nautilus-docs] *NautilusTrader Documentation*, https://docs.nautilustrader.io/. Confidence: high.
- [source:nautilus-repo] NautilusTrader GitHub, https://github.com/nautechsystems/nautilus_trader. Confidence: high.

