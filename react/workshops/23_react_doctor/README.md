# TP 23 — React Doctor

> This TP is **autonomous**: it does not depend on any other TP. The app works —
> search, lineup, reviews, Jedi training — but it is written with five of the
> effect and key anti-patterns React Doctor reports. You scan it, read the
> diagnostics, fix them one by one, and turn the scan into a gate.

## Goal

Chapter 23 — Use a static audit as a guide, and prove each fix with a test:

- **Run** React Doctor and read its report: score, categories, rules, file and line
- **Explain** a diagnostic with `rules explain` before touching the code
- **Fix** derived state, state reset through an effect, an effect chain, event
  logic in an effect, and an index used as a `key`
- **Measure** what an effect costs: one extra commit, counted with `<Profiler>`
- **Gate** the codebase: `doctor.config.ts`, a `doctor` script, `--blocking`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Network access for `npx react-doctor@latest` (the first run downloads it). The
  score is computed by React Doctor's API: add `--no-score` to keep everything
  local — the diagnostics are the same, only the number is missing.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are already written, next to the code they grade:
**`src/components/PeopleSearch.spec.tsx`**, **`ReviewPanel.spec.tsx`**,
**`JediTraining.spec.tsx`**, **`FavoriteButton.spec.tsx`** and
**`src/App.spec.tsx`**. Six of them are red on the starter. Most of the green ones
are already green: they pin down what the app *does*, and must stay green while
you change *how* it does it.

Several specs count **commits** rather than read the DOM. An effect that sets
state ends with the right screen — one commit too late: React first commits the
stale value, then the effect runs, sets state, and React commits again. The final
DOM looks the same either way, so `src/tests/commits.tsx` wraps the component in a
`<Profiler onRender>` and counts. "One click, one commit" is the contract.

**Already done for you:**

- `src/tests/commits.tsx` — `renderCountingCommits(ui)`, returning `commits()` and
  `resetCommits()`.
- `src/analytics.ts` — `track(event, personId)` pushes onto `window.dataLayer`,
  Google Tag Manager style. The specs read that array: nothing is mocked.
- `src/App.tsx` — the lineup state (`addToLineup`, `move`) and the page layout.
- `src/ranks.ts` — `rankFor(points)`, a pure function.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Scan the app and read the report | the terminal | You can name the 5 rule families and the files they point at |
| 2 | Compute the filtered list while rendering | `src/components/PeopleSearch.tsx` | `PeopleSearch.spec.tsx` is green — one commit per keystroke |
| 3 | Reset the review form with a `key`, not an effect | `PersonReview.tsx` + `ReviewPanel.tsx` | `ReviewPanel.spec.tsx` is green |
| 4 | Break the effect chain | `src/components/JediTraining.tsx` | Three clicks, three commits |
| 5 | Move the tracking into the click handler | `src/components/FavoriteButton.tsx` | Two clicks, two events in `window.dataLayer` |
| 6 | Key the lineup by identity | `src/components/Lineup.tsx` | A note moves with its person — `App.spec.tsx` is green |
| 7 | Configure React Doctor and make it a gate | `doctor.config.ts`, `package.json` | `npm run doctor` scores 100 and exits 0; a regression makes it exit 1 |

## Steps

### 1. The first scan — the terminal

1. From this folder, run the scan, then again in verbose mode to get files and
   lines:

   ```bash
   npx react-doctor@latest
   npx react-doctor@latest --verbose
   ```

2. Write down the **score** (around 60 / 100 on the starter) and the list of
   rules. You should find, all in the **Bugs** category:

   | Rule | File |
   |---|---|
   | `no-derived-state` | `PeopleSearch.tsx`, `JediTraining.tsx` |
   | `no-reset-all-state-on-prop-change`, `no-adjust-state-on-prop-change` | `PersonReview.tsx` |
   | `no-effect-chain` | `JediTraining.tsx` |
   | `no-event-handler` | `FavoriteButton.tsx` |
   | `no-array-index-as-key` | `Lineup.tsx` |

3. Pick one and ask the tool why it matters:

   ```bash
   npx react-doctor@latest rules explain react-doctor/no-effect-chain
   ```

4. Run `npm test` and match each red spec with a line of the report.

→ **Done when** you can say, for each of the five files, which rule fires and
which red spec it explains.

### 2. Derived state — `src/components/PeopleSearch.tsx`

`matches` is a copy of something React can compute: `people` filtered by `query`.

1. Read `TODO 2.1`, then run `PeopleSearch.spec.tsx`: the mount takes two commits
   and every keystroke takes two.
2. Delete the `matches` state **and** the effect. Compute the list in the body of
   the component.
3. Do not reach for `useMemo` yet: filtering six names is free. Memoize when a
   profiler says it is slow, not before.

→ **Done when** `PeopleSearch.spec.tsx` is green and the rule is gone from the scan.

