# Why an error monitoring tool?

<div style="display: flex; gap: 2em;">
<div>

### What you have without it

- **Logs** — on a server you can reach; never in your users' browsers
- **Users** — who report one bug in a hundred, as *"it doesn't work"*
- **Metrics** — that say *that* the error rate rose, not *which* error, *where*,
  *for whom*

</div>
<div>

### What Sentry adds

- Every error, **from every runtime**: browser, server, mobile, jobs
- **Grouped** into issues, **counted**, with the users affected
- The **stack trace**, the **context** and the **steps** that led there
- Linked to the **release** and the **commit** that introduced it
- **Traces**: the slow part, not just the broken part

</div>
</div>

<br />

> Observability is three questions: **is it broken** (errors), **is it slow**
> (traces), **what happened** (logs, replays). Sentry answers all three from the
> developer's side — the code, not the infrastructure.

---

# The Sentry platform

| Product | What it captures | Today |
|---|---|---|
| **Issues** (errors) | Exceptions and messages, grouped | Chapters 01 – 03 |
| **Tracing** | Spans of requests, renders, queries — across services | Chapter 04 |
| **Session Replay** | A DOM recording of the user's session | Chapter 05 — React |
| **User Feedback** | What the user says, tied to the error | Chapter 05 — React |
| **Crons** | Scheduled jobs: missed, late, failed | Chapter 05 — NestJS |
| **Logs** | Structured logs, attached to the trace | Chapter 05 |
| **Profiling** | Where the CPU time goes, function by function | Chapter 04 — mentioned |
| **Uptime**, **Metrics**, **Seer** (AI) | Probes, counters, root-cause suggestions | Chapter 06 — mentioned |

<style>
table { font-size: 0.85em; }
</style>

---

# SaaS or self-hosted?

<div style="display: flex; gap: 2em;">
<div>

### sentry.io

- Hosted by Sentry, **US or EU** data region — chosen at sign-up, not later
- A free **Developer** plan: one user, a monthly quota of errors, spans,
  replays — enough to try everything today
- Billed by **volume**: what you send is what you pay (chapter 06)

</div>
<div>

### Self-hosted

- The same product, source-available (FSL licence), run with **Docker Compose**
- Your data never leaves your network
- You run Kafka, ClickHouse, Postgres, Redis, Snuba… — **a platform**, not a
  container
- Some features arrive later or never (Seer, some integrations)

</div>
</div>

<br />

> The SDKs do not care: a **DSN** tells them where to send. Everything in this
> training works with both.

---

# Organisations, projects, DSN

```text
Organisation  acme
├── Team      web
│   └── Project issue-tracker-web  (platform: React)    DSN #1
└── Team      platform
    └── Project issue-tracker-api  (platform: NestJS)   DSN #2
```

- **One project per deployable**: the web app and the API are two projects —
  their errors, releases and alerts are not the same
- **Environments** (`production`, `staging`, `development`) are an attribute of
  the events of one project, not separate projects

```text
https://<public key>@o123456.ingest.de.sentry.io/<project id>
```

- The **DSN is not a secret**: it ships in every browser bundle. It only lets
  you *send* events — never read them. Abuse is handled by **rate limits** and
  **allowed domains**, not by hiding it
