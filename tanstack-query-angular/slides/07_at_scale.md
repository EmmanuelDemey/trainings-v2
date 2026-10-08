---
layout: cover
---

# 07 - TanStack Query in a large application

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Organise** queries as Angular services that expose `queryOptions` factories
- **Build** the `QueryClient` inside DI, so its global handlers can use your services
- **Prefetch** in the router: resolvers, guards and `ensureQueryData`
- **Replace** Suspense with what Angular has: `@defer`, `@if`, and the router
- **Know** what exists beyond the day: persistence, SSR, offline

---
src: ../../tanstack-query-common/slides/07_at_scale/organization.md
---

---

# The Angular resource module — a service of `queryOptions`

```ts
@Injectable({ providedIn: 'root' })
export class IssueQueries {
  private readonly http = inject(HttpClient);

  list(filter: IssueFilter) {
    return queryOptions({
      queryKey: issueKeys.list(filter),
      queryFn: () => lastValueFrom(this.http.get<IssueSummary[]>('/api/issues', { params: { status: filter } })),
    });
  }

  detail(id: number) {
    return queryOptions({ queryKey: issueKeys.detail(id), queryFn: () => lastValueFrom(this.http.get<Issue>(`/api/issues/${id}`)) });
  }
}
```

```ts
export class IssueList {
  private readonly queries = inject(IssueQueries);
  protected readonly issues = injectQuery(() => this.queries.list(this.filter()));
}
```

- The query functions get **DI** (`HttpClient`, interceptors, tokens); the
  components keep one line per query; a test replaces the service — or what it injects
- Keys stay plain constants (`issueKeys`): invalidation needs no injection
- Mutations: `injectXxx()` functions next to it (`issue-mutations.ts`)

---
src: ../../tanstack-query-common/slides/07_at_scale/defaults-errors.md
---

---

# A client built inside DI

`provideTanStackQuery` also accepts an **`InjectionToken<QueryClient>`**:

```ts
export const QUERY_CLIENT = new InjectionToken<QueryClient>('QUERY_CLIENT', {
  factory: () => {
    const toasts = inject(Toasts);               // any service of the app
    return new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000 } },
      queryCache: new QueryCache({
        onError: (error, query) => { if (query.state.data !== undefined) toasts.show(error.message); },
      }),
      mutationCache: new MutationCache({ onError: (error) => toasts.show(error.message) }),
    });
  },
});

export const appConfig: ApplicationConfig = {
  providers: [provideTanStackQuery(QUERY_CLIENT, withDevtools())],
};
```

- `new QueryClient()` in `app.config.ts` runs **outside** any injection context;
  the token's factory runs inside one
- `throwOnError: true` sends the error to Angular's `ErrorHandler` — there is no
  error boundary component in Angular

---
src: ../../tanstack-query-common/slides/07_at_scale/prefetching.md
---

---

# Prefetching in the router

```ts
// A resolver: navigation waits for the data — which is then in the cache
export const issueResolver: ResolveFn<Issue> = (route) =>
  inject(QueryClient).ensureQueryData(inject(IssueQueries).detail(Number(route.paramMap.get('id'))));

// A guard that does not wait: start the request, let the page show its own loading
export const prefetchIssues: CanActivateFn = () => {
  void inject(QueryClient).prefetchQuery(inject(IssueQueries).list('open'));
  return true;
};

export const routes: Routes = [
  { path: 'issues', component: IssuePage, canActivate: [prefetchIssues] },
  { path: 'issues/:id', component: IssueDetailPage, resolve: { issue: issueResolver } },
];
```

- `ensureQueryData` returns the cached data if there is some, fetches otherwise —
  and the component still uses `injectQuery` on the same options (it stays in
  sync, refetches, invalidates)
- Route functions run in an **injection context**: `inject()` just works there
- In `query-core` 5.104, `ensureQueryData` and `prefetchQuery` are deprecated:
  `queryClient.query({ ...options, staleTime: 'static' })` and
  `queryClient.query(options).catch(noop)` replace them — same behaviour

---

# No Suspense in Angular — what replaces it

- `injectQuery` never suspends: the template reads `isPending()` and decides —
  an `@if` per section, so each loads at its own pace
- **`@defer`** splits the code of a heavy section and loads it on a trigger
  (`on viewport`, `on interaction`, `on idle`), with `@placeholder` and `@loading`:
  combine it with a prefetch on the same trigger

```html
@defer (on viewport) {
  <app-activity-feed />          <!-- its injectInfiniteQuery starts when it is created -->
} @placeholder {
  <p>Activity</p>
}
```

- The router waits when you **want** it to (a resolver + `ensureQueryData`),
  and only then — the data-first navigation Suspense gives React

---
src: ../../tanstack-query-common/slides/07_at_scale/beyond.md
---

---

# Beyond, in Angular

- **Persistence** — `@tanstack/angular-query-persist-client`:
  `provideTanStackQuery(client, withPersistQueryClient(…))`, the second feature
  `provideTanStackQuery` accepts next to `withDevtools`
- **SSR** — the adapter registers a pending task while a query fetches, so Angular
  SSR waits for the data before it serialises the page. The cache itself is not
  transferred for you: `dehydrate` on the server, Angular's `TransferState`, then
  `hydrate` on the client — or accept one refetch at boot
- **RxJS interop** — a query is signals: `toObservable(this.issues.data)` for a
  stream (in an injection context), and `lastValueFrom` / `firstValueFrom` to turn an
  Observable into the Promise a query function returns
- **`resource()` / `httpResource()`** — Angular's own async primitives fetch
  and expose signals, but have no shared cache, deduplication,
  invalidation or mutations: they fit a component-local read, not server state
