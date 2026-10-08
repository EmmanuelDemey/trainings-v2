import { describe, it } from 'vitest';

describe('injectCreateIssue, without a component', () => {
  // TODO (step 5): `TestBed.configureTestingModule({ providers: [...] })`, then
  // `TestBed.runInInjectionContext(() => injectCreateIssue())`. Spy on
  // `queryClient.invalidateQueries` with `using invalidate = vi.spyOn(...)`,
  // call `mutate`, and `vi.waitFor` the success.
  it.todo('creates the issue, then invalidates every issue query');
});
