# TP 11 — Runtime validation

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the React front of a bookshop: books come from an API through a `useBooks`
> hook, orders from a `<form>` — and nothing checks either of them. Describe
> them with **Zod** schemas, infer the types — the props of `BookCard`
> included — from those schemas, and write a `validate` that works with **any**
> validation library.

## Goal

Chapter 11 — Runtime validation:

- Describe the data that **enters** the app — a `fetch` response, a form's
  `FormData` — with a **schema**, and check it at run time
- **Infer** the types from the schema — `z.infer`, `z.input`, `z.output` —
  instead of writing them twice, props included
- Tell **`parse`** (throws) from **`safeParse`** (a discriminated union)
- **Transform** and **coerce** while validating: a date string into a `Date`,
  `"3"` into `3`, `"on"` into `true`
- **Brand** a type, so that only the schema can produce it
- Write a function that accepts **any Standard Schema** — Zod, Valibot, ArkType…

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --typecheck
npm run test:watch   # the same, in watch mode
npm run typecheck    # tsc --noEmit
```

`tests/*.spec.tsx` run the code with Testing Library, `tests/types.test-d.tsx`
is checked by the compiler: all are given and **red**. `tests/fixtures.ts`
holds one book as the API sends it, and two schemas written by hand — read it
first. Keep `npm run test:watch` open.

The Zod documentation: https://zod.dev/api

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `IsbnSchema`, `BookSchema` | `src/book.ts` | — |
| 2 | `BookJson` and `Book`, inferred — and the props of `BookCard` | `src/book.ts`, `src/BookCard.tsx` | The `Book` type specs are green |
| 3 | `parseBook`, `tryParseBooks`, and `useBooks` | `src/book.ts` | The `parseBook`, `tryParseBooks` and `useBooks` specs are green |
| 4 | `OrderSchema`, `Order`, `parseOrder` — the `<form>` action | `src/order.ts` | The `parseOrder` and `OrderForm` specs and the `Order` type spec are green |
| 5 | `validate`, for any Standard Schema | `src/validate.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. The schema of a book — `src/book.ts`

1. `IsbnSchema`: a string of **13 digits** (`.regex()`), then `.brand<'Isbn'>()`.
2. `BookSchema`, one field at a time — read `tests/book.spec.tsx` for what each
   accepts:
   - `id` a positive **integer** (`z.int()`), `price` a number that is not negative
   - `title` a string, **trimmed**, never empty
   - `authors` at least one
   - `publishedAt` an ISO date (`z.iso.date()`), **transformed** into a `Date`
   - `cover` an **https** URL (`z.url({ protocol: … })`), **optional**

→ **Done when** `BookSchema` has seven fields. The specs turn green at the next step.

### 2. Types, inferred — `src/book.ts`, `src/BookCard.tsx`

1. `Book` is `z.output<typeof BookSchema>`. Hover over it: where does each
   field type come from?
2. `BookJson` is `z.input<typeof BookSchema>`. What is the difference with
   `Book`, and why?
3. Replace `Isbn` with `z.infer<typeof IsbnSchema>`. Try `const isbn: Isbn =
   '9780441172719'`: why is it refused?
4. `BookCardProps` describes a book **by hand**, a second time. Make its `book`
   a `Book`: `publishedAt` is a `Date` now — simplify the render. Why is
   `<BookCard book={dune} />` refused, `dune` being a book as the API sends it?

→ **Done when** the four `Book` type specs are green.

### 3. Parsing — `src/book.ts`

1. `parseBook` calls `BookSchema.parse`. A book sent with a `stock` field: is
   it kept?
2. `tryParseBooks` must **never** throw: use `z.array(BookSchema).safeParse`.
   Hover over its result: what does checking `result.success` narrow to? Map
   each issue to `{ path, message }` — the path joined with `.`.
3. `useBooks` hands the JSON of `fetch` to the component **as is**: hover over
   `json` — it is `any`, so `books: json` compiles. Pass it through
   `tryParseBooks` instead, and type `json` as `unknown`.

→ **Done when** the `parseBook`, `tryParseBooks` and `useBooks` specs are green.

### 4. The order form — `src/order.ts`

`OrderForm` is a `<form>` whose **action** receives a `FormData`: its values
are **strings, or nothing** — and a checkbox that is not ticked is not sent at
all. `parseOrder` reads `Object.fromEntries(formData)`.

1. `quantity`: `z.coerce.number()`, a positive integer, `1` by default.
2. `email`: an email, required.
3. `shipping`: one of `standard`, `express`, `pickup` — `standard` by default.
4. `giftWrap`: `z.stringbool()`, `false` by default — a ticked checkbox sends
   `"on"`. Why not `z.coerce.boolean()`? Try it with `'false'`.
5. `Order` is inferred. `parseOrder` uses `safeParse`, and returns an `error`
   that lists **every** wrong field — `z.prettifyError` does that. `OrderForm`
   shows it in its `role="alert"`.

→ **Done when** the `parseOrder` and `OrderForm` specs and the `Order` type
spec are green.

### 5. Any library — `src/validate.ts`

Zod, Valibot and ArkType schemas all have a `~standard` property: the
**Standard Schema** interface. `tests/fixtures.ts` holds two schemas written
without any library.

1. Make `validate` generic: `<S extends StandardSchemaV1>`, returning
   `Promise<StandardSchemaV1.InferOutput<S>>`.
2. Call `schema['~standard'].validate(input)` — it may return a `Promise`:
   `await` it either way. When the result has `issues`, throw a
   `ValidationError`; otherwise return its `value`.

→ **Done when** `npm test` and `npm run typecheck` are both green.

### 6. *(Bonus)* — a cheaper book

Add a `discount` field: a number between `0` and `1`, `0` by default. Is it
optional in `BookJson`? In `Book` — and so in the props of `BookCard`?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirty-nine specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `Book`, `BookJson`, `Isbn`, `Order` and the props of `BookCard` are all
      **inferred** — no type written by hand
- [ ] `tryParseBooks` never throws, and `useBooks` hands nothing unchecked to a component
- [ ] `parseOrder` reports every wrong field at once
- [ ] `validate` imports nothing from Zod
- [ ] No `as`, no `!`, no `any` in `src/`

**You can explain**

- [ ] Why a type annotation on `response.json()` checks nothing
- [ ] The difference between `z.input` and `z.output`
- [ ] When to use `parse`, and when `safeParse`
- [ ] What Standard Schema is — and what it lets a library such as a form or a
      router do

## Going further

- Rewrite `BookSchema` with **Valibot** (`npm install valibot`). Does
  `validate` need to change? Compare the bundle size of both.
- `useBooks` never says when `fetch` fails: add a third case to its result.
  Where does a network error go — and a 404?
- `z.toJSONSchema(BookSchema)` throws: why? Try it again with
  `{ io: 'input' }` — what does the API team get?
