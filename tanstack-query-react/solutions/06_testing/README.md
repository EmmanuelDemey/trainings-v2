# Workshop 06 — Debugging and testing

> Workshop 04's app, finished. This time there is no spec to turn green: you
> write the tests — for components that query, for a mutation, and for a hook on
> its own.

## Goal

Chapter 06 — Test components and hooks that use TanStack Query, with **Vitest**
and **React Testing Library**:

- **A test client** per test, configured for tests: no retries, no
  garbage-collection timers
- **Async UI**: loading, then data, with `findBy*`
- **Errors** two ways: the fake server's switch, and `vi.mock` — and why the
  first tests more
- **A mutation** through the UI, and **a hook** in isolation with `renderHook`
- **Spies that clean up after themselves**, with `using`

The devtools half of the chapter is a guided tour, done live on workshop 05's app.

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 06 of the deck. Vitest's API is Jest's (`describe`, `it`, `expect`,
  `vi.fn` ↔ `jest.fn`, `vi.mock` ↔ `jest.mock`, `vi.spyOn` ↔ `jest.spyOn`): what
  you write here runs under Jest with a rename.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the app under test
npm test             # vitest run — green: nothing but todos
npm run test:watch   # keep it open: every todo you turn into a test runs at once
npm run typecheck
```

> `src/api/` is a **shared copy**: do not edit it. This workshop has no shared
> spec: `src/tests/` is yours.

**Already done for you**: `src/tests/setup.ts` unmounts what React Testing
Library rendered after each test, and each test file of `src/tests/` lists the
tests to write as `it.todo`s. The starter is green: a todo is not a failure.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `createTestQueryClient`, `createWrapper`, `renderWithClient` | `tests/renderWithClient.tsx` | It typechecks, and step 2 uses it |
| 2 | The list: loading, then data | `tests/IssueList.spec.tsx` | The first todo is a green test |
| 3 | The error state, twice | `tests/IssueList.spec.tsx`, `tests/IssueList.mocked.spec.tsx` | Two green tests, and you can say which one tests more |
| 4 | The creation mutation | `tests/NewIssueForm.spec.tsx` | Two green tests |
| 5 | `useCreateIssue` in isolation | `tests/useCreateIssue.spec.tsx` | `npm test` — no todo left |

Every test file starts the same way — a fresh server, and a fast one:

```ts
beforeEach(() => {
  resetApi();
  apiSettings.latencyMs = 20;
});
```

## Steps

### 1. A client for tests — `tests/renderWithClient.tsx`

1. `createTestQueryClient()` returns a **new** `QueryClient` with
   `defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } }`:
   - `retry: false` — a failing query fails **now**. With the default 3 retries
     and their back-off, the error state shows up after ~7 s, past the 1 s of
     `findBy*`: the test fails for the wrong reason.
   - `gcTime: Infinity` — no garbage-collection timer starts when a component
     unmounts, so none outlives the test.
   - A **new** one per test: a cache shared between tests makes them depend on
     their order.
2. `createWrapper(queryClient)` returns a component rendering its `children`
   inside `<QueryClientProvider client={queryClient}>`.
3. `renderWithClient(ui, queryClient = createTestQueryClient())` calls
   `render(ui, { wrapper: createWrapper(queryClient) })` and returns the result
   **and** the client: `Object.assign(result, { queryClient })`.

Why not `createQueryClient()` from `src/queryClient.ts`, like the shared specs of
workshops 01–05? Those test the whole app with **its** defaults. Here you test one
component, and want defaults made for tests.

→ **Done when** `npm run typecheck` exits 0 with the `throw` gone.

### 2. Loading, then data — `tests/IssueList.spec.tsx`

1. `renderWithClient(<IssueList />)`.
2. `screen.getByTestId('list-loading')` — synchronous: on the first render,
   nothing came back yet.
3. `await screen.findByTestId('issue-1')` — `findBy*` retries until the element
   shows up (1 s by default).
4. Then `list-loading` is gone, and `sent('GET /issues?status=open')` is 1.

→ **Done when** the test is green — and red if you break `issuesQuery` on purpose.

### 3. The error state, twice — `tests/IssueList.spec.tsx`, `tests/IssueList.mocked.spec.tsx`

1. **With the fake server**: `apiSettings.failNextRequest = true` before rendering,
   then `list-error` contains "temporarily unavailable". The request really goes
   out and really fails: the real error travels through `fetchIssues`, the query
   and the component.
2. **With a mocked module**, in a file of its own (`vi.mock` is hoisted above the
   imports and applies to the whole file):

   ```ts
   vi.mock('../api/fakeApi', async (importOriginal) => ({
     ...(await importOriginal<typeof import('../api/fakeApi')>()),
     fetchIssues: vi.fn(),
   }));
   ```

   Then `vi.mocked(fetchIssues).mockRejectedValue(new ApiError(500, '…'))`, render,
   and find your message in `list-error`.

Which one tests more? Rename the error message in the API, change the signature of
`fetchIssues`: the mocked test stays green — it tests the error **you** wrote.
Mock a module when there is no other way to reach a state, not by default.

→ **Done when** both tests are green, and you can answer the question.

### 4. The creation mutation — `tests/NewIssueForm.spec.tsx`

1. Render `<IssueList />` — it holds the form: the test sees what the user sees,
   the form AND the list that must refresh.
2. `const user = userEvent.setup();`, `await user.type(screen.getByTestId('new-title'), '…')`,
   `await user.click(screen.getByTestId('create-submit'))`.
3. `issue-43` shows up, and the input is empty (`waitFor`).
4. Second test: `apiSettings.failWrites = true` — `create-error` shows, the input
   keeps the title.

→ **Done when** both tests are green.

### 5. A hook in isolation — `tests/useCreateIssue.spec.tsx`

1. `const queryClient = createTestQueryClient();` and seed a list:
   `queryClient.setQueryData(issueKeys.list('open'), [])`.
2. Spy on the client, for this test only:
   `using invalidate = vi.spyOn(queryClient, 'invalidateQueries');` — `using`
   calls `mockRestore()` when the block ends, pass or fail. No `afterEach`, no
   `mockRestore()` to forget. (Not in a `beforeEach`: the spy would be restored at
   the end of the `beforeEach` itself.)
3. `const { result } = renderHook(() => useCreateIssue(), { wrapper: createWrapper(queryClient) });`
4. `await act(() => result.current.mutateAsync({ title: '…' }))`, then
   `await waitFor(() => expect(result.current.isSuccess).toBe(true))` — the
   hook's state reaches React a tick after the promise.
5. `expect(invalidate).toHaveBeenCalledWith({ queryKey: issueKeys.all })`, and
   `queryClient.getQueryState(issueKeys.list('open'))?.isInvalidated` is `true`.
6. Second test: `act(() => result.current.mutate({ title: '   ' }))` — `mutate`
   never rejects — then `waitFor` `isError`, and the message is
   "A title is required".

→ **Done when** `npm test` shows no todo left, and everything is green.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0, with no `todo` left
- [ ] `grep -rn TODO src` returns nothing
- [ ] `grep -rn mockRestore src` returns nothing

**The tests are there**

- [ ] Each test renders with a **new** client
- [ ] The list: loading, then data; the error, with the server switch and with
      `vi.mock`
- [ ] The creation: the new row and the cleared input; the refused write
- [ ] `useCreateIssue` with `renderHook`: the invalidation, and the error
- [ ] Every test turns red when you break the code it covers (try it)

**You can explain**

- [ ] Why `retry: false` and `gcTime: Infinity` in tests
- [ ] Why the server switch tests more than `vi.mock`
- [ ] What `renderHook` renders, and why it needs a wrapper
- [ ] What `using` does at the end of the test, and why not in a `beforeEach`

## Going further

- Run the same tests under **Jest**: `jest-environment-jsdom`, `ts-jest` or
  `@swc/jest`, and `jest.mock` / `jest.spyOn` — the deck has the config.
- Test the `SavingIndicator`: render it next to a component that mutates, and
  assert it shows while the mutation is pending.
- Mock the network instead of the module, with **MSW**, on a real `fetch`-based
  API: what would you lose and gain compared to the fake server?
