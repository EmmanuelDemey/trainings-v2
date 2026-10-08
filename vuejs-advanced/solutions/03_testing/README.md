# TP 3 — Testing fundamentals

> This TP is **autonomous**: it does not depend on any other TP. The application
> is provided and working; your job is to fill in the test files, which ship as
> skeletons with `// TODO` markers and pass trivially until you do.

This is the chapter-3 workshop: components and composables **in isolation**.

## Goal

Cover one small application with unit tests:

- **Queries and states**: drive a component through its loading and data states
- **Stubbing** a heavy child and asserting on the props it receives
- **Fake timers** and `using` spies for a debounced composable
- **MSW** answering the network for Vitest, so no test mocks our own code
- **Sabotage**: break the source on purpose, and check that the right test — and
  only it — goes red

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the app, to see what you are testing
npm test             # vitest run
npm run test:watch   # re-runs on change
npm run typecheck    # vue-tsc --noEmit
```

## The two mocking layers

| Layer | Used by | Where |
|---|---|---|
| `window.fetch` patch | `npm run dev` / `preview` | `src/api/fakeBackend.ts` |
| **MSW** | Vitest | `tests/msw.ts` |

Two mechanisms, **one contract**. If you change a response shape, both have to
agree — which is exactly the kind of drift these tests are meant to catch.

> The MSW server is already wired in `tests/setup.ts` and serves the happy path:
> you just benefit from it. Every test in this workshop relies on that default;
> a test that one day needs another answer can swap a handler with `server.use(...)`,
> and the `resetHandlers()` already in the setup undoes it after that test.

## The workshop at a glance

| # | What you write | Where | Done when |
|---|---|---|---|
| 1 | The loading state, then the data state | `tests/InvoiceList.spec.ts` | The loading assertion runs with **no** `await`, and adding one breaks it |
| 2 | A custom stub, and assertions on the props it receives | `tests/InvoiceChart.stub.spec.ts` | You can name what the stub stopped testing |
| 3 | Fake timers and a `using` spy | `tests/useDebouncedSearch.spec.ts` | Three keystrokes provably produce one call |
| 4 | Three mutations of the source, one at a time | `src/` | Each one turned the expected test red, and `git diff src/` is empty again |

Nothing here is graded by a green `npm test` alone: every spec you have to write
**starts green and asserts nothing** (the few tests marked *given* are already
written, as worked examples). Step 4 is what tells you whether the tests you
wrote before it are worth anything.

---

## Steps

### Step 1. Loading and data — `tests/InvoiceList.spec.ts`

Assert the loading state on the **first render** (no `await` — that is the
point), then the data state after `flushPromises()`. Query with `data-testid`,
never with CSS classes.

→ **Done when** the loading assertion runs on the first render with no `await`,
the data assertion runs after `flushPromises()`, and every lookup goes through
`[data-testid=…]`.

### Step 2. Stubbing — `tests/InvoiceChart.stub.spec.ts`

Stub `InvoiceChart` with a custom stub declaring its props, and assert on those
props. The second test — the same mount **without** the stub — is given: read it,
and its comment, for what the stub made you stop testing.

→ **Done when** the spec asserts on the props `InvoiceChart` receives, and you
can say what the given no-stub test shows.

### Step 3. Timers and spies — `tests/useDebouncedSearch.spec.ts`

Prove that three keystrokes produce one call, using
`vi.advanceTimersByTimeAsync`. Then write a test using `using` for a spy.
`useDebouncedSearch` takes its `search` function as an argument — no HTTP mock
needed, just a `vi.fn()`. The "clears the results" test in between is given, as a
second example of the same timer dance.

→ **Done when** three keystrokes provably produce **one** call, and at least one
spy is declared with `using` and has no `mockRestore()` left beside it.

### Step 4. Sabotage — check that the tests can fail

Every spec you write starts green, with no assertion in it. A test that
asserts nothing and a test that asserts something look exactly alike in the
runner: a green dot. The only way to tell them apart is to **break the source on
purpose** and watch the runner go red.

Keep `npm run test:watch` open, apply **one** mutation at a time and revert it
before the next — `git diff src/` must be empty when you are done.

| Break this | Where | What must go red |
|---|---|---|
| `loading` starts at `false` instead of `true` | `src/components/InvoiceList.vue` | the loading test |
| pass `:currency="'USD'"` to `<InvoiceChart>` | `src/components/InvoiceList.vue` | the stub test, on `props('currency')` |
| delete the `clearTimeout(timer)` line | `src/composables/useDebouncedSearch.ts` | the debounce test — three calls instead of one |

Read the failure, not just the colour: a test that goes red for the **wrong**
reason (a `TypeError`, an unhandled rejection, a snapshot of the whole DOM) is
barely more useful than one that never fails at all.

The interesting case is a mutation that leaves everything green: that behaviour
is **not** covered, whatever the test names claim. Fix the *test*, keep the
mutation in place until it is red, then revert it.

> This is mutation testing, done by hand — Stryker automates it over a whole
> project. What matters here is the reflex: a test is not finished until you have
> seen it fail.

→ **Done when** the three mutations each turned the expected test red, for the
expected reason, and `git diff src/` is empty again.

## Definition of Done

Tick every box before closing the workshop. The "Going further" section is
**not** part of this list.

**It runs**

- [ ] `npm test` is green, with the three spec files reporting tests (not zero)
- [ ] `npm run typecheck` exits 0
- [ ] No `.only` and no `.skip` left in `tests/`
- [ ] `grep -rn TODO tests | grep -v bonus` returns nothing

**The tests earn their keep**

- [ ] The loading test asserts on the **first render**, with no `await` — and it fails
      if you add one
- [ ] The data test goes through `flushPromises()` and asserts on rendered rows
- [ ] Every element lookup goes through `[data-testid=…]`: no
      `wrapper.find('.some-class')` and no tag selector left in your specs
- [ ] The stub test declares the stub's props and asserts on the props
      `InvoiceChart` receives
- [ ] You read the given no-stub test and can say what the stub made you stop
      testing
- [ ] The debounce test proves three keystrokes produce **one** call, via
      `vi.advanceTimersByTimeAsync`
- [ ] At least one spy is declared with `using`, and it has no matching
      `mockRestore()` / `afterEach` cleanup left
- [ ] You ran the three mutations of step 4, one at a time: each one turned the
      expected test red, for the expected reason — and `git diff src/` is empty again

**You can explain**

- [ ] Why the loading test has no `await`
- [ ] What the stub stopped testing, and when that trade is worth it
- [ ] Why fake timers need the **async** advance variant here

## Going further

- Run `npm run test:coverage` and look at what is **not** covered. Decide which
  gaps matter and which do not — coverage is a smell detector, not a target.
- Wire it all into a GitHub Actions workflow (this is the subject of TP 16).