### 3. Reset with a `key` — `PersonReview.tsx` + `ReviewPanel.tsx`

Switching person must start a blank review. The starter clears every state in an
effect watching `person.id`, so Vader's form is first committed holding Luke's
draft.

1. Delete the effect of `TODO 3.1`.
2. Run the specs: the draft now survives the switch. React sees the same
   component type at the same place in the tree, so it keeps its state.
3. `TODO 3.2`: render `<PersonReview key={selected.id} … />`. A different key is a
   different component: React unmounts the old form and mounts a fresh one.

→ **Done when** `ReviewPanel.spec.tsx` is green — the draft is gone *and* it takes a
single commit.

### 4. The effect chain — `src/components/JediTraining.tsx`

One click sets `points`, an effect sets `rank`, another effect sets
`announcement`. That is three commits for one click, and for two of them the
screen shows a rank that does not match the points.

1. Turn `rank` into a value computed while rendering, with `rankFor(points)`.
2. The announcement is caused by the click: in `train()`, compute the next number
   of points, and when `rankFor(next)` differs from the current rank, set the
   announcement **in the same handler**. Both updates are batched into one commit.
3. Both effects and the `rank` state are gone. Is `useEffect` still imported?

→ **Done when** `JediTraining.spec.tsx` is green: three clicks, three commits,
"Promoted to Padawan!" on the third.

### 5. Event logic in an effect — `src/components/FavoriteButton.tsx`

The `added` state exists only to trigger an effect that calls `track()`. Click
twice on Luke: the second click sets the same object, React bails out, the
effect never runs, and the event is lost.

1. Delete the state and the effect.
2. Call `track('add_to_lineup', person.id)` in `handleClick`, next to `onAdd`.
3. In `npm run dev`, with `<StrictMode>` on, check that one click is still one
   event in `window.dataLayer` (type `dataLayer` in the console).

→ **Done when** `FavoriteButton.spec.tsx` is green.

### 6. An index is not an identity — `src/components/Lineup.tsx`

Add Luke and Leia to the lineup, type a note for Luke, move him down: the note
stays in the first row, now labelled Leia. The `key` told React the *position* is
the identity of the row, so it kept the DOM node — and its input value — at that
position.

1. Replace `key={index}` with `key={person.id}`.
2. Try it again in the browser. Also try typing into a row, then removing the
   `key` entirely: what does React print in the console?

→ **Done when** `App.spec.tsx` is green and `npm test` is entirely green.

### 7. Configure and gate — `doctor.config.ts`, `package.json`

So far the tool ran through `npx`. To configure it and use it in a script:

1. Install it: `npm install -D react-doctor`.
2. Create `doctor.config.ts` at the root (it is already in `tsconfig.json`'s
   `include`, so it is typechecked):

   ```ts
   import { defineConfig } from 'react-doctor/api';

   export default defineConfig({
     rules: { 'react-doctor/no-array-index-as-key': 'error' },
     blocking: 'warning',
     ignore: { files: ['src/**/*.spec.tsx', 'src/tests/**'] },
   });
   ```

3. Add a script: `"doctor": "react-doctor --verbose -y"`, then `npm run doctor`.
4. Prove the gate: put `key={index}` back in `Lineup.tsx`, run `npm run doctor`,
   and `echo $?` — it must be `1`. Put the fix back.

→ **Done when** `npm run doctor` reports **100 / 100** and exits 0, and a
re-introduced index key makes it exit 1.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — every commit count, the lineup notes, the tracking
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] `npm run doctor` scores 100 / 100 and exits 0

**The behaviour is there**

- [ ] Typing in the search commits once per keystroke, and the list is never stale
- [ ] Switching the reviewed person shows a blank form, in one commit
- [ ] One "Train" click is one commit, promotion included
- [ ] Two clicks on "Add Luke Skywalker to the lineup" push two events
- [ ] A note typed for Luke follows Luke when the lineup is reordered
- [ ] No `useEffect` is left in `src/components/` — none of these needed one

**You can explain**

- [ ] Why a state copied from props through an effect costs a commit, and why the
      final DOM hides it
- [ ] What React compares to decide whether to keep or reset a component's state,
      and how `key` changes the answer
- [ ] Why setting state to the value it already holds does not run an effect
- [ ] When an effect *is* the right tool (synchronising with something outside
      React: a subscription, a timer, the DOM)
- [ ] Why `--scope changed` is the setting to start from on an existing codebase

## Going further

- Run `npx react-doctor@latest --json --no-score | jq '.summary'` and look at what
  a CI job would consume.
- Install the ESLint integration (`eslint-plugin-react-doctor`) and compare: which
  diagnostics does it lose, and why (hint: the project-wide rules)?
- Generate a GitHub Actions workflow with `npx react-doctor@latest ci install` and
  read it: what does it do on a pull request, and what would make it block?
- Enable the React Compiler (`babel-plugin-react-compiler`) and scan again: which
  new category appears?
