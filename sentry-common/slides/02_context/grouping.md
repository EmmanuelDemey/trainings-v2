# Grouping — one bug, one issue

The default fingerprint is `{{ default }}`: **the stack trace** (in-app frames
first), else the exception **type and message**, else the message.

<div style="display: flex; gap: 2em;">
<div>

### Too many issues

- The message carries **a variable**: `Order 4512 not found`,
  `Order 4513 not found`… — one issue per id
- Code without source maps changes at **every deploy**: new file names, new
  frames — new issues (chapter 03)

</div>
<div>

### Too few issues

- One helper (`apiClient.request`) throws for every route: **one stack**, the
  route is only in the message
- One generic handler (`handleError`) captures every error **from the same
  place** — different bugs, same stack

</div>
</div>

<br />

> Fix the **message** first: put the variable in a **tag** or a **context**, keep
> the message constant (`Order not found`). Change the fingerprint when the
> stack cannot tell bugs apart — or tells apart what is one bug.

---

# Fingerprints

```ts
// For one capture
Sentry.captureException(error, {
  fingerprint: ['api-error', 'GET', '/issues/:id', String(error.status)],
});

// For a family of errors, wherever they come from
Sentry.init({
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error instanceof DatabaseError) {
      event.fingerprint = ['database-error', error.code];
    }
    return event;
  },
});
```

- `'{{ default }}'` **extends** the default: `['{{ default }}', tenant]` — one issue
  per bug *and* per tenant
- Without it, the fingerprint **replaces** grouping entirely — be sure the parts
  identify the bug
- A **route template** (`/issues/:id`), never the URL (`/issues/13`)
- Server side, without code: **fingerprint rules** and **stack trace rules** in the
  project settings — and **Merge** in the UI, after the fact
