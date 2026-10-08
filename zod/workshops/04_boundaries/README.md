# TP 4 — Errors at the boundaries

> This TP is **autonomous**: it does not depend on any other TP. Three places
> where data enters an app — the environment, an API response, a form — and
> the code most apps ship for each: it trusts the input, and the error, when it
> comes, says nothing useful. Making each one fail early and clearly is yours to do.

## Goal

Chapter 4 — Validate at the edges, and make the errors worth reading:

- Parse the **environment** once, at start-up, and refuse to start with a
  message that lists **every** problem — `z.prettifyError`
- Write **custom messages** with the `error` param
- Turn a `ZodError` into the **field errors** a form shows — keyed
  `lines[0].quantity`, from each issue's `path`
- Check an **API response** against a schema, and return the reason it failed
  instead of a body typed `any`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
npm run typecheck    # tsc --noEmit
npm start            # loads the config from your environment — see src/main.ts
```

Three spec files are given and **red**. Keep `npm run test:watch` open.

**Already done for you**: `src/order.ts`, the order form schema that
`toFieldErrors` is tested against, and `src/main.ts`, which starts with
`loadConfig(process.env)`.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The environment, parsed once, with messages a human can act on | `src/config.ts` | `tests/config.spec.ts` is green, and `npm start` explains a broken environment |
| 2 | `toFieldErrors` — a `ZodError` the way a form wants it | `src/fieldErrors.ts` | `tests/fieldErrors.spec.ts` is green |
| 3 | `fetchJson` — an API response checked before use | `src/fetchJson.ts` | `npm test` is green |

## Steps

### 1. The environment — `src/config.ts`

1. Write each variable of TODO 1: `z.enum` + `.default()`, `z.coerce.number()`,
   `z.url({ protocol: … })`, `z.stringbool()`.
2. Give the messages of TODO 1 with the `error` param:
   `z.coerce.number({ error: '…' })`, `.max(65535, '…')`.
3. `loadConfig`: `safeParse`, and on failure throw an `Error` whose message is
   `Invalid environment:` followed by `z.prettifyError(result.error)`.
4. Try it: `DATABASE_URL=mysql://db PORT=99999 npm start`.

> `FEATURE_NEW_CHECKOUT=false` is a non-empty string: `z.coerce.boolean()`
> would read it as `true`. That is why `z.stringbool()` exists.

→ **Done when** `tests/config.spec.ts` is green, and `npm start` with a broken
environment lists every variable to fix, then exits 1.

### 2. Field errors — `src/fieldErrors.ts`

1. `pathToKey`: a number segment becomes `[0]`, a string segment is joined with
   a dot — but not before the first one. An empty path is the `FORM` key.
2. `toFieldErrors`: one entry per path, the **first** message only (`??=`).

> Why not `z.flattenError`? Try it on a broken `customer.email`: it files the
> error under `customer`, and the form has no input called `customer`.

→ **Done when** `tests/fieldErrors.spec.ts` is green.

### 3. API responses — `src/fetchJson.ts`

1. A response that is not `ok`: return its status, and do not read the body.
2. `schema.safeParse(await response.json())`: on failure, return a `contract`
   result whose message is `z.prettifyError(…)`.
3. Hover the return type at the call site in `tests/fetchJson.spec.ts`: `data`
   is the schema's output — the type was inferred, not cast.

→ **Done when** `npm test` is green, and `src/fetchJson.ts` holds no `as` and no `any`.

### 4. *(Bonus)* Messages in French

At the top of `src/main.ts`, call `z.config(z.locales.fr())`, then
`PORT=abc npm start`. Which messages changed, and which did not? Why?

### 5. *(Bonus)* The contract as a document

`console.log(JSON.stringify(z.toJSONSchema(OrderSchema), null, 2))`. Which rule
of `OrderSchema` is missing from the output?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the twenty-one specs
- [ ] `grep -rn TODO src` returns nothing
- [ ] `npm start` with a broken environment lists each variable to fix, then exits 1

**The behaviour is there**

- [ ] `process.env` is read in one place only, and the rest of the code gets numbers and booleans
- [ ] `FEATURE_NEW_CHECKOUT=false` is `false`
- [ ] `lines[1].quantity` and `customer.email` are keyed by their full path
- [ ] An error about the whole order lands under `_form`
- [ ] `fetchJson` never returns a body that did not pass the schema

**You can explain**

- [ ] Why the environment is parsed at start-up and not where each variable is used
- [ ] The difference between `z.prettifyError`, `z.flattenError` and `z.treeifyError`, and who each one is for
- [ ] Why a contract failure is not the same result as an HTTP error
- [ ] Where the `error` param applies, and where `z.config` does

## Going further

- Make the API return `{ errors: [{ path: ['lines', 1, 'quantity'], message }] }`
  on a `422`, and put them on the form with `pathToKey`. Same key, both sides.
- `fetchJson` takes a Zod schema. Rewrite its signature against
  `StandardSchemaV1` (`@standard-schema/spec`), and pass it a Valibot schema.
- Add `.readonly()` to `EnvSchema`. What does TypeScript now refuse in `main.ts`?
