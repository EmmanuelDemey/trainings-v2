# Rollback strategies

| Strategy | How | When |
|---|---|---|
| **Restore the snapshot** | `setQueryData(key, snapshotData)` for each entry | the default — exact, cheap |
| **Inverse operation** | apply the opposite change: `status: 'open'` back | when other changes happened since the snapshot and must be kept |
| **Refetch only** | no snapshot; `invalidateQueries` in `onError` | the data is cheap to reload and a short flash of wrong data is acceptable |
| **Reset** | `resetQueries` — back to the skeleton | when you cannot trust anything in the entry anymore |

<br />

- The snapshot is **all or nothing**: it also reverts changes made **after**
  `onMutate` by other mutations or refetches — the next slides
- Whatever the strategy, `onSettled` invalidates: the rollback is a **best
  guess**, the refetch is the **truth**

<style>
table { font-size: 0.85em; }
</style>

---

# Concurrent optimistic mutations

The user closes #1, #2 and #4 in a row, quickly:

```text
t=0     close #1 → onMutate: snapshot S1, write         PATCH /issues/1 ─────────┐
t=150   close #2 → onMutate: cancel, snapshot S2, write  PATCH /issues/2 ─────┐   │
t=300   close #4 → onMutate: cancel, snapshot S3, write  PATCH /issues/4 ──┐  │   │
t=400   #1 settles → onSettled: invalidate → GET open (server: #2, #4 still OPEN) │
t=800   the GET lands → #2 and #4 REAPPEAR in the open list                ❌ flicker
t=550…  #2, #4 settle → more refetches → they disappear again
```

- Each `onSettled` refetches while **other** writes are still in flight: the
  server's answer does not include them yet
- The optimistic data is **overwritten** by a truthful-but-early response

---

# The trick: invalidate only when the last one settles

```ts
export const toggleIssueMutation = (queryClient: QueryClient) => ({
  mutationKey: ['issues', 'toggle'] as const,           // needed to count them
  mutationFn: ({ id, status }: Toggle) => updateIssue(id, { status }),
  // onMutate: cancel, snapshot, write — as before
  // onError: restore the snapshot — as before
  onSettled: () => {
    // During onSettled, THIS mutation still counts as pending
    if (queryClient.isMutating({ mutationKey: ['issues', 'toggle'] }) === 1) {
      void queryClient.invalidateQueries({ queryKey: issueKeys.all });
    }
  },
});
```

- Only the **last** mutation to settle refetches — one GET instead of three, no
  flicker
- Each `onMutate` still calls `cancelQueries`: a refetch started by an earlier
  settle is cancelled by a later mutation
- Count by **key**: other kinds of mutations (create, delete) are not delayed
- Alternative: `scope: { id: 'issues' }` runs them **one after the other** —
  simpler, but the 2nd and 3rd PATCH wait

---

# Partial failures

Close #1 ✅, close #2 ❌ (server refuses), close #4 ✅ — in flight together.

- #2's `onError` restores **its** snapshot S2 — taken **after** #1's write,
  **before** #4's: #4 goes back to *open* on screen, #1 stays closed ❌
- A snapshot restore is only exact when **no other** optimistic write happened
  since
- Two ways out:

<div style="display: flex; gap: 2em;">
<div>

### Inverse operation

```ts
onError: (_e, { id, status }) => {
  const previous = status === 'closed' ? 'open' : 'closed';
  for (const [key, issues] of queryClient.getQueriesData<IssueSummary[]>({ queryKey: issueKeys.lists() })) {
    if (issues) queryClient.setQueryData(key, applyStatus(issues, id, previous, key[2] as IssueFilter));
  }
},
```

Undo **only** this change, keep the others.

</div>
<div>

### Converge with the server

- Keep the snapshot rollback for the **common** case (one write at a time)
- Rely on the final `invalidateQueries` to **fix** the rare partial failure
- With the "last one settles" trick, that refetch includes every successful
  write

</div>
</div>

<style>
.slidev-layout { --slidev-code-font-size: 10.5px; }
</style>

---

# Showing the error

- The rollback **moves the row back** — easy to miss. Always add a message:
  *"Could not close #2: The issue tracker refused the change"* (`toggle-error`)
- Say **which** item failed: with several in flight, "an error occurred" is
  useless — `variables` tells you
- Where the message lives:
  - mutate-level `onError` / the mutation's `error` — on the screen that acted
  - `MutationCache.onError` — a global toast for writes nobody handled
- Offer a **retry**: `mutate(variables)` again with the same variables
- Clear it: the mutation's `reset()`, or the next successful `mutate`

> Workshop 05, steps 1–2: toggle with *"The server refuses every write"* on —
> the row moves, comes back, `toggle-error` appears, and the Network panel shows
> one `PATCH` (failed) and the refetch.

---

# Rollback vs undo

<div style="display: flex; gap: 2em;">
<div>

### Rollback

- **Automatic**, on **failure**
- The server said no: put back what it has
- Part of the mutation's code: `onError`

</div>
<div>

### Undo

- **Chosen** by the user, after a **success**
- *"Issue closed — Undo"*: a **new mutation**, the inverse one
  (`status: 'open'`), optimistic in its own right
- Or delay the real write (send after 5 s unless undone) — then the
  "optimistic" state is just client state until the timer fires

</div>
</div>

<br />

- Don't build undo out of the rollback snapshot: by the time the user clicks,
  refetches have replaced it
- Destructive writes (delete): an undo toast beats a confirmation dialog — and
  optimistic removal makes it feel instant
