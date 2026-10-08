# The TanStack Query devtools

A panel inside the page that shows the **cache** — what the Network tab cannot:
what is cached, for how long, who uses it, and why it refetched.

<div style="display: flex; gap: 2em;">
<div>

### The query list

- One row per **query**, its **key** as the label
- A colour per state:
  - **fresh** — green
  - **fetching** — blue
  - **paused** — purple
  - **stale** — yellow
  - **inactive** — grey
- The **observer count** next to each key: `0` = inactive, the gc timer runs
- Filter by key, sort by status / last updated

</div>
<div>

### A selected query

- **Query details**: hash, status, observers, **last updated**
- **Data explorer**: the cached data as a tree — editable
- **Query explorer**: the options actually applied (`staleTime`, `gcTime`,
  `retry`…) — after defaults and `setQueryDefaults`
- **Actions**: Refetch · Invalidate · Reset · Remove · **Trigger loading** ·
  **Trigger error** (click again to restore)

</div>
</div>

<br />

> The training shows how to install it for your framework. The panel itself is
> the same in the three: it reads the same `QueryClient`.

---

# Debugging with the actions

| Question | What to do in the devtools |
|---|---|
| "Why did it refetch?" | Watch the row turn **blue**: on focus (`visibilitychange`)? on mount (observer count +1)? after a mutation (invalidated)? |
| "Why didn't it refetch?" | Still **green** = fresh: `staleTime` too long. Grey = no observer. Disabled? |
| "Two requests for one screen?" | Two rows with **almost** the same key: `['issue', 1]` vs `['issues', 'detail', 1]`, `'1'` vs `1` |
| "What does my skeleton look like?" | **Trigger loading** — puts the query back to `pending` until you click again |
| "And my error state?" | **Trigger error** — no need to break the server |
| "Is my invalidation broad enough?" | Run the mutation, check that **every** expected row turned stale / refetched |
| "What does the UI do with other data?" | Edit the **data explorer** — the screen re-renders with your values |
| "Is it garbage collected?" | Leave the screen; the row goes grey, then disappears after `gcTime` |

<style>
table { font-size: 0.8em; }
</style>

---

# The mutations tab

- One row per **mutation** in the `MutationCache` — kept for its `gcTime`
  (5 min) after it settles
- Its **`mutationKey`** as the label — or nothing: another reason to name
  mutations
- Status: `idle` / `pending` / `success` / `error`, `isPaused`
- **Variables**, **data**, **error**, `failureCount`, the `onMutateResult` —
  check what the snapshot of an optimistic update actually contained
- Watch concurrent toggles: three `pending` rows, settling one by one

<br />

> Live demo on workshop 05: turn on *"The server refuses every write"*, close an
> issue — follow the optimistic write in the list's **data explorer**, the
> failed mutation in the **mutations tab**, the rollback, then the refetch.

---

# In production

- The devtools are **excluded from production builds** by default: the
  adapters' devtools packages render nothing when `process.env.NODE_ENV` is
  `'production'` (or the framework's equivalent)
- Need them on a production build — debugging a bug only seen there?
  **Lazy-load** them behind a switch:

```ts
// The idea, framework-free: the devtools chunk is only downloaded on demand
async function enableQueryDevtools() {
  const { mountDevtools } = await import('./devtools-production');   // a separate chunk
  mountDevtools(queryClient);
}
// e.g. from the console: window.toggleDevtools = enableQueryDevtools
```

- Keep them **out of the main bundle**: the panel weighs more than the core
  library
- The **browser extension**-style alternatives exist (e.g. a Vue Devtools
  inspector for Vue Query) — same information, different place
