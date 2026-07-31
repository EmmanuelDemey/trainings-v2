# TP 2 — The event loop

> Autonomous workshop — does not depend on any other TP.

## Goal

Build an intuition for how Node.js schedules asynchronous work. Tied to chapter 2
("The event loop"), you will:

- Predict and verify the execution order of `process.nextTick`, resolved Promises,
  `setImmediate` and `setTimeout`.
- Measure event-loop latency under load with `monitorEventLoopDelay`.
- Spot a CPU-bound block using `node --prof` and `node --prof-process`.

## Prerequisites

- Node.js **>= 24** (LTS). TypeScript runs natively — there is no build step.
- Check your version: `node --version` (an `.nvmrc` is provided: `nvm use`).

## Setup

```bash
npm install        # dev dependencies only (typescript, @types/node)
npm run typecheck  # optional: validate the skeleton compiles
npm start          # runs src/index.ts (the menu)
```

The skeleton ships with `// TODO` markers — implement them as you go.

## Steps

1. **Order of microtasks vs macrotasks** — open `src/order.ts`.
   Add `process.nextTick`, a resolved `Promise.then`, `setImmediate` and
   `setTimeout(..., 0)` calls. First write down the order you expect, then run it
   and compare:

   ```bash
   node src/order.ts
   ```

2. **Latency under load** — open `src/latency.ts`.
   Enable the `monitorEventLoopDelay` histogram, log `mean` and `p99` every second,
   and implement `simulateLoad()` to periodically block the loop. Observe how the
   latency degrades:

   ```bash
   node src/latency.ts
   ```

3. **Profiling a CPU block** — open `src/blocking.ts`.
   Implement the CPU-bound function (naive `fib`) called in a loop, then profile it:

   ```bash
   npm run profile                       # or: node --prof src/blocking.ts
   node --prof-process isolate-*.log     # human-readable summary
   ```

   Look at the "Summary" and "Bottom up (heavy) profile" sections to locate the
   hot function.

## Going further

- Replace the blocking `fib` with a Worker Thread and re-measure the latency from
  step 2 — the main loop should stay responsive.
- Compare `setImmediate` vs `setTimeout(fn, 0)` ordering when called from inside an
  I/O callback (e.g. `fs.readFile`).
- Use `--cpu-prof` instead of `--prof` and inspect the `.cpuprofile` in your editor's
  flamegraph viewer.
