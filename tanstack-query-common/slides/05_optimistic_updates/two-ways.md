# Optimistic updates

Show the result of a write **before** the server confirms it.

```text
pessimistic   click ── PATCH 400 ms ── refetch 400 ms ──▶ row moves        (800 ms of nothing)
optimistic    click ──▶ row moves    ── PATCH 400 ms ── refetch 400 ms ──▶ (confirmed, silently)
                                          └─ fails? ──▶ row moves back + error
```

- Worth it when the write **almost always succeeds** and its result is
  **predictable** on the client: toggles, likes, renames, reordering, a new
  comment
- Not worth it when the server **decides** the result (a price, a generated
  id that the UI needs, a validation that often fails) or when failure is
  **costly** to undo in the user's mind (a payment, a send)

Two ways to do it with TanStack Query:

1. **Through the UI** — render the mutation's `variables` while it is pending
2. **Through the cache** — write the expected result into the cache in
   `onMutate`, roll back in `onError`

---

# Way 1 — through the UI, with `variables`

```ts
export const createIssueMutation = (queryClient: QueryClient) => ({
  mutationKey: ['issues', 'create'] as const,
  mutationFn: createIssue,
  // RETURN it: the mutation stays pending until the real row is in the list
  onSettled: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
});
```

```text
while isPending:   render variables.title as an extra, greyed-out row   (pending-issue)
on error:          the pending row disappears — show the error, keep the input
on success:        the refetched list contains the real row; the pending row goes at the same moment
```

- **No cache write, nothing to roll back**: if it fails, the pending row just
  stops being rendered
- Returning the invalidation from `onSettled` avoids a **flash**: without it the
  pending row would vanish 400 ms before the real one appears
- Shown in **one place**: the component holding the mutation — or anywhere via
  `useMutationState` / `injectMutationState` filtered on the `mutationKey`

---

# Way 2 — through the cache

```text
onMutate     cancel refetches · snapshot · write the expected data into every affected entry
mutationFn   the request
onError      put the snapshot back
onSettled    invalidate: let the server have the last word
```

- **Every** component showing the data updates at once — the list, the
  counter, the detail, another tab of the same screen
- More code, and **you** own the consistency: the snapshot, the rollback, the
  races with refetches

| | Through the UI | Through the cache |
|---|---|---|
| Where the optimistic data lives | the mutation's `variables` | the query cache |
| Who sees it | the component(s) that render it | every observer of the keys |
| Rollback | nothing to do | restore the snapshot |
| Best for | **adding** an item (one place shows it) | **changing** existing data shown in many places |
| Workshop 05 | the creation (`pending-issue`) | the toggle close / reopen (`toggle-<id>`) |

<style>
table { font-size: 0.85em; }
</style>
