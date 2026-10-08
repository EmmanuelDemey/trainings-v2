# TP 10 — Transition & TransitionGroup

> This TP is **autonomous**: it does not depend on any other TP. The board works
> and every change is instant: tabs snap, rows appear and vanish, the drawer
> blinks out. Your job is to give the DOM time to say what it is doing.

## Goal

Chapter 10 — The two built-in components, and the timing question behind them:

- The **six classes**, and why the `transition` declaration lives on `*-active`
- `mode="out-in"`, and what the default mode does to your layout
- `<TransitionGroup>`: one `tag`, no `mode`, a **required** `key`, and `v-move`
- **FLIP**, and why a leaving row has to come out of the flow
- The order of operations: **the DOM leaves first, the data goes last**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- A browser. Half of this workshop is checked with your eyes, on purpose.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

`tests/transitions.spec.ts` is given, and **six of its eight specs are red**.

A word on what they can and cannot see: **jsdom runs no CSS**. The specs assert
the classes Vue applies and the order it applies them in — which is exactly what
`name`, `mode` and `appear` control — and they cannot assert that anything
*looked* right. `v-move` is invisible to them entirely: FLIP measures positions,
and every position in jsdom is zero. Those checks are in the Definition of Done,
in a browser, with the durations turned up.

**Already done for you:** the `fade` and `slide` classes in
`src/transitions.css`. Read them before you start — the six-class shape is the
one you will write yourself for `list`.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Cross-fade the tab panels, one at a time | `src/components/TabsPanel.vue` | Switching tabs no longer makes the page below jump |
| 2 | Animate a list that reorders, keyed by release | `src/transitions.css` + `src/components/ReleaseList.vue` | Sorting by votes makes the rows **slide** — and a typed note follows its row |
| 3 | Let the drawer finish leaving before it is emptied | `src/App.vue` | The panel slides out with its content still in it |

`npm test` grades the classes Vue applies and the order it applies them in.
It cannot grade what anything **looks** like — jsdom runs no CSS, and every
position in it is zero. Half of this workshop is checked with your eyes, at 0.4s.

## Steps

### 1. The tab switcher — `src/components/TabsPanel.vue`

Wrap the `<component :is>` in a `<Transition name="fade" mode="out-in" appear>`.

Then take the mode off and switch tabs again: for a moment both panels are in
the DOM, they stack, and everything below jumps. Put it back.

> `out-in` costs you the **sum** of the two durations. That is the trade.

→ **Done when** the first paint fades in (`appear`), and switching tabs never
puts two panels in the DOM at once.

### 2. The list — `src/transitions.css` + `src/components/ReleaseList.vue`

1. Write the `list` set in `transitions.css`, on the model of `fade`, plus
   `.list-move` beside the two `-active` classes.
2. Turn the `<ul>` into `<TransitionGroup name="list" tag="ul">`. Without `tag`
   it renders no wrapper at all — and `<li>` outside a `<ul>` is invalid markup.
3. Key the rows by `release.id`. `:key="index"` tells Vue "the row at position 2
   is still the row at position 2", so it reuses the DOM node — type a note into
   *Offline draft recovery*, sort by votes, and watch the note stay behind.
4. Sort, then remove a row: the neighbours jump. Add `position: absolute` to
   `.list-leave-active`, so a leaving row stops holding its space, and compare.

> This is also why `<TransitionGroup>` **requires** a key: it has to know which
> child moved in order to animate the move.

→ **Done when** sorting by votes slides the rows, a note typed into a row stays
on that release through the sort, and removing a row makes its neighbours close
the gap instead of jumping.

### 3. The drawer — `src/App.vue`

Closing wipes `selected` in the same tick, so the panel goes blank before it has
moved a pixel. Split the two:

- `v-if` hangs on `isOpen` alone; the close button only flips that
- wrap the panel in `<Transition name="slide" @after-leave="forget">`
- `forget()` is where `selected` goes back to `null` — and where the counter is
  incremented

→ **Done when** the drawer slides out with its content still visible, and the
counter increments once the animation is over, not before.

### 4. *(Bonus)* Tune it

Bring the durations down to something you would ship (0.15–0.25s), and decide
per transition. Which of the three still reads at 0.15s, and which one needs its
time?

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the eight specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**What the specs check**

- [ ] The first tab panel fades in on load (`appear`)
- [ ] Switching tabs lets the old panel leave before the new one enters
- [ ] The list is a `<TransitionGroup tag="ul">` rendering a real `<ul>`
- [ ] A removed row leaves with the `list-leave-*` classes
- [ ] A note typed into a row follows **that release** when the list is sorted
- [ ] The drawer's data is forgotten in `@after-leave`, not in the click handler

**What only your eyes can check** — in the browser, durations at 0.4s

- [ ] Switching tabs does not make the page below jump
- [ ] Sorting by votes makes the rows **slide** to their new position
- [ ] Removing a row makes the rows below slide up — and you saw the difference
      `position: absolute` on `.list-leave-active` makes
- [ ] The drawer slides out **still showing its title**, and only then empties

**You can explain**

- [ ] Which of the six classes carries the `transition` declaration, and why
- [ ] What `out-in` costs, and when you would accept the default mode
- [ ] What FLIP measures, and why it needs a stable key
- [ ] Why `<TransitionGroup>` has no `mode`

## Going further

- Add a `<Transition>` around the whole board with `appear` and a longer
  duration. What happens to the nested transitions underneath?
- Replace the CSS transition on `fade` with a CSS **animation** and read what
  Vue does differently to detect its end.
- Use the JS hooks (`@enter`, `@leave`) with `done()` instead of CSS, and drive
  the drawer with the Web Animations API.
- Give `<Transition>` a `:duration="{ enter: 300, leave: 600 }"` and find a case
  where Vue's automatic detection gets it wrong.
