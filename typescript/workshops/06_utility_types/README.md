# TP 6 — Utility types

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the model of a small library app — a `Book`, its genres, the default settings
> of the UI — and a file of DTO types that are all `unknown`. Derive every one
> of them from the model: not a single field typed twice.

## Goal

Chapter 6 — Utility types:

- Turn a **value** into a type with **`typeof`**, and read a type out of another
  with **indexed access** (`Book['summary']`, `(typeof GENRES)[number]`)
- Shape an object type with **`Partial`**, **`Required`**, **`Readonly`**,
  **`Pick`**, **`Omit`** and **`Record`**
- Filter a union with **`Exclude`**, **`Extract`** and **`NonNullable`**
- Read the types of a function or a class with **`ReturnType`**,
  **`Parameters`**, **`Awaited`** and **`InstanceType`**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # vitest --typecheck, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/dto.test-d.ts` checks the types — Vitest hands it to the compiler, it is
never run — and `tests/books.spec.ts` checks the four functions that use them.
Both are given and **red**. Keep `npm run test:watch` open.

Read `src/model.ts` first: it is the **only** place where a field of a book is
written down. You never edit it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `Genre` and `Settings`, from values | `src/dto.ts` | The "values become types" specs are green |
| 2 | The request bodies | `src/dto.ts` | The "request bodies" specs are green |
| 3 | The views of a book | `src/dto.ts` | The "views of a book" specs are green |
| 4 | The unions | `src/dto.ts` | The "unions" specs are green |
| 5 | The types of a function and a class | `src/dto.ts` | `tests/dto.test-d.ts` is green |
| 6 | The four functions | `src/books.ts` | `npm test` is green |

## Steps

### 1. Values become types — `src/dto.ts`

- `GENRES` is a **value** — an array marked `as const`. `typeof GENRES` is its
  type: a readonly tuple of four literals. Index it with `number` to get the
  union of its elements.
- `Settings` is `typeof defaultSettings`. Hover over it: why is `sortBy` a
  `string` and not `'title'`? What would `as const` change?

→ **Done when** the two "values become types" specs are green.

### 2. Request bodies — `src/dto.ts`

The server assigns the id: a POST sends everything **but** the id. A PATCH sends
any subset of those fields. Two utility types, the second one wrapping the first.

→ **Done when** the two "request bodies" specs are green.

### 3. Views of a book — `src/dto.ts`

`CompleteBook` has no optional field left. `BookSummary` keeps three keys.
`FrozenBook` refuses an assignment. `GenreCount` has one `number` per genre —
**every** genre, so a missing one is a compile error.

→ **Done when** the four "views of a book" specs are green.

### 4. Unions — `src/dto.ts`

- `Exclude<U, X>` keeps the members of `U` that are **not** assignable to `X`;
  `Extract<U, X>` keeps those that **are**.
- `Book['summary']` is `string | undefined`: `NonNullable` drops the `undefined`.
- `Book[keyof Book]` is the union of the types of every field. Hover over it:
  where does the `undefined` come from?

→ **Done when** the four "unions" specs are green.

### 5. Functions and classes — `src/dto.ts`

`fetchBook` and `BookStore` are values: their types are `typeof fetchBook` and
`typeof BookStore`. `ReturnType` gives a `Promise` — unwrap it with `Awaited`.
`Parameters` gives a **tuple**, with the names of the parameters as labels.
`typeof BookStore` is the type of the **constructor**: `InstanceType` gives the
type of what it builds.

→ **Done when** `tests/dto.test-d.ts` is green.

### 6. The four functions — `src/books.ts`

Replace each `any` with the DTO it stands for, then implement:

- `createBook` adds the id to a body
- `applyPatch` returns a **new** book with the changes applied
- `toSummary` keeps the three fields of a `BookSummary` — and drops any other,
  even when it is given a whole `Book`. Why does the compiler accept a `Book`
  where a `BookSummary` is expected?
- `countByGenre` starts every genre at `0`. You build the counts from `GENRES`
  with `Object.fromEntries`, which returns a `{ [k: string]: number }`: what
  does it take to make it a `GenreCount`, and what does that cost you?

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 7. *(Bonus)* — add a field

Add `isbn: string` to `Book` in `src/model.ts`. Which types follow on their
own, and which compile errors show you where the code must change?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-one specs
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `any` and no `unknown` is left in `src/dto.ts` and `src/books.ts`

**The behaviour is there**

- [ ] `src/model.ts` is unchanged, and no field of `Book` is written anywhere else
- [ ] No genre is written anywhere but in `GENRES`
- [ ] `applyPatch` never mutates the book it receives

**You can explain**

- [ ] The difference between `typeof x` in a type and `typeof x` in an expression
- [ ] Why `Partial<Omit<Book, 'id'>>` and not `Omit<Partial<Book>, 'id'>` — or
      whether they are the same
- [ ] Why `ReturnType<fetchBook>` does not compile, and `ReturnType<typeof fetchBook>` does
- [ ] What `Exclude` and `Extract` do to a union, member by member

## Going further

- Write `UpdateBookBody` so that `title`, if present, can never be an empty
  string — can a type do that? Where does that check belong instead?
- `Record<Genre, number>` vs `Partial<Record<Genre, number>>` vs
  `{ [genre: string]: number }`: write one value of each that the others refuse.
- Read the declaration of `Omit` in `node_modules/typescript/lib/lib.es5.d.ts`.
  It is built with `Pick` and `Exclude`: chapter 7 is about writing your own.
