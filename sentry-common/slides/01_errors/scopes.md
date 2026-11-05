# Scopes — where the context lives

```ts
Sentry.setUser({ id: '42' });     // on the ISOLATION scope
Sentry.setTag('feature', 'list');
Sentry.captureException(err);     // the event receives the data of every scope, merged
```

| Scope | Lives for | In the browser | On a server |
|---|---|---|---|
| **Global** | The whole process | The page | The process — every request |
| **Isolation** | One unit of work | The page (same as global) | **One request**, forked automatically |
| **Current** | One block of code | A `withScope` callback, an active span | Same |

- `Sentry.setX` writes the **isolation** scope: on a server, it is **per
  request** — two concurrent users never see each other's tags
- `Sentry.withScope(scope => …)` forks the **current** scope for one block
- Merge order: global → isolation → current — the most specific wins

<style>
table { font-size: 0.85em; }
</style>

---

# `withScope` — context for one capture

```ts
try {
  await saveIssue(issue);
} catch (error) {
  Sentry.withScope((scope) => {
    scope.setTag('issue.id', String(issue.id));
    scope.setContext('issue', { id: issue.id, status: issue.status });
    scope.setLevel('warning');
    Sentry.captureException(error);
  });
}
```

- The tag and the context are on **this** event only — not on the next error
- Same thing, shorter — the second argument of `captureException`:

```ts
Sentry.captureException(error, {
  tags: { 'issue.id': String(issue.id) },
  contexts: { issue: { id: issue.id, status: issue.status } },
  level: 'warning',
});
```
