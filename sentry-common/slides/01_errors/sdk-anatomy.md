# Anatomy of a Sentry SDK

```text
 your code ──► Sentry.captureException(err)
                │
                ▼
          ┌──────────┐   applies   ┌────────────────────────────────┐
          │  Scopes  │ ──────────► │ user · tags · contexts · crumbs │
          └──────────┘             └────────────────────────────────┘
                │
                ▼
          ┌──────────┐  integrations add data · event processors · beforeSend
          │  Client  │  sampling · ignoreErrors · denyUrls
          └──────────┘
                │ envelope
                ▼
          ┌───────────┐  fetch / http, rate limits, offline buffer
          │ Transport │ ─────────────► Sentry  (and Spotlight, in development)
          └───────────┘
```

- **`@sentry/core`** holds all of it; `@sentry/browser`, `@sentry/node`, then
  `@sentry/react` and `@sentry/nestjs` add **integrations** for their runtime
- **Integrations** are what catch errors you never `capture`: global handlers,
  framework hooks, instrumented `fetch` and `http`

---

# `Sentry.init` — the options that matter

```ts
Sentry.init({
  dsn: env.SENTRY_DSN,              // where — no DSN: nothing is sent (but to Spotlight)
  environment: env.NODE_ENV,        // production · staging · development
  release: env.SENTRY_RELEASE,      // chapter 03

  sampleRate: 1,                    // share of ERROR events kept — almost always 1
  tracesSampleRate: 0.2,            // share of TRACES kept — chapter 04

  integrations: [/* add, configure, or remove the defaults */],
  ignoreErrors: [/ResizeObserver loop/],       // chapter 02
  beforeSend(event, hint) { return event; },   // last word on every error event

  dataCollection: { /* what personal data is collected — chapter 02 */ },
  debug: false,                     // the SDK logs what it does — in development
});
```

- **Once**, **as early as possible**, before the code it must watch
- **One** place that owns it: a function the app *and* the tests call

> **v11** removed `sendDefaultPii` and `enableLogs`. If you see them, the code was
> written for v10.
