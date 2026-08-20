# TP 7 — Performance management

> This practical exercise is **autonomous**: it does not depend on any other TP.
> You can clone this folder on its own and complete it from scratch.

## Goal

Apply the techniques from **chapter 7 (Performance)** to a small Express
server that is deliberately slow and leaky. You will:

- profile a route that blocks the event loop;
- detect a memory leak using heap snapshots;
- offload a heavy synchronous computation by slicing it with `setImmediate`.

## Prerequisites

- **Node.js >= 24** (native TypeScript execution, no build step). Run `nvm use`
  to pick up the version from `.nvmrc`.
- `autocannon` and `clinic` are used through `npx` — no global install needed.
- A Chromium-based browser (Chrome / Edge) for the DevTools heap snapshots.

## Setup

```bash
nvm use            # selects Node 24 from .nvmrc
npm install        # express + dev typings
npm run typecheck  # should pass
npm start          # http://localhost:3000
```

Smoke-test the routes:

```bash
curl http://localhost:3000/healthy
curl http://localhost:3000/slow
curl http://localhost:3000/leak
```

## Steps

1. **Profile the slow route with `clinic doctor`.**
   - Start the profiler: `npm run clinic`.
   - In another terminal, send load: `npm run load` (autocannon hits `/slow`).
   - Stop the server (Ctrl-C) so `clinic` generates its HTML report.
   - Confirm the diagnosis: the **event loop is blocked** by `computeHeavy`.
     While `/slow` runs, `curl http://localhost:3000/healthy` hangs too.

2. **Detect the memory leak (3 heap snapshots).**
   - Start with the inspector: `node --inspect src/server.ts`.
   - Open `chrome://inspect`, click *inspect*, go to the **Memory** tab.
   - Take **snapshot #1** (baseline). Send some traffic:
     `for i in {1..50}; do curl -s localhost:3000/leak >/dev/null; done`.
   - Take **snapshot #2**, send more traffic, then **snapshot #3**.
   - Compare snapshots (*Comparison* view): the `Buffer` allocations retained
     by `leakedData` keep growing. Then fix the `// TODO` in `src/server.ts`
     and verify memory stabilizes across snapshots.

3. **Slice the heavy computation with `setImmediate`.**
   - Implement `sliceWithSetImmediate` in `src/heavy.ts` (skeleton provided).
   - Update the `/slow` route to `await` it instead of calling `computeHeavy`.
   - Re-run `npm run load` and, in parallel, `curl localhost:3000/healthy`:
     `/healthy` should now respond quickly because the event loop yields
     between chunks.

## Going further

- Compare offloading strategies: `setImmediate` slicing vs a **Worker thread**
  (`node:worker_threads`) for the CPU-bound work.
- Add `clinic flame` / `clinic bubbleprof` to visualize CPU vs async delays.
- Expose metrics via `perf_hooks` (`monitorEventLoopDelay`) and log p99 latency.
- Cache `computeHeavy` results for identical inputs and measure the gain.
