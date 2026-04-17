---
title: Python asyncio Patterns and Anti-Patterns
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: aa5f90dc8386c3ddba75dcd4cc48921de838b0f8d92ad66b3ad4fa68de77587a
---

## Overview
[[asyncio]] is Python's standard cooperative-concurrency library: a single-threaded [[event loop]] schedules [[coroutines]] that yield at `await` points. It excels at I/O-bound concurrency (HTTP, DB, websockets) but is misused for CPU-bound work, where it offers no parallelism. Correct use hinges on never blocking the loop and treating every `await` as a yield point.

## Conceptual Model
A [[coroutine]] (`async def`) is a generator-like object that is meaningless until scheduled on the [[event loop]]; `asyncio.run(main())` creates the loop and drives the root coroutine. `await foo()` suspends the current coroutine until `foo()` resolves, letting the loop service other tasks. `asyncio.create_task(coro)` schedules a coroutine concurrently (returning a [[Task]]); `asyncio.gather(*coros)` runs many concurrently and awaits all [source:python-asyncio]. Anything synchronous (a hot loop, `time.sleep`, `requests.get`) blocks every other task.

## Details
- Anti-pattern: `await` in a sequential loop when you wanted concurrency — wrap with `gather`/`TaskGroup` instead.
- Anti-pattern: bare `create_task(...)` without keeping a reference; the task can be GC'd mid-flight.
- Use `asyncio.TaskGroup` (3.11+) for structured concurrency with proper cancellation propagation.
- For CPU work, offload to `loop.run_in_executor(None, fn, *args)` (thread pool) or a separate process.
- Cancellation raises `CancelledError` at the next await; in 3.11+ catch and re-raise — never swallow it.
- Don't mix sync libraries (`requests`, `psycopg2`) inside async code; use `httpx`/`aiohttp`, `asyncpg`.
- `asyncio.wait_for(coro, timeout=...)` enforces deadlines; `async with asyncio.timeout(...)` is the modern form.

## Sources
- [source:python-asyncio] *asyncio — Asynchronous I/O*, https://docs.python.org/3/library/asyncio.html. Confidence: high.
- [source:hettinger-asyncio] Raymond Hettinger, PyCon talks on asyncio. Confidence: medium.

