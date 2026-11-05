---
layout: cover
---

# 06 - Operating Sentry

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Triage** the issue stream: assign, resolve, ignore — and route to owners
- **Alert** on what needs a human, not on everything
- **Connect** Sentry to the tools of the team: source control, chat, tickets
- **Keep** the bill under control
- **Review** a NestJS app's Sentry setup with a checklist

---
src: ../../sentry-common/slides/06_operate/triage.md
---

---
src: ../../sentry-common/slides/06_operate/alerts.md
---

---

# Alerts that matter for an API

| Alert | On | Why |
|---|---|---|
| New issue in `production` | Issue | A new kind of failure shipped |
| Regression | Issue | A resolved bug is back — with the release that brought it |
| `p95(span.duration)` of `GET /issues/:id` > 800 ms | Metric | Slow, not failing |
| `failure_rate()` > 2 % over 5 min | Metric | Many users, one cause or many |
| `nightly-purge` missed or failed | Cron monitor | Nobody is awake at 03:00 |

- Filter by **environment** and by **tag** (`api.version`, `tenant`): the tags of
  chapter 02 make alerts precise
- A metric alert on a span needs the trace to be **sampled**: a 1 % rate gives
  noisy percentiles on a low-traffic route

<style>
table { font-size: 0.85em; }
</style>

---
src: ../../sentry-common/slides/06_operate/integrations.md
---

---
src: ../../sentry-common/slides/06_operate/costs.md
---

---
src: ../../sentry-common/slides/06_operate/checklist.md
---

---

# The NestJS checklist

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Wiring

- [ ] `instrument.ts` loaded with `--import` (or `NODE_OPTIONS`) — everywhere:
  `start:prod`, the Dockerfile, the worker processes
- [ ] `SentryModule.forRoot()` first in `AppModule`
- [ ] `SentryGlobalFilter` **or** `@SentryExceptionCaptured()` on your catch-all
  filter — not both, not neither
- [ ] Errors outside requests (crons, consumers) captured or monitored
- [ ] `Sentry.close()` on `SIGTERM`

</div>
<div>

### Data and cost

- [ ] `release` and `environment` on every event
- [ ] Source maps uploaded by the CI, debug ids injected
- [ ] `dataCollection` reviewed: no request body, headers on an allowlist
- [ ] User = an id, set in a guard — never an email
- [ ] `tracesSampler` drops health checks, inherits the caller's decision
- [ ] Spotlight in development only

</div>
</div>

---
src: ../../sentry-common/slides/retro.md
---
