# TP 1 — Vue Devtools

> This TP is **autonomous**: it does not depend on any other TP. The app works as
> shipped. It is also re-rendering three times a second for nothing, and you will
> only see that in the panel — which is the entire point of this first hour.

## Goal

Chapter 1 — Stop guessing, start reading the instrument:

- **Turn the tracing on** and find Vue's marks in the browser's Performance panel
- **Read the Timeline** to answer *what re-rendered when I did that, and how
  many times?*
- **Fix two wasted renders**, with the counter as proof
- **Drive state from the Components tab** to reach a state you cannot type your
  way into

House rule for the next three days, and it starts here: **no optimization
without a before/after measurement**.

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **Vue Devtools** browser extension (Chrome or Firefox). Nothing to install
  in this project — install it in your browser before you start.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Open the app, open the browser devtools, and select the **Vue** tab. Keep it
next to the page for the whole workshop.

`tests/dashboard.spec.ts` is given, and it is **red** on the skeleton. It asserts
render counts and DOM — the same two things the panel shows you. Keep
`npm run test:watch` in a second terminal.

The app displays its own **render counters** at the bottom, with a **Reset**
button. That panel is the scoreboard: reset it, do one thing, read it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Turn Vue's tracing on, and find its marks in the Performance panel | `src/createDashboardApp.ts` | You have the widest render bar's duration written down |
| 2 | Move the ticking clock out of the root component | `src/App.vue` → a new `src/components/ClockBadge.vue` | Five idle seconds move **one** counter, not three |
| 3 | Stop the stats panel re-rendering on every keystroke | `src/App.vue` + `src/components/StatsPanel.vue` | Typing moves `TicketList` and **not** `StatsPanel` |
| 4 | Render the empty state you reached from the panel | `src/components/TicketList.vue` | A filter matching nothing renders the message and no `<table>` |
| 5 | Read the component tree, and answer | nothing to edit | You can answer the three questions without running anything |

Steps 2, 3 and 4 are the ones `npm test` grades. Steps 1 and 5 are graded by
what you can say out loud, with the panel open.

## Steps

### 1. Turn the instrument on — `src/createDashboardApp.ts`

One line, guarded by `import.meta.env.DEV`. Then:

1. Open the browser's **Performance** panel (not the Vue one), record a profile
   while you type one letter in the filter, and stop.
2. Find the Vue marks — `init`, `compile`, `render`, `patch` — and write down the
   duration of the **widest render bar**.
3. Answer: why is this guarded by `DEV`, and what does the Vue panel show on a
   production build?

→ **Done when** the Vue marks are visible in the Performance panel and you have
the widest render duration written down.

### 2. Find the render nobody asked for — the clock (`src/App.vue`)

1. In the Vue panel, open the **Timeline**, start recording, and **do nothing at
   all** for five seconds.
2. Read back the component events. Two components update every second while
   nothing on screen changes. Name them before reading further.
3. The cause is in `App.vue`. Move the ticking state into a **`ClockBadge.vue`**
   of its own: it renders the time inside `data-testid="clock"`, counts its
   renders as `'ClockBadge'`, and clears its interval on unmount. `App.vue` must
   stop reading `now`.

**Measure it**: reset the counters, wait five seconds, read them again. Before,
three counters moved; after, one does.

→ **Done when** `ClockBadge.vue` owns the interval and clears it on unmount, and
five idle seconds move that one counter alone.

### 3. Find the second one — the keystroke (`src/App.vue` + `StatsPanel.vue`)

1. Record again, and this time type `billing` in the filter.
2. `StatsPanel` re-renders on every keystroke. It counts *every* ticket of the
   desk — the filter is none of its business. Why does it re-render anyway?
3. Fix it in two places: `App.vue` builds a new object and a new array on every
   render (`:state="{ tickets, filter }"`, `:tickets="tickets.filter(...)"`), and
   `StatsPanel` asks for more than it reads. Hoist the list into a `computed`,
   and give the stats panel the `tickets` array itself.

**Measure it**: reset, type six letters, read the counters. `TicketList` moves,
`StatsPanel` does not.

> The lesson is **prop identity**: Vue skips a child whose props are identical.
> A literal in a template is never identical to the one before it.

→ **Done when** `StatsPanel` takes `tickets: Ticket[]`, six keystrokes move
`TicketList` only, and you have the counters before and after.

### 4. Reproduce a state without typing it — `src/components/TicketList.vue`

1. Select the `App` component in the panel, find the `filter` ref, and **edit it
   from the panel** to `kangaroo`.
2. The table renders a header and no row — the app looks broken rather than
   empty. Fix `TicketList.vue`: render a message in an element carrying
   `data-testid="empty"`, and keep the table out of the DOM in that case.
3. *(Bonus)* Set `filter` to a value with an accent (`é`) and check what
   `matches()` does with it.

→ **Done when** a filter matching nothing renders the `data-testid="empty"`
message, with no `<table>` left in the DOM.

### 5. Read the tree — nothing to edit

Without running anything, answer from the **Components** tab alone:

- Which component owns `filter`, and which ones merely receive it?
- What are `StatsPanel`'s props *now*, and what were they before step 3?
- Which of these components would disappear from the panel on a production
  build, and why?

→ **Done when** you can answer the three out loud, from the tree alone.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the five specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No Vue warning in the browser console

**The behaviour is there**

- [ ] `app.config.performance` is on in development **and off in a production build**
- [ ] `ClockBadge.vue` exists, owns the interval, and clears it on unmount
- [ ] Resetting the counters and waiting five seconds moves **only** `ClockBadge`
- [ ] Typing in the filter moves `TicketList` and **not** `StatsPanel`
- [ ] `StatsPanel` takes `tickets: Ticket[]` and the desk-wide counts do not change
      when a filter is applied
- [ ] A filter matching nothing renders the empty message, and no `<table>`

**You measured it**

- [ ] You have the widest render duration from the Performance panel, written down
- [ ] You have the counters before and after step 2, written down
- [ ] You have the counters before and after step 3, written down

**You can explain**

- [ ] Why `:state="{ tickets, filter }"` defeats Vue's "skip this child" check
- [ ] What the Timeline told you that reading `App.vue` did not
- [ ] Why the Vue panel goes quiet on a production build
- [ ] In under 30 seconds: *who owns this state, and what re-rendered when I clicked?*

## Going further

- Install `vite-plugin-vue-devtools` in this project and compare it with the
  extension: which tabs do you gain, and what does open-in-editor change in your
  loop?
- Put `filter` in a `provide()` at the app level and look at the Components tab
  again: where does an injected value show up, and on which component?
- Add a second `createApp()` to `main.ts` mounting a tiny widget, and find the
  app selector in the panel.
- Turn the counters into a `watchEffect` that logs to the console instead. Which
  of the two instruments would you keep in a real codebase?
