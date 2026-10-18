# TP 2 — TypeScript for React developers

> This TP is **autonomous**: it does not depend on any other TP. The data, a
> small page and every spec are provided; your job is to write the types and
> the typed helpers that every later workshop takes for granted.

## Goal

Chapter 2 — Use the type system as a design tool, not as an afterthought:

- **Object types**, optional fields and **literal unions** for the `Person` model
- A **discriminated union** `RemoteData<T>`, narrowed by a `switch`, with an
  **exhaustiveness check** (`never`)
- **Utility types**: `Pick`, `Omit`, `Partial`, `Record` — types derived from other types
- A **type guard** turning an `unknown` payload into a `Person`
- **Generics**: `groupBy`, `pick`, `sortBy`, `indexById`, typed by their arguments

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run — the runtime specs AND the type tests
npm run test:watch   # vitest, in watch mode
```

Two kinds of specs grade this workshop, side by side in `src/`:

- **`*.spec.ts(x)`** — ordinary runtime tests: they call your functions and check
  what comes back.
- **`*.test-d.ts`** — **type tests**. They are never executed: Vitest runs the
  TypeScript compiler on them (its *typecheck* mode, configured in
  `vitest.config.ts` and `tsconfig.typetests.json`) and reports every type error as
  a failed test. Their assertions are `expectTypeOf<…>().toEqualTypeOf<…>()` and
  `// @ts-expect-error` — a line that **must not** compile, and fails the test if it
  does.

The type tests are left out of `npm run typecheck` (see the `exclude` in
`tsconfig.json`): on the starter, they are *supposed* to hold type errors. Both
kinds are red on the starter; `npm test` runs them all.

**Already done for you:**

- `src/data/people.ts` — five Star Wars characters, typed `Person[]`. It must keep
  compiling, **untouched**, against the `Person` type you write
- `src/App.tsx` — a page listing the people grouped by gender, built on your helpers:
  it fills up as you go (`src/App.spec.tsx` is green at the end of step 5)
- The signatures of every function, with `// TODO N.M:` markers matching the steps

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Type the `Person` model and its `Gender` | `src/model/person.ts` | The *Person type* tests of `person.test-d.ts` are green |
| 2 | A `RemoteData<T>` union, described by an exhaustive `switch` | `src/remote-data.ts` | `remote-data.spec.ts` and `remote-data.test-d.ts` are green |
| 3 | Derive `PersonPreview`, `NewPerson`, `PersonPatch`, `PeopleById` | `src/model/person.ts` | `person.spec.ts` and `person.test-d.ts` are green |
| 4 | A type guard for untrusted data | `src/guards.ts` | `guards.spec.ts` and `guards.test-d.ts` are green |
| 5 | Generic collection helpers | `src/collections.ts` | `collections.*` and `App.spec.tsx` are green — `npm test` exits 0 |

## Steps

### 1. The `Person` model — `src/model/person.ts`

1. Replace `Gender = string` with the union of the five values the data uses.
2. Replace the "anything goes" `Person` with its real shape: required `id` and
   `name`; optional `height`, `mass`, `hairColor`, `skinColor`, `eyeColor`,
   `birthYear` (all strings — the API sends `"172"`, not `172`); an optional
   `gender`; and `films`, an array of titles.
3. Check that `src/data/people.ts` still compiles. Then break it on purpose: write
   `heigth`, then `gender: 'robot'`, then `height: 172` — read each error message —
   and revert.

→ **Done when** the first describe block of `src/model/person.test-d.ts` (*the
Person type*) is green, and `src/data/people.ts` is untouched.

### 2. A discriminated union — `src/remote-data.ts`

The starter's `RemoteData<T>` is a bag of optional fields: it accepts
`{ status: 'loading', data: … }` and `{ status: 'success' }` without data.

1. Rewrite it as a union of four object types sharing a literal `status`:
   `idle`, `loading`, `success` with `data: T`, `error` with `error: Error`.
2. Implement `describeRemoteData` with a `switch (state.status)`: *Nothing loaded
   yet*, *Loading…*, whatever `describeData(state.data)` returns, and *Something
   went wrong: \<message\>*. Notice that `state.data` only compiles in the
   `success` branch.
3. Implement `assertNever`, and call it in the `default` branch. Then add a fifth
   member `{ status: 'refreshing' }` to the union: the `default` branch stops
   compiling. Revert.

