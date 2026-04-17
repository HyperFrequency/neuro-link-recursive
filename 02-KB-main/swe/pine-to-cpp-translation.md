---
title: Pine Script v6 to C++: translation patterns and pitfalls
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 95c43165fd8e42d3dd20fde5b1f50f48e9745d25efdf7b6e42e4ddb0a9a5518c
---

# Pine Script v6 to C++: translation patterns and pitfalls

Distilled from translating two canonical TradingView indicators (RSI mean-reversion, MACD signal cross) from Pine Script v6 into streaming-style basic C++. C++ is the right target when you need an HFT/embedded engine, exchange-collocated execution, or any latency-sensitive path. Average score across the C++ ports: 14/15.

## Mental model: streaming, not vectorized

Pine, pandas, and vectorbt all think in *series*. C++ trading code thinks in *bars-as-they-arrive*. The translation pattern is: turn each Pine indicator into a small class with `on_bar(...)` returning the updated value, and store only the recursive state needed (last EMA, last RSI, prior crossover values). No full-history buffers on the hot path.

```cpp
class Ema {
public:
  explicit Ema(std::size_t length)
      : alpha_(2.0 / (static_cast<double>(length) + 1.0)) {}
  double update(double x) {
    if (!have_value_) { value_ = x; have_value_ = true; }
    else value_ = alpha_ * x + (1.0 - alpha_) * value_;
    return value_;
  }
  // ...
};
```

Compose larger indicators (MACD, ATR, Bollinger) from these small streaming primitives. This is the pattern Nautilus and most production C++ engines use.

## Pitfall 1: Wilder smoothing constant

Same trap as the Python port. Pine's `ta.rsi`/`ta.atr`/`ta.rma` use `alpha = 1/length`, not `2/(length+1)`. In C++:

```cpp
const double alpha = 1.0 / static_cast<double>(length);          // Wilder
const double alpha = 2.0 / (static_cast<double>(length) + 1.0);  // EMA
```

Always `static_cast<double>(length)` before the divide; mixing `int` arithmetic into the divide loses precision and silently zeroes alpha for `length >= 2`.

## Pitfall 2: Wilder seed

Wilder's RSI/ATR seeds the average with a *simple* mean of the first `length` deltas, then switches to recursive smoothing. Failing to gate on the seed bar produces an RSI that's noisy for the first 14 bars. Implement explicitly:

```cpp
if (bars_seen_ < length_) {
  sum_up_ += up; sum_down_ += down; ++bars_seen_;
  if (bars_seen_ == length_) {
    avg_up_ = sum_up_ / static_cast<double>(length_);
    avg_down_ = sum_down_ / static_cast<double>(length_);
  }
} else {
  avg_up_ = (avg_up_ * (1.0 - alpha_)) + up * alpha_;
  avg_down_ = (avg_down_ * (1.0 - alpha_)) + down * alpha_;
}
```

## Pitfall 3: Divide-by-zero in RSI

When `avg_down == 0`, `RS = avg_up / avg_down` is infinity. Pine returns RSI = 100 in this case. The naive C++ `100 - 100/(1+rs)` produces NaN.

```cpp
if (avg_down_ == 0.0) return 100.0;
const double rs = avg_up_ / avg_down_;
return 100.0 - (100.0 / (1.0 + rs));
```

## Pitfall 4: Crossover state needs both prior values

Pine's `ta.crossover(a, b)` is implicitly comparing `(a, b)` to `(a[1], b[1])`. In C++ store both prior values, not just one:

```cpp
const bool cross_up = (macd > sig) && (prev_macd <= prev_signal);
const bool cross_dn = (macd < sig) && (prev_macd >= prev_signal);
// ...update prev_macd and prev_signal AFTER the comparison.
```

Updating either prior before the comparison eats the crossover bar.

## Pitfall 5: MACD signal-line composition

Pine's MACD signal line is the *EMA of the MACD line*, not the EMA of price. The C++ ordering must be:

```cpp
const double f = fast_.update(close);
const double s = slow_.update(close);
const double macd = f - s;
const double sig  = signal_.update(macd);  // EMA of macd, NOT of close
```

A common bug is to feed `close` into the signal EMA. The result looks plausible on a chart but never reaches the right cross points.

## Pitfall 6: Look-ahead

C++ is naturally bar-at-a-time so look-ahead is harder to introduce — but Donchian-style indicators still need to compute the channel from the *prior* `length` bars. Use a circular buffer of the last `length` highs/lows and update it *after* you've computed the breakout decision for the current bar.

## Output, NaN sentinels, and `std::optional`

Using `std::numeric_limits<double>::quiet_NaN()` as a not-ready sentinel is fast and avoids branchy ready-flags on the hot path, but it leaks NaN into downstream math. For library-quality code prefer `std::optional<double>` for the *first* read; once warmed up, the value is always defined and the cost goes away.

## Translation workflow checklist

1. Read the Pine source; write down the behavioral contract.
2. Identify the recursive state needed for each indicator. That state is the only thing the C++ class needs to hold.
3. Build small primitives (`Ema`, `Rma`, `RollingMax`) and compose larger indicators from them.
4. Wilder vs standard EMA, biased stdev, look-ahead — all the same pitfalls as the Python port apply.
5. Make `on_bar(close)` (or `(open, high, low, close)`) the only public method on the hot path. No allocations.

## When NOT to translate to C++

- For research, parameter sweeps, or notebooks — stay in Python or vectorbt.
- For event-driven backtests with realistic fills — use NautilusTrader (Python or Rust).
- C++ is the right target when latency is in the order-flow critical path, when you need to embed in an exchange gateway, or when memory/cache layout matters more than developer ergonomics.

## Sources

- Translation grading session, 2026-04-16. Worktree: `compassionate-franklin-2583d0/.planning/translations/`.
- Strategy-translator skill: `/Users/DanBot/.claude/skills/strategy-translator/SKILL.md`.

