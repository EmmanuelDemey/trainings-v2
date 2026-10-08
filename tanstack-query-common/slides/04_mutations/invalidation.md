# `invalidateQueries`

```ts
await queryClient.invalidateQueries({ queryKey: issueKeys.all });
```

Two things, for every query matching the filters:

1. **Mark it stale** — whatever its `staleTime` (`isInvalidated`)
2. **Refetch it if it is active** — on screen right now

- **Inactive** matches are only marked: they refetch when a component uses them
  again — no request for screens nobody is looking at
- The promise resolves when the **refetches** are done — return it from
  `onSuccess` to keep the mutation pending until then
- Every component showing a matching query updates — **without** being told
  that a mutation happened: no events, no prop drilling

---

# Choosing what to invalidate

```ts
// Prefix — everything about issues: lists, pages, details
queryClient.invalidateQueries({ queryKey: issueKeys.all });

// Narrower — every list, not the details
queryClient.invalidateQueries({ queryKey: issueKeys.lists() });

// Exact — only this key, not what is below it
queryClient.invalidateQueries({ queryKey: issueKeys.detail(7), exact: true });

// Predicate — anything you can compute from the Query
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'issues' && query.state.dataUpdatedAt < cutoff,
});

// refetchType — which matches to refetch now
queryClient.invalidateQueries({ queryKey: issueKeys.all, refetchType: 'none' });     // mark only
queryClient.invalidateQueries({ queryKey: issueKeys.all, refetchType: 'all' });      // inactive too
```

- **Prefer broad over clever**: invalidating a list nobody watches costs
  nothing (it is only marked); missing one shows wrong data
- Creating an issue changes the lists, the counter, the pages, the activity
  feed… → `issueKeys.all` **and** `activityKeys.all`

---

# `setQueryData` — use the server's answer

The `PATCH` already returns the updated issue — why refetch it?

```ts
export const updateIssueMutation = (queryClient: QueryClient) => ({
  mutationFn: ({ id, patch }: { id: number; patch: IssuePatch }) => updateIssue(id, patch),
  onSuccess: (issue: Issue) => {
    // The detail: replace it with the server's version — no request
    queryClient.setQueryData(issueKeys.detail(issue.id), issue);
    // The lists: their shape is different, and the issue may change list → invalidate
    return queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
  },
});
```

- `setQueryData(key, value | updater)` writes **synchronously**: every observer
  re-renders at once, no round trip
- The updater must be **immutable**: return a **new** array / object, never
  `push` or mutate `old` — structural sharing and change detection rely on it
- `setQueryData` **creates** the entry if missing; `setQueriesData(filters, updater)`
  only updates **existing** matches
- Returning `undefined` from the updater **leaves the cache untouched**

---

# Writing into a list

```ts
// Workshop 04, bonus: add the created issue to the cached open list instead of refetching
onSuccess: (issue: Issue) => {
  const summary: IssueSummary = {
    id: issue.id, title: issue.title, status: issue.status,
    assignee: issue.assignee, commentCount: issue.commentCount,
  };
  // issuesQuery(…).queryKey is tagged: `old` is IssueSummary[] | undefined
  queryClient.setQueryData(issuesQuery('open').queryKey, (old) => (old ? [...old, summary] : old));
  queryClient.setQueryData(issuesQuery('all').queryKey, (old) => (old ? [...old, summary] : old));
},
```

- You re-implement the **server's logic** on the client: ordering, filtering,
  what goes in which list, derived counts… easy to get wrong
- And you miss what the server changed **besides** (the activity feed, a
  counter computed elsewhere)
- ➜ `setQueryData` for the entry the response **is** (the detail);
  **invalidate** what the response only **affects** (lists, counts)

---

# Remove, reset, refetch, invalidate

| Method | Data kept? | Refetch? | Use it for |
|---|---|---|---|
| `invalidateQueries` | yes (marked stale) | active ones, now | **the default after a write** |
| `refetchQueries` | yes | matches (default: all), **now**, even fresh | "refresh this screen" button |
| `setQueryData` / `setQueriesData` | replaced | no | the response **is** the new data |
| `resetQueries` | back to `initialData` / **removed** | active ones | "start over": skeleton again |
| `removeQueries` | **deleted** | no — next reader starts `pending` | a deleted resource's detail, logout |
| `cancelQueries` | yes (reverted to before the fetch) | stops the running fetch | before an optimistic write |

```ts
// After DELETE /issues/7
queryClient.removeQueries({ queryKey: issueKeys.detail(7), exact: true });  // never show it again
void queryClient.invalidateQueries({ queryKey: issueKeys.lists() });       // the lists lose it

// On logout: nothing of the previous user must survive
queryClient.clear();
```

<style>
table { font-size: 0.78em; }
</style>
