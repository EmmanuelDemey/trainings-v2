# Testing code that queries — the principles

1. **A fresh `QueryClient` per test** — a shared cache makes each test depend on
   the ones before it: data cached by test A is "instant" in test B
2. **Built by the app's factory**, with test overrides — so the app's
   `defaultOptions` (`staleTime`, `retry` policy…) apply in tests too
3. **`retry: false`** — otherwise an error test waits ~7 s for three retries,
   and times out
4. **`gcTime: Infinity`** — no gc timers left running after the test ends
   (Jest's *"did not exit"*, leaking timers); the client is thrown away anyway
5. **Render inside the provider** — the adapter's way to hand the client to the
   tree: a wrapper, a host component, the providers of `TestBed`
6. **Wait for the UI**, never for the cache: `findBy*`, `waitFor`
7. **Test behaviour, not the cache**: assert what the **page** shows and what
   the **server** received — not `queryClient.getQueryData`

---

# The client of a test

```ts
// src/tests/queryClient.ts
import { createQueryClient } from '../queryClient';

export function createTestQueryClient(): QueryClient {
  const queryClient = createQueryClient();            // the app's defaults…
  queryClient.setDefaultOptions({
    ...queryClient.getDefaultOptions(),
    queries: { ...queryClient.getDefaultOptions().queries, retry: false, gcTime: Infinity },
    mutations: { ...queryClient.getDefaultOptions().mutations, retry: false },
  });
  return queryClient;                                  // …plus what gets in the way of a test
}
```

- **One call per test** — in the render helper, never at module level
- Workshop 06, step 1: a `renderWithClient` helper — builds this client,
  renders the component inside the adapter's provider, returns the client for
  the rare test that needs to seed or inspect it
- Silence the expected error logs of error tests in the test, not globally

---

# Waiting for asynchronous UI

```ts
import { screen, waitFor } from '@testing-library/dom';   // re-exported by each framework's TL

it('shows the open issues', async () => {
  await renderApp();

  expect(screen.getByTestId('list-loading')).toBeTruthy();                // synchronous: first render
  expect(await screen.findByTestId('issue-1')).toBeTruthy();              // waits (1 s default)
  await waitFor(() =>
    expect(screen.getByTestId('open-count').textContent).toContain('28 open'));
});
```

- `findBy*` = `waitFor` + `getBy*`: **polls** until the element appears or the
  timeout — the right tool for "after the response"
- `waitFor(() => expect(…))` for anything that is not "an element appears"
- Never `await sleep(500)`: slow **and** flaky
- Fake timers + TanStack Query: possible (`vi.useFakeTimers({ shouldAdvanceTime: true })`),
  rarely needed — prefer a short real latency (the workshop specs use 50 ms)

---

# What to fake — three levels

| | Fake **the network** (MSW) | Fake **a server** (the workshop's `fakeApi`) | Mock **the API module** (`vi.mock`) |
|---|---|---|---|
| What runs for real | everything down to `fetch` | everything down to the API functions | the component and TanStack Query |
| What you control | HTTP responses, status codes, delays | data, latency, `failNextRequest`, `failWrites` | the return value of each function |
| Catches | URL, headers, parsing, error mapping bugs | the request **count**, races, caching behaviour | component logic only |
| Cost | handlers to maintain | a fake to maintain | one line per test — but **brittle** |
| Can count requests | yes | yes (`sent('GET /issues?status=open')`) | call counts, not real requests |

<br />

- **Never mock TanStack Query itself** (`vi.mock('@tanstack/…')`): the
  caching, deduplication and retries **are** the behaviour under test
- Prefer the **highest** level you can afford: MSW for a real HTTP API; a fake
  server for a demo; `vi.mock` for the odd "this function throws" case

<style>
table { font-size: 0.75em; }
</style>

---

# The error state, two ways — workshop 06, step 3

```ts
// 1. With the fake server's switch: the real path, end to end
it('shows an error when the server fails', async () => {
  apiSettings.failNextRequest = true;          // the next call rejects with ApiError(503)
  await renderApp();
  expect(await screen.findByTestId('list-error')).toBeTruthy();
});
```

```ts
// 2. By mocking the API module
vi.mock('../api/fakeApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/fakeApi')>()),
  fetchIssues: vi.fn().mockRejectedValue(new ApiError(500, 'Boom')),
}));
```

- The first exercises the **real** `queryFn`, the real error type, the retry
  policy (`retry: false` in tests — or a 404 not retried by your `shouldRetry`)
- The second only proves "when `fetchIssues` rejects, an error shows" — and
  breaks if the component calls another function, or the signature changes
- `vi.mock` is **hoisted** and applies to the **whole file**: one mocked module
  per file, `vi.mocked(fetchIssues).mockResolvedValueOnce(…)` per test
- **How** you replace the module depends on the framework's test runner: Angular's
  unit-test builder refuses `vi.mock` on relative imports — there, provide a fake
  through dependency injection (next slide in the Angular training)

---

# Testing a mutation

```ts
it('creates an issue and clears the input', async () => {
  const user = userEvent.setup();
  await renderApp();
  await screen.findByTestId('issue-1');

  await user.type(screen.getByTestId('new-title'), 'Login loops on Firefox');
  await user.click(screen.getByTestId('create-submit'));

  expect(await screen.findByTestId('issue-43')).toBeTruthy();        // the refetched list
  expect((screen.getByTestId('new-title') as HTMLInputElement).value).toBe('');
  expect(sent('POST /issues')).toBe(1);
});
```

- Same rules: act like a user (`userEvent`), assert on the page and on the
  requests
- **Optimistic rollback**: turn on `apiSettings.failWrites`, click, assert the
  row moved **at once** (before any response), then moved **back** and the
  error is shown
- The **pending** state: `latencyMs` high, assert `create-submit` is disabled
  right after the click

---

# Testing a custom hook / composable / injectable

```ts
// What to test in isolation: YOUR logic around the query — not TanStack Query
export const openCountQuery = queryOptions({
  ...issuesQuery('open'),
  select: (issues) => issues.length,
});
```

- The adapter's query function needs its **context** (provider / injection
  context): the training shows `renderHook`, a host component, or
  `TestBed.runInInjectionContext` — workshop 06, step 5
- Often you don't need a component at all — the **options** are plain objects:

```ts
it('counts the open issues', async () => {
  const queryClient = createTestQueryClient();
  const count = await queryClient.query(openCountQuery);   // select applies here too
  expect(count).toBe(28);
});
```

- Test the key factory? Only if it has logic. Test `select`, `shouldRetry`,
  `applyStatus`: **plain functions**, plain unit tests
