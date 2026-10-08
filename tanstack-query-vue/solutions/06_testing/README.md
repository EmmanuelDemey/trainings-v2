# Workshop 06 — Debugging and testing

> The finished app of workshop 04 — and a `src/tests/` folder full of
> `it.todo`s. This time there is no spec to turn green: you write the tests,
> with `@testing-library/vue` and Vitest, for the list, its error state, the
> creation, and a composable on its own.

## Goal

Chapter 06 — Debugging with the devtools, testing:

- **`renderWithClient`**: a fresh `QueryClient` per test, tuned for tests
- **Asynchronous UI**: `findBy*`, `waitFor`
- **The error state, two ways**: the fake server's switch, and `vi.mock` — and
  why the first tests more
- **A mutation**, through the screen
- **A composable in isolation**, in a host component — with spies that restore
  themselves (`using`)

The devtools half of the chapter is a guided tour, live, on the app of
workshop 05.

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 06 of the deck. The app is the solution of workshop 04, untouched.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the app, to see what you test
npm test             # vitest run — green from the start: only todos
npm run test:watch   # keep it open: each todo you write runs at once
npm run typecheck    # vue-tsc --noEmit — the specs are typechecked too
```

**Do not edit** `src/api/`: a copy of `tanstack-query-common/`. The fake server
is your best testing tool: `resetApi()` puts it back in its initial state,
`apiSettings` makes it slow or failing, `sent(label)` counts what it received.

`src/tests/render.ts` is the helper the shared specs of the other workshops
use; this workshop has no shared spec, and you write your own helper.

What is in `src/tests/`:

| File | What you write |
|---|---|
| `renderWithClient.ts` | step 1 — the helper |
| `IssueList.spec.ts` | steps 2 and 3 — loading, data, the error with the fake server |
| `IssueList.mocked.spec.ts` | step 3 — the error with the API module mocked |
| `NewIssueForm.spec.ts` | step 4 — the creation |
| `withSetup.ts`, `useCreateIssue.spec.ts` | step 5 — the composable on its own |

Vitest's API is Jest's: `describe`, `it`, `expect`, `vi.fn()` for `jest.fn()`,
`vi.mock()` for `jest.mock()`, `vi.spyOn()` for `jest.spyOn()`. Everything here
runs under Jest with `jest-environment-jsdom` and the same Testing Library.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `createTestQueryClient()` and `renderWithClient()` | `renderWithClient.ts` | It typechecks, and you can say why each option |
| 2 | Loading, then data | `IssueList.spec.ts` | The first test green |
| 3 | The error, with the fake server, then with `vi.mock` | `IssueList.spec.ts`, `IssueList.mocked.spec.ts` | Three more tests green |
| 4 | The creation through the screen | `NewIssueForm.spec.ts` | Two more tests green |
| 5 | `useCreateIssue` in a host component, `using` spies | `withSetup.ts`, `useCreateIssue.spec.ts` | No `todo` left, all green |

## Steps

### 1. A client for tests — `renderWithClient.ts`

```ts
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

export function renderWithClient(component: Component, props: Record<string, unknown> = {}) {
  const queryClient = createTestQueryClient();
  const result = render(component, { props, global: { plugins: [[VueQueryPlugin, { queryClient }]] } });
  return { ...result, queryClient };
}
```

- **A fresh client per call**: no cache shared between two tests, so their
  order never matters.
- **`retry: false`**: an error test would otherwise wait for three retries —
  1 + 2 + 4 seconds of backoff — before the error reaches the screen.
- **`gcTime: Infinity`**: no garbage-collection timer started when a query
  loses its last observer — nothing left ticking after the test (with Jest:
  "Jest did not exit one second after the test run").
- Not the app's `createQueryClient()`: you test components, not the app's
  freshness policy. (The shared specs did the opposite, on purpose: they
  checked YOUR `defaultOptions`.)

Testing Library unmounts after each test by itself: `globals: true` in
`vitest.config.ts` gives it the global `afterEach` it needs.

→ **Done when** `npm run typecheck` passes, and you can say what each option
prevents.

### 2. Loading, then data — `IssueList.spec.ts`

```ts
beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});

