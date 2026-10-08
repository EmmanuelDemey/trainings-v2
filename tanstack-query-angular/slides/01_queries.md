---
layout: cover
---

# 01 - Queries and query keys

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** server state from client state, and say why a signal in a service is
  the wrong home for the first one
- **Read** data with `injectQuery`, a **key factory** and `queryOptions`
- **Make a key follow a signal**, by reading it inside the options function
- **Call** `inject*` functions where Angular allows it — and know what to do
  everywhere else
- **Tell** fetching from loading: `isPending()` vs `isFetching()` in a template

---
src: ../../tanstack-query-common/slides/01_queries/server-state.md
---

---

# The starter, in Angular — fetching by hand

```ts
export class IssueList implements OnInit {
  protected readonly filter = signal<IssueFilter>('open');
  protected readonly issues = signal<IssueSummary[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<Error | null>(null);

  ngOnInit(): void { void this.load(); }

  protected select(filter: IssueFilter): void { this.filter.set(filter); void this.load(); }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.issues.set(await fetchIssues(this.filter()));   // the LAST answer wins
    } catch (error) { this.error.set(error as Error); }
    finally { this.loading.set(false); }
  }
}
```

- Signals make it **reactive**, not **correct**: no cache, no deduplication, a
  race on every fast click — and the header's counter does it all again
- A `BehaviorSubject` in a service, or an NgRx store, moves the same problems
  one floor up

---
src: ../../tanstack-query-common/slides/01_queries/query-keys.md
---

---
src: ../../tanstack-query-common/slides/01_queries/query-function.md
---

---

# `injectQuery` — the Angular adapter

```ts
import { injectQuery } from '@tanstack/angular-query-experimental';

@Component({
  selector: 'app-open-count',
  template: `
    <span data-testid="open-count">
      @if (openIssues.data(); as issues) { {{ issues.length }} open } @else { … open }
    </span>
  `,
})
export class OpenCount {
  protected readonly openIssues = injectQuery(() => issuesQuery('open'));
}
```

- Takes a **function** returning the options — never the options themselves
- Returns an object of **signals**: `data()`, `error()`, `status()`,
  `isPending()`, `isFetching()`, `isError()`, `isSuccess()`… plus `refetch()`
- The observer lives as long as the component: created with it, unsubscribed
  when it is destroyed

---

# Signals in — a key that follows the filter

```ts
export class IssueList {
  protected readonly filter = signal<IssueFilter>('open');

  // ✅ `this.filter()` is read INSIDE the function: it runs in a `computed`,
  //    so the options — and the key — follow the signal
  protected readonly issues = injectQuery(() => issuesQuery(this.filter()));
}
```

```ts
// ❌ read once, at construction: the key never changes again
const filter = this.filter();
protected readonly issues = injectQuery(() => issuesQuery(filter));
```

- Any signal works: a `signal()`, an `input()`, a `computed()`, a route param
  turned into a signal (`withComponentInputBinding()` + `input()`)
- A new key is a **new cache entry**: switching back to a filter you already
  loaded shows it at once (and, if stale, refetches it behind the data)
- No `effect()`, no `switchMap`, no unsubscription: the race of the starter is
  gone — an answer for an old key lands in the old key's entry

---

# Signals out — reading the result

```ts
protected readonly issues = injectQuery(() => issuesQuery(this.filter()));
```

```html
@if (issues.isPending()) {
  <p data-testid="list-loading">Loading…</p>
} @else if (issues.isError()) {
  <p data-testid="list-error">{{ issues.error().message }}</p>   <!-- narrowed: Error -->
} @else {
  @for (issue of issues.data(); track issue.id) { … }
}
```

- Each field is its **own signal**: a template that only reads `data()` is not
  checked again when `isFetching()` flips
- In TypeScript, use them like any signal: `computed(() => this.issues.data()?.length ?? 0)`
- Narrowing works on `isError()` → `error()`; for `data()`, the reliable form is
  `@if (query.data(); as data) { … }`

---

# The injection context

`injectQuery`, `injectMutation`… call `inject()` inside: they need an
**injection context**.

```ts
export class IssueList {
  private readonly queries = inject(IssueQueries);
  protected readonly issues = injectQuery(() => this.queries.list(this.filter())); // ✅ field initializer
  constructor() { /* ✅ here too */ }

  ngOnInit() { injectQuery(() => …); }   // ❌ NG0203: inject() must be called from an injection context
}
```

```ts
// Anywhere else: hand it an injector — or run in its context
private readonly injector = inject(Injector);

load() {
  return injectQuery(() => issuesQuery('open'), { injector: this.injector });
  // or: runInInjectionContext(this.injector, () => injectQuery(…))
}
```

- **Your own** `injectXxx()` functions inherit the rule — and the benefit:
  `injectCreateIssue()` is just a function that calls `inject` and `injectMutation`

---

# `HttpClient` or `fetch` in the query function

The query function must return a **Promise**. `HttpClient` returns an Observable:

```ts
@Injectable({ providedIn: 'root' })
export class IssueQueries {
  private readonly http = inject(HttpClient);

  list(filter: IssueFilter) {
    return queryOptions({
      queryKey: issueKeys.list(filter),
      queryFn: ({ signal }) =>
        lastValueFrom(
          this.http
            .get<IssueSummary[]>('/api/issues', { params: { status: filter } })
            // unsubscribing aborts the request: cancellation for free
            .pipe(takeUntil(fromEvent(signal, 'abort'))),
        ),
    });
  }
}
```

- `lastValueFrom`: an HTTP observable emits once then completes — no data loss
- With `HttpClient`, the **interceptors** (auth, base URL, errors) still apply
- `fetch` works too — the workshops call a fake API that returns Promises

---
src: ../../tanstack-query-common/slides/01_queries/statuses.md
---

---

# Several queries at once — `injectQueries`

```ts
import { injectQueries } from '@tanstack/angular-query-experimental/inject-queries-experimental';

export class IssueCompare {
  readonly ids = input.required<number[]>();

  // Signal<CreateQueryResult[]>: one result per id, in order
  protected readonly issues = injectQueries(() => ({
    queries: this.ids().map((id) => issueDetailQuery(id)),
  }));
}
```

```html
@for (issue of issues(); track $index) {
  @if (issue.data(); as data) { <li>{{ data.title }}</li> } @else { <li>Loading…</li> }
}
```

- A **dynamic** number of queries — `injectQuery` in a `@for` is impossible
- Returns **one** signal (`issues()`) holding an array of results, each made of signals
- Note the entry point: experimental **inside** the experimental package — its
  `combine` option works, but in 5.104 its types still describe signals where the
  function receives plain results

---

## Workshop 01 — First queries
