# Result Prompt 2

## 1. Responsibility of `urlQueue.js`
`urlQueue.js` defines a deterministic, in-memory FIFO queue for crawl targets. It validates candidate URLs against the seed domain and maximum depth, tracks each URL’s depth and visited state, and exposes minimal queue operations for scheduling without performing any crawling, network calls, or storage writes.

## 2. Scheduling strategy (and why)
**FIFO (first-in, first-out)** scheduling is used to preserve a predictable, breadth-style traversal order that is easy to reason about and deterministic across runs given identical inputs. FIFO ensures that URLs discovered earlier are scheduled earlier without reordering.

## 3. How determinism is guaranteed
- The queue is purely in-memory and uses stable FIFO ordering with no randomness.
- URLs are normalized to a canonical string before storing, so identical inputs map to identical queue entries.
- Duplicate URLs are ignored deterministically based on normalized string equality.
- No external I/O, time-based logic, or concurrency is used.

## 4. Assumptions made
- `seedUrl` is an absolute, valid URL and defines the only allowed origin for enqueued items.
- `maxDepth` is a non-negative integer and represents an inclusive upper bound.
- URLs are treated as unique by their normalized string form.

## 5. Edge cases considered
- Invalid URLs are rejected without mutating queue state.
- Different-origin URLs are rejected to enforce same-domain rules.
- Depth values outside `[0, maxDepth]` are rejected.
- Duplicate URLs are ignored to avoid non-deterministic re-queuing.
- Dequeue skips already-visited entries in a deterministic manner.

## 6. Intentionally NOT handled here (and why)
- **Crawling or fetching**: scheduling only; no network behavior is allowed here.
- **Persistence**: storage is handled by infrastructure adapters, not the queue.
- **Robots, rate limits, or politeness policies**: belong to HTTP and policy layers.
- **URL discovery or parsing**: done by parsing adapters and workflows, not the queue.
