---
layout: cover
---

# 2 - Node.js internal architecture

---

# Overview

- Node.js is built on:
  - The **V8** JavaScript engine (Google) to execute JS code
  - **libuv** (C/C++) for non-blocking I/O and the event loop
  - A standard library exposed in JS (`fs`, `http`, `crypto`, etc.)
  - **Bindings** between JS and C++ code

```
+----------------------------+
|       Your JS code         |
+----------------------------+
| Core modules (fs, http...) |
+----------------------------+
|       C++ Bindings         |
+--------------+-------------+
|     V8       |    libuv    |
+--------------+-------------+
```

---

# Single-thread

- JavaScript code runs on **a single thread**
- Blocking operations (CPU, sync I/O) freeze **all** other requests
- libuv delegates some operations to a **thread pool** (4 by default)
  - Filesystem (except natively non-blocking operations)
  - DNS (`dns.lookup`)
  - Crypto (`pbkdf2`, async `randomBytes`, etc.)
  - Compression (`zlib`)

```bash
UV_THREADPOOL_SIZE=8 node server.js
```

---

# The Event Loop

- Infinite loop orchestrating execution phases

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout / setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

---

# Microtasks vs macrotasks

- Between each phase, Node runs:
  - All pending **`process.nextTick`** callbacks
  - All **microtasks** (resolved promises)

```ts
console.log('1');
setTimeout((): void => console.log('2'), 0);
setImmediate((): void => console.log('3'));
Promise.resolve().then((): void => console.log('4'));
process.nextTick((): void => console.log('5'));
console.log('6');

// Output: 1, 6, 5, 4, 2, 3
```

---

# setImmediate vs setTimeout(fn, 0)

- `setImmediate(cb)`: runs in the **check** phase (after `poll`)
- `setTimeout(cb, 0)`: scheduled in the **timers** phase, fired as soon as possible
- When inside an I/O callback, **`setImmediate` is guaranteed to run before** the timer

```ts
import { readFile } from 'node:fs';

readFile('./file', (): void => {
  setTimeout((): void => console.log('timeout'), 0);
  setImmediate((): void => console.log('immediate'));
});
// Output: immediate, timeout
```

---

# process.nextTick

- Schedules a function to run **before** the next event loop iteration
- Higher priority than microtasks (Promises)
- Use with care: an infinite `nextTick` starves the event loop

```ts
function deferred(): void {
  process.nextTick((): void => {
    // ... runs right after the current stack
  });
}
```

---

# Bottlenecks

- Any **CPU-bound** computation > a few milliseconds blocks the event loop
  - Synchronous bcrypt hashing
  - JSON.parse/stringify on huge payloads
  - Complex loops
- Sync APIs from the standard library should be banned from the hot path
- Solutions:
  - Slice the work using `setImmediate`
  - **Worker Threads**
  - Offload to another service

---

# Measuring event loop latency

- The `perf_hooks.monitorEventLoopDelay` module

```ts
import { monitorEventLoopDelay } from 'node:perf_hooks';
import type { IntervalHistogram } from 'node:perf_hooks';

const histogram: IntervalHistogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval((): void => {
  console.log('mean:', histogram.mean / 1e6, 'ms');
  console.log('p99:', histogram.percentile(99) / 1e6, 'ms');
  histogram.reset();
}, 1000);
```

- External tools: `clinic doctor`, `0x`, APMs (Datadog, NewRelic, Dynatrace)

---

# Recap

- Node = V8 + libuv + bindings
- **One thread** for JS, **N threads** for some I/O
- The event loop has **6 phases** interleaved with microtasks
- Bottlenecks are almost always **CPU work on the main thread**

---

# Hands-on

## Workshop 2 - Event loop
- Predict then verify the output order of `nextTick` / `Promise` / `setImmediate` / `setTimeout`
- Measure event-loop latency under load with `monitorEventLoopDelay`
- Spot a CPU block on the main thread with `node --prof` + `--prof-process`
