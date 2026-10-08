# The recipe — close / reopen an issue

```ts {all|7|9-10|12-16|18|21-25|27-29}
type Toggle = { id: number; status: IssueStatus };
type Snapshot = Array<[QueryKey, IssueSummary[] | undefined]>;

export const toggleIssueMutation = (queryClient: QueryClient) => ({
  mutationFn: ({ id, status }: Toggle) => updateIssue(id, { status }),
  onMutate: async ({ id, status }: Toggle) => {
    await queryClient.cancelQueries({ queryKey: issueKeys.all });         // 1. no late overwrite

    const snapshot: Snapshot = queryClient.getQueriesData<IssueSummary[]>( // 2. remember every list
      { queryKey: issueKeys.lists() });

    for (const [key, issues] of snapshot) {                                // 3. write the future
      if (!issues) continue;
      const filter = key[2] as IssueFilter;                               //    ['issues', 'list', filter]
      queryClient.setQueryData(key, applyStatus(issues, id, status, filter));
    }

    return { snapshot };                                                   // 4. → onMutateResult
  },

  onError: (_error: Error, _toggle: Toggle, onMutateResult?: { snapshot: Snapshot }) => {
    for (const [key, issues] of onMutateResult?.snapshot ?? []) {          // 5. roll back
      queryClient.setQueryData(key, issues);
    }
  },

  onSettled: () => {
    void queryClient.invalidateQueries({ queryKey: issueKeys.all });       // 6. the server decides
  },                                                                       //    — NOT returned
});
```

<style>
.slidev-layout { --slidev-code-font-size: 10.5px; --slidev-code-line-height: 1.3; }
</style>

---

# Step 1 — `cancelQueries`

```ts
await queryClient.cancelQueries({ queryKey: issueKeys.all });
```

```text
t=0     focus → GET /issues?status=open starts      (the server answers with issue 7 OPEN)
t=100   click "close #7" → optimistic write: #7 leaves the open list
t=400   the GET lands → setQueryData(old data) → #7 is BACK in the open list   ❌
t=500   PATCH done → invalidation → #7 leaves again                            (flicker)
```

- A response that **left the server before** your write carries the **old**
  state; landing after `setQueryData`, it overwrites the optimistic data
- `cancelQueries` stops those fetches and **reverts** the queries to their state
  before the fetch — the promise never rejects
- It must be **awaited**: the snapshot must be taken **after** the revert
- The aborted request may still reach the server — what matters is that its
  answer is **ignored**

---

# Steps 2 and 3 — snapshot, then write immutably

```ts
function applyStatus(issues: IssueSummary[], id: number, status: IssueStatus,
                     filter: IssueFilter): IssueSummary[] {
  const changed = issues.map((issue) => (issue.id === id ? { ...issue, status } : issue));
  // A closed issue leaves the "open" list, a reopened one leaves the "closed" list
  return filter === 'all' ? changed : changed.filter((issue) => issue.status === filter);
}
```

- **`getQueriesData`** returns `[key, data]` for **every** matching entry — the
  *open*, *closed* and *all* lists, whichever are cached. The snapshot holds
  the **references** to the current arrays
- **`setQueriesData(filters, updater)`** writes the same updater to every match
  — enough when the change does not depend on the key; here the filter matters,
  so loop and call `setQueryData` per key
- **Immutable**: `map` and `filter` build **new** arrays and new objects. Mutate
  `issues` in place and the snapshot is **modified too** — the rollback would
  restore the already-changed data
- Snapshot only what you **write**: `issueKeys.lists()` — the details have
  another shape

<style>
.slidev-layout { --slidev-code-font-size: 11px; }
</style>

---

# Steps 4 and 5 — `onMutateResult` and the rollback

```ts
onMutate: async (toggle) => {
  // …
  return { snapshot };                // whatever you return here…
},
onError: (error, toggle, onMutateResult) => {
  // …arrives here as onMutateResult (undefined if onMutate itself threw)
  for (const [key, issues] of onMutateResult?.snapshot ?? []) {
    queryClient.setQueryData(key, issues);
  }
},
```

- Restore **every** entry of the snapshot — not only the one on screen
- An entry that did not exist before (`undefined` in the snapshot):
  `setQueryData(key, undefined)` is a no-op — remove it with `removeQueries` if
  you had created it
- Then **tell the user**: the row jumping back is not enough feedback —
  workshop 05's `toggle-error`
- Type `onMutateResult` once and the whole recipe is checked — or let the
  adapter's mutation function infer it from `onMutate`'s return type

---

# Step 6 — `onSettled` invalidates, without waiting

```ts
onSettled: () => {
  void queryClient.invalidateQueries({ queryKey: issueKeys.all });
},
```

- **Success**: the server may have changed more than we guessed (`updatedAt`,
  the activity feed, the counters) — refetch to converge
- **Error**: the rollback restored the snapshot, but the snapshot may itself be
  out of date — refetch to converge
- **Not returned**, unlike chapter 04: the screen is **already right**
  - returned, the mutation stays `pending` 400 ms longer for nothing
  - on error, `onError` has run but the mutate-level `onError` (show the message)
    and `isError` would **wait for the refetch**
- `cancelQueries` + `invalidateQueries` on the **same** keys: the refetch of
  mutation A could be cancelled by mutation B's `onMutate` — which is fine,
  B's own `onSettled` will refetch (next slide set: concurrent mutations)
