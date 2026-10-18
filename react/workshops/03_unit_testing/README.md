# TP 3 — Unit testing with Vitest and Testing Library

> This TP is **autonomous**: it does not depend on any other TP. The application
> is provided and working; your job is to write its tests. The spec files ship
> as lists of `it.todo`, green from the start and asserting nothing, until you
> fill them.

## Goal

Chapter 3 — Cover one small React application with tests that would actually
catch a regression:

- **Pure functions** with `expect`, `it.each` and an **inline snapshot**
- **Spies** declared with `using`, to silence and assert on `console.warn`, and to
  make `Math.random` deterministic
- **Components** rendered with Testing Library and queried **by role**, the way a
  user finds them
- **User interactions** with `user-event`
- **Fake timers** for a debounced search
- **Sabotage**: break the source on purpose, and check that the right test goes red

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the app, to see what you are testing
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode — keep it open
```

Nothing grades this workshop for you: `npm test` is green on the starter
(`25 todo`), and would stay green with tests that assert nothing. **Step 6** is
what tells you whether your tests are worth anything.

**Already done for you:**

- The application, correct and finished: a searchable table of Star Wars people, and
  a "Pick a random person" button
  - `src/utils/format.ts` — `formatHeight` (`"172"` → `"1.72 m"`, warns on bad data)
    and `formatMass`
  - `src/utils/filterPeople.ts` — the search: trimmed, case-insensitive
  - `src/utils/random.ts` — `pickRandom`, built on `Math.random`
  - `src/hooks/useDebouncedValue.ts` — the table follows the input only after
    `SEARCH_DELAY` (300 ms) without a keystroke
  - `src/components/PeopleTable.tsx`, `src/components/RandomPerson.tsx`, `src/App.tsx`
- Vitest with jsdom, `@testing-library/jest-dom` matchers (`toBeInTheDocument`,
  `toHaveTextContent`…) and the cleanup after each test: `vitest.config.ts` and
  `src/tests/setup.ts`
- The five spec files, with the name of every test to write and a hint on top

## The workshop at a glance

| # | What you write | Where | Done when |
|---|---|---|---|
| 1 | Pure-function tests, a `using` spy, an inline snapshot | `src/utils/format.spec.ts` | 10 tests, and no warning printed in the test output |
| 2 | One behaviour per test | `src/utils/filterPeople.spec.ts` | 6 tests |
| 3 | A component, queried by role | `src/components/PeopleTable.spec.tsx` | 4 tests, no CSS selector |
| 4 | Clicks, and a deterministic `Math.random` | `src/components/RandomPerson.spec.tsx` | 3 tests, two `using` spies |
| 5 | Fake timers and a debounce | `src/App.spec.tsx` | 4 tests, running in milliseconds |
| 6 | Four mutations of the source, one at a time | `src/` | Each one turned a test red, and `git diff src/` shows only specs |

## Steps

### 1. Pure functions — `src/utils/format.spec.ts`

1. Write the `formatHeight` and `formatMass` tests: one input, one `expect(…).toBe(…)`.
2. Cover `undefined` and `'unknown'` with a single `it.each([undefined, 'unknown'])`.
3. `formatHeight('tall')` prints a warning. Declare
   `using warn = vi.spyOn(console, 'warn').mockImplementation(() => {})`: the
   warning disappears from the output, you can assert it with
   `toHaveBeenCalledExactlyOnceWith(…)`, and the spy is restored at the end of the
   block — no `mockRestore()`, no `afterEach`.
4. Map four heights through `formatHeight` and end with an **empty**
   `toMatchInlineSnapshot()`: run the tests, and read what Vitest wrote into your
   spec. Review it as you would review code.

→ **Done when** the 10 tests of the file pass, the test output shows no
`Unparsable height` warning, and the snapshot sits inline in the spec.

### 2. One behaviour per test — `src/utils/filterPeople.spec.ts`

Import `people` from `../data/people` and write the six tests. Each one must fail
for **one** reason only: compare the names (`map(({ name }) => name)`), not whole
objects, and keep one `expect` per behaviour.

→ **Done when** the 6 tests pass, and each test name says the behaviour it checks.

### 3. A component — `src/components/PeopleTable.spec.tsx`

1. `render(<PeopleTable people={people} />)`, then find the table by its accessible
   name — `getByRole('table', { name: 'Star Wars people' })` — and count its rows
   with `within(table).getAllByRole('row')`.
2. Find Luke's row with `getByRole('row', { name: /luke skywalker/i })`, and its
   cells with `within(row).getByRole('cell', { name: '1.72 m' })`.
3. With an empty list: the `status` message is there and the `table` is not — use
   `queryByRole` for an element that must be **absent**.
4. Snapshot the row of a single person with `toMatchInlineSnapshot()`.

→ **Done when** the 4 tests pass with no `querySelector` and no class name in the
spec.

### 4. Interactions and a deterministic spy — `src/components/RandomPerson.spec.tsx`

1. `const user = userEvent.setup()` **before** `render`, then
   `await user.click(screen.getByRole('button', { name: 'Pick a random person' }))`.
2. `using _random = vi.spyOn(Math, 'random').mockReturnValue(0.7)`: work out which
   person `Math.floor(0.7 × 5)` lands on, and assert it is shown. The `_` prefix
   says the binding is never read.
3. The edges: `mockReturnValueOnce(0).mockReturnValueOnce(0.99)`, two clicks — the
   first and the last person — and `toHaveBeenCalledTimes(2)` on the spy.

→ **Done when** the 3 tests pass, run in any order, and leave `Math.random` real for
the next file.

### 5. Fake timers — `src/App.spec.tsx`

1. `beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))` and
   `afterEach(() => vi.useRealTimers())`. `shouldAdvanceTime` keeps the fake clock
   moving along with the real one: Testing Library's async `act` waits on a
   `setTimeout(0)` that a frozen clock would never fire.
2. `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`: user-event pauses
   between keystrokes with timers too.
3. Type, then move the clock with `act(() => vi.advanceTimersByTime(SEARCH_DELAY))`
   — `act`, because the timer updates React state. Import `SEARCH_DELAY`; never
   write `300` in the spec.
4. For *does not filter while the user is still typing*: type `v`, advance **half**
   the delay, type `ader`, advance half the delay again — still six rows. Why does
   that prove more than typing `vader` in one go?

→ **Done when** the 4 tests pass, and the whole file runs in milliseconds, not
seconds.

### 6. Sabotage — check that the tests can fail

Every test you wrote started as a green `todo`. A test that asserts nothing and a
test that asserts something look exactly alike in the runner: a green tick. The
only way to tell them apart is to **break the source on purpose**.

Keep `npm run test:watch` open, apply **one** mutation at a time and revert it
before the next:

| Break this | Where | What must go red |
|---|---|---|
| `toFixed(2)` → `toFixed(1)` | `src/utils/format.ts` | the `formatHeight` tests, the snapshot, the table cell |
| remove `.trim()` | `src/utils/filterPeople.ts` | *ignores the spaces around the query* |
| `return () => clearTimeout(timer)` → `return () => {}` | `src/hooks/useDebouncedValue.ts` | *does not filter while the user is still typing* |
| `Math.floor` → `Math.round` | `src/utils/random.ts` | both random-draw tests — 0.7 and 0.99 now land elsewhere |

Read the failure, not just the colour: a test that goes red for the **wrong**
reason (a timeout, a `TypeError`, a snapshot of the whole page) is barely more
useful than one that never fails at all.

The interesting case is a mutation that leaves everything green: that behaviour is
**not** covered, whatever the test names claim. Fix the *test*, keep the mutation
until it is red, then revert it.

→ **Done when** the four mutations each turned the expected test red, for the
expected reason, and `git diff src/` shows nothing but spec files.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It runs**

- [ ] `npm test` exits 0 with **no** `todo` left — 27 tests across the 5 files
- [ ] `npm run typecheck` exits 0
- [ ] No `.only`, no `.skip`, and `grep -rn TODO src` returns nothing
- [ ] The test output prints no warning and no React `act(…)` warning

**The tests earn their keep**

- [ ] Every element lookup goes through `getByRole` / `getByLabelText` / `getByText`,
      with `within` to scope it: no `querySelector`, no class name
- [ ] Every spy is declared with `using`, with no `mockRestore()` and no
      `afterEach(vi.restoreAllMocks)` left
- [ ] The two inline snapshots were written by Vitest and read by you
- [ ] The debounce tests move a fake clock: none of them waits 300 real milliseconds
- [ ] You ran the four mutations of step 6, one at a time: each one turned the
      expected test red — and `git diff src/` shows only specs

**You can explain**

- [ ] Why `getByRole` is a better query than `getByTestId`, and when `queryBy…` is the right one
- [ ] What `using` does at the end of a block, and what a forgotten `mockRestore()` breaks
- [ ] Why advancing the clock is wrapped in `act`
- [ ] When a snapshot is a good assertion, and when it is a rubber stamp

## Going further

- Test `useDebouncedValue` on its own with `renderHook` and `rerender({ value })` —
  the subject of chapter 11.
- Install `@vitest/coverage-v8` and run `npx vitest run --coverage`: which lines are
  not covered, and do they matter? Coverage finds untested code; only mutations
  tell you the tested code is *checked*.
- Try `npx stryker init` with the Vitest runner: it automates step 6 over the whole
  project.
- Replace `toMatchInlineSnapshot` with `toMatchSnapshot` and look at the
  `__snapshots__/` file it creates. Which one would you rather review in a pull
  request?
