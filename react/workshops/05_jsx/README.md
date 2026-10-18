# TP 5 — First steps with JSX

> This TP is **autonomous**: it does not depend on any other TP. The Vite project,
> the Star Wars data and the stylesheet are provided; your job is to write the JSX
> that turns the data into a page.

## Goal

Chapter 5 — Render real data with JSX:

- **Interpolation** with `{ }` — text, numbers, any expression
- **Fragments**, to return several nodes without a useless wrapper
- **Lists**: `map` an array to elements, with a stable **`key`**
- **Conditional rendering**: early return, `&&`, the ternary
- **JSX attribute names**: `className`, `htmlFor`, `scope`…
- **Formatting** values for humans in small pure functions

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written and red on the starter:

- **`src/utils/format.spec.ts`** — the two formatting functions
- **`src/components/PeopleTable.spec.tsx`** — the table: caption, headers, rows,
  cells, the droid badge, the empty state
- **`src/components/PeopleTable.keys.spec.tsx`** — no missing-`key` warning. It
  lives in its own file because React prints that warning only **once** per
  component: an earlier render in the same file would hide it
- **`src/App.spec.tsx`** — the page: title, count, fragment, labelled search field

Keep `npm run test:watch` open in a second terminal and turn them green one by one.

**Already done for you:**

- `src/model/person.ts` — the `Person` type. Note `mass: number | null`: one
  character's mass is unknown, and the type says so
- `src/data/people.ts` — ten characters, each with a unique `id`
- `src/index.css` — the styles: the class names you need are `people-table`,
  `number`, `badge`, `search` and `empty`
- `src/main.tsx` — `createRoot(...).render(<StrictMode><App /></StrictMode>)`

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | A fragment and two interpolations | `src/App.tsx` | The DOM root holds a `<header>` and a `<main>`, nothing else |
| 2 | The table, one row per person | `src/components/PeopleTable.tsx` | Ten rows, no key warning in the console |
| 3 | Format height and mass | `src/utils/format.ts` | `1.72 m`, `77 kg`, `unknown` |
| 4 | Two conditional renderings | `src/components/PeopleTable.tsx` | Droids get a badge; an empty list shows a message |
| 5 | A labelled search field | `src/App.tsx` | Clicking the label focuses the input |

## Steps

### 1. Fragment and interpolation — `src/App.tsx`

1. The starter wraps everything in a `<div>`. Replace it by a **fragment**
   (`<>…</>`) holding a `<header>` and a `<main>`. Open the devtools' Elements
   panel: the `<div>` is gone.
2. In the `<header>`, keep the `<h1>` — move its text to a `title` constant and
   **interpolate** it. Below it, a paragraph:
   `10 characters from a galaxy far, far away.` — where `10` is
   `people.length`, never a hard-coded number.
3. Put the `<PeopleTable>` inside `<main>`.

→ **Done when** the `App` specs about the title and the "no wrapper element" pass.

### 2. A table from an array — `src/components/PeopleTable.tsx`

1. Return a `<table className="people-table">` with a
   `<caption>Characters</caption>` — the caption is what gives the table its
   accessible name.
2. A `<thead>` with one row of five `<th scope="col">`: **Name, Gender, Birth
   year, Height, Mass**.
3. A `<tbody>` in which you `map` every person to a `<tr>` with five `<td>`.
4. Give each `<tr>` a **`key`**. Which value? Try `key={index}` first, then ask
   yourself what happens when the list is filtered (chapter 8 will make you
   feel it). Use `person.id`.

→ **Done when** the page shows ten rows and the browser console has **no**
`Each child in a list should have a unique "key" prop` warning.

### 3. Formatting — `src/utils/format.ts`

1. `formatHeight(172)` returns `'1.72 m'` (`toFixed(2)` is your friend).
2. `formatMass(77)` returns `'77 kg'`, and `formatMass(null)` returns
   `'unknown'` — not `'null kg'`.
3. Use both in the table's last two cells, and give those two `<td>` the
   `number` class so they are right-aligned.

→ **Done when** `format.spec.ts` is green and Wilhuff Tarkin's mass reads
`unknown`.

### 4. Conditional rendering — `src/components/PeopleTable.tsx`

1. **Early return**: when `people` is empty, return
   `<p role="status" className="empty">No character to display.</p>` instead of
   the table. To see it, pass `people={[]}` from `App` for a moment.
2. **`&&`**: after the name, render `<span className="badge">Droid</span>` when
   `person.gender === 'n/a'`, nothing otherwise.
3. Think about it: why is `{people.length && <Table />}` a classic bug, and what
   does it render for an empty array?

→ **Done when** C-3PO, R2-D2 and R5-D4 have a badge, Luke does not, and the
empty-state spec passes.

### 5. JSX attribute names — `src/App.tsx`

Above the table, inside `<div className="search">`, add a
`<label>Search a character</label>` and an `<input id="search" type="search">`.
Tie them together — `for` is a reserved word in JavaScript, so JSX spells it
differently. (The field does nothing yet: state is chapter 8.)

→ **Done when** clicking the label puts the cursor in the field.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part
of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No React warning in the browser console

**The behaviour is there**

- [ ] The page shows the title, "10 characters from a galaxy far, far away." and a
      ten-row table
- [ ] There is no wrapper `<div>` around `<header>` and `<main>`
- [ ] Heights read in metres, masses in kilograms, and the unknown mass reads `unknown`
- [ ] Droids carry a badge; an empty list shows "No character to display."
- [ ] Clicking "Search a character" focuses the search field

**You can explain**

- [ ] What `<h1>{title}</h1>` compiles to (hint: `jsx('h1', { children: title })`)
- [ ] Why a component returns one node, and what a fragment changes in the DOM
- [ ] What React uses the `key` for, and why the array index is a bad key for a
      list that can be filtered or reordered
- [ ] Why `{count && <List />}` can print a `0`, and two ways to avoid it

## Going further

- Sort the table by name with `people.toSorted(...)` before mapping — why not
  `people.sort(...)`?
- Add a `<tfoot>` with the average height, formatted with `formatHeight`.
- Replace the `Droid` text by an emoji inside `<span role="img" aria-label="Droid">`
  — do the specs still pass? Why?
- Write the same table with `createElement` only, without JSX, for one row. You
  will not want to do it twice.
