# TP 1 — Taming the async paradigm

> Autonomous workshop — does not depend on any other TP.

## Goal

Building on chapter 1 (the asynchronous model, the event loop, callbacks vs.
Promises vs. `async`/`await`), this workshop has you practice the three
foundational patterns of modern asynchronous Node.js:

1. Replacing callback-based code with `async`/`await`.
2. Running independent asynchronous operations concurrently with `Promise.all`.
3. Cancelling a slow operation with an `AbortController`.

You will work directly in TypeScript, executed natively by Node.js 24 — there is
no build step.

## Prerequisites

- Node.js >= 24 (TypeScript is run natively, no transpilation step required).

That's it. No other TP and no global tooling are needed.

## Setup

```bash
npm install        # installs the dev dependencies (typescript, @types/node)
npm start          # runs src/index.ts directly with node
npm run typecheck  # type-checks the project with tsc --noEmit
```

If you use `nvm`, run `nvm use` first — the `.nvmrc` pins Node.js 24.

While developing you can also use `npm run dev`, which restarts on every save
thanks to `node --watch`.

## Steps

1. **Rewrite callback code with `async`/`await`** — open
   `src/callback-style.ts`. It provides a working `readConfig` built on
   `fs.readFile` callbacks. In `src/index.ts`, complete **Task 1**: write an
   equivalent that uses `node:fs/promises` and `async`/`await`, and confirm both
   return the same parsed object.
2. **Parallelize HTTP calls with `Promise.all`** — in `src/index.ts`, complete
   **Task 2**: fire three independent `fetch` requests and await them
   concurrently with `Promise.all`, instead of one after the other.
3. **Add an `AbortController` timeout** — open `src/http.ts` and implement
   `fetchWithTimeout`, then call it from **Task 3** in `src/index.ts` to fetch a
   URL that must complete within a given delay.

## Going further

- Replace `Promise.all` with `Promise.allSettled` and report which calls failed
  without aborting the others.
- Swap your hand-rolled timeout logic for the built-in `AbortSignal.timeout(ms)`
  and compare the two approaches.
- Combine several signals with `AbortSignal.any([...])` (e.g. a timeout signal
  plus a user-cancellation signal).
- Measure the wall-clock difference between the sequential and parallel versions
  of Task 2 using `performance.now()`.
