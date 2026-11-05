# Workshop 04 — Tracing

> Someone says "opening an issue is slow". Slow where — the guard, the scoring,
> the database? Trace the requests, join the browser's trace, and add the spans
> the SDK cannot guess.

## Goal

Chapter 04 — A trace for every request that matters:

- **Sampling by what the request is**: never the health checks, always obey the
  caller's decision
- **Distributed tracing**: the API continues the trace the browser started
- **Your own spans**: `@SentryTraced` around a method, `Sentry.startSpan` around a
  block

## Prerequisites

- Workshop 03 done (this starter is its solution)
- Chapter 04 of the deck: spans, sampling, distributed tracing, custom spans

## Setup

```bash
nvm use              # Node.js 24, from .nvmrc
npm install
npm test             # vitest run — the given specs, red on the starter
npm run test:watch   # keep it open in a second terminal
npm run typecheck    # tsc --noEmit
cp .env.example .env
npm run start:dev    # the API on http://localhost:3000
```

To **see** what the API sends, start Spotlight in another terminal —
`npx @spotlightjs/spotlight` — and open http://localhost:8969. `.env` already
has `SENTRY_SPOTLIGHT=1`. A real project of sentry.io is optional: put its DSN in
`SENTRY_DSN`.

The specs are already written: **`src/tests/workshop.spec.ts`**. They start the SDK
with **your** `initSentry()` (`src/tests/setup.ts`, before the app is loaded — what
`node --import` does for the real server), with a fake transport that records the
envelopes; they drive the whole app with `supertest`, then read what would have
reached Sentry.

> `src/tests/shared/` is a **shared copy** of the test kit (the same for the
> React and NestJS editions of this training): do not edit it.

**What is missing**: with Spotlight open, `curl localhost:3000/issues/1` — no
trace at all. Tracing is **off** until a sample rate or a sampler is set.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `tracesSampler` | `sentry.ts` | `npm test` — step 1 green |
| 2 | Continue the browser's trace | nothing to write | `npm test` — step 2 green |
| 3 | `@SentryTraced` | `issues/issues.service.ts` | `npm test` — step 3 green |
| 4 | A manual span | `issues/issues.repository.ts` | `npm test` — all green |

## Steps

### 1. What is traced — `sentry.ts`

```ts
tracesSampler: ({ attributes, inheritOrSampleWith }) => {
  if (attributes?.['url.path'] === '/health') return 0;
  return inheritOrSampleWith(process.env.NODE_ENV === 'production' ? 0.2 : 1);
},
```

- The decision is taken when the request **arrives**, before routing: the URL is in
  `attributes` (`url.path`, `url.full`, the headers), the name is only `GET`.
- `inheritOrSampleWith(rate)`: when the request comes with `sentry-trace`, keep the
  caller's decision — a trace is kept whole or dropped whole. A bare `return 1`
  would break the browser's sampling.

**Check it**: `curl localhost:3000/issues/1` — a trace in Spotlight: the request, the
middlewares, the guard, the handler. `curl localhost:3000/health` — nothing.

→ **Done when** the step 1 specs are green.

### 2. Continue the browser's trace

Nothing to write: the `http` instrumentation reads `sentry-trace` and `baggage` on
every request. Try it:

```bash
curl localhost:3000/issues/1 -H 'sentry-trace: 0123456789abcdef0123456789abcdef-89abcdef01234567-1'
```

The trace id in Spotlight is `0123…cdef`. In a real app, the React app's
`tracePropagationTargets` sends this header — and the API must allow it in CORS.

→ **Done when** the step 2 spec is green.

### 3. A span around the scoring — `issues/issues.service.ts`

Decorate `score` with `@SentryTraced('issues.score')` (from `@sentry/nestjs`). The
argument is the **op**; the span is named after the method.

→ **Done when** the step 3 spec is green.

### 4. A span around the database read — `issues/issues.repository.ts`

A real driver (`pg`, `mysql2`, `mongodb`, Prisma…) is instrumented by the SDK; this
in-memory one is not. Wrap the read:

```ts
return Sentry.startSpan(
  { name: 'issues.repository.findOne', op: 'db.query', attributes: { 'issue.id': id } },
  () => this.read(id),
);
```

The span ends when the promise settles — `status: 'error'` when it rejects: try
`/issues/13`.

→ **Done when** `npm test` is fully green.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `GET /health` is never traced
- [ ] A request with `sentry-trace` joins that trace, and keeps its decision
- [ ] The trace of `GET /issues/:id` shows `score` and `issues.repository.findOne`

**You can explain**

- [ ] Why the sampler reads `url.path`, not the route
- [ ] What `inheritOrSampleWith` protects
- [ ] When to use `@SentryTraced`, and when `Sentry.startSpan`

## Going further

- `npm install @sentry/profiling-node`, add `nodeProfilingIntegration()`,
  `profileSessionSampleRate: 1`, `profileLifecycle: 'trace'`, and make `score` slow
  (a busy loop): find it in the profile.
- `ignoreSpans: [{ op: 'middleware' }]`: what disappears from the trace?
- Call a third-party API with `fetch` from the service: an `http.client` span, and
  the `sentry-trace` header sent to it — do you want that?
