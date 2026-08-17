# TP 4 & 7 — Testing

> This TP is **autonomous**: it does not depend on any other TP. The application
> is provided and working; your job is to fill in the test files, which ship as
> skeletons with `// TODO` markers and pass trivially until you do.

**This single project is used twice in the training:**

| Part | After chapter | Steps | Theme |
|---|---|---|---|
| **Part 1** | 4 — Testing fundamentals | 1a, 3, 5 | components and composables **in isolation** |
| **Part 2** | 7 — Testing in integration & e2e | 1b, 2, 4, 6 | router, Pinia, network, real browser |

Come back to the same clone for part 2 — the tests you wrote in part 1 must still
be green.

## Goal

Cover one small application at every level:

- **Queries and states**: drive a component through loading, data, empty, error
- **Stubbing** a heavy child and asserting on the props it receives
- **Fake timers** and `using` spies for a debounced composable
- **The router**, tested twice: with a real memory router, then with `vi.mock`
- **`createTestingPinia`** for a store-connected component
- **MSW** to mock the network for Vitest
- **Cypress**: `cy.intercept`, fixtures, custom commands, `cy.session`

## Prerequisites

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`
- `npm install` downloads the **Cypress binary** (~250 MB). Skip it with
  `CYPRESS_INSTALL_BINARY=0 npm install` if you only want the Vitest steps —
  **part 1 does not need Cypress at all**.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the app, to see what you are testing
npm test             # vitest run
npm run test:watch   # re-runs on change
npm run typecheck    # vue-tsc --noEmit
```

For the end-to-end part (part 2 only):

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

> The MSW server is already wired in `tests/setup.ts` and serves the happy path.
> In part 1 you just benefit from it; in part 2 you override it per test.

---

# Part 1 — after chapter 4 (fundamentals)

### Step 1a. Loading and data — `tests/InvoiceList.spec.ts`

The first two tests only. Assert the loading state on the **first render** (no
`await` — that is the point), then the data state after `flushPromises()`.
Query with `data-testid`, never with CSS classes.

Leave the *empty* and *error* tests for part 2.

### Step 3. Stubbing — `tests/InvoiceChart.stub.spec.ts`

Stub `InvoiceChart` with a custom stub declaring its props, assert on those
props, then mount without the stub and note what changes. Write down what the
stub made you stop testing.

### Step 5. Timers and spies — `tests/useDebouncedSearch.spec.ts`

Prove that three keystrokes produce one call, using
`vi.advanceTimersByTimeAsync`. Then write a test using `using` for a spy.
`useDebouncedSearch` takes its `search` function as an argument — no HTTP mock
needed, just a `vi.fn()`.

**Checkpoint** — `npm test` green on three files, and you can explain why the
loading test has no `await`.

---

# Part 2 — after chapter 7 (integration & e2e)

### Step 1b. Empty and error with MSW — `tests/InvoiceList.spec.ts`

Back to the same file. Override the default handler with `server.use(...)` to
return an empty list, then a 500. Make the retry test prove the button actually
re-fetches — `resetHandlers()` in `tests/setup.ts` undoes the override
afterwards.

### Step 2. The router, two ways — `tests/LoginForm.spec.ts`

1. With a **real memory router**: disabled submit, redirect to `?redirect=`,
   rejection of an absolute redirect, and the 401 error path.
2. With **`vi.mock('vue-router')`**: assert `push` was called with the right
   argument. Mind the hoisting of `vi.mock`.
3. Decide which one you keep, and why.

### Step 4. Pinia — `tests/CartSummary.spec.ts`

Seed the state with `createTestingPinia`, assert on the real getters, spy on the
actions, then compare with `stubActions: false`.

### Step 6. End-to-end — `cypress/`

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
- Wire it all into a GitHub Actions workflow (this is the subject of TP 8).
