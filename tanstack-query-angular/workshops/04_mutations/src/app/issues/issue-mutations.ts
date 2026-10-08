/**
 * Everything the app knows about CHANGING issues will live here. Each function
 * will be an inject function: called in an injection context (a field
 * initializer, a constructor), like `injectMutation` itself.
 */

// TODO (step 4): the keys of the mutations, for `injectIsMutating` to filter on:
//   all: ['issues']  →  create(): ['issues', 'create'],  delete(): ['issues', 'delete']

// TODO (step 1): `injectCreateIssue()` — `inject(QueryClient)`, then an
// `injectMutation(() => ({ mutationFn, onSuccess }))` whose `onSuccess` RETURNS
// `queryClient.invalidateQueries({ queryKey: issueKeys.all })`.

// TODO (step 4): `injectDeleteIssue()` — the same, around `deleteIssue`, with a
// `mutationKey`.

export {};
