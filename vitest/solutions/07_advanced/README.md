# TP 7 — Advanced

> This TP is **autonomous**: it does not depend on any other TP. The stock of
> the bookshop lives in a JSON file; a typed event bus tells who sold what; two
> searches look a book up. The runtime specs are given; the fixtures they need,
> the config that splits them, the type-level specs and the benchmark are not.

## Goal

Chapter 7 — Organise a test suite:

- Share setup and teardown with **`test.extend`** fixtures and **`onCleanup`**
- Split the suite into **projects**: `unit` and `integration`
- Test **types** with **`expectTypeOf`** and **`@ts-expect-error`** in `*.test-d.ts`
- Compare two implementations with a **benchmark**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test                  # vitest run — every project
npm run test:unit         # vitest run --project unit
npm run test:integration  # vitest run --project integration
npm run bench             # vitest bench --run
npm run typecheck         # tsc --noEmit
```

`tests/inventory.integration.spec.ts` is red: its fixtures throw.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The `folder` and `inventory` fixtures | `tests/fixtures.ts` | The integration specs are green |
| 2 | Two projects, and the typecheck | `vitest.config.ts` | `npm run test:unit` runs no file of the other project |
| 3 | The type-level specs | `tests/events.test-d.ts` | `npm test` exits 0, *Type Errors: no errors* |
| 4 | The benchmark | `tests/search.bench.ts` | `npm run bench` exits 0 |

## Steps

### 1. The fixtures — `tests/fixtures.ts`

`base.extend('folder', async ({}, { onCleanup }) => { … return folder })`: create
it with `mkdtemp`, remove it in `onCleanup`. `inventory` depends on `folder` —
ask for it in its first argument.

→ **Done when** the integration specs are green, including "removes it after the test".

### 2. Two projects — `vitest.config.ts`

`test.projects`: one `{ test: { name: 'unit', include, typecheck } }`, one for
`integration` with `fileParallelism: false`. The type-level specs:
`typecheck: { enabled: true, include: ['tests/**/*.test-d.ts'], tsconfig: './tsconfig.test.json' }`.

→ **Done when** `npm run test:unit` and `npm run test:integration` each run their half.

### 3. The type-level specs — `tests/events.test-d.ts`

`expectTypeOf(x).toEqualTypeOf<…>()`, `.parameters`, `.toExtend<…>()`. What must
**not** compile: one `// @ts-expect-error` above each call — if the line ever
compiles, the spec goes red.

→ **Done when** `npm test` exits 0 and reports *Type Errors: no errors*. Break
`emit`'s signature to see one go red.

### 4. The benchmark — `tests/search.bench.ts`

`test('…', async ({ bench }) => { const result = await bench.compare(bench('linearFind', …), bench('binaryFind', …)); … })`,
then `expect(result.get('binaryFind')).toBeFasterThan(result.get('linearFind'))`.

→ **Done when** `npm run bench` exits 0 and prints the two rates.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — runtime and type specs
- [ ] `npm run bench` exits 0

**The behaviour is there**

- [ ] No temporary folder is left behind after a run
- [ ] A test that does not ask for `inventory` creates no file

**You can explain**

- [ ] Fixtures vs `beforeEach`
- [ ] Why `npm run typecheck` is green on the starter while the type specs are red
- [ ] Why the benchmark is not part of `npm test`

## Going further

- Give `folder` the `{ scope: 'file' }` option: what breaks, and why?
- Add a `browser` project that runs one spec in Chromium
  (`@vitest/browser-playwright`).
