# Spotlight — Sentry on your machine

```bash
npx @spotlightjs/spotlight      # the sidecar and its UI: http://localhost:8969
```

<div style="display: flex; gap: 2em;">
<div>

- **Sentry for development**: the SDK sends a copy of every envelope to a local
  **sidecar**, which shows errors, traces and logs in a web UI
- **No account, no DSN, no quota**: the SDK sets up its Spotlight integration
  even without a DSN
- Seconds, not minutes: no ingestion pipeline, no sampling
- **Never in production** — enable it from the environment, in development only

</div>
<div>

```ts
Sentry.init({
  dsn: env.SENTRY_DSN,          // may be empty in development
  environment: env.MODE,
  // the SDK of your platform turns Spotlight on — see the next slide
});
```

</div>
</div>

<br />

> Today: **Spotlight** to see what your code sends, the **specs** to check it, and
> — if you have one — a **real project** for what only Sentry's servers do:
> grouping, source maps, alerts.
