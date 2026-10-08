import { describe, it } from 'vitest';

describe('useCreateIssue', () => {
  // TODO (5): `renderHook(() => useCreateIssue(), { wrapper: createWrapper(queryClient) })`.
  // Seed a list with `queryClient.setQueryData(issueKeys.list('open'), [])`,
  // spy with `using invalidate = vi.spyOn(queryClient, 'invalidateQueries')`,
  // then `await act(() => result.current.mutateAsync({ title: '…' }))`.
  it.todo('invalidates every issue query once the issue is created');

  // TODO (5): `mutate({ title: '   ' })`, then `waitFor` `isError`, and the
  // message of the server.
  it.todo('exposes the error of a refused creation');
});
