---
layout: cover
---

# 02 - Query configuration

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tune** freshness with `staleTime` and memory with `gcTime` — app-wide in
  `createQueryClient()`, and per query in `injectQuery`
- **Choose** the refetch triggers of a query — focus, reconnect, mount, interval
- **Retry** what is worth retrying, and only that
- **Show** something before the first answer: `placeholderData` vs `initialData`
- **Wait** for an `input()` with `enabled` or `skipToken`, and derive with `select`

---
src: ../../tanstack-query-common/slides/02_configuration/stale-gc.md
---

---

# Defaults, then overrides — the Angular places

```ts
// src/queryClient.ts — app-wide: provided once by provideTanStackQuery
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, gcTime: 5 * 60_000 } },
  });
}
```

```ts
// per query: spread the shared options, then override — in the options function
protected readonly openIssues = injectQuery(() => ({
  ...issuesQuery('open'),
  refetchOnWindowFocus: 'always',
}));
```

- The specs build their client with the **same** `createQueryClient()` — the
  defaults you choose are the defaults they test
- An option that changes with a signal (`refetchInterval: this.live() ? 5_000 : false`)
  is re-applied when the signal changes: the options function is a `computed`

---
src: ../../tanstack-query-common/slides/02_configuration/refetch-triggers.md
---

---

# Focus, reconnect — with or without zone.js

- `focusManager` listens to `visibilitychange` on `window`; `onlineManager` to
  `online` / `offline`. **Plain DOM listeners** in `query-core`: nothing to do
  with zone.js
- When a refetch lands, the adapter **sets a signal** — and in a zoneless app
  (Angular 22's default), a signal read by a template is what schedules change
  detection. Nothing else has to tell Angular
- The adapter also registers a **pending task** while a query fetches: the app
  is not "stable" until the data is there — what SSR waits for before
  serialising, and what `fixture.whenStable()` waits for in a test

```ts
// Tests and demos: simulate the user coming back to the tab
window.dispatchEvent(new Event('visibilitychange'));
// or drive it directly
focusManager.setFocused(true);
```

---
src: ../../tanstack-query-common/slides/02_configuration/retry.md
---

---
src: ../../tanstack-query-common/slides/02_configuration/initial-placeholder.md
---

---

# Placeholder from the cache — in a component

```ts
export class IssueDetail {
  readonly issueId = input<number>();
  private readonly queryClient = inject(QueryClient);

  protected readonly detail = injectQuery(() => {
    const id = this.issueId();
    return {
      ...issueDetailQuery(id),
      // never written to the cache: the query still fetches the real issue
      placeholderData: () => (id === undefined ? undefined : issueSummaryFromLists(this.queryClient, id)),
    };
  });
}
```

```html
@if (detail.data(); as issue) {
  <h2>{{ issue.title }}</h2>
  @if (detail.isPlaceholderData()) { <p>Loading the description…</p> }
  @else { <p>{{ issue.description }}</p> }
}
```

- `inject(QueryClient)` in a field: the same client `provideTanStackQuery` gave the app

---
src: ../../tanstack-query-common/slides/02_configuration/enabled-select.md
---

---

# Waiting for an `input()`

```ts
export function issueDetailQuery(id: number | undefined) {
  return queryOptions({
    queryKey: issueKeys.detail(id),
    // no id → no query function → the query is disabled, and `id` is a number below
    queryFn: id === undefined ? skipToken : () => fetchIssue(id),
  });
}
```

```ts
readonly issueId = input<number>();            // undefined until the parent selects one
protected readonly detail = injectQuery(() => issueDetailQuery(this.issueId()));
```

- The `input()` is a signal: read in the options function, it **enables** the
  query the moment the parent binds a value — no `ngOnChanges`
- `select` vs `computed()`: both derive. `select` lives **in the options** (shared
  through `queryOptions`, memoised by the observer); `computed(() => q.data()?.length)`
  lives in the component. Prefer `select` for a derivation every user of the key needs

---

## Workshop 02 — Query configuration
