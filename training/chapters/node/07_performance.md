---
layout: cover
---

# 7 - Performance management

---

# Goals

- Identify **bottlenecks** in a Node.js application
- Write JavaScript that is **performant for V8**
- Master **memory** and detect **leaks**
- Offload **heavy computations** (worker threads, clusters)
- **Profile** and **analyze** performance

---

# JavaScript that's performant for V8

- V8 compiles JS through several stages: Ignition (interpreter) → SparkPlug → Maglev → TurboFan
- A few rules to stay on the **fast path**:
  - Keep a **stable object shape** (Hidden Classes are derived from the order of property additions)
  - Initialize **all** properties in the constructor
  - Avoid **changing the type** of a property over time
  - Use **dense arrays** instead of objects for ordered lists
  - Prefer **monomorphic** functions (same argument types)

---

# Hidden classes - example

```ts
// ✗ Bad: shape change
const a: Record<string, number> = {};
a.x = 1;
a.y = 2;

const b: Record<string, number> = {};
b.y = 2;
b.x = 1; // different shape from a!

// ✓ Good: same shape
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
```

---

# Inlining and deoptimization

- V8 **inlines** short functions called inside a hot loop
- Avoid:
  - Functions that are too **long** (>600 chars)
  - `try/catch` around the hot path (especially before Node 18)
  - Using `arguments` outside arrow functions

```ts
// Bad
function sum(): number {
  let total = 0;
  for (const n of arguments) total += n;
  return total;
}

// Good
function sum(...nums: number[]): number {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}
```

---

# Memory management

- V8 uses a **generational GC**:
  - **New Space**: young objects, frequent GC (Scavenger)
  - **Old Space**: promoted objects, less frequent GC (Mark-Sweep-Compact)
- Default limit: **~4 GB** on 64-bit → tunable

```bash
node --max-old-space-size=8192 server.js
```

- The GC blocks the event loop: limit **allocations on the hot path**

---

# Memory leaks - common causes

- **Closures** capturing a large object
- **Listeners** never unsubscribed on an EventEmitter
- **Caches** without an eviction policy (no LRU)
- **Global** variables that grow forever
- Timers (`setInterval`) never stopped

```ts
// Typical leak
const cache: Record<string, Promise<User>> = {};
app.get('/users/:id', (req: Request, res: Response) => {
  if (!cache[req.params.id]) {
    cache[req.params.id] = fetchUser(req.params.id);
  }
  // cache grows indefinitely
});
```

---

# Detecting leaks

- Watch `process.memoryUsage()` over time

```ts
setInterval((): void => {
  const m: NodeJS.MemoryUsage = process.memoryUsage();
  console.log({
    rss: Math.round(m.rss / 1e6),
    heap: Math.round(m.heapUsed / 1e6),
  });
}, 5000);
```

- Heap snapshots in Chrome DevTools: `node --inspect server.js` then "Memory" → "Heap snapshot" (the **3-snapshots** technique)
- Tools: `clinic heap`, `heapdump`, `memlab` (Meta)

---

# Heavy computations - strategies

| Strategy | Use case |
|----------|----------|
| **`setImmediate` slicing** | Iterative compute over a large collection |
| **Worker Threads** | CPU-bound work in the same process |
| **Cluster** | Spread processes across CPU cores |
| **External service** | Long-running, isolated, independently scalable |
| **Native addon** | Truly need C++ performance |

---

# Slicing with setImmediate

```ts
function processChunk<T>(items: T[], i = 0): void {
  const end = Math.min(i + 1000, items.length);
  for (; i < end; i++) heavyWork(items[i]);

  if (i < items.length) {
    setImmediate(() => processChunk(items, i));
  }
}
```

- Lets the event loop **breathe** between chunks
- Too many `setImmediate` = overhead, dose accordingly

---

# CPU profiling

- Built-in **`--prof`**

```bash
node --prof server.js
# generates isolate-XXXX-v8.log
node --prof-process isolate-XXXX-v8.log > report.txt
```

- **`--cpu-prof`**: Chrome DevTools-compatible profile

```bash
node --cpu-prof --cpu-prof-dir=./profiles server.js
```

- Load the file in **Chrome DevTools → Performance**

---

# External tools

- **clinic.js** (NearForm): `doctor`, `flame`, `bubbleprof`, `heap`

```bash
clinic doctor -- node server.js
clinic flame -- node server.js
```

- **0x**: ready-made flamegraphs
- **autocannon**: HTTP benchmarking

```bash
autocannon -c 100 -d 30 http://localhost:3000/api/users
```

- APMs: Datadog, NewRelic, Dynatrace, Sentry, Elastic APM

---

# Performance Measurement APIs

- The `node:perf_hooks` module

```ts
import { performance, PerformanceObserver } from 'node:perf_hooks';
import type { PerformanceObserverEntryList } from 'node:perf_hooks';

const obs = new PerformanceObserver((items: PerformanceObserverEntryList) => {
  for (const entry of items.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('start');
await heavyOperation();
performance.mark('end');
performance.measure('heavy', 'start', 'end');
```

- Aligned with the Web Performance API → portable browser ↔ Node

---

# Bottlenecks - diagnostic

1. **Measure** before optimizing (`autocannon`, APM metrics)
2. **Identify** the responsible phase (CPU, memory, I/O, GC, DB lock)
3. **Profile** the hot zone
4. **Optimize** one thing at a time
5. **Re-measure**

> *Premature optimization is the root of all evil* - Donald Knuth

---
layout: cover
---

# Hands-on

## Workshop 7 - Performance
- Profile a slow route with `clinic doctor`
- Detect a memory leak (3 snapshots)
- Slice a heavy computation with `setImmediate`
