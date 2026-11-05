---
layout: cover
---

# 04 - Tracing and performance

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Read** a trace: segments, spans, what the SDK instruments on its own
- **Sample** by what a request is — and never break a trace started elsewhere
- **Continue** the browser's trace in the API
- **Add** spans around your own code, with a decorator or by hand
- **Profile** the CPU of a slow endpoint

---
src: ../../sentry-common/slides/04_tracing/spans.md
---

---

# What the SDK traces on its own

```text
GET /issues/:id                       http.server   ← the segment: the request
├─ middleware - jsonParser            middleware
├─ IssuesController.findOne           handler       ← nestIntegration
│  ├─ UserGuard                       middleware
│  ├─ issues.repository.findOne       db.query      ← yours
│  └─ score                           issues.score  ← yours
└─ POST https://payments.example/…    http.client   ← fetch / http
```

- **Incoming** `http` → the segment span, named after the route
- **Nest**: middleware, guards, interceptors, pipes, handlers (`nestIntegration`)
- **Outgoing** `http` and `fetch`, with `sentry-trace` and `baggage` added
- **Drivers**: `pg`, `mysql2`, `mongodb`, `mongoose`, `ioredis`, `prisma`,
  `knex`, `kafkajs`, `amqplib`… — as long as they load **after** `instrument.ts`

---
src: ../../sentry-common/slides/04_tracing/sampling.md
---

---

# `tracesSampler` on Node

```ts
Sentry.init({
  tracesSampler: ({ attributes, inheritOrSampleWith }) => {
    if (attributes?.['url.path'] === '/health') return 0;
    return inheritOrSampleWith(process.env.NODE_ENV === 'production' ? 0.2 : 1);
  },
});
```

- The decision is taken when the request **arrives**, before routing: `name` is
  only the method (`GET`) — read the URL in **`attributes`**: `url.path`,
  `url.full`, `http.request.method`, the request headers
- A span you drop here costs nothing: no span is even created
- `ignoreSpans` instead drops a span **after** it was created — for child spans
  (a noisy middleware), not for whole requests

---
src: ../../sentry-common/slides/04_tracing/distributed.md
---

---

# Continuing the browser's trace — nothing to write

```text
Browser                                     API
fetch('/issues/1')  ── sentry-trace: 0123…cdef-89ab…4567-1 ──►  GET /issues/:id
                       baggage: sentry-trace_id=0123…, sentry-sample_rate=0.2
```

- The `http` instrumentation reads `sentry-trace` and `baggage` on every
  incoming request: the API's segment becomes a **child** of the browser's span
- `-1` / `-0`: the browser **already decided** — `inheritOrSampleWith` obeys
- The browser only sends them to the hosts in **its** `tracePropagationTargets`
- CORS: the API must **allow** these two headers —
  `app.enableCors({ allowedHeaders: ['content-type', 'sentry-trace', 'baggage'] })`

---
src: ../../sentry-common/slides/04_tracing/custom-spans.md
---

---

# `@SentryTraced` — a span around a method

```ts
import { SentryTraced } from '@sentry/nestjs';

@Injectable()
export class IssuesService {
  @SentryTraced('issues.score')     // the op; the name is the method's: 'score'
  score(issue: Issue): number {
    return (4 - issue.priority) * 10 + (issue.assignee ? 0 : 5);
  }
}
```

- Sync or async: the span ends when the method returns or its promise settles,
  `status: 'error'` if it throws
- Keeps the method's name and its metadata — safe under `@Cron`, `@OnEvent`…
- A name of your own, attributes, a block inside a method: `Sentry.startSpan`

```ts
return Sentry.startSpan(
  { name: 'issues.repository.findOne', op: 'db.query', attributes: { 'issue.id': id } },
  () => this.read(id),
);
```

---

# Profiling — where the CPU goes

```ts
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.2,
  profileSessionSampleRate: 0.1,   // 10 % of the processes profile
  profileLifecycle: 'trace',       // …while a sampled trace is running
});
```

- A **sampling profiler** in a native module: every few ms, the stack of the
  main thread — attached to the spans that ran at that moment
- A slow span with no child spans? The profile shows **which function** burnt
  the time: a regex, a `JSON.parse` of 20 MB, a sync crypto call
- Native binaries for Linux, macOS, Windows — check your base image (Alpine:
  `musl`) before turning it on in production

---
layout: cover
---

# Workshop 04

## Tracing