it('shows a loading state, then the open issues', async () => {
  renderWithClient(IssueList);

  expect(screen.getByTestId('list-loading')).toBeTruthy();
  expect(await screen.findByTestId('issue-1')).toBeTruthy();
  expect(screen.queryByTestId('list-loading')).toBeNull();
});
```

`getBy*` right after the render: the first render has nothing in the cache.
`findBy*` polls (1 s by default) until the element is there — the query
resolves after the fake latency, never in the same tick. `queryBy*` returns
`null` instead of throwing: the one to assert an absence.

→ **Done when** the test is green — and red if you break `IssueList.vue`
(try: show `list-loading` on `isFetching`).

### 3. The error state, two ways — `IssueList.spec.ts`, `IssueList.mocked.spec.ts`

1. **With the fake server**: `apiSettings.failNextRequest = true` before the
   render, then `findByTestId('list-error')`, whose text contains "temporarily
   unavailable".
2. **With the module mocked**, in a file of its own — `vi.mock` is hoisted and
   replaces the module for the **whole** file:

   ```ts
   vi.mock('../api/fakeApi', async (importOriginal) => ({
     ...(await importOriginal<typeof import('../api/fakeApi')>()),
     fetchIssues: vi.fn(),
   }));

   it('shows the error the API rejects with', async () => {
     vi.mocked(fetchIssues).mockRejectedValue(new ApiError(500, 'Mocked: the tracker is down'));
     renderWithClient(IssueList);
     expect((await screen.findByTestId('list-error')).textContent).toContain('Mocked');
   });
   ```

   The component imports `@/api/fakeApi`, the test `../api/fakeApi`: the same
   file, so the same mocked module. Add a second test with
   `mockResolvedValue([...])` — a row that only exists in that test.

Which one tests more? The first: the real request, the real `ApiError` and its
real message, the real latency. The mock only checks that the component shows
whatever we made up — change `fetchIssues`' errors, and it stays green. Mock a
module when you cannot drive the real thing (a third-party SDK, a browser API).

→ **Done when** the three tests are green.

### 4. A mutation, through the screen — `NewIssueForm.spec.ts`

Render `App` — the form **and** the list — so the test sees what the user sees,
the invalidation included:

1. `userEvent.setup()`, `renderWithClient(App)`, wait for `issue-1`;
2. `user.type(...)` in `new-title`, `user.click(...)` on `create-submit`;
3. `findByTestId('issue-43')`, then `waitFor` the input to be empty.

Then the failure: `apiSettings.failWrites = true`, `create-error` shows
"refused", and the title stays in the input.

→ **Done when** both tests are green.

### 5. A composable on its own — `withSetup.ts`, `useCreateIssue.spec.ts`

`useCreateIssue()` calls `useQueryClient()`, which `inject`s: it only runs in a
component's `setup`. Give it one that renders nothing:

```ts
export function withSetup<T>(composable: () => T) {
  let result: T | undefined;
  const Host = defineComponent({
    setup() {
      result = composable();
      return () => null;
    },
  });
  const { queryClient, unmount } = renderWithClient(Host);
  return { result: result as T, queryClient, unmount };
}
```

Then test its contract — what it does to the server and to the cache:

```ts
it('creates the issue, then invalidates every issue query', async () => {
  const { result, queryClient } = withSetup(() => useCreateIssue());
  using invalidate = vi.spyOn(queryClient, 'invalidateQueries');

  const issue = await result.mutateAsync({ title: 'Totals are rounded three times' });

  expect(issue.id).toBe(43);
  expect(result.data.value?.title).toBe('Totals are rounded three times');
  expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all });
});
```

`using` (Explicit Resource Management): the spy is restored — `mockRestore()` —
when the block ends, pass or fail. No `afterEach`, no forgotten restore. Never in
a `beforeEach`: it would be restored at the end of the `beforeEach`, before the
test runs.

Second test: with `apiSettings.failWrites`, `mutateAsync` rejects
(`await expect(…).rejects.toThrow('refused')`), `result.error.value` is set,
and `invalidateQueries` was not called.

→ **Done when** `npm test` shows no `todo`, and everything is green.

## Definition of Done

Tick every box. The "Going further" section is **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0, with **no** `todo` left
- [ ] `grep -rn TODO src` returns nothing

**The tests are there**

- [ ] A fresh client per test, with `retry: false` and `gcTime: Infinity`
- [ ] Loading then data, with `findBy*` — no `setTimeout`, no fixed `sleep`
- [ ] The error state, once with the fake server's switch, once with `vi.mock`
- [ ] The creation: the new row, the cleared input, and the refused write
- [ ] `useCreateIssue` tested in a host component, its spies declared with `using`
- [ ] Each test fails if you break the behaviour it covers (try it once per test)

**You can explain**

- [ ] What `retry: false` and `gcTime: Infinity` prevent
- [ ] `getBy*` / `queryBy*` / `findBy*`: which one for what
- [ ] Why the fake server's switch tests more than `vi.mock`
- [ ] Why a composable needs a host component, and what `using` does to a spy

## Going further

- **The devtools tour, on workshop 05's app**: freeze a query in `loading`
  (**Trigger loading**), force an `error` (**Trigger error**), invalidate a list
  by hand and watch the Network panel, read the **Mutations** tab during a
  refused toggle.
- Replace the fake server with **MSW** (`msw/node`'s `setupServer`) and a real
  `fetch`: the third level of "what to fake".
- Test the optimistic toggle of workshop 05: assert the row moved while
  `inFlight('PATCH /issues/1')` still has one entry.
- Run the suite under **Jest** (`jest`, `jest-environment-jsdom`,
  `@vue/vue3-jest`, `babel-jest` or `ts-jest`): only the imports change.
