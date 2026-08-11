# TP 6 — Advanced testing

> This TP is **autonomous**: it does not depend on any other TP. The application
> is provided and working; your job is to fill in the test files, which ship as
> skeletons with `// TODO` markers and pass trivially until you do.

## Goal

Chapter 6 — Cover one small application at every level:

- **MSW** to drive a component through its four states (loading, data, empty, error)
- **The router**, tested twice: with a real memory router, then with `vi.mock`
- **Stubbing** a heavy child and asserting on the props it receives
- **`createTestingPinia`** for a store-connected component
- **Fake timers** and `using` spies for a debounced composable
- **Cypress**: `cy.intercept`, fixtures, custom commands, `cy.session`

## Prerequisites

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`
- `npm install` downloads the **Cypress binary** (~250 MB). Skip it with
  `CYPRESS_INSTALL_BINARY=0 npm install` if you only want the Vitest steps.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the app, to see what you are testing
npm test             # vitest run
npm run test:watch   # re-runs on change
npm run typecheck    # vue-tsc --noEmit
```

For the end-to-end part:

```bash
npm run build
npm run preview      # http://localhost:4173
npm run e2e:open     # in another terminal
```

## The three mocking layers

| Layer | Used by | Where |
|---|---|---|
| `window.fetch` patch | `npm run dev` / `preview` | `src/api/fakeBackend.ts` |
| **MSW** | Vitest | `tests/msw.ts` |
| **`cy.intercept`** | Cypress | `cypress/e2e/*.cy.ts` |

Three mechanisms, **one contract**. If you change a response shape, all three
have to agree — which is exactly the kind of drift these tests are meant to catch.

## Steps

### 1. Four states with MSW — `tests/InvoiceList.spec.ts`

Assert the loading state on the first render, the data state after
`flushPromises()`, the empty state, and the error state. Then make the retry test
prove the button actually re-fetches.

### 2. The router, two ways — `tests/LoginForm.spec.ts`

1. With a **real memory router**: disabled submit, redirect to `?redirect=`,
   rejection of an absolute redirect, and the 401 error path.
2. With **`vi.mock('vue-router')`**: assert `push` was called with the right
   argument. Mind the hoisting of `vi.mock`.
3. Decide which one you keep, and why.

### 3. Stubbing — `tests/InvoiceChart.stub.spec.ts`

Stub `InvoiceChart` with a custom stub declaring its props, assert on those
props, then mount without the stub and note what changes. Write down what the
stub made you stop testing.

### 4. Pinia — `tests/CartSummary.spec.ts`

Seed the state with `createTestingPinia`, assert on the real getters, spy on the
actions, then compare with `stubActions: false`.

### 5. Timers and spies — `tests/useDebouncedSearch.spec.ts`

Prove that three keystrokes produce one call, using
`vi.advanceTimersByTimeAsync`. Then write a test using `using` for a spy.

### 6. End-to-end — `cypress/`

1. Implement `getByTestId` and a `cy.session`-based `login` command.
2. Stub `GET /api/invoices` with the fixture and assert on the row count.
3. Simulate a 500 and test the retry.
4. Use `cy.login` in two tests and confirm in the runner that the login flow ran
   only once.

To make `cy.session` actually useful, you will need to persist the token in
`localStorage` in `src/stores/auth.ts`. Do it, and be able to explain why.

## Going further

- Run `npm run test:coverage` and look at what is **not** covered. Decide which
  gaps matter and which do not — coverage is a smell detector, not a target.
- Add a Cypress **component test** for `InvoiceChart`: it is the one component
  jsdom cannot test properly.
- Wire it all into a GitHub Actions workflow (this is the subject of TP 7).
