# TP 12 — Migrating JavaScript

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the order module of a small shop, written in plain JavaScript. It runs — and
> it is wrong. Let the checker read it, one file at a time, and it will tell
> you where.

## Goal

Chapter 12 — Migrating a JavaScript project:

- Let `tsc` **check** JavaScript files with **`allowJs`** and **`checkJs`**
- Type a JavaScript file **without converting it**, with JSDoc: `@typedef`,
  `@param`, `@returns`, `@import`
- **Rename** a file from `.js` to `.ts`, and type it in TypeScript
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

`tests/order.spec.ts` and `tests/migration.spec.ts` are given and **red**. Keep
`npm run test:watch` open.

`npm run typecheck` is **green** on the starter: `allowJs` lets `tsc` read the
JavaScript files, but nothing checks them yet. That green is the lie this TP is
about.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Turn on `checkJs` | `tsconfig.json` | The `tsconfig` spec is green, and `npm run typecheck` lists errors |
| 2 | Type `cart.js` with JSDoc | `src/cart.js` | The `lineTotal` specs are green |
| 3 | Rename `format.js` to `format.ts` | `src/format.ts` | The `formatTotal` specs are green |
| 4 | Remove the `@ts-nocheck` of `parse.js` | `src/parse.js` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. Turn on `checkJs` — `tsconfig.json`

Add `"checkJs": true`, then run `npm run typecheck`. Every error is an
**implicit `any`**: `strict` is on, and a JavaScript parameter has no type.
Read them all before fixing any: which file is **not** in the list, and why?

→ **Done when** the `the compiler checks the JavaScript files` spec is green.

### 2. Type `cart.js` with JSDoc — `src/cart.js`

This file **stays JavaScript**. Describe a line with a `@typedef` — `name`,
`price`, `quantity`, `discount` — then give `lineTotal` a `@param {Line}` and a
`@returns {number}`. Run `npm run typecheck`: the checker now knows what a line
is. What does it say about the body of `lineTotal`?

→ **Done when** the two `lineTotal` specs are green, and `cart.js` has no error.

### 3. Rename `format.js` to `format.ts` — `src/format.ts`

Rename the file — the imports in the tests keep saying `./format.js`: with
`module: nodenext`, an import names the **emitted** file. Type `formatPrice`
and `formatTotal` in TypeScript; a `Line` comes from `cart.js` like any type:
`import { lineTotal, type Line } from './cart.js'`.

Once `lines` is a `Line[]`, the checker finds a bug in `formatTotal` that the
tests found first: which call is missing an argument, and why did JavaScript
not mind?

→ **Done when** the two `formatTotal` specs and the `format.ts` spec are green.

### 4. Remove the `@ts-nocheck` — `src/parse.js`

Delete the first line. Bring the `Line` type in with a JSDoc
`/** @import { Line } from './cart.js' */`, then say `parseLine` takes a
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
- [ ] `src/cart.js` and `src/parse.js` are still JavaScript, typed with JSDoc
- [ ] `src/format.ts` is TypeScript, and `src/format.js` is gone
- [ ] No `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` is left in `src`

**You can explain**

- [ ] Why `npm run typecheck` was green on a module with three bugs
- [ ] What `allowJs` does on its own, and what `checkJs` adds
- [ ] Why the tests import `./format.js`, when the file is `format.ts`
- [ ] When you would keep a file in JavaScript with JSDoc rather than rename it

## Going further

- Add `"declaration": true`, `"emitDeclarationOnly": true`, `"rootDir": "src"` and
  `"outDir": "types"` to a copy of the `tsconfig.json`, and run `tsc` on it:
  what does `types/cart.d.ts` look like? A JavaScript library can ship types
  without a single `.ts` file.
- Put `// @ts-expect-error` above a line that has **no** error. What does the
  checker say — and why is that better than `// @ts-ignore`?
- Give the order a total with a `@satisfies {Record<string, number>}` JSDoc
  tag, then the same in TypeScript with `satisfies`.
