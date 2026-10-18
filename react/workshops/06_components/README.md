# TP 6 — Components & props

> This TP is **autonomous**: it does not depend on any other TP. The starter is a
> working page written as one big component; your job is to split it into small,
> reusable, typed components and rebuild the page from them.

## Goal

Chapter 6 — Think in components:

- **Props**, typed with a `type` and destructured with defaults
- **`children`** and a second "slot" prop (`footer`) for composition
- **`ComponentProps<'input'>`** to wrap a native element without re-declaring its API
- **Controlled components**: the value comes in as a prop, the change goes out as a callback
- **Lifting state up** to the closest common parent
- A **render prop** *(bonus)*

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

Every component comes with its spec, next to it in `src/components/`:
**`Title.spec.tsx`**, **`Input.spec.tsx`**, **`PeopleFilter.spec.tsx`**,
**`Card.spec.tsx`**, **`PeopleTable.spec.tsx`** — plus **`src/App.spec.tsx`**
for the assembled page. The component specs are red on the starter (the
components render nothing yet); two `App` specs are already green, because the
monolith works — they are the safety net that must **stay** green while you
refactor.

**Already done for you:**

- `src/App.tsx` — the whole page in one component, filter included. The
  `useState` line is given: state is chapter 8, read it as "a value and the
  function that changes it"
- `src/utils/filterPeople.ts`, `src/utils/format.ts` — pure functions, given
  and ready to use
- `src/components/*.tsx` — one file per component, with its **props type
  already written**. Read each type before writing the body: it is the contract
- `src/components/Highlight.tsx` — for the bonus
- `src/index.css` — the class names you need: `title`, `card`, `field`, `hint`,
  `people-table`, `number`

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | A heading whose level is a prop | `src/components/Title.tsx` | `level={2}` renders an `<h2>` |
| 2 | An `<input>` with a label, a hint, and every native prop | `src/components/Input.tsx` | `toHaveAccessibleDescription` passes |
| 3 | A controlled filter | `src/components/PeopleFilter.tsx` | It reports `'Luk'`, not an event |
| 4 | A card with `children` and a `footer` slot | `src/components/Card.tsx` | It is a region named by its title |
| 5 | The table as its own component | `src/components/PeopleTable.tsx` | It renders the rows it is given |
| 6 | Rebuild `App` from the pieces | `src/App.tsx` | All specs green, and `App` is about 25 lines |

## Steps

### 1. `Title` — `src/components/Title.tsx`

1. Destructure `text` and `level`, with `level = 1` as the default.
2. Render `text` in `h1`, `h2` or `h3`. A JSX tag can be a **variable**, as
   long as its name starts with an uppercase letter:
   `` const Heading = `h${level}` as const; `` then `<Heading>`.

→ **Done when** `Title.spec.tsx` is green.

### 2. `Input` — `src/components/Input.tsx`

1. Look at `InputProps`: `ComponentProps<'input'>` is **every** prop of a native
   `<input>`. Hover it in your editor.
2. Destructure `label`, `hint` and `id`, and collect everything else with a rest
   parameter: `{ label, hint, id, ...inputProps }`.
3. Get an id from `useId()` — unique per instance, stable across renders — and
   let a caller-provided `id` win: `id ?? generatedId`.
4. Render `<div className="field">`, a `<label htmlFor>` and the `<input>` with
   `{...inputProps}` spread **before** the `id` you computed.
5. When `hint` is given, render it in `<p className="hint" id="…">` and set the
   input's `aria-describedby` to that id — and leave the attribute **out**
   otherwise.

→ **Done when** `Input.spec.tsx` is green — including the spec that renders two
inputs side by side.

### 3. `PeopleFilter` — `src/components/PeopleFilter.tsx`

1. Render an `<Input>` labelled `Filter by name`, hint `Case does not matter.`,
   `type="search"`, with `value={value}`.
2. Its `onChange` prop receives a `string`. Adapt: the `<input>` gives you a
   `ChangeEvent`, the parent wants `event.target.value`.
3. Read the third spec: typing in the field does **not** change it on its own.
   That is what *controlled* means — whoever owns `value` decides.

→ **Done when** `PeopleFilter.spec.tsx` is green.

### 4. `Card` — `src/components/Card.tsx`

1. Render `<section className="card">` with an `<h2>` holding the title.
2. Link them: `useId()` for the heading's `id`, `aria-labelledby` on the
   section. A labelled `<section>` is a **region** landmark — screen-reader users
   can jump to it, and the specs find it with `getByRole('region', { name })`.
3. Render `children` after the heading.
4. Render `footer` in a `<footer>`, **only when** it is given. `footer` is a
   `ReactNode`: a string works, and so does any JSX.

→ **Done when** `Card.spec.tsx` is green.

### 5. `PeopleTable` — `src/components/PeopleTable.tsx`

1. Cut the `<table>` out of `App` and paste it here. Replace `visiblePeople` by
   the `people` prop — the table no longer knows anything about filtering.
2. When `people` is empty, render `<p role="status">No character matches.</p>`.

→ **Done when** `PeopleTable.spec.tsx` is green.

### 6. Rebuild `App` — `src/App.tsx`

1. Keep the `useState` and `filterPeople` lines: the filter state stays **here**,
   because two siblings need it — `PeopleFilter` changes it, `PeopleTable`
   displays its result. That is *lifting state up*.
2. Render `<Title>`, a `<Card title="Search">` with the `<PeopleFilter>`, and a
   `<Card title="Characters">` with the `<PeopleTable>` and the footer
   `` `${visiblePeople.length} of ${people.length} characters` ``.
3. Delete what is no longer used. Open React DevTools' **Components** tab and
   watch `value` change on `PeopleFilter` while you type.
4. *(Bonus)* Add a `renderName?: (person: Person) => ReactNode` **render prop**
   to `PeopleTable`, defaulting to `(person) => person.name`, and pass
   `(person) => <Highlight text={person.name} query={query} />` from `App`: the
   matching letters light up, and the table still knows nothing about filters.

→ **Done when** every spec is green and typing `sky` leaves one row and the
footer reads `1 of 10 characters`.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] `App.tsx` contains no `<table>`, no `<input>` and no `<label>` any more

**The behaviour is there**

- [ ] The page looks and filters exactly as before the refactor
- [ ] The two cards are landmarks: the browser's accessibility tree lists a
      "Search" and a "Characters" region
- [ ] The footer counts the visible characters
- [ ] The hint "Case does not matter." is announced as the field's description

**You can explain**

- [ ] Why props are read-only, and how a child still changes its parent's data
- [ ] What `ComponentProps<'input'>` saves you, and why the spread comes before `id`
- [ ] The difference between `children` and a `footer` prop — and when you would
      reach for a render prop instead
- [ ] Why the filter state lives in `App` rather than in `PeopleFilter`

## Going further

- Write a `PeopleTable` that takes `columns: { header: string; render: (person: Person) => ReactNode }[]`
  — a generic table driven by configuration. When is that worth it, and when is
  it over-engineering?
- Wrap `Card` in a higher-order component `withBorder(Component)` and compare it
  with plain composition. Which one does React DevTools display more clearly?
- Move each component into its own folder (`src/components/Card/Card.tsx`,
  `Card.spec.tsx`, `index.ts`). What does the barrel file buy you, and what does
  it cost (hint: tree-shaking and circular imports)?