→ **Done when** `src/remote-data.spec.ts` and `src/remote-data.test-d.ts` are green,
and adding a status breaks the build until the `switch` handles it.

### 3. Utility types — `src/model/person.ts`

1. Derive the four types **from `Person`**, never by copying fields:
   `PersonPreview` (`Pick` the id and the name), `NewPerson` (`Omit` the id),
   `PersonPatch` (`Partial` of `NewPerson`), `PeopleById` (`Record` of an id to a
   person).
2. Implement `toPreview` (destructure in the parameter list), `createPerson` and
   `updatePerson` (spread — and check that the original is not mutated).
3. Hover each type in your editor: what does TypeScript show for `PersonPatch`?

→ **Done when** `src/model/person.spec.ts` and the whole of
`src/model/person.test-d.ts` are green — including the `@ts-expect-error` proving an
update cannot change an `id`.

### 4. A type guard — `src/guards.ts`

`JSON.parse` and `response.json()` return values the compiler knows nothing about.
`unknown` forces you to check before you use them.

1. Change the return type of `isPerson` to `value is Person`, and check the shape:
   an object, not `null`; `id` and `name` strings; `films` an array of strings; every
   optional field either missing or a string. `'id' in value` narrows the object.
2. Implement `parsePeople`: throw a `TypeError` when the payload is not an array,
   otherwise `filter(isPerson)` — and notice the result is `Person[]`, not `unknown[]`.

→ **Done when** `src/guards.spec.ts` and `src/guards.test-d.ts` are green.

### 5. Generics — `src/collections.ts`

Every `any` of this file must become a **type parameter**, so that the type of the
result is computed from the arguments:

1. `groupBy<T, K extends PropertyKey>(items, getKey)` returns
   `Partial<Record<K, T[]>>` — `??=` makes the body three lines long.
2. `pick<T extends object, K extends keyof T>(source, keys)` returns `Pick<T, K>`.
3. `sortBy<T>(items, key: keyof T)` returns a sorted **copy**: numeric strings
   compared as numbers (`'96'` before `'150'`), other values with `localeCompare`,
   missing values last.
4. `indexById<T extends { id: string }>(items)` returns `Record<string, T>`.

Then hover `groupBy(people, (p) => p.gender ?? 'unknown')` in `src/App.tsx`: the key
type is the `Gender` union plus `'unknown'` — inferred, never written.

→ **Done when** `src/collections.spec.ts`, `src/collections.test-d.ts` and
`src/App.spec.tsx` are green: `npm test` exits 0.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — 9 files, the runtime specs **and** the type tests, with
      `Type Errors  no errors`
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `any` left in your code: `grep -rnw any src/collections.ts src/model/person.ts` returns nothing
- [ ] `src/data/people.ts` and the spec files are unchanged (`git diff` shows nothing there)

**The behaviour is there**

- [ ] A typo in a field name, an unknown gender or a numeric height is a **compile error**
- [ ] `{ status: 'success' }` without `data` and `{ status: 'loading', data }` do not compile
- [ ] Adding a status to `RemoteData` breaks `describeRemoteData` until it handles it
- [ ] An update cannot change an `id`, and does not mutate the person it receives
- [ ] `parsePeople` drops the invalid items of a payload and rejects a non-array
- [ ] The page lists the five people grouped by gender, sorted by name

**You can explain**

- [ ] The difference between `unknown` and `any`, and why a type guard needs `unknown`
- [ ] What makes a union *discriminated*, and what `never` proves in the `default` branch
- [ ] Why `PersonPatch` is derived from `Person` instead of written by hand
- [ ] What `K extends keyof T` buys you in `pick`, compared with `key: string`

## Going further

- Replace the `Person[]` annotation of `people` with `satisfies Person[]` and hover
  `people[0].gender`: what changed, and when is that better?
- Write `type PersonKeysOfType<V> = …` — the keys of `Person` whose value is `V` (a
  *mapped type* with `as` and a conditional type) — and restrict `sortBy`'s `key` to
  the string fields.
- Make `RemoteData<T, E = Error>` generic on its error too, and write a
  `mapRemoteData(state, fn)` that only transforms the success state.
- Compare your `groupBy` with the built-in `Object.groupBy` (ES2024): what does its
  return type say about missing keys?
