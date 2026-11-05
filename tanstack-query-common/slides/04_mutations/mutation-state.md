# Mutation state beyond one component

The state returned by the adapter's mutation function belongs to **that**
component. But the header wants to say *"Saving…"* while **any** write runs:

```ts
queryClient.isMutating();                                        // number of pending mutations
queryClient.isMutating({ mutationKey: issueMutationKeys.all });  // prefix match: ['issues'] matches create, delete…
queryClient.isMutating({ predicate: (m) => m.state.variables?.id === 7 });
```

- Reactive versions in the adapters: `useIsMutating` / `injectIsMutating` — a
  number that updates as mutations start and settle
- Workshop 04, step 4: `saving` in the header while `isMutating > 0`, with a
  `mutationKey` on the delete mutation
- Same pair for queries: `queryClient.isFetching()` /
  `useIsFetching` / `injectIsFetching`

---

# `setMutationDefaults` — options by key

```ts
queryClient.setMutationDefaults(issueMutationKeys.create(), {
  mutationFn: createIssue,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: issueKeys.all }),
  retry: 0,
});

// Anywhere: only the key is needed — the defaults supply the rest
// options: { mutationKey: issueMutationKeys.create() }
```

- Mutation defaults matched by **`mutationKey` prefix**, merged under the
  call's own options — like `setQueryDefaults`
- **Required** for mutations that must survive a **reload** (offline,
  persisted): a function cannot be serialised, so a resumed mutation finds its
  `mutationFn` through its key — chapter 07
- Otherwise, option **factories** in the feature module (`createIssueMutation(queryClient)`)
  are more explicit and easier to follow
