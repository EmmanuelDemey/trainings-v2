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

## Definition of Done — part 1

Tick every box before closing part 1. The part 2 steps and the "Going further"
section are **not** part of this list.

**It runs**

- [ ] `npm test` is green, with the three part-1 files reporting tests (not zero)
- [ ] `npm run typecheck` exits 0
- [ ] No `.only` and no `.skip` left in `tests/`
- [ ] No `TODO` left in `tests/InvoiceList.spec.ts` (first two tests),
      `tests/InvoiceChart.stub.spec.ts` and `tests/useDebouncedSearch.spec.ts`

**The tests earn their keep**

- [ ] The loading test asserts on the **first render**, with no `await` — and it fails
      if you add one
- [ ] The data test goes through `flushPromises()` and asserts on rendered rows
- [ ] Every element lookup goes through `[data-testid=…]`: no
      `wrapper.find('.some-class')` and no tag selector left in your specs
- [ ] The stub test declares the stub's props and asserts on the props
      `InvoiceChart` receives
- [ ] You mounted the same component **without** the stub and wrote down what the stub
      made you stop testing
- [ ] The debounce test proves three keystrokes produce **one** call, via
      `vi.advanceTimersByTimeAsync`
- [ ] At least one spy is declared with `using`, and it has no matching
      `mockRestore()` / `afterEach` cleanup left

**You can explain**

- [ ] Why the loading test has no `await`
- [ ] What the stub stopped testing, and when that trade is worth it
- [ ] Why fake timers need the **async** advance variant here

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

## Definition of Done — part 2

Part 2 is done when part 1's list still holds **and**:

**It runs**

- [ ] `npm test` is green, part-1 tests included — no regression
- [ ] `npm run e2e` is green against `npm run preview` on the **built** app
- [ ] `npm run typecheck` exits 0
- [ ] `grep -rn TODO tests cypress | grep -v bonus` returns nothing

**The tests earn their keep**

- [ ] The empty and error states come from `server.use(...)` overrides, not from a
      component prop or a stubbed method
- [ ] The retry test proves the button **re-fetches**: it fails if you make the click a
      no-op
- [ ] You checked that removing `resetHandlers()` from `tests/setup.ts` leaks an
      override into a later test
- [ ] `LoginForm` is tested both ways — real memory router **and**
      `vi.mock('vue-router')` — and both are green
- [ ] The real-router tests cover: disabled submit, redirect to `?redirect=`, refusal of
      an absolute redirect, and the 401 path
- [ ] You wrote down which of the two approaches you keep, and why
- [ ] `CartSummary` seeds state with `createTestingPinia`, asserts on the **real**
      getters and spies on the actions
- [ ] You ran the same test with `stubActions: false` and noted what changed
- [ ] `getByTestId` and a `cy.session`-based `login` command exist and are used
- [ ] The Cypress runner shows the login flow ran **once** across two tests
- [ ] The token is persisted in `localStorage` by `src/stores/auth.ts`

**You can explain**

- [ ] Why `cy.session` needs the token in `localStorage` to be useful
- [ ] Why the same response shape has to be mocked in three places, and what drift that
      catches
- [ ] What `stubActions: true` hides from you

## Going further

- Run `npm run test:coverage` and look at what is **not** covered. Decide which
  gaps matter and which do not — coverage is a smell detector, not a target.
- Add a Cypress **component test** for `InvoiceChart`: it is the one component
  jsdom cannot test properly.
- Wire it all into a GitHub Actions workflow (this is the subject of TP 8).
