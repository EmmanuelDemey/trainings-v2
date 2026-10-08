# TP 3 — Transforms & refinements

> This TP is **autonomous**: it does not depend on any other TP. Four schemas,
> each one valid but naive: they check that a value has the right *type*, and
> leave the rest — converting it, normalising it, relating it to the other
> fields — to whoever reads it next. Moving that into the schema is yours to do.

## Goal

Chapter 3 — Parse, don't validate:

- Turn strings into the values you work with: **`z.coerce`**, **`.transform()`**,
  **`.pipe()`**, **`.default()`** and **`.catch()`**
- Normalise **before** you check: `.trim()`, `.toLowerCase()`, then the format
- Write rules across fields with **`.refine()`** and **`.superRefine()`**, and
  put each error on the right field with its **`path`**
- Run an **async** check without wasting a request on a malformed value
- Say both directions of a conversion once, with a **codec**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
```

Four spec files are given and **red**, one per schema file. Keep
`npm run test:watch` open.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The query string of the search page | `src/schemas/search.ts` | `tests/search.spec.ts` is green |
| 2 | The booking form and its cross-field rules | `src/schemas/booking.ts` | `tests/booking.spec.ts` is green |
| 3 | An async availability check that costs nothing on a typo | `src/schemas/username.ts` | `tests/username.spec.ts` is green |
| 4 | A date that is a string on the wire and a `Date` in the app | `src/schemas/wire.ts` | `npm test` is green |

## Steps

### 1. The search — `src/schemas/search.ts`

Each field arrives as a string, or not at all. One tool per field:

- `q`: `.trim()` comes **before** `.min(2)` — order matters, they run in sequence
- `page`: `z.coerce.number()`, then the integer and minimum checks, then a
  `.default()`. Try `z.coerce.number().parse('')` in your head first
- `tags`: a `.transform()` that splits the string, then a `.pipe()` into the
  array schema that checks the result
- `sort`: `.catch()` — an unknown value is replaced, not reported

→ **Done when** `tests/search.spec.ts` is green, and `SearchParams` (hover it)
says `page: number` and `tags: string[]`.

### 2. The booking — `src/schemas/booking.ts`

1. `EmailSchema`: trim and lower-case **then** check the format — a pipe from a
   normalising string schema into `z.email()`.
2. `quantity` comes from an `<input>`: coerce it.
3. `.refine()` on the object for the two emails — with `path: ['confirmEmail']`,
   or no field will ever show the error.
4. The two backstage rules may **both** fail: `.superRefine()` and one
   `ctx.addIssue()` per rule, each with its own `path`.

→ **Done when** `tests/booking.spec.ts` is green, including "reports both
backstage rules at once".

### 3. The username — `src/schemas/username.ts`

1. Chain a `.refine(async (username) => !(await isTaken(username)), …)` at the
   end of the schema, the obvious way.
2. Run the specs: "never asks the server about ab" is red. In Zod 4, a failed
   `.min()` does not stop the checks that follow it on the same schema — the
   server got asked about a username that could never be valid.
3. Put the async check behind a `.pipe()`: the second schema only runs when the
   first one succeeded.

> An async refinement makes the whole schema async: `.parse()` now throws, and
> only `.parseAsync()` / `.safeParseAsync()` work. The spec checks that too.

→ **Done when** `tests/username.spec.ts` is green: a taken name is reported, and
a malformed one never costs a request.

### 4. The wire format — `src/schemas/wire.ts`

1. Fill in the two directions of `IsoDateTime`: `decode` turns the ISO string
   into a `Date`, `encode` turns it back with `.toISOString()`.
2. `decodeConcert` is `z.decode(ConcertWireSchema, …)`, `encodeConcert` is
   `z.encode(ConcertWireSchema, …)`. Hover `ConcertWire` and `Concert`.

→ **Done when** `npm test` is green, and `encode(decode(json))` gives back the
same JSON.

### 5. *(Bonus)* Transform vs codec

Rewrite `IsoDateTime` as `z.iso.datetime().transform((iso) => new Date(iso))`.
Which specs still pass? What would you need to write by hand to send a concert
back to the API?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-eight specs
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] An empty query string comes out as `{ page: 1, tags: [], sort: 'date' }`
- [ ] `' Nina@Example.COM '` and `'nina@example.com'` are the same email
- [ ] Each cross-field error is attached to the field the user has to fix
- [ ] A malformed username never reaches `isTaken`
- [ ] `startsAt` is a `Date` in the app and an ISO string on the wire

**You can explain**

- [ ] The difference between `.default()` and `.catch()`
- [ ] Why `.trim()` must come before `.min(2)`, and the email normalisation before `z.email()`
- [ ] What happens to an issue raised by `.refine()` without a `path`
- [ ] Why chaining the async check is not enough, and what `.pipe()` changes
- [ ] What a codec gives you that a `.transform()` does not

## Going further

- `z.stringbool()` turns `"yes"`, `"on"`, `"1"` into `true`. Add an `available`
  filter to the search.
- `.refine(fn, { when })` decides when a refinement runs. Rewrite step 3 with it
  instead of a pipe — which one reads better?
- Read the issue codes the booking raises (`issue.code`). Which ones are yours?
