# Advanced Node.js — Workshops (TP)

Hands-on exercises for the **Advanced Node.js** training, based on **Node.js 24 LTS**.

Each workshop is a **standalone project**: it has its own `package.json`, `tsconfig.json`,
`.nvmrc` and `README.md`, and it **does not depend on any other workshop**. You can start
with any of them in any order.

All code is **TypeScript executed natively by Node.js 24** (type stripping, no build step):

```bash
cd 01_async
npm install
npm start          # runs src/index.ts directly
npm run typecheck  # tsc --noEmit (type-check only)
```

## Workshops

| # | Folder | Topic | Extra requirements |
|---|--------|-------|--------------------|
| 1 | `01_async/` | Taming the async paradigm (async/await, Promise.all, AbortController) | — |
| 2 | `02_event_loop/` | Event loop ordering, latency, CPU profiling (`--prof`) | — |
| 3 | `03_events/` | Typed EventEmitter, error handling, EventEmitter vs RxJS | — |
| 4 | `04_express/` | REST API, JWT/role guards, helmet/cors/rate-limit | — |
| 5 | `05_streams/` | Count lines, gzip+AES pipeline, JSON Lines Transform | — |
| 6 | `06_tests/` | Unit tests with mocks, supertest, Playwright (optional) | — |
| 7 | `07_performance/` | Profiling, memory leaks, slicing heavy work | `npx` autocannon / clinic |
| 8 | `08_clusters_workers/` | PM2 cluster, Worker Threads, benchmarking | `npx` pm2 / autocannon |
| 9 | `09_advanced_streams/` | Back-pressure, AMQP ack/nack, Redis Pub/Sub | **Docker** (compose) |
| 10 | `10_quality/` | ESLint/Prettier/Husky, error hierarchy, pino + ALS | — |
| 11 | `11_advanced_modules/` | AsyncLocalStorage, scrypt, fs.watch | — |
| 12 | `12_native_addons/` | Node-API addon, Fibonacci, benchmark vs JS | **C/C++ toolchain** |

> Each folder is a starter skeleton: implement the `// TODO` markers following the steps
> in its own `README.md`.

The worked answer to every workshop lives in `solutions/node/`, one runnable
folder per workshop. Do not hand it out before the exercise.

## Toolchain versions

Dependencies were last refreshed on **2026-08-20**, to the latest release of every
package. Two deliberate exceptions, both of which will lift on their own:

| Pin | Why |
|---|---|
| `@types/node` on **24.x**, not 26.x | It must describe the runtime the training targets. The 26.x types declare APIs Node 24 does not have, so code would type-check and then crash at runtime. |
| `typescript` **6.0.3** in `10_quality` only | `typescript-eslint@8` peers `typescript <6.1.0`; no release supports TypeScript 7 yet. Every other workshop is on **TypeScript 7**. |

`@types/amqplib` was dropped: **amqplib 2** ships its own type definitions.
