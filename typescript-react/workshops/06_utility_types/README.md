# TP 6 — Utility types

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the model of a small React library app — a `Book`, its genres, the default
> settings of the UI, a route loader, a store and a hook — and a file of prop and
> state types that are all `unknown`. Derive every one of them from the model
> and from React's own types: not a single field typed twice.

## Goal

Chapter 6 — Utility types:

- Turn a **value** into a type with **`typeof`**, and read a type out of another
  with **indexed access** (`Book['summary']`, `(typeof GENRES)[number]`)
- Shape props and state with **`Partial`**, **`Required`**, **`Readonly`**,
  **`Pick`**, **`Omit`** — on `ComponentProps<'button'>` too — and **`Record`**
- Filter a union with **`Exclude`**, **`Extract`** and **`NonNullable`**
- Read the types of a loader, a hook or a class with **`ReturnType`**,
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

The specs come in two kinds, both given and **red**:

- `tests/dto.test-d.tsx` checks the types — Vitest hands it to the compiler, it
  is never run
- `tests/*.spec.tsx` **run** the two components (`render`) and the two hooks
  (`renderHook`) that use them, with Testing Library

`npm run typecheck` is green from the start, and must stay so. Keep
`npm run test:watch` open.

Read `src/model.ts` first: it is the **only** place where a field of a book is
written down. You never edit it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `Genre` and `Settings`, from values | `src/dto.ts` | The "values become types" specs are green |
| 2 | The form values, the draft and `SubmitButtonProps` | `src/dto.ts` | The "form types" specs are green |
| 3 | The views of a book — `BookCardProps` and co. | `src/dto.ts` | The "views of a book" specs are green |
| 4 | The unions | `src/dto.ts` | The "unions" specs are green |
| 5 | The types of a loader, a class and a hook | `src/dto.ts` | `tests/dto.test-d.tsx` is green |
| 6 | `SubmitButton`, `BookCard`, `useBookDraft`, `useGenreCount` | `src/*.tsx`, `src/use*.ts` | `npm test` is green |

## Steps

### 1. Values become types — `src/dto.ts`

- `GENRES` is a **value** — an array marked `as const`. `typeof GENRES` is its
  type: a readonly tuple of four literals. Index it with `number` to get the
  union of its elements — the options of a genre `<select>`.
- `Settings` is `typeof defaultSettings`. Hover over it: why is `sortBy` a
  `string` and not `'title'`? What would `as const` change?

→ **Done when** the two "values become types" specs are green.

### 2. Form types — `src/dto.ts`

The server assigns the id: the "new book" form holds everything **but** the id.
The draft of the "edit book" form holds any subset of those fields. Two utility
types, the second one wrapping the first.

`<SubmitButton>` wraps a `<button>`: it accepts every prop a `<button>` accepts —
read them with `ComponentProps<'button'>` — **but** `type`, which it sets
itself. Try `Omit<…, 'tpye'>`: does the compiler notice?

→ **Done when** the three "form types" specs are green.

### 3. Views of a book — `src/dto.ts`

`CompleteBook` has no optional field left. `BookCardProps` keeps three keys.
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

### 5. Loaders, classes and hooks — `src/dto.ts`

`bookLoader`, `BookStore` and `useShelf` are values: their types are
`typeof bookLoader`, `typeof BookStore` and `typeof useShelf`. `ReturnType` of
the loader gives a `Promise` — unwrap it with `Awaited`. `Parameters` gives a
**tuple**, with the names of the parameters as labels. `typeof BookStore` is
the type of the **constructor**: `InstanceType` gives the type of what it
builds. `useShelf` does not export its return type: `ReturnType` reads it.

→ **Done when** `tests/dto.test-d.tsx` is green.

### 6. The components and the hooks — `src/`

Replace each `any` with the DTO it stands for, then implement:

- `SubmitButton` spreads its props on a `<button>` and sets `type="submit"`
- `useBookDraft` merges the changes into the draft, and `result` is a **new**
  book with the draft applied
- `BookCard` renders the title and the author — and nothing else, even when it
  is given a whole `Book` with `{...book}`. Why does the compiler accept a
  `Book` where a `BookCardProps` is expected?
- `useGenreCount` starts every genre at `0`. You build the counts from `GENRES`
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
- [ ] `npm test` exits 0 — the twenty-four specs
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `any` and no `unknown` is left in `src/`

**The behaviour is there**

- [ ] `src/model.ts` is unchanged, and no field of `Book` is written anywhere else
- [ ] No genre is written anywhere but in `GENRES`, no prop of a `<button>` anywhere but in `@types/react`
- [ ] `useBookDraft` never mutates the book it receives

**You can explain**

- [ ] The difference between `typeof x` in a type and `typeof x` in an expression
- [ ] Why `Partial<Omit<Book, 'id'>>` and not `Omit<Partial<Book>, 'id'>` — or
      whether they are the same
- [ ] Why `ReturnType<useShelf>` does not compile, and `ReturnType<typeof useShelf>` does
- [ ] What `Exclude` and `Extract` do to a union, member by member

## Going further

- Write `BookDraft` so that `title`, if present, can never be an empty
  string — can a type do that? Where does that check belong instead?
- `Record<Genre, number>` vs `Partial<Record<Genre, number>>` vs
  `{ [genre: string]: number }`: write one value of each that the others refuse.
- `ComponentProps<'button'>` vs `ComponentPropsWithoutRef<'button'>` vs
  `ComponentProps<typeof SubmitButton>`: hover over each, and find where they differ.
- Read the declaration of `Omit` in `node_modules/typescript/lib/lib.es5.d.ts`.
  It is built with `Pick` and `Exclude`: chapter 7 is about writing your own.
