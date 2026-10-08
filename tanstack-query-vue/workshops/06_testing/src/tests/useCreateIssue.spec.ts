import { describe, it } from 'vitest';

// The composable on its own, in a host component (`withSetup`). Spy on the
// client with `using invalidate = vi.spyOn(queryClient, 'invalidateQueries')`:
// the spy is restored when the test's block ends.

describe('useCreateIssue', () => {
  // TODO (step 5) — `await result.mutateAsync(…)`, then the new issue's id
  // (43), `result.data.value`, and `invalidateQueries` called with `issueKeys.all`.
  it.todo('creates the issue, then invalidates every issue query');

  // TODO (step 5) — with `apiSettings.failWrites`, `mutateAsync` rejects,
  // `result.error.value` is set, and nothing is invalidated.
  it.todo('invalidates nothing when the server refuses');
});
