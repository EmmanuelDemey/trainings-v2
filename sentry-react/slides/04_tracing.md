---
layout: cover
---

# 04 - Tracing and performance

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Read** a trace: page load, navigations, `fetch` calls, Web Vitals
- **Sample** traces, by rate or by what they are
- **Propagate** the trace to your API — and only there
- **Measure** what matters to your users with custom spans

---
src: ../../sentry-common/slides/04_tracing/spans.md
---

---

# `browserTracingIntegration`

```ts
Sentry.init({
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1,
  tracePropagationTargets: ['https://api.issue-tracker.example'],
});
```

- A **pageload** span from navigation start to idle, a **navigation** span per
  route change — and their children: `fetch` / XHR calls, resources, long tasks
- **Web Vitals** on the page load: LCP, CLS, INP, TTFB, FCP — the numbers Google
  ranks you on, measured on your real users
- Spans from `performance.mark()` / `measure()`: add `userTimingIntegration()` —
  v11 no longer records them by default
- Click and keypress spans: `interactionsIntegration()`, also separate in v11

---

# Routes, not URLs

```tsx
import { createBrowserRouter } from 'react-router';

Sentry.init({
  integrations: [Sentry.reactRouterV7BrowserTracingIntegration({
    useEffect, useLocation, useNavigationType, createRoutesFromChildren, matchRoutes,
  })],
});

const router = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter)(routes);
```

- Without it, a navigation is named after its **URL**: `/issues/1`, `/issues/2`…
  — one "transaction" per issue, nothing to compare
- With it: `/issues/:id` — the same reason as the fingerprint by route of
  chapter 02
- TanStack Router: `tanstackRouterBrowserTracingIntegration(router)`

---
src: ../../sentry-common/slides/04_tracing/sampling.md
---

---
src: ../../sentry-common/slides/04_tracing/distributed.md
---

---

# Propagation from the browser

- The SDK adds `sentry-trace` and `baggage` to the `fetch` / XHR calls whose URL
  matches `tracePropagationTargets` — default: same origin only
- A cross-origin API must **allow** them, or the preflight fails:

```http
Access-Control-Allow-Headers: sentry-trace, baggage
```

- Never to a third party: it receives your trace ids, and a preflight it does not
  expect
- The page load itself can continue the server's trace: render
  `<meta name="sentry-trace">` and `<meta name="baggage">` in the HTML

---
src: ../../sentry-common/slides/04_tracing/custom-spans.md
---

---

# A span for what the user did

```tsx
fetchIssue(id) // before

Sentry.startSpan(
  { name: 'issue.open', op: 'ui.action', attributes: { 'issue.id': id } },
  () => fetchIssue(id),            // returns the promise — the span ends with it
).then(…);
```

- The `fetch` made inside the callback joins the same trace
- `<Sentry.Profiler name="IssueDetail">` / `withProfiler(Component)`: spans for
  the **mount** and the **updates** of a component
- `ignoreSpans: [{ op: 'http.client', name: /\/health$/ }]` — the polling you do
  not want to pay for. (`ignoreTransactions` only works with
  `traceLifecycle: 'static'`)

---
layout: cover
---

# Workshop 04

## Tracing
