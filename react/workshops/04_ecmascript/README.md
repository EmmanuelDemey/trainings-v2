# TP 4 — Modern JavaScript, from ES2015 to ES2025

> This TP is **autonomous**: it does not depend on any other TP. The data, a
> small page and every spec are provided; your job is to implement a set of
> helpers over the Star Wars people with the syntax and the built-ins React code
> uses every day.

## Goal

Chapter 4 — Write data transformations the way modern JavaScript (and React)
expects them: short, declarative, and **without mutating** what you receive.

- **Arrow functions**, currying, **destructuring** and **template literals** (ES2015)
- `map`, `filter`, `reduce`, `Set`, and `Object.entries` / `Object.fromEntries` (ES2019)
- `at()` (ES2022), `toSorted()` (ES2023), `Object.groupBy()` (ES2024), `structuredClone()`
- **Rest and spread** on objects (ES2018), **optional chaining** `?.` and **nullish
  coalescing** `??` (ES2020)
- **Promises**: `async` / `await`, `Promise.all`, `Promise.allSettled` (ES2020)

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- `tsconfig.json` targets the `esnext` library: `Object.groupBy` (ES2024) does not
  exist in the type definitions of older targets

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Two spec files grade this workshop, both already written:

- **`src/utils/es.spec.ts`** — the synchronous helpers of `src/utils/es.ts`, in three
  `describe` blocks matching steps 1–2, 3 and 4
- **`src/utils/async.spec.ts`** — the two loaders of `src/utils/async.ts` (step 5),
  against a fake `fetchPerson` where later ids answer **first**: an implementation
  that loses the order, or fetches one person after the other, shows

Both are red on the starter. Keep `npm run test:watch` open in a second terminal.

**Already done for you:**

- `src/model/person.ts` — the `Person` type, and `src/data/people.ts` — five people
- `src/App.tsx` — a page of statistics built on your helpers: it fills up as you go
- The signature of every function, with a `// TODO N.M:` marker matching the steps
  below. The signatures are right: change the **bodies** only

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Arrow functions, `map` / `filter`, destructuring, currying | `src/utils/es.ts` | The first four tests of `es.spec.ts` are green |
| 2 | `at()`, `Object.entries` / `fromEntries`, `reduce`, `Set` | `src/utils/es.ts` | The *arrays* block of `es.spec.ts` is green |
| 3 | `Object.groupBy`, `toSorted`, `structuredClone` | `src/utils/es.ts` | The *newer built-ins* block is green |
| 4 | Rest, spread, `?.` and `??` | `src/utils/es.ts` | The *objects* block is green |
| 5 | `Promise.all` and `Promise.allSettled` | `src/utils/async.ts` | `async.spec.ts` is green — `npm test` exits 0 |

## Steps

### 1. Arrow functions and array methods — `src/utils/es.ts`

1. `getLength` and `countMales`: `filter` with the gender destructured in the
   parameter list — `({ gender }) => …`.
2. `getNames`: `map`.
3. `getAttr`: a function returning a function. `getAttr('name')` is a reusable
   "extract the names" function; `getAttr('height')(people)` gives the heights. Hover
   the result in your editor: TypeScript computes `Person[K][]` from the key.

→ **Done when** *counts the people*, *counts the males*, *returns the names, in order*
and *builds a reusable getter for any attribute* are green.

### 2. Reading at the edges — `src/utils/es.ts`

1. `getFirstKeys`: `people.at(0)` is typed `Person | undefined` — unlike `people[0]`,
   it admits the list may be empty. Return `null` then, `Object.keys` otherwise.
2. `describeLast`: `at(-1)`, `Object.entries`, and a template literal per line.
3. `getMassAverage`: `null` for an empty list **or** when one mass is not a number
   (`Number.isNaN`), otherwise a `reduce` to the sum, divided by the count.
4. `addOneToLast`: `Object.entries` → `filter` (numeric strings, not the `id`) →
   `map` (plus one, back to a string) → `Object.fromEntries`.
5. `uniqueEyeColors`: `[...new Set(…)]`.

→ **Done when** the whole *arrays: map, filter, reduce* block is green, with no `for`
and no `let` in your code.

### 3. The newer built-ins — `src/utils/es.ts`

1. `groupByGender`: `Object.groupBy(people, …)`, with `?? 'unknown'` for a missing
   gender. Compare its return type with the `Partial<Record<…>>` of the signature:
   why `Partial`?
2. `sortByHeight`: `toSorted` with a comparator — tallest first, `NaN` heights last.
   Try `sort` instead: it does not even compile, because the parameter is a
   `readonly Person[]` — the signature already forbids mutating the caller's array.
3. `deepCopy`: `structuredClone`. Then try `{ ...value }` instead: the films of the
   original change too — a spread is **shallow**.

→ **Done when** the *newer built-ins* block is green, and you have seen why neither
`sort` nor a shallow spread would do.

### 4. Objects: rest, spread, `?.` and `??` — `src/utils/es.ts`

1. `withoutFilms`: destructure the parameter as `{ films: _films, ...rest }` and
   return `rest`.
2. `withDefaults`: `{ ...defaults, ...person }` — the **last** spread wins. Swap them
   to see the other test fail.
3. `addFilm`: a new person **and** a new films array — `[...person.films, film]`. This
   is exactly how you will update React state from chapter 8 on.
4. `describeMass`: `person?.mass ?? 'unknown'`. Then try `||`: the test with an empty
   mass goes red.

→ **Done when** the *objects* block is green, and you can say what `||` would get
wrong in `describeMass`.

### 5. Promises — `src/utils/async.ts`

1. `loadPeople`: `Promise.all(ids.map(fetchPerson))`. Try a `for … of` loop with an
   `await` inside first: the order is right, but *starts every request before the
   first one answers* goes red — the requests ran **one after the other**.
2. `loadPeopleSettled`: `Promise.allSettled`, then split the results on
   `result.status === 'fulfilled'` — the `status` narrows `result` to a value or a
   reason. Use the index to find the failed id.

→ **Done when** `src/utils/async.spec.ts` is green: `npm test` exits 0, and the page
shows every statistic.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — 2 files, 28 tests
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `for` loop, no `let`, no `var` in the code of `src/utils/es.ts`; the spec files are unchanged

**The behaviour is there**

- [ ] No helper mutates its argument: the original `people` keep their order and their films
- [ ] An empty list gives `null` (or `{}`), never a crash and never `undefined`
- [ ] `loadPeople` runs the requests in parallel and keeps the order of the ids
- [ ] `loadPeopleSettled` never rejects, and reports the ids that failed
- [ ] The page lists the people, the males, the average mass, the tallest and the genders

**You can explain**

- [ ] The difference between `sort` and `toSorted`, and why React cares
- [ ] Why a spread is not a deep copy, and when `structuredClone` is the right tool
- [ ] What `??` does that `||` does not
- [ ] When you would choose `Promise.allSettled` over `Promise.all`

## Going further

- Rewrite `uniqueEyeColors` for two lists with the ES2025 `Set` methods:
  `new Set(a).intersection(new Set(b))`, `union`, `difference`.
- Write `findTallest(people)` with `reduce` only, then with `toSorted().at(0)`. Which
  one reads better, and which one is faster on 100 000 people?
- Add a `loadFirst(ids, fetchPerson)` with `Promise.any` (ES2021) and test what it
  rejects with when everything fails (`AggregateError`).
- Make `loadPeople` cancellable: accept an `AbortSignal` and pass it on to
  `fetchPerson` — the subject of chapter 9.
