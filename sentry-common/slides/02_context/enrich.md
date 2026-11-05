# Who, where, what: enriching events

```ts
Sentry.setUser({ id: user.id });                 // who — the id, not the email
Sentry.setTag('tenant', user.tenantSlug);        // where — searchable, indexed
Sentry.setContext('cart', { items: 3, total: 120.5 });  // what — free-form, NOT searchable
Sentry.addBreadcrumb({ category: 'ui.filter', message: 'status=closed', level: 'info' });
```

| | Searchable | Shown | Use it for |
|---|---|---|---|
| **user** | `user.id:42` | Users affected, per issue | Impact — how many people does this bug hit? |
| **tags** | `tenant:acme` | Tag distribution, per issue | Low-cardinality dimensions: tenant, feature, plan, route |
| **contexts** | ✗ | The event page | Structured detail: the object you were working on |
| **breadcrumbs** | ✗ | A timeline before the error | The steps that led there |

- Tags: **strings**, key ≤ 32 chars, value ≤ 200 chars, **low cardinality** — a
  tag per user id is a context, not a tag
- Breadcrumbs: the SDK already records **clicks, navigations, `fetch`/XHR,
  `console`** — add the **domain** steps it cannot know

<style>
table { font-size: 0.85em; }
</style>

---

# Where to set it — once, not everywhere

<div style="display: flex; gap: 2em;">
<div>

### Context of the session

- **On login** → `setUser({ id })`
- **On logout** → `setUser(null)` — or the next user inherits it
- A **tenant**, a **feature flag** → `setTag` where it is known

### Context of one operation

- `withScope` / the second argument of `captureException`
- An **active span** (chapter 04): its attributes describe the operation

</div>
<div>

### Context for *every* event

```ts
Sentry.init({
  initialScope: { tags: { 'app.region': 'eu-west' } },
  // or: an event processor — runs for every event
});

Sentry.addEventProcessor((event) => {
  event.tags = { ...event.tags, 'build.channel': BUILD_CHANNEL };
  return event;
});
```

</div>
</div>
