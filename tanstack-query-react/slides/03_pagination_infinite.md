---
layout: cover
---

# 03 - Paginated and infinite queries

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Paginate** with the page in the key, without emptying the screen at every
  click — `keepPreviousData` and `isPlaceholderData`
- **Prefetch** the next page from a component, at the right moment
- **Build** an infinite feed with `useInfiniteQuery` and `infiniteQueryOptions`
- **Choose** between "load more" and infinite scroll, and wire either in React

---
src: ../../tanstack-query-common/slides/03_pagination_infinite/paginated.md
---

---

# A paginated table, in React

```tsx {all|2|4-7|10-14}
function IssueTable() {
  const [page, setPage] = useState(1);            // client state: which page
  const queryClient = useQueryClient();
  const { data, isPending, isPlaceholderData } = useQuery({
    ...issuePageQuery(page),                      // server state: the page itself
    placeholderData: keepPreviousData,
  });
  const hasNext = page < (data?.totalPages ?? 1);

  useEffect(() => {
    // Once a page is REALLY on screen, warm the cache for the next one
    if (!isPlaceholderData && hasNext) void queryClient.prefetchQuery(issuePageQuery(page + 1));
  }, [queryClient, page, hasNext, isPlaceholderData]);

  return (/* … */ <button disabled={isPlaceholderData || !hasNext} onClick={() => setPage((p) => p + 1)}>Next</button>);
}
```

- The page number lives in React state — or better, in the **URL**
  (`useSearchParams`): shareable, and the back button works
- An **effect** is fine here: it synchronises the cache with what is on screen,
  and `prefetchQuery` is idempotent (`<StrictMode>`'s double run costs nothing)
- `usePrefetchQuery(options)` does the same during render — no effect, but no
  condition on `isPlaceholderData` either

---
src: ../../tanstack-query-common/slides/03_pagination_infinite/infinite.md
---

---

# `useInfiniteQuery`

```ts
export const activityFeedQuery = infiniteQueryOptions({
  queryKey: activityKeys.feed(),
  queryFn: ({ pageParam }) => fetchActivity(pageParam),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
```

```tsx
function ActivityFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(activityFeedQuery);

  return (
    <>
      <ul>
        {data?.pages.flatMap((page) => page.items).map((event) => <li key={event.id}>{event.message}</li>)}
      </ul>
      {hasNextPage && (
        <button disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>Load more</button>
      )}
    </>
  );
}
```

- `infiniteQueryOptions` types `pageParam` from `initialPageParam`, and `data`
  as `InfiniteData<CursorPage<Activity>, number>`
- Guard the button with `isFetchingNextPage`: two quick clicks would ask for the
  same page twice

---

# Infinite scroll in React

```tsx
function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) onVisible();
    });
    observer.observe(element);
    return () => observer.disconnect();           // the cleanup StrictMode checks
  }, [onVisible]);

  return <div ref={ref} aria-hidden />;
}
```

```tsx
{hasNextPage && !isFetchingNextPage && <LoadMoreSentinel onVisible={() => void fetchNextPage()} />}
```

- Unmounting the sentinel while a page loads is the guard: no double fetch
- Keep a **button** too: keyboard and screen-reader users cannot "scroll to the
  end" of an infinite list

---

## Workshop 03 — Pagination & infinite
