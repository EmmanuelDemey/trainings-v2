---
layout: cover
---

# 03 - Paginated and infinite queries

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Paginate** with the page in the key, a `signal` for the page, and
  `keepPreviousData` to keep the screen still
- **Prefetch** the next page from an `effect()`, and say why there
- **Load** a feed page by page with `injectInfiniteQuery`
- **Render** the pages of an infinite query with nested `@for`, and stop at the end
- **Tell** fetching from loading once more: `isPlaceholderData()`,
  `isFetchingNextPage()`

---
src: ../../tanstack-query-common/slides/03_pagination_infinite/paginated.md
---

---

# A paginated table, in Angular

```ts
export class IssueTable {
  private readonly queryClient = inject(QueryClient);
  protected readonly page = signal(1);

  protected readonly issues = injectQuery(() => ({
    ...issuePageQuery(this.page()),
    placeholderData: keepPreviousData,      // the last page stays until the new one lands
  }));

  constructor() {
    // Runs whenever the data on screen changes: prefetch the page after it
    effect(() => {
      const current = this.issues.data();
      if (!current || this.issues.isPlaceholderData() || current.page >= current.totalPages) return;
      void this.queryClient.prefetchQuery(issuePageQuery(current.page + 1));
    });
  }
}
```

```html
<table [class.dimmed]="issues.isPlaceholderData()"> … </table>
<button [disabled]="issues.isPlaceholderData() || current.page >= current.totalPages"
        (click)="page.set(page() + 1)">Next →</button>
```

- `effect()` and not the click handler: the **data** decides — first load, back
  button, a page reached any other way all prefetch the same
- `prefetchQuery` is deprecated in `query-core` 5.104 (struck through in the
  editor): `queryClient.query(options).catch(noop)` is its new name

---
src: ../../tanstack-query-common/slides/03_pagination_infinite/infinite.md
---

---

# `injectInfiniteQuery`

```ts
export function activityFeedQuery() {
  return infiniteQueryOptions({
    queryKey: activityKeys.feed(),
    queryFn: ({ pageParam }) => fetchActivity(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export class ActivityFeed {
  protected readonly feed = injectInfiniteQuery(() => activityFeedQuery());
}
```

```html
@for (page of feed.data()?.pages; track $index) {
  @for (event of page.items; track event.id) { <li>{{ event.message }}</li> }
}
@if (feed.isFetchingNextPage()) { <p>Loading more…</p> }
@if (feed.hasNextPage()) {
  <button [disabled]="feed.isFetchingNextPage()" (click)="feed.fetchNextPage()">Load more</button>
}
```

- `infiniteQueryOptions` types `pageParam` from `initialPageParam` — a number here
- `hasNextPage()` is `false` once `getNextPageParam` returns `undefined`: the button goes

---

# Infinite scroll — a small directive

```ts
@Directive({ selector: '[appInView]' })
export class InView {
  readonly appInView = output<void>();

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) this.appInView.emit();
    });
    observer.observe(element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
```

```html
@if (feed.hasNextPage()) {
  <div (appInView)="feed.isFetchingNextPage() || feed.fetchNextPage()"></div>
}
```

- The query does not care **who** calls `fetchNextPage()`: a button, a sentinel,
  a keyboard shortcut
- Keep a button anyway: keyboard and screen-reader users need something to press

---

## Workshop 03 — Paginated and infinite queries
