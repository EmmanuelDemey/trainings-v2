# TP 06 — Debugging and testing

> The app of workshop 04, finished — and untested. No spec is given this time:
> you write them. A test helper, the list, its error state two ways, a mutation,
> and an inject function on its own.

## Goal

Chapter 06 — Testing code that queries, the Angular way:

- **`renderWithClient`**: Testing Library's `render`, with a fresh client per test
- **Asynchronous UI**: `getBy*` for what is there now, `findBy*` for what comes
- **Faking the server** at two levels: its own switches, or a provider in TestBed
- **An inject function in isolation** with `TestBed.runInInjectionContext`, and a
  spy that cleans up after itself with `using`

## Prerequisites

- **Node.js >= 22.22.2** (24 recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 06 of the deck

## Setup

```bash
npm install
npm run dev          # http://localhost:4200
npm test             # ng test --watch=false — green: every test is an it.todo
npm run test:watch
npm run typecheck
```

`npm test` runs Vitest through the Angular CLI (`@angular/build:unit-test`, in
jsdom). It picks up every `src/**/*.spec.ts`; TestBed is set up for you,
zoneless like the app. `src/api/` is a shared copy: do not edit it. There is no
`src/tests/shared/` here — **the starter is green**, and turning each `it.todo`
into a real test is the exercise.

**What changed since workshop 04**: the app reads the server through Angular's
dependency injection — the `ISSUE_API` token (`src/app/issues/issue-api.ts`) —
and the queries come from an `IssueQueries` service. Why: Angular's unit-test
builder **bundles** the specs with the app before Vitest runs them, and refuses
`vi.mock()` of a relative import:

```txt
Error: The "vi.mock" and related methods are not supported for relative imports
with the Angular unit-test system. Please use Angular TestBed for mocking dependencies.
```

DI is the seam Angular gives you instead: a test provides another `ISSUE_API`.

**Read first**: `src/tests/render.ts`, the helper the shared specs of workshops
01 to 05 used. Yours generalises it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `createTestQueryClient()` and `renderWithClient()` | `tests/render-with-client.ts` | `npm run typecheck` passes |
| 2 | The list: loading, then data | `tests/issue-list.spec.ts` | 1 test green |
| 3 | The error state: the server's switch, then a mocked `ISSUE_API` | `tests/issue-list.spec.ts`, `tests/issue-list-mocked.spec.ts` | 3 tests green |
| 4 | The creation, through the whole app | `tests/new-issue.spec.ts` | 4 tests green |
| 5 | `injectCreateIssue()` alone | `tests/issue-mutations.spec.ts` | `npm test` — 5 green, no todo |

## Steps

### 1. A client per test — `render-with-client.ts`

1. `createTestQueryClient()`: a `new QueryClient` with
   `queries: { retry: false, gcTime: Infinity }` and `mutations: { retry: false }`.
   `retry: false` — a failing query fails now, not after three retries with a
   growing delay. `gcTime: Infinity` — no garbage-collection timer left behind.
2. `renderWithClient(component, options = {})`: build a client, call
   `render(component, { ...options, providers: [provideTanStackQuery(queryClient), ...(options.providers ?? [])] })`
   from `@testing-library/angular`, and return `{ ...result, queryClient }`.

Cleanup is automatic: after each test, Testing Library destroys the fixture and
TestBed its injector — which unmounts the client.

→ **Done when** `npm run typecheck` exits 0.

### 2. The list — `issue-list.spec.ts`

1. `beforeEach`: `resetApi()`, and `apiSettings.latencyMs = 20` (fast, but still
   asynchronous).
2. Render `IssueList`, then `expect(screen.getByTestId('list-loading')).toBeTruthy()`
   — **now**, synchronously — and `expect(await screen.findByTestId('issue-1')).toBeTruthy()`
   — **eventually**. Issue 3 is closed: `queryByTestId('issue-3')` is `null`.

→ **Done when** the test is green — run it three times: no flakiness.

### 3. The error state, two ways — `issue-list.spec.ts`, `issue-list-mocked.spec.ts`

1. With the server's switch: `apiSettings.failNextRequest = true` before the
   render, then find `list-error` and check its text
   ("temporarily unavailable"). The real `fetchIssues` runs, is logged, and fails
   with the server's own `ApiError(503)`.
2. With a mock: build an `api: IssueApi` whose `fetchIssues` is
   `vi.fn<IssueApi['fetchIssues']>().mockRejectedValue(new ApiError(500, 'Boom'))`,
   render with `{ providers: [{ provide: ISSUE_API, useValue: api }] }`, find the
   error, and `expect(api.fetchIssues).toHaveBeenCalledWith('open')`.

Which one tests more? The first goes through the real query function, the real
error, the real request log. The second only proves that "when the function
rejects, an error shows" — keep mocks for what a test cannot run.

→ **Done when** both tests are green.

### 4. A mutation, through the app — `new-issue.spec.ts`

1. `renderWithClient(App)` — the form and the list are separate components; only
   the cache links them, which is what you test.
2. `const user = userEvent.setup()`, `await user.type(input, '…')`,
   `await user.click(screen.getByTestId('create-submit'))`.
3. Find `issue-43`; `await waitFor(() => expect(input.value).toBe(''))`; the
   counter says 29.

→ **Done when** the test is green.

### 5. An inject function, alone — `issue-mutations.spec.ts`

1. `TestBed.configureTestingModule({ providers: [provideTanStackQuery(queryClient)] })`
   with a client from `createTestQueryClient()`.
2. `using invalidate = vi.spyOn(queryClient, 'invalidateQueries');` — `using`
   restores the spy when the test's scope ends: no `mockRestore()`, no `afterEach`.
   (Never `using` in a `beforeEach`: it would be restored at the end of the hook.)
3. `const createIssue = TestBed.runInInjectionContext(() => injectCreateIssue());`
   — TestBed lends the injection context a field initializer has.
4. `createIssue.mutate('…')`, then `await vi.waitFor(() => expect(createIssue.isSuccess()).toBe(true))`,
   `createIssue.data()?.id` is 43, and `invalidate` was called with
   `{ queryKey: issueKeys.all }`.

→ **Done when** `npm test` shows 5 passed, 0 todo.

### The devtools half

Done live with the trainer on the app of workshop 05: open the devtools, find a
query by its key, read its observers and `dataUpdatedAt`, trigger a loading and
an error state from the panel, watch a mutation in the **Mutations** tab.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0, with 5 passed and no `todo`
- [ ] Three runs of `npm test` in a row: green every time
- [ ] `grep -rn TODO src` returns nothing outside `src/api/`

**The tests are right**

- [ ] Every test renders with a **fresh** client
- [ ] No fixed `sleep`: only `findBy*`, `waitFor`, `vi.waitFor`
- [ ] No `mockRestore()` and no `afterEach` for spies: `using`
- [ ] Break the app on purpose (remove the invalidation in `injectCreateIssue`):
      at least one test turns red

**You can explain**

- [ ] Why `retry: false` and `gcTime: Infinity` in tests
- [ ] Why `vi.mock` does not work here, and what replaces it
- [ ] The switch of the fake server vs the mocked `ISSUE_API`: which tests more
- [ ] What `TestBed.runInInjectionContext` gives `injectCreateIssue()`

## Going further

- *(Bonus)* Test the delete mutation and the "Saving…" indicator of the header.
- With `HttpClient` instead of the fake API: `provideHttpClient()`,
  `provideHttpClientTesting()` and `HttpTestingController.expectOne('/api/issues?status=open').flush([...])`.
- Port one spec to Jest (`jest-preset-angular`): `vi.fn` → `jest.fn`. There,
  `jest.mock('../api/fakeApi')` works — why?
