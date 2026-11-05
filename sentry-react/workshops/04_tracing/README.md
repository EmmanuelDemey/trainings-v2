# Workshop 04 — Tracing

> Users say opening an issue is "slow sometimes". Sentry knows about errors, not
> about time. Turn tracing on, send the trace to the API — and only to the API —
> and give the user's action a span of its own, so the requests it triggers show
> up under it.

## Goal

Chapter 04 — Tracing and performance with **`browserTracingIntegration`**:

- **Page loads, navigations and `fetch` calls** as spans, with the Web Vitals
- **Sampling**: every trace in development, a fraction in production
- **Distributed tracing**: `sentry-trace` and `baggage` to your own API, never
  to a third party
- **A custom span** for what the user did

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Workshop 03 done, or start from this folder: its starter is workshop 03's solution
- Chapter 04 of the deck: spans, sampling, distributed tracing

## Setup

```bash
npm install
npm run dev                   # http://localhost:5173
npx @spotlightjs/spotlight    # http://localhost:8969, in another terminal
npm run test:watch
```

The spec, **`src/tests/workshop.spec.tsx`**, is red on the starter. Besides the
envelopes, it reads `serverLog` — every request the fake backend received,
**headers included** — to check what your SDK propagates.

> SDK v11 **streams** spans: each one is sent when it ends, in a `span` envelope,
> not nested in a `transaction` event as in v10. Spotlight and Sentry rebuild the
> tree.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Tracing on, and sampled | `sentry.ts` | `npm test` — step 1 green |
| 2 | Propagate to the API only | `sentry.ts` | `npm test` — step 2 green |
| 3 | A span for opening an issue | `components/IssueDetail.tsx` | `npm test` — all green |
| 4 | *(Bonus)* Ignore the health check | `sentry.ts` | no `GET …/health` span in Spotlight |

## Steps

### 1. Tracing on — `sentry.ts`

1. Add `Sentry.browserTracingIntegration()` to the integrations — for every mode,
   not only development.
2. `tracesSampleRate: import.meta.env.PROD ? 0.2 : 1`. Every trace while you
   develop; one in five in production — each span counts in your quota.

**Check it**: reload. Spotlight shows a **pageload** trace, with the `fetch`
calls of the list as children, and the Web Vitals (LCP, CLS, INP) on the root.

→ **Done when** the step 1 spec is green.

### 2. The trace goes to the API — `sentry.ts`

`tracePropagationTargets: [API_URL]` (`./api/fakeServer`). The SDK adds
`sentry-trace` and `baggage` to the requests whose URL matches — and only those.

Why not everywhere? The avatars come from a CDN you do not own: it would receive
your trace ids, and a browser sends a CORS preflight for a request with custom
headers — one the CDN does not expect, and may refuse.

**Check it**: open issue 1. In the browser's devtools (Network), the request to
`api.issue-tracker.test` has the two headers; the one to
`avatars.issue-tracker-cdn.test` has neither. (The fake backend answers in the
page: look at `serverLog` in the console, or at the spec.)

→ **Done when** the step 2 specs are green.

### 3. A span for the user's action — `components/IssueDetail.tsx`

Wrap the fetch of the detail in a span — `startSpan` returns what its callback
returns, so you chain on it as before:

```ts
Sentry.startSpan({ name: 'issue.open', op: 'ui.action', attributes: { 'issue.id': id } }, () => fetchIssue(id))
  .then(…)
```

The span ends when the promise settles. The request made inside belongs to the
same trace: in Spotlight, `issue.open` and its `GET api.issue-tracker.test` sit
side by side, with their durations.

→ **Done when** `npm test` is fully green.

### 4. *(Bonus)* The health check — `sentry.ts`

`useHealthCheck` calls `GET /health` every 30 seconds: thousands of identical
spans a day, for nothing.

```ts
ignoreSpans: [{ op: 'http.client', name: /\/health$/ }],
```

`ignoreTransactions` does not work any more with span streaming: `ignoreSpans`
works with both lifecycles.

## Definition of Done

Tick every box before moving on. The bonus step and the "Going further" section
are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] A pageload trace in Spotlight, with the Web Vitals
- [ ] `sentry-trace` and `baggage` on the API requests, never on the CDN's
- [ ] An `issue.open` span with the attribute `issue.id`, in the trace of its request
- [ ] `tracesSampleRate` is lower in production

**You can explain**

- [ ] Trace, segment, span: which contains which
- [ ] What `sentry-trace` and `baggage` carry, and why the API needs them
- [ ] Why `tracePropagationTargets` is a list of YOUR origins
- [ ] What sampling 0.2 means for the traces of a user who reports a bug

## Going further

- `Sentry.reactRouterV7BrowserTracingIntegration({ … })` names navigations by
  route (`/issues/:id`), not by URL — the same reason as the fingerprint of
  workshop 02.
- `tracesSampler` instead of `tracesSampleRate`: 1 for the checkout page, 0.05
  for the rest.
- Start the API of the NestJS edition of this training, point `API_URL` to it:
  one trace, from the click to the database.
