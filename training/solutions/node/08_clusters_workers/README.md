# TP 8 — Clusters & Worker Threads

> This TP is **autonomous**: it does not depend on any other TP. Everything you need
> lives in this directory. No build step — Node.js 24 runs the TypeScript sources
> natively.

## Goal

Chapter 8 — Scale a Node.js HTTP server beyond a single thread:

- Run multiple instances of the server with a **cluster** managed by **PM2**.
- Move a CPU-heavy computation (password hashing) off the event loop using a
  **Worker Thread**, so the main thread stays free to serve requests.
- **Measure** the difference with a load test before and after offloading.

## Prerequisites

- **Node.js >= 24** (TypeScript runs natively, no transpilation). Use `nvm use`
  to pick up the version from `.nvmrc`.
- **pm2** and **autocannon** are run on demand via `npx` — nothing to install
  globally.

> **Note on hashing.** The course slides use `bcrypt` to illustrate a CPU-bound task.
> `bcrypt` is a native addon and requires a compile toolchain, which would break the
> autonomy of this TP. We use Node's built-in `node:crypto` **`scrypt`** instead — it
> is just as CPU-intensive and ships with Node, so there are **zero native
> dependencies**. The technique (offloading to a Worker Thread) is identical.

## Setup

```bash
nvm use                # selects Node 24 from .nvmrc
npm install            # express + dev type packages
npm run typecheck      # optional: verify the types compile
npm start              # starts the server on http://localhost:3000
```

Try it:

```bash
curl "http://localhost:3000/hash?password=secret"
```

## Steps

The current `src/server.ts` hashes **inline on the main thread**, which blocks the
event loop. Work through the three tasks below; each `// TODO` marks where to act.

1. **Cluster with PM2.** Start the server as a cluster of workers, one per CPU core:

   ```bash
   npm run pm2          # npx pm2 start src/server.ts -i max --interpreter node
   npx pm2 ls           # list the running instances
   npx pm2 logs         # follow logs
   npx pm2 delete all   # stop the cluster when done
   ```

   Observe that incoming requests are load-balanced across instances.

2. **Offload to a Worker Thread.** Replace the inline blocking hash in
   `src/server.ts` with a call to `hashInWorker(...)` from `src/run-worker.ts`.
   Complete the worker logic in `src/hash.worker.ts` (receive the password, compute
   the `scrypt` hash, post the result back) and the spawning helper in
   `src/run-worker.ts`.

3. **Compare performance.** Load-test the endpoint with autocannon, both with the
   inline version and the Worker version, and compare throughput / latency:

   ```bash
   npm run load         # npx autocannon -c 50 http://localhost:3000/hash?password=secret
   ```

   Run it once against the inline implementation, then again after wiring the Worker
   Thread (single instance, no PM2), and note the difference.

## Going further

- Combine both approaches: a PM2 cluster **and** a Worker Thread per instance.
- Replace the one-shot worker with a **worker pool** that reuses threads instead of
  spawning a new one per request (e.g. a fixed-size pool of `Worker`s, or the
  `node:worker_threads` primitives behind a small queue).
- Move the hashing into a **`MessagePort`-based** long-lived worker and benchmark the
  spawn-cost savings.
- Explore PM2 features: zero-downtime `reload`, `pm2 monit`, ecosystem files.
