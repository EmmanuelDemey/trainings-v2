# Tracing — not *what* broke, *where the time went*

```text
trace 0123…cdef ─────────────────────────────────────────────────────  1 240 ms
├─ pageload /issues                         browser   ████████████████  1 240 ms
│  ├─ ui.action  issue.open                 browser      ███████████      890 ms
│  │  ├─ http.client GET /issues/7          browser      ██████████       850 ms
│  │  │  └─ http.server GET /issues/:id     API           █████████       810 ms
│  │  │     ├─ db.query issues.findOne      API           ███████         640 ms   ← there
│  │  │     └─ function issues.score        API                  ██       120 ms
│  │  └─ ui.render IssueDetail              browser                 █      30 ms
```

- A **trace**: one operation, end to end, across services — a **trace id**
- A **span**: one timed unit of work in it — a name, an **op**, a start and an
  end, a **status**, **attributes**, a **parent**
- The **segment** (root span of a service — v10 called it a *transaction*): the
  page load, the HTTP request, the job
- Errors captured during a span carry its **trace id**: from the issue to the
  trace, and back

---

# Spans in SDK v11 — streamed

> **v11 streams spans by default** (`traceLifecycle: 'stream'`): each span is
> sent when it **finishes**, in `span` envelope items — no more `transaction`
> event holding every child.

| v10 (`SpanJSON`, transaction) | v11 (`StreamedSpanJSON`) |
|---|---|
| `description` | `name` |
| `op` | `attributes['sentry.op']` |
| `data` | `attributes` |
| `timestamp` | `end_timestamp` |
| `status`: `'internal_error'`, `'not_found'`… | `status`: `'ok'` or `'error'` |

- `beforeSendSpan(span)` receives the **streamed** format, once per span
- `ignoreTransactions` and `beforeSendTransaction` only work with
  `traceLifecycle: 'static'` → use **`ignoreSpans`**
- `traceLifecycle: 'static'` keeps the v10 model — for compatibility only

<style>
table { font-size: 0.85em; }
</style>
