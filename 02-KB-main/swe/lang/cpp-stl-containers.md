---
title: C++ STL Container Complexity
domain: software-engineering
confidence: high
last_updated: 2026-04-17
sha256: 892920a7cf0aa7cc19fc0de1022256800860a5fa2b1a8260b784bb8a2f715964
---

## Overview
The [[C++ STL]] provides a family of containers with documented [[Big-O]] complexity guarantees on each operation. Choosing the right container is mostly about *access pattern* and *insertion/deletion locality*. Cache-friendliness of contiguous storage often matters more than asymptotic complexity for realistic sizes.

## Conceptual Model
[[Sequence containers]] (`vector`, `deque`, `array`, `list`, `forward_list`) store elements in a defined order; [[associative containers]] (`set`, `map`, `multiset`, `multimap`) keep them sorted via a [[red-black tree]]; [[unordered associative]] (`unordered_set`, `unordered_map`) use [[open hashing]]. [[Container adaptors]] (`stack`, `queue`, `priority_queue`) wrap one of the above. The right pick depends on whether you need random access, ordered iteration, stable iterators, or fastest lookup [source:cppref-containers].

## Details
- `vector<T>`: O(1) random access, O(1) amortized push_back, O(n) middle insert. Default choice; cache-friendly.
- `deque<T>`: O(1) push_front and push_back, O(1) random access, but iterators invalidate on insertion.
- `list<T>`: O(1) splice/insert anywhere given an iterator, O(n) lookup. Rare in practice — pointer chasing kills cache.
- `map<K,V>` / `set<K>`: O(log n) ops, ordered iteration. Iterators stable across insert.
- `unordered_map<K,V>`: O(1) average / O(n) worst lookup; needs `std::hash<K>` + `operator==`.
- `priority_queue<T>`: max-heap by default; pass `std::greater<T>` for min-heap.
- For small N (<32), `vector` linear scan often beats hash/tree containers due to constants and cache effects.
- Consider [[boost::flat_map]] / `std::flat_map` (C++23) for sorted contiguous storage — best of both worlds for read-heavy workloads.

## Sources
- [source:cppref-containers] *cppreference: Containers*, https://en.cppreference.com/w/cpp/container. Confidence: high.
- [source:meyers-stl] Scott Meyers, *Effective STL*, Addison-Wesley 2001. Confidence: high.

