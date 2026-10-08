---
layout: cover
---

# 08 - Internals and performance

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Draw** what happens between `injectQuery` and the `QueryCache`
- **Explain** how the adapter turns an observer into signals, and why that fits
  zoneless Angular
- **Find** the knobs that cost or save the most: keys, `staleTime`, `select`,
  invalidation scope
- **Check** an Angular app against a production checklist

---
src: ../../tanstack-query-common/slides/08_internals_performance/architecture.md
---

---

# Inside `injectQuery`

```ts
// simplified from @tanstack/angular-query-experimental 5.104 — create-base-query.ts
const queryClient = inject(QueryClient);
const options = computed(() => queryClient.defaultQueryOptions(optionsFn()));   // your function
const observer = new QueryObserver(queryClient, options());                       // once

effect(() => observer.setOptions(options()));        // a signal changed → new key, new options

effect((onCleanup) => {
  const unsubscribe = ngZone.runOutsideAngular(() =>
    observer.subscribe((state) => ngZone.run(() => result.set(state))),           // one signal write per notification
  );
  onCleanup(unsubscribe);                            // the component is destroyed → unsubscribe
});

return signalProxy(computed(() => result() ?? observer.getOptimisticResult(options())));
```

- `signalProxy`: `query.data`, `query.isPending`… are `computed` slices of one
  result signal — a template re-renders only for the slices it reads
- A **pending task** is held while `fetchStatus === 'fetching'`: SSR and
  `whenStable()` wait for the data
- In a zoneless app `NgZone` is the no-op zone — `run()` just calls the function:
  the signal write alone schedules change detection

---
src: ../../tanstack-query-common/slides/08_internals_performance/query-lifecycle.md
---

---
src: ../../tanstack-query-common/slides/08_internals_performance/performance.md
---

---

# Performance — the Angular side

- **Zoneless + signals**: nothing re-renders on a timer or a request that
  ended — only the components whose template reads a slice that changed
- **Structural sharing** keeps `data()` the **same reference** when a refetch
  brings equal JSON: `computed`s and `@for … track` downstream do nothing
- `track issue.id`, never `track $index`, on lists that refetch: rows are kept,
  not re-created
- `select` over a `computed` when many components need the same derivation:
  computed once per observer, compared, and the signal only changes when the
  result does
- An options function should be **cheap and pure**: it re-runs whenever a signal
  it reads changes — read the signals you need, and only those

---
src: ../../tanstack-query-common/slides/08_internals_performance/checklist.md
---

---

# Checklist — the Angular extras

- [ ] `@tanstack/angular-query-experimental` **pinned exactly**, upgraded on purpose
- [ ] One client, from `provideTanStackQuery` — in a token factory if its global
      handlers need services
- [ ] `withDevtools()` from `…/devtools` (stubbed in production), or
      `…/devtools/production` behind a flag
- [ ] Every `inject*` call in an injection context — or given an `injector`
- [ ] Query options in services or factory files; components hold one line per query
- [ ] Specs render with a **fresh** client (`retry: false`), and mock through DI
- [ ] No `subscribe()` in a component to read server state: the result is signals

---
src: ../../tanstack-query-common/slides/retro.md
---
