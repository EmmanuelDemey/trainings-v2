# TP 11 — Runtime validation

> This TP is **autonomous**: it does not depend on any other TP. You are handed
> the catalogue of a bookshop: books come from an API, the configuration from
> environment variables — and nothing checks either of them. Describe them with
> **Zod** schemas, infer the types from those schemas, and write a `validate`
> that works with **any** validation library.

## Goal

Chapter 11 — Runtime validation:

- Describe the data that **enters** the app with a **schema**, and check it at
  run time
- **Infer** the types from the schema — `z.infer`, `z.input`, `z.output` —
  instead of writing them twice
- Tell **`parse`** (throws) from **`safeParse`** (a discriminated union)
- **Transform** and **coerce** while validating: a date string into a `Date`,
  `"8080"` into `8080`
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

`tests/*.spec.ts` run the code, `tests/types.test-d.ts` is checked by the
compiler: all are given and **red**. `tests/fixtures.ts` holds one book as the
API sends it, and two schemas written by hand — read it first. Keep
`npm run test:watch` open.

The Zod documentation: https://zod.dev/api

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `IsbnSchema`, `BookSchema` | `src/book.ts` | — |
| 2 | `BookJson` and `Book`, inferred | `src/book.ts` | The `Book` type specs are green |
| 3 | `parseBook`, `tryParseBooks` | `src/book.ts` | The `parseBook` and `tryParseBooks` specs are green |
| 4 | `ConfigSchema`, `Config`, `loadConfig` | `src/config.ts` | The `loadConfig` specs and the `Config` type spec are green |
| 5 | `validate`, for any Standard Schema | `src/validate.ts` | `npm test` and `npm run typecheck` are green |

## Steps

### 1. The schema of a book — `src/book.ts`

1. `IsbnSchema`: a string of **13 digits** (`.regex()`), then `.brand<'Isbn'>()`.
2. `BookSchema`, one field at a time — read `tests/book.spec.ts` for what each
   accepts:
   - `id` a positive **integer** (`z.int()`), `price` a number that is not negative
   - `title` a string, **trimmed**, never empty
   - `authors` at least one
   - `publishedAt` an ISO date (`z.iso.date()`), **transformed** into a `Date`
   - `cover` an **https** URL (`z.url({ protocol: … })`), **optional**

→ **Done when** `BookSchema` has seven fields. The specs turn green at the next step.

### 2. Types, inferred — `src/book.ts`

1. `Book` is `z.output<typeof BookSchema>`. Hover over it: where does each
   field type come from?
2. `BookJson` is `z.input<typeof BookSchema>`. What is the difference with
   `Book`, and why?
3. Replace `Isbn` with `z.infer<typeof IsbnSchema>`. Try `const isbn: Isbn =
   '9780441172719'`: why is it refused?

→ **Done when** the three `Book` type specs are green.

### 3. Parsing — `src/book.ts`

1. `parseBook` calls `BookSchema.parse`. A book sent with a `stock` field: is
   it kept?
2. `tryParseBooks` must **never** throw: use `z.array(BookSchema).safeParse`.
   Hover over its result: what does checking `result.success` narrow to? Map
   each issue to `{ path, message }` — the path joined with `.`.

→ **Done when** the `parseBook` and `tryParseBooks` specs are green.

### 4. The configuration — `src/config.ts`

Environment variables are **strings, or nothing**.

1. `PORT`: `z.coerce.number()`, an integer, `3000` by default.
2. `API_URL`: an https URL, required.
3. `LOG_LEVEL`: one of `debug`, `info`, `warn`, `error` — `info` by default.
4. `CACHE`: `z.stringbool()`, `false` by default. Why not `z.coerce.boolean()`?
   Try it with `'false'`.
5. `Config` is inferred. `loadConfig` uses `safeParse`, and throws a
   `ConfigError` whose message lists **every** error — `z.prettifyError` does
   that.

→ **Done when** the `loadConfig` specs and the `Config` type spec are green.

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
optional in `BookJson`? In `Book`?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirty-six specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `Book`, `BookJson`, `Isbn` and `Config` are all **inferred** — no type
      written by hand
- [ ] `tryParseBooks` never throws
- [ ] `loadConfig` reports every wrong variable at once
- [ ] `validate` imports nothing from Zod
- [ ] No `as`, no `!`, no `any` in `src/`

**You can explain**

- [ ] Why a type annotation on `JSON.parse(...)` checks nothing
- [ ] The difference between `z.input` and `z.output`
- [ ] When to use `parse`, and when `safeParse`
- [ ] What Standard Schema is — and what it lets a library such as a form or a
      router do

## Going further

- Rewrite `BookSchema` with **Valibot** (`npm install valibot`). Does
  `validate` need to change? Compare the bundle size of both.
- `parseBook` checks **after** `fetch` returns. Write `fetchBooks(url)` that
  returns `BooksResult`: where does a network error go?
- `z.toJSONSchema(BookSchema)` throws: why? Try it again with
  `{ io: 'input' }` — what does the API team get?
