# TP 1 — Getting started

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> two small functions of a bookshop, and a project with Vitest already
> installed. There is not a single test yet: writing the first ones is the job.

## Goal

Chapter 1 — From zero to a green run:

- Read a **`vitest.config.ts`**: which files are tests, what coverage measures
- Write a first spec file: **`describe`**, **`test`**, **`expect`**
- Run Vitest in **watch** mode, **once** (`vitest run`), and in its **UI**
- Let **coverage** tell you what no test has run yet

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --coverage — red: there is no test file yet
npm run test:watch   # vitest, in watch mode — keep it open
npm run test:ui      # the same, in the browser
npm run typecheck    # tsc --noEmit
```

`npm test` grades this workshop: the coverage **thresholds** of
`vitest.config.ts` ask for every line and every branch of `src/` to be run by
a test. Until then, it exits 1.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Read the config, run Vitest | `vitest.config.ts` | You can say why `npm test` fails |
| 2 | The first test | `src/price.spec.ts` | One green test in the watch mode |
| 3 | `formatPrice` | `src/price.spec.ts` | Its cases are green |
| 4 | `priceInCents` | `src/price.spec.ts` | `npm test` exits 0 — 100 % coverage |
| 5 | The UI and the CLI | — | You ran one test alone, from the CLI and from the UI |

## Steps

### 1. Read the config — `vitest.config.ts`

`include` says which files are tests, `coverage` what is measured and how much
is required. Run `npm test` and read the error: *No test files found*.

→ **Done when** you can say which file name Vitest expects, and where.

### 2. The first test — `src/price.spec.ts`

Create the file, import `describe`, `test` and `expect` from `vitest`, and
`formatPrice` from `./price`. One test: `formatPrice(1250)` is `'€12.50'`.

→ **Done when** `npm run test:watch` shows it green — then break `formatPrice`
on purpose, watch it go red, and put it back.

### 3. `formatPrice`

A round price keeps its two decimals (`800` → `'€8.00'`); a free book is
`'€0.00'`. One test per case, in a `describe('formatPrice')`.

→ **Done when** the three cases are green.

### 4. `priceInCents`

Two decimals, one decimal (`'12.5'` → `1250`), none (`'8'` → `800`), spaces
around, and what is not a price at all — `toThrow` takes the expected message.

→ **Done when** `npm test` exits 0: coverage says **100 %**. If it does not, the
*Uncovered Line #s* column says which line no test has run.

### 5. The CLI and the UI

- `npx vitest run -t "one decimal"` — runs only the tests whose name matches
- `npx vitest run price` — only the files whose path matches
- `npm run test:ui` — run, filter and re-run the same tests from the browser

→ **Done when** you ran a single test alone, both ways.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — every line and branch of `src/` covered

**The behaviour is there**

- [ ] Each test checks one thing, and its name says which
- [ ] The error case asserts the message, not only that something was thrown

**You can explain**

- [ ] The difference between `vitest` and `vitest run`, and which one CI runs
- [ ] What 100 % coverage proves — and what it does not

## Going further

- Move one test into `src/price.ts` itself, as an **in-source** test
  (`import.meta.vitest`, `includeSource` in the config). What must the build do
  to strip it?
- `priceInCents('12.505')` throws. Should it? Write the test that decides.
- Install the Vitest extension of your editor and run a test from the gutter.
