# TP 10 — Tooling

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> a small Vite + React app — a `SalesReport` component and the sales statistics
> it renders — compiled as one project, browser code and Node.js code alike,
> with `strict` and nothing more. Tighten the compiler, fix what it finds, and
> split the app into **project references**: `tsconfig.app.json` and
> `tsconfig.node.json`, as `npm create vite` does.

## Goal

Chapter 10 — Tooling:

- Go **beyond `strict`**: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Fix the **real bugs** those flags find — without `!` or `as`
- Share options with **`extends`**
- Split an app into **project references** — the browser code and the tools'
  config — and build it with **`tsc -b`**
- Read a build with **`--verbose`**, `--extendedDiagnostics`, `--showConfig`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # vite — the report, in the browser
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc -b
```

`tests/sales.spec.tsx`, `tests/SalesReport.spec.tsx`, `tests/types.test-d.tsx`
(type-level specs, checked by `vitest --typecheck`) and `tests/build.spec.tsx`
are given and **red**. Keep `npm run test:watch` open.

Run `npm run dev` first, and open the page: look at the `By region` list.
`npm run typecheck` is green all the same.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Turn on two stricter flags | `tsconfig.base.json` | The type specs are green, and `npm run typecheck` lists errors |
| 2 | Fix the bugs they find | `src/sales.ts`, `src/SalesReport.tsx` | `tests/sales.spec.tsx` and `tests/SalesReport.spec.tsx` are green, and so is `npm run typecheck` |
| 3 | Split the app into `tsconfig.app.json` and `tsconfig.node.json` | `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | `tests/build.spec.tsx` is green |
| 4 | Read the build | — | You can say what `tsc -b` skipped on its second run, and why |

## Steps

### 1. Beyond `strict` — `tsconfig.base.json`

Add the two flags `strict` does **not** turn on:

- `noUncheckedIndexedAccess` — `array[i]` and `record[key]` may be `undefined`
- `exactOptionalPropertyTypes` — `currency?: string` may be **left out**, but
  not set to `undefined`

Run `npm run typecheck`, and read the three errors before fixing any.

→ **Done when** the four type specs are green.

### 2. Fix the bugs — `src/sales.ts`, `src/SalesReport.tsx`

Each error points at a bug the specs confirm:

- `topSeller([])` crashes on `sorted[0].sku`
- `totalsByRegion` adds a number to `undefined` — the `NaN` of `npm run dev`
- `<SalesReport sales={sales} />` passes `{ currency: undefined }` to
  `formatTotal`, which **overrides** the default `'EUR'` in the spread

Fix them in the code, **not** in the types: no `!`, no `as`, no
`| undefined` added to `ReportOptions`.

→ **Done when** `tests/sales.spec.tsx` and `tests/SalesReport.spec.tsx` are
green, and so is `npm run typecheck`.

### 3. Project references — `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

One project compiles everything, every time — and with the types of both
worlds: the components see `process`, `vite.config.ts` sees `document`. Split it:

1. `tsconfig.app.json` — `extends` the base; `composite: true`, the DOM in
   `lib`, `"types": ["vite/client"]`, `"jsx": "react-jsx"`, and
   `"include": ["src"]`. `noEmit` stays: Vite builds the app, `tsc` only checks it
2. `tsconfig.node.json` — the same `extends` and `composite`, but `lib` without
   the DOM, `"types": ["node"]`, and `"include": ["vite.config.ts"]`
3. `tsconfig.json` — `"files": []`, and a `references` to both projects

`tsc -b` checks each project with **its own** options, and writes a
`.tsbuildinfo` next to each one to know what changed.

→ **Done when** `tests/build.spec.tsx` is green.

### 4. Read the build

```bash
npx tsc -b --verbose                           # what is checked, what is skipped, why
npx tsc -b --verbose                           # again: nothing to do
npx tsc -p tsconfig.app.json --showConfig      # the options, extends resolved
npx tsc -p tsconfig.app.json --extendedDiagnostics
```

Touch `vite.config.ts`, rebuild with `--verbose`: which project is rebuilt,
and which is not? What does `tsconfig.app.tsbuildinfo` hold?

→ **Done when** you can answer both questions.

### 5. *(Bonus)* — type tests of your own

Add a spec to `tests/types.test-d.tsx` that checks `topSeller` returns
`string | undefined`, and one that checks `<SalesReport />` refuses a `Sale`
without its `amount` — with `// @ts-expect-error`.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the eighteen specs
- [ ] `npm run dev` prints a total for each region — no `NaN`
- [ ] `grep -rn TODO src tsconfig*.json` returns nothing

**The behaviour is there**

- [ ] `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on, for both projects
- [ ] No `!` and no `as` in `src/`
- [ ] The root `tsconfig.json` compiles nothing itself
- [ ] A second `tsc -b` has nothing to do

**You can explain**

- [ ] Why `strict` alone let the three bugs through
- [ ] The difference between `currency?: string` and `currency: string | undefined`
      under `exactOptionalPropertyTypes`
- [ ] What `composite` demands, and what `tsc -b` gains from it
- [ ] Why the app and `vite.config.ts` are two projects, with two `types`

## Going further

- Install `typescript-eslint` and `eslint-plugin-react-hooks`, and turn on
  `no-floating-promises`, `no-unnecessary-condition` and `rules-of-hooks`: what
  do they find that `tsc` does not?
- Run `npx tsc -p tsconfig.app.json --generateTrace trace`, then
  `npx @typescript/analyze-trace trace`.
- Add `"isolatedDeclarations": true` to the app: which export lacks an explicit type?
