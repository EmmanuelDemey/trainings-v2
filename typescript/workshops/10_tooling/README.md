# TP 10 — Tooling

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> a small workspace — a `core` package of sales statistics and a `cli` that
> prints them — compiled as one project, with `strict` and nothing more.
> Tighten the compiler, fix what it finds, and split the workspace into
> **project references**.

## Goal

Chapter 10 — Tooling:

- Go **beyond `strict`**: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Fix the **real bugs** those flags find — without `!` or `as`
- Share options with **`extends`**
- Split a workspace into **project references**, and build it with **`tsc -b`**
- Read a build with **`--verbose`**, `--extendedDiagnostics`, `--showConfig`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm start            # node packages/cli/src/main.ts — the report
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc -b
```

`tests/sales.spec.ts`, `tests/types.test-d.ts` (type-level specs, checked by
`vitest --typecheck`) and `tests/build.spec.ts` are given and **red**. Keep
`npm run test:watch` open.

Run `npm start` first: look at the `by region` line. `npm run typecheck` is
green all the same.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Turn on two stricter flags | `tsconfig.base.json` | The type specs are green, and `npm run typecheck` lists errors |
| 2 | Fix the bugs they find | `packages/core/src/sales.ts` | `tests/sales.spec.ts` is green, and so is `npm run typecheck` |
| 3 | Split the workspace into project references | `tsconfig.json`, `packages/*/tsconfig.json` | `tests/build.spec.ts` is green |
| 4 | Read the build | — | You can say what `tsc -b` skipped on its second run, and why |

## Steps

### 1. Beyond `strict` — `tsconfig.base.json`

Add the two flags `strict` does **not** turn on:

- `noUncheckedIndexedAccess` — `array[i]` and `record[key]` may be `undefined`
- `exactOptionalPropertyTypes` — `currency?: string` may be **left out**, but
  not set to `undefined`

Run `npm run typecheck`, and read the three errors before fixing any.

→ **Done when** the four type specs are green.

### 2. Fix the bugs — `packages/core/src/sales.ts`

Each error points at a bug the specs confirm:

- `topSeller([])` crashes on `sorted[0].sku`
- `totalsByRegion` adds a number to `undefined` — the `NaN` of `npm start`
- `formatTotalFromEnv` passes `{ currency: undefined }`, which **overrides** the
  default `'EUR'` in the spread

Fix them in the code, **not** in the types: no `!`, no `as`, no
`| undefined` added to `ReportOptions`.

→ **Done when** `tests/sales.spec.ts` is green, and so is `npm run typecheck`.

### 3. Project references — `tsconfig.json`, `packages/*/tsconfig.json`

One project compiles everything, every time. Split it:

1. `packages/core/tsconfig.json` — `extends` the base; `composite: true`,
   `rootDir: "./src"`, `outDir: "./dist"`, `emitDeclarationOnly: true` (Node.js
   runs the sources: only the declarations are needed)
2. `packages/cli/tsconfig.json` — the same, plus
   `"references": [{ "path": "../core" }]`
3. `tsconfig.json` — `"files": []`, and a `references` to both packages

`tsc -b` builds the references **first**, and checks the cli against the
core's `.d.ts` — not its sources.

→ **Done when** `tests/build.spec.ts` is green.

### 4. Read the build

```bash
npx tsc -b --verbose                        # what is built, what is skipped, why
npx tsc -b --verbose                        # again: nothing to do
npx tsc -p packages/core --showConfig       # the options, extends resolved
npx tsc -p packages/core --extendedDiagnostics --noEmit false
```

Touch `packages/cli/src/main.ts`, rebuild with `--verbose`: which project is
rebuilt, and which is not? What does `tsconfig.tsbuildinfo` hold?

→ **Done when** you can answer both questions.

### 5. *(Bonus)* — type tests of your own

Add a spec to `tests/types.test-d.ts` that checks `topSeller` returns
`string | undefined`, and one that checks `average` refuses a `Sale` without
its `amount` — with `// @ts-expect-error`.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the eighteen specs
- [ ] `npm start` prints a total for each region — no `NaN`
- [ ] `grep -rn TODO packages tsconfig*.json` returns nothing

**The behaviour is there**

- [ ] `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on, for every package
- [ ] No `!` and no `as` in `packages/`
- [ ] The root `tsconfig.json` compiles nothing itself
- [ ] A second `tsc -b` has nothing to do

**You can explain**

- [ ] Why `strict` alone let the three bugs through
- [ ] The difference between `currency?: string` and `currency: string | undefined`
      under `exactOptionalPropertyTypes`
- [ ] What `composite` demands, and what `tsc -b` gains from it
- [ ] Why the cli is checked against `core/dist/*.d.ts`, not `core/src`

## Going further

- Install `typescript-eslint` and turn on `no-floating-promises` and
  `no-unnecessary-condition`: what do they find that `tsc` does not?
- Run `npx tsc -p packages/core --generateTrace trace --noEmit false`, then
  `npx @typescript/analyze-trace trace`.
- Add `"isolatedDeclarations": true` to the core: which export lacks an explicit type?
