# Custom spans — measure what matters to *you*

```ts
const issue = await Sentry.startSpan(
  { name: 'issue.open', op: 'ui.action', attributes: { 'issue.id': id } },
  async (span) => {
    const issue = await fetchIssue(id);           // child span: http.client
    span.setAttribute('issue.status', issue.status);
    return issue;
  },
);
```

- `startSpan(options, callback)`: the span is **active** in the callback — every
  span started inside (instrumented `fetch`, DB calls…) is its **child**; it
  **ends** when the callback returns or its promise settles
- A thrown error sets the status to **`error`** — and the error is linked to it
- `startSpanManual` — you call `span.end()`; `startInactiveSpan` — not active, no
  children

---

# Naming spans

<div style="display: flex; gap: 2em;">
<div>

### `name` — what, low cardinality

- `issue.open`, `GET /issues/:id`, `checkout.submit`
- **Never** an id in the name: `issue.open 7` makes every span unique — no
  aggregation, no percentiles

### `op` — the kind of work

- `http.client`, `http.server`, `db.query`, `ui.action`, `function`, `queue.process`
- Drives the **icons**, the **breakdowns**, the **performance views**

</div>
<div>

### `attributes` — the detail

- `issue.id`, `cart.items`, `db.rows` — searchable in **Trace Explorer**
- Semantic conventions where they exist: `http.request.method`, `url.path`,
  `db.system.name`

### What *not* to span

- A function called 10 000 times per request — a span costs; **profiling** finds
  hot functions instead
- What is already instrumented: `fetch`, `http`, the router, the DB driver

</div>
</div>
