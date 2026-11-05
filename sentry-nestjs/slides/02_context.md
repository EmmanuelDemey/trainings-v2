---
layout: cover
---

# 02 - Context, grouping, filtering and PII

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Enrich** each request's events with its user and its business context
- **Group** errors by their cause with a fingerprint
- **Drop** the noise before it costs you quota
- **Choose** what personal data leaves the API — SDK v11 collects a lot by default

---
src: ../../sentry-common/slides/02_context/enrich.md
---

---

# Where to set the context in Nest

| Where | What | Example |
|---|---|---|
| A **guard** | Who: the user, the tenant | `Sentry.setUser({ id })` |
| An **interceptor** | What all routes share | `Sentry.setTag('api.version', 'v2')` |
| A **controller** | What this request is about | `Sentry.setTag('issue.id', id)` |
| A **service** | A business context | `Sentry.setContext('payment', { provider })` |

```ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  Sentry.setTag('issue.id', id);   // every event of this request
  return this.issues.findOne(id);
}
```

- All four run **inside** the request's isolation scope: no leak between users
- Tags are **indexed** — search, filter, alert on them; contexts are not: put
  the detail there

<style>
table { font-size: 0.85em; }
</style>

---
src: ../../sentry-common/slides/02_context/grouping.md
---

---

# Fingerprints from the error itself

```ts
Sentry.init({
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error instanceof DatabaseError) {
      event.fingerprint = ['database-error', error.code];   // ECONNRESET, ETIMEDOUT…
    }
    return event;
  },
});
```

- `hint.originalException`: the **thrown value** — its class, its fields — not
  just what the event serialised
- Here: one issue per **database failure mode**, whatever the route, the query
  or the message
- Leave the rest to Sentry: a fingerprint on everything breaks the grouping
  Sentry does better than you

---
src: ../../sentry-common/slides/02_context/filtering.md
---

---
src: ../../sentry-common/slides/02_context/pii.md
---

---

# `dataCollection` on an API

```ts
Sentry.init({
  dataCollection: {
    userInfo: false,          // no IP address, nothing guessed from the request
    cookies: false,
    httpBodies: [],           // no request or response body: passwords, tokens, PII
    httpHeaders: {
      request: { allow: ['content-type', 'user-agent', 'x-user-id'] },
      response: false,
    },
    // urlQueryParams: { deny: ['email'] },   databaseQueryData: false, …
  },
});
```

- An **allowlist** for headers: a header you add next year stays out
- Headers left out are still listed, value `[Filtered]` — the shape of the
  request survives, its secrets do not
- `authorization`, `cookie`, `x-api-key`, `token=` are filtered even with the
  defaults — **bodies are not**: `{"password":"hunter2"}` goes as is
- Server-side scrubbing in the project settings is the **second** net, not the first

---
layout: cover
---

# Workshop 02

## Context & filtering
