# The day

| Time | Chapter | Hands-on |
|---|---|---|
| 09:00 | **00** — Introduction · the Sentry platform · Spotlight | — |
| 09:20 | **01** — Capturing errors | Workshop 01 — First errors (40 min) |
| 10:30 | *break* | |
| 10:45 | **02** — Context, grouping, filtering and PII | Workshop 02 — Context & filtering (40 min) |
| 11:55 | **03** — Releases and source maps | Workshop 03 — Readable stack traces (25 min) |
| 12:30 | *lunch* | |
| 13:45 | **04** — Tracing and performance | Workshop 04 — Tracing (40 min) |
| 15:05 | *break* | |
| 15:20 | **05** — Beyond errors | Workshop 05 (35 min) |
| 16:30 | **06** — Operating Sentry · retro | — |

<style>
table { font-size: 0.8em; }
td, th { padding-top: 0.25em !important; padding-bottom: 0.25em !important; }
</style>

---

# Programme

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Errors

- **Capturing errors** — what the SDK catches on its own, what you must send
- **Context** — user, tags, contexts, breadcrumbs, scopes
- **Grouping** — fingerprints: one bug, one issue
- **Filtering and PII** — what never leaves the app

### Shipping

- **Releases** — which version broke, which commit is suspect
- **Source maps** — stack traces that point to *your* code

</div>
<div>

### Performance

- **Tracing** — spans, sampling, distributed traces from browser to API
- **Custom spans** — measure what matters to your product

### Beyond errors

- React: **Session Replay**, **User Feedback**
- NestJS: **Cron monitors**, **Logs**

### Operating it

- **Triage, alerts, integrations, quotas** — a tool the team actually reads

</div>
</div>

---

# Objectives of the day

At the end of the day, you will be able to:

- **Install** the Sentry SDK of your platform the right way — first, once,
  with a configuration you own
- **Capture** the errors your framework swallows, and **ignore** the noise
- **Enrich** every event with who, where and what — without leaking personal data
- **Group** errors so that one bug is one issue, and **release** your code so that
  each issue points to a version and a line of *your* source
- **Trace** a request across services, **sample** it, and add spans of your own
- **Operate** Sentry: triage, alerts, integrations, and a bill under control

---

# Prerequisites

- **JavaScript / TypeScript**: promises, `async`/`await`, modules, decorators or
  JSX depending on your track
- **Your framework**: components and hooks (React), or modules, controllers,
  providers and filters (NestJS)
- **HTTP**: status codes, headers, what a reverse proxy does
- A **laptop** with **Node.js 24** and a recent Chrome or Firefox
- *Optional*: a free **sentry.io** account — nothing in the workshops requires it

<br />

> This training targets the **Sentry JavaScript SDK 11**. Where v11 changed
> something from v10 (`sendDefaultPii` → `dataCollection`, `enableLogs` removed,
> span streaming…), the slide says so: you will meet v10 code in the wild.

---

# How the day runs — and how it is evaluated

<div style="display: flex; gap: 2em;">
<div>

### Teaching methods

- Short **theory** blocks, code-first, always with the *why*
- **Five hands-on workshops**: about **half the day**
- Live demos in **Spotlight** and in a real Sentry project
- Field experience from the trainer: what a noisy Sentry costs a team
- Digital course materials: slides, workshops, solutions

</div>
<div>

### Evaluation

- **Before** — a self-assessment questionnaire, to calibrate the day
- **During** — the workshops: their given specs go from **red to green**
- **After** — a **final questionnaire** mirroring the self-assessment, to
  measure the progress

</div>
</div>
