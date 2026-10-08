# Mutation state beyond one component

The state returned by the adapter's mutation function belongs to **that**
component. But the header wants to say *"Saving…"* while **any** write runs:

```ts
queryClient.isMutating();                                        // number of pending mutations
queryClient.isMutating({ mutationKey: ['issues'] });             // prefix match, like query keys
queryClient.isMutating({ predicate: (m) => m.state.variables?.id === 7 });
```

- Reactive versions in the adapters: `useIsMutating` / `injectIsMutating` — a
  number that updates as mutations start and settle
- Workshop 04, step 4: `saving` in the header while `isMutating > 0`, with a
  `mutationKey` on the delete mutation
- Same pair for queries: `queryClient.isFetching()` /
  `useIsFetching` / `injectIsFetching`

---

# Reading other mutations: the `MutationCache`

Every `mutate()` creates a **`Mutation`** in the client's `MutationCache` — kept
for `gcTime` (5 min) after it settles.

```ts
// Every pending creation, anywhere in the app — with its variables
const pendingTitles = queryClient
  .getMutationCache()
  .findAll({ mutationKey: ['issues', 'create'], status: 'pending' })
  .map((mutation) => (mutation.state.variables as { title: string }).title);
```

- Reactive version: `useMutationState` / `injectMutationState` with
  `{ filters, select }` — e.g. a list component showing the pending row of a
  form it does not own (workshop 05, bonus)
- Give mutations a **`mutationKey`** — filters, devtools and defaults all match
  on it

---

# Global callbacks: `MutationCache` and `QueryCache`

```ts
import { MutationCache, QueryCache, QueryClient, type QueryKey } from '@tanstack/query-core';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only background refetch failures: the first load shows its own error state
        if (query.state.data !== undefined) toast.error(`Could not refresh: ${error.message}`);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => {
        if (!mutation.options.onError) toast.error(error.message);   // nobody handled it
      },
      onSettled: (_data, _error, _variables, _onMutateResult, mutation, context) => {
        if (mutation.meta?.invalidates) {   // context.client: the QueryClient, no closure needed
          return context.client.invalidateQueries({ queryKey: mutation.meta.invalidates as QueryKey });
        }
      },
    }),
  });
}
```

- Cache-level callbacks run **for every** query / mutation, **before** the
  options-level ones, and can't be skipped by an unmount
- `meta` is free-form data on a query or mutation, read here — chapter 07

<style>
.slidev-layout { --slidev-code-font-size: 11px; }
</style>

---

# `setMutationDefaults` — options by key

```ts
queryClient.setMutationDefaults(['issues', 'create'], {
  mutationFn: createIssue,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  retry: 0,
});

// Anywhere: only the key is needed — the defaults supply the rest
// options: { mutationKey: ['issues', 'create'] }
```

- Mutation defaults matched by **`mutationKey` prefix**, merged under the
  call's own options — like `setQueryDefaults`
- **Required** for mutations that must survive a **reload** (offline,
  persisted): a function cannot be serialised, so a resumed mutation finds its
  `mutationFn` through its key — chapter 07
- Otherwise, option **factories** in the feature module (`createIssueMutation(queryClient)`)
  are more explicit and easier to follow
