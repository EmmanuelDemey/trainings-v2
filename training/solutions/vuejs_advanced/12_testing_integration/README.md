# TP 12 — Testing in integration & end-to-end

> This TP is **autonomous**: it does not depend on any other TP, and in
> particular not on TP 3. The app you are handed is **already unit-tested** —
> `tests/TicketTable.spec.ts` is given and green. Everything you write here sits
> *above* that level: with the router, with the store, with the network.

## Goal

Chapter 12 — Test the parts a unit test cannot reach:

- Mount with the **real router** on a memory history — and know when to
  `vi.mock` it instead
- Drive a component through its store with **`createTestingPinia`**: spied
  actions, `initialState`, and `stubActions: false` when you want the real thing
- Mock HTTP **one layer lower** with **MSW**, so your own `fetch` code runs
- Write a **Cypress** journey with `cy.intercept`, aliases, `cy.session` — and no
  fixed waits

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- `npm install` downloads the **Cypress binary** (~250 MB). Steps 1 to 3 do not
  need it: `CYPRESS_INSTALL_BINARY=0 npm install` if the room's Wi-Fi is the
  enemy, then install it properly before step 4.

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
npm run e2e:open     # in another terminal — or `npm run e2e` headless
```

## The three mocking layers

| Layer | Used by | Where |
|---|---|---|
| `window.fetch` patch | `npm run dev` / `preview` | `src/api/fakeBackend.ts` |
| **MSW** | Vitest | `tests/msw.ts`, started by `tests/setup.ts` |
| **`cy.intercept`** | Cypress | `cypress/e2e/*.cy.ts` |

Three mechanisms, **one contract**. Change a response shape and all three have to
agree — which is exactly the drift these tests exist to catch.

They are also mutually exclusive. The fake backend steps aside under Cypress
(`if (!('Cypress' in window))` in `src/main.ts`): it patches `window.fetch` and
answers `/api/*` before the request ever reaches the network — the very layer
`cy.intercept` listens on. Leave it installed and every `cy.wait('@tickets')`
fails with *"No request ever occurred"*, because none did.

## What you are handed

```
tests/TicketTable.spec.ts             GIVEN, green — the unit level, already done
tests/helpers.ts                      freshRouter(), mountApp(), mountStandalone()
tests/msw.ts + tests/setup.ts         the happy path, reset after every test
tests/router.spec.ts                  STEP 1  — to write
tests/loginView.mockedRouter.spec.ts  STEP 1b — to write
tests/session.spec.ts                 STEP 2  — to write
tests/tickets.spec.ts                 STEP 3  — to write
cypress/                              STEPS 4 & 5 — to write
```

Read `tests/TicketTable.spec.ts` first. It is the contract the specs you write
must **not** duplicate: nothing below is about rendering a row.

## The workshop at a glance

| # | What you write | Where | Done when |
|---|---|---|---|
| 1a | The guard, exercised by a real memory router | `tests/router.spec.ts` | Signed out, `/tickets` lands on login with `query.redirect` |
| 1b | The login view with the router replaced by two stubs | `tests/loginView.mockedRouter.spec.ts` | You can name what 1a catches and this cannot |
| 2 | A store-connected badge, on seeded state and spied actions | `tests/session.spec.ts` | The assertions survive `stubActions` being flipped, and you chose one |
| 3 | The network, intercepted below your own `fetch` | `tests/tickets.spec.ts` | Happy path, empty, 500 and a write — with no stale rows on the error |
| 4 | A sign-in command the next spec can restore | `cypress/support/commands.ts` | The runner shows the form filled **once** across two tests |
| 5 | The whole journey, on the built app | `cypress/e2e/triage.cy.ts` | `npm run e2e` is green, with not one `cy.wait(number)` in the file |

**`npm test` starts green here** — the specs you have to write are `it.todo`s,
and an empty test is a passing test. What tells you the suite is worth anything
is step 6: sabotage the source and watch the right test, and only it, go red.

## Steps

### 1. The router, twice — `tests/router.spec.ts` + `tests/loginView.mockedRouter.spec.ts`

**1a — the guard, for real.** `freshRouter()` gives you a router on
`createMemoryHistory()`: the real guard runs, and there is no browser URL to
reset between tests. Assert that `/tickets` while signed out lands on `login`
with `query.redirect`, and that a signed-in agent goes straight through.

**1b — the mocked router** (`tests/loginView.mockedRouter.spec.ts`).
`LoginView` only calls `useRouter().push()` and reads `route.query`, so two stubs
replace the whole router:

```ts
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ query: { redirect: '/tickets/2' } }),
}));
```

`vi.mock` is hoisted for the whole **module**, which is why it needs its own
file. Then answer, in the Definition of Done: **what does the real-router
version catch that this one cannot?**

→ **Done when** the guard and the mocked version are both green, and you can
state what the mocked one stopped covering.

### 2. Pinia — `tests/session.spec.ts`

```ts
const pinia = createTestingPinia({
  createSpy: vi.fn,                        // not optional with Vitest
  initialState: { session: { session } },  // keyed by store id
});
```

1. `SessionBadge` on a session, and without one — driven by `initialState`
   alone, no network in sight.
2. Clicking "Sign out" calls the action. Every action is **stubbed and spied** by
   default, so the state does **not** change. Assert both.
3. Do it again with `stubActions: false` and watch the real action run. Say which
   of the two you want here, and why.

→ **Done when** the badge is driven by `initialState` alone, the sign-out spy is
asserted, and you have run the same test both ways.

### 3. The network — `tests/tickets.spec.ts`

MSW intercepts the request itself, so your own `fetch` code runs: the URL, the
method, the JSON parsing, the status handling. A `vi.mock` of `@/api/client`
would have skipped all of it.

1. The happy path — the default handlers already serve it.
2. The empty queue: `server.use(http.get('/api/tickets', () => HttpResponse.json([])))`,
   and assert the empty **state**, not an empty table.
3. The failure: a 500, the error message, and **no stale rows left on screen**.
4. Closing a ticket goes through the network too — assert the row's new status.
5. Delete a handler and read the failure: `onUnhandledRequest: 'error'` is what
   turns "the test hangs" into "you forgot a handler".

→ **Done when** the four cases are covered through MSW overrides, and the 500
leaves **no** stale rows on screen.

### 4. The Cypress command — `cypress/support/commands.ts`

`cy.signIn()` takes an agent through the form once. Intercept
`POST /api/session`, alias it, and **wait on the alias**. Then wrap it in
`cy.session('agent', …)` so the next spec restores it instead of logging in
again — which works here because the store persists its token to
`localStorage`.

→ **Done when** the command waits on its alias, never on a number, and the
runner shows the form filled once across two tests.

### 5. The journey — `cypress/e2e/triage.cy.ts`

Sign in, read the queue, open a ticket, and check the error state. Serve the
list from `cypress/fixtures/tickets.json`.

> **Not one `cy.wait(number)` in the file.** A fixed wait is either flaky or
> slow, usually both. Wait on an alias, or on an assertion.

→ **Done when** `npm run e2e` is green against `npm run preview` on the built
app, with no numeric wait anywhere in `cypress/`.

### 6. *(Bonus)* Sabotage

Break the source on purpose, one change at a time, and check that the **right**
test goes red — and only it:

- make the guard return `true` unconditionally
- have `close()` not replace the ticket in the list
- return a 500 from the fake backend for `/api/tickets`
- rename `data-testid="ticket-row"`

A test that stays green on a sabotage was testing nothing.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0, with **no `it.todo` left**
- [ ] `npm run build` succeeds
- [ ] `npm run e2e` is green against `npm run preview`

**The router**

- [ ] A signed-out visit to `/tickets` lands on `login`, with `redirect` in the query
- [ ] A signed-in agent goes through
- [ ] The mocked-router spec lives in its own file, and you can say what it misses

**Pinia**

- [ ] `SessionBadge` is driven by `initialState`, with no network
- [ ] The default stubbed action is asserted **on the spy**, and the state does not move
- [ ] The `stubActions: false` variant shows the state moving, and you chose between them

**The network**

- [ ] Happy path, empty queue and 500 are three separate specs
- [ ] The error case asserts that the old rows are **gone**
- [ ] You saw the message `onUnhandledRequest: 'error'` produces

**End-to-end**

- [ ] `cy.signIn()` exists, intercepts, aliases and waits on the alias
- [ ] `cy.session` makes the second spec skip the form
- [ ] The suite contains **no** `cy.wait(<number>)`
- [ ] The queue is served from a fixture at least once

**You can explain**

- [ ] When you would mock the router and when you would build a real one
- [ ] What `createTestingPinia` stubs by default, and what `stubActions: false` changes
- [ ] Why MSW catches bugs a `vi.mock` of the API module cannot
- [ ] Why the fake backend has to step aside under Cypress

## Going further

- Add an `AbortSignal` to `load()` and write the spec for a navigation that
  cancels an in-flight request.
- Move the MSW handlers into a package shared by Vitest **and** the browser
  (`msw/browser`), and delete `fakeBackend.ts`. What do you gain, what do you lose?
- Add `cy.intercept` with a delay and assert the loading state — without a fixed wait.
- Run the Vitest suite with `--coverage` and find the line no test reaches. Decide
  whether it deserves one.
