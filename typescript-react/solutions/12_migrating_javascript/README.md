# TP 12 — Migrating JavaScript

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the cart of a small shop, written in plain JavaScript and JSX: two components
> and a CSV import. It renders — and it is wrong. Let the checker read it, one
> file at a time, and it will tell you where.

## Goal

Chapter 12 — Migrating a JavaScript project:

- Let `tsc` **check** `.js` and `.jsx` files with **`allowJs`** and **`checkJs`**
- Type a JavaScript component **without converting it**, with JSDoc:
  `@typedef`, `@param` — on its props too — `@returns`, `@import`
- **Rename** a component from `.jsx` to `.tsx`, and type it in TypeScript
- Remove a **`@ts-nocheck`**, and fix what it was hiding

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/order.spec.tsx` and `tests/migration.spec.tsx` are given and **red**.
Keep `npm run test:watch` open.

`npm run typecheck` is **green** on the starter: `allowJs` lets `tsc` read the
JavaScript files, but nothing checks them yet. That green is the lie this TP is
about.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Turn on `checkJs` | `tsconfig.json` | The `tsconfig` spec is green, and `npm run typecheck` lists errors |
| 2 | Type `CartLine.jsx` with JSDoc — its props included | `src/CartLine.jsx` | The `lineTotal` specs are green |
| 3 | Rename `Cart.jsx` to `Cart.tsx` | `src/Cart.tsx` | The `Cart` specs are green |
| 4 | Remove the `@ts-nocheck` of `parse.js` | `src/parse.js` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. Turn on `checkJs` — `tsconfig.json`

Add `"checkJs": true`, then run `npm run typecheck`. Every error is an
**implicit `any`**: `strict` is on, and a JavaScript parameter — the props of a
component included — has no type. Read them all before fixing any: which file
is **not** in the list, and why?

→ **Done when** the `the compiler checks the JavaScript files` spec is green.

### 2. Type `CartLine.jsx` with JSDoc — `src/CartLine.jsx`

This file **stays JavaScript**. Describe a line with a `@typedef` — `name`,
`price`, `quantity`, `discount` — then give `lineTotal` a `@param {Line}` and a
`@returns {number}`, and `CartLine` a `@param {{ line: Line }} props`. Run
`npm run typecheck`: the checker now knows what a line is. What does it say
about the body of `lineTotal`?

→ **Done when** the two `lineTotal` specs are green, and `CartLine.jsx` has no error.

### 3. Rename `Cart.jsx` to `Cart.tsx` — `src/Cart.tsx`

Rename the file — the imports in the tests keep saying `./Cart.jsx`: with
`moduleResolution: bundler`, an import may name the `.jsx` file, and the
checker maps it back to `Cart.tsx`. Type `formatPrice` and the props of `Cart`
in TypeScript — a `CartProps` interface; a `Line` comes from `CartLine.jsx`
like any type: `import { CartLine, lineTotal, type Line } from './CartLine.jsx'`.

Once `lines` is a `Line[]`, the checker finds a bug in `Cart` that the tests
found first: which call is missing an argument, and why did JavaScript not
mind?

→ **Done when** the two `Cart` specs and the `Cart.tsx` spec are green.

### 4. Remove the `@ts-nocheck` — `src/parse.js`

Delete the first line. Bring the `Line` type in with a JSDoc
`/** @import { Line } from './CartLine.jsx' */`, then say `parseLine` takes a
`string` and returns a `Line`. What does the checker say about the values that
come out of `split(';')`? Fix them — without `@ts-ignore`, without
`@ts-expect-error`.

→ **Done when** `npm test` and `npm run typecheck` are both green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part
of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the eleven specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `allowJs` and `checkJs` are on
- [ ] `src/CartLine.jsx` and `src/parse.js` are still JavaScript, typed with JSDoc
- [ ] `src/Cart.tsx` is TypeScript, and `src/Cart.jsx` is gone
- [ ] No `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` is left in `src`

**You can explain**

- [ ] Why `npm run typecheck` was green on a cart with three bugs
- [ ] What `allowJs` does on its own, and what `checkJs` adds
- [ ] Why the tests import `./Cart.jsx`, when the file is `Cart.tsx`
- [ ] When you would keep a component in JavaScript with JSDoc rather than rename it

## Going further

- Add `"declaration": true`, `"emitDeclarationOnly": true`, `"rootDir": "src"` and
  `"outDir": "types"` to a copy of the `tsconfig.json`, and run `tsc` on it:
  what does `types/CartLine.d.ts` look like? A JavaScript component library can
  ship types without a single `.tsx` file.
- Put `// @ts-expect-error` above a JSX line that has **no** error. What does the
  checker say — and why is that better than `// @ts-ignore`?
- Give the shop its VAT rates with a `@satisfies {Record<string, number>}` JSDoc
  tag, then the same in TypeScript with `satisfies`.
