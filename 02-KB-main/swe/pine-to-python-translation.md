---
title: Pine Script v6 to Python: translation patterns and pitfalls
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: c65c42360261550488e2625087b38ecb5b20e40302fc14e055f3eaa33da6efe5
---

# Pine Script v6 to Python: translation patterns and pitfalls

Distilled from translating five canonical TradingView indicators (EMA cross, RSI mean-reversion, Bollinger Bands, MACD, Donchian breakout) into basic Python (pandas/numpy) and vectorbt. Average translation score: 13.9/15. The patterns and pitfalls below cover every non-trivial gap discovered.

## Pattern: behavioral contract first

Before typing a single line of Python, write down the source's behavioral contract: indicator parameters, entry/exit conditions, position sizing, fill convention. Most translation bugs come from skipping this step.

## Pitfall 1: EWM smoothing constant — Wilder vs standard EMA

Pine's `ta.rsi`, `ta.atr`, `ta.rma` use **Wilder smoothing**: `alpha = 1 / length`.
Pine's `ta.ema` uses **standard EMA**: `alpha = 2 / (length + 1)`.

Pandas' `.ewm(span=length, adjust=False)` is the *standard* EMA formula. Using it for an RSI port produces a silently-wrong RSI that drifts a few points from Pine.

Right:
```python
# Standard EMA (matches ta.ema)
close.ewm(span=length, adjust=False).mean()

# Wilder smoothing (matches ta.rsi, ta.atr, ta.rma)
close.ewm(alpha=1.0 / length, adjust=False).mean()
```

Always pass `adjust=False` so the recursion is `value = alpha*x + (1-alpha)*prev`.

## Pitfall 2: Standard deviation — biased (N) vs sample (N-1)

Pine's `ta.stdev` is the *biased* (population) stdev: divisor N. Pandas' `.std()` defaults to sample stdev: divisor N-1. Bollinger Bands and z-score indicators silently come out wider in Python unless you pass `ddof=0`.

```python
close.rolling(length).std(ddof=0)  # matches Pine
```

## Pitfall 3: Look-ahead in self-referential channels

Donchian, swing-high/low, chandelier exits — anything that uses a rolling extreme as a breakout level — must compute the level from *prior* bars only. Pine writes `ta.highest(high, length)[1]` (the `[1]` is a one-bar lag).

In pandas:

```python
# Wrong — peeks at the breakout bar in its own channel; signal never fires.
upper = high.rolling(length).max()

# Right — channel is computed from the previous `length` bars.
upper = high.rolling(length).max().shift(1)
```

Without the shift, the breakout level always equals the breakout bar's high, so `close > upper` is never true. The bug produces silently-flat backtests, not exceptions.

## Pitfall 4: Crossover detection requires the prior bar

Pine's `ta.crossover(a, b)` is true on the bar where `a` first exceeds `b`, not on every bar where `a > b`. The Python equivalent compares current vs prior bar:

```python
cross_up = (a > b) & (a.shift(1) <= b.shift(1))
cross_dn = (a < b) & (a.shift(1) >= b.shift(1))
```

Using only `(a > b)` re-signals every bar the condition holds and turns a strategy with two yearly trades into one with two hundred.

## Pitfall 5: Fill-timing convention

Pine `strategy.entry` fills at the **close of the signal bar** (default `process_orders_on_close=false` actually fills on the *next* bar's open, but the semantics most users assume is signal-bar close). vectorbt's `Portfolio.from_signals` fills on the **next bar's open**.

For the basic-Python version, the safe convention is `position.shift(1) * returns` — model entries as effective from the bar *after* the signal. State this in the docstring so the reader can reconcile against Pine.

## vectorbt-specific notes

- Use the `.vbt` accessor for crossover detection: `close.vbt.crossed_above(upper)`. It does the lag bookkeeping for you and avoids the Pitfall 4 bug.
- vectorbt's built-in indicators rename Pine's parameters: Bollinger Bands' `mult` → `alpha`; the mid-band is `bb.middle`, not `bb.basis`.
- Always pass `freq=close.index.inferred_freq or '1D'` to `Portfolio.from_signals` so annualized stats are correct.
- Pass `fees` and `slippage` explicitly even when zero — it documents the assumption.

## Idiomatic position state

The explicit Python loop is clear but slow. Vectorize with:

```python
position = (
    pd.Series(np.where(entry, 1, np.where(exit, 0, np.nan)), index=close.index)
    .ffill()
    .fillna(0)
    .astype('int8')
)
```

## Translation workflow checklist

1. Read the Pine source; write the behavioral contract.
2. Identify every Pine builtin used and look up its smoothing/biased/lag rules.
3. Emit the Python (or vectorbt) translation in one block.
4. Add a `# Diff vs source` comment listing each semantic difference and why.
5. State the fill-timing convention explicitly.

## Sources

- Translation grading session, 2026-04-16. Worktree: `compassionate-franklin-2583d0/.planning/translations/`.
- Strategy-translator skill: `/Users/DanBot/.claude/skills/strategy-translator/SKILL.md`.

