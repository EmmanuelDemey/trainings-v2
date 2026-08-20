# TP 10 — Final project (optional, ½ day, in pairs, with cross-review)

> **Optional.** This workshop is the one place in the training where nothing new
> is taught. You take chapters 2 to 9, build one vertical slice of a real app
> with them, hand it to another pair, and review theirs. Half a day, two roles,
> one deliverable each.

Everything you need is already in your head or in the previous eight workshops.
What this one adds is the part a training usually skips: **someone else reads
your code and tells you what they found.**

## Goal

An invoicing back-office where one feature works end to end:

- a **composable** that fetches, cancels and never lets a stale response win
- a **store** that indexes its entities and updates optimistically
- **routes** that are lazy, guarded and role-aware
- an **async component** behind `Suspense`, with an **error boundary** around it
- a **form** validated by a Zod schema, accessible, and honest about server errors
- **tests** you wrote yourself, on the two behaviours worth testing
- a **build** you would defend

And, at the end, **three findings written on someone else's code** — which is a
deliverable too, and the harder one.

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — `nvm use` picks it up from `.nvmrc`
- Chapters 2 to 9. Workshops 2 to 9 are not required, but everything here has
  been seen in one of them.
- A pair. Not a group of three, not alone: the review round needs an even number
  of pairs, and the trainer joins as a reviewer when the count is odd.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run test:watch   # the given spec, red on the skeleton
```

One command matters more than the others, because it is the first thing your
reviewers will run:

```bash
npm run review       # typecheck + tests + build
```

## How the half-day runs

| Time | Duration | What happens |
|---|---|---|
| 0:00 | 15 min | Read this file **together**, agree on which steps you attack and in which order |
| 0:15 | 1h45 | **Build.** Driver / navigator, swap every 25 minutes |
| 2:00 | 10 min | **Freeze.** `npm run review`, then write the handover note (below) |
| 2:10 | 45 min | **Cross-review.** You review another pair's work while they review yours |
| 2:55 | 20 min | **Restitution.** 5 min per pair, then each pair fixes **one** finding on the spot |
| 3:15 | 15 min | Group debrief with the trainer |

The freeze at 2:00 is not negotiable. A reviewer cannot review a moving target,
and "it works on my machine, I was just about to commit" is the exact situation
this exercise exists to make you feel.

## Working as a pair

One keyboard. The **driver** types, the **navigator** reads the TODOs, keeps the
Definition of Done in view and says "stop, we said we would do 2.3 first". Swap
every 25 minutes, driver becomes navigator, no exception — including in the
middle of something.

Commit as you go (`git init` if you want history in this folder). It makes the
handover simpler and it gives your reviewers something to read.

## The build

Seven steps. **Steps 1, 2, 3 and 5 are the core** — a pair that does those four
well has something worth reviewing. Steps 4, 6 and 7 are where a fast pair goes
next. Doing four steps properly beats doing seven halfway, and the review will
show it either way.

### 1. `useAsyncData` — the composable (`src/composables/useAsyncData.ts`)

The only spec you are given: `tests/useAsyncData.spec.ts`, red on the skeleton.
Cancellation, out-of-order responses, `loading` that belongs to the last request,
`AbortError` swallowed, abort on scope disposal. Make the eight tests green.

> Two `refresh()` in a row must leave exactly one winner. That is the whole
> chapter-3 lesson, written as a test.

### 2. The invoices store (`src/stores/invoices.ts`)

- index + order instead of an array you scan (TODO 2.1)
- `countByStatus` and `outstandingTotal` as `computed` (TODO 2.2)
- **optimistic** `setStatus`, with rollback and a rethrow on failure (TODO 2.3)

Flip **"Simulate a server error"** in the header and change a status. The row
must move immediately, come back to its previous value, and the user must be
told. A rollback nobody is told about looks exactly like a bug.

### 3. Routing (`src/router/index.ts`, `src/views/LoginView.vue`)

- lazy-load the views that are not the entry point (TODO 3.1)
- `meta.requiresAuth`, `meta.roles` (TODO 3.2, 3.3)
- the `beforeEach` guard: `restoreSession()`, redirect with `?redirect=`, role
  check, and the signed-in user bounced away from `/login` (TODO 3.4)
- `document.title` in an `afterEach` (TODO 3.5)
- honour `?redirect=` after login — and **refuse an absolute URL** (TODO 3.6, 3.7)
- `onBeforeRouteLeave` on the form when something was typed (TODO 3.8)

Two journeys prove it: `/invoices` while signed out, and a **hard refresh** on
`/invoices` while signed in. Alan (`alan@example.com` / `user`) must not reach
`/invoices/new`.

### 4. Async component, Suspense, boundary (`src/views/InvoiceView.vue`)

`InvoiceDetail.vue` has a top-level `await`: it cannot mount without a
`<Suspense>`. Load it with `defineAsyncComponent`, give the fallback a real
skeleton, and make `/invoices/999` land in the error boundary instead of blanking
the app (TODO 4.1 → 4.4).

### 5. The form (`src/schemas/invoice.ts`, `src/views/InvoiceFormView.vue`)

- the Zod schema, and the `string` → `number` decision you can defend (TODO 5.1)
- `toFieldErrors` (TODO 5.3)
- validation on blur and on submit, without calling the API when it is invalid
  (TODO 5.4, 5.5)
- no double submit (TODO 5.6)
- the **server** error under the field it names — create `INV-1001` twice
  (TODO 5.7)
- redirect to the created invoice (TODO 5.8)

`TextField` and `ErrorSummary` are given and accessible. Keep them that way.

### 6. Your own tests (`tests/`)

Two tests, chosen by you, on the two behaviours that would hurt most if they
broke. The obvious candidates:

- **the store**: a failing `setStatus` rolls the status back and rethrows
  (`@pinia/testing` or a plain `createPinia()`, and the failure switch)
- **the form**: an invalid submit shows the messages and calls **no** API

Name them after the behaviour, not after the function. Your reviewers will read
the test names before they read the code.

### 7. Ship it

```bash
npm run build
```

- every route except the entry point is its own chunk — count them
- `grep -rn TODO src` returns nothing you left behind on purpose
- `grep -r "sk_live" dist/` — run it, then decide what to do about what you find

## Definition of Done

The floor, not the ceiling. Tick these before the freeze.

**It runs**

- [ ] `npm run review` exits 0 (typecheck, tests, build)
- [ ] No `console.log` you did not mean to keep

**The behaviours**

- [ ] The eight given tests of `useAsyncData` are green
- [ ] Clicking "Refresh" twice quickly leaves one winner, and `loading` ends false
- [ ] The store holds an index; `find()` does not scan the collection
- [ ] `countByStatus` and `outstandingTotal` are right, and update after a change
- [ ] With the failure switch on, a status change **rolls back** and says why
- [ ] `/invoices` signed out → `/login?redirect=/invoices`, and after signing in
      you land on `/invoices`
- [ ] A hard refresh on `/invoices` while signed in stays on `/invoices`
- [ ] `?redirect=https://example.com` does **not** send the user to example.com
- [ ] Alan cannot reach `/invoices/new`; Ada can
- [ ] An invalid form submit shows a summary, moves the focus to it, and makes
      no API call
- [ ] Submitting `INV-1001` shows the server's message under the **Reference**
      field

**You wrote tests**

- [ ] Two tests of your own, green, named after the behaviour they protect
- [ ] Each one fails when you break the behaviour on purpose — check it, once

**You can explain**

- [ ] Why `loading` belongs to the last request and not to the last response
- [ ] Why the request state is in the view and the entities are in the store
- [ ] What `Suspense` gives you here that `useAsyncData` does not
- [ ] What the error boundary does **not** catch

## Freeze — the handover note

Ten minutes, five lines, in a file called `HANDOVER.md` at the root of your
project:

1. **What works** — the journeys a reviewer can run
2. **What is not done** — steps skipped, and why (a deliberate cut is not a gap)
3. **Where to start** — the two files worth reading first
4. **What I am unsure about** — the decision you would like a second opinion on
5. **How to run it** — anything beyond `npm install && npm run dev`

Point 4 is the one that changes the quality of the review you get back. A pair
that writes "we hesitated between coercing in the schema and converting in the
component" gets an answer. A pair that writes "everything is fine" gets a lecture
about `:key`.

## The cross-review round — 45 minutes

Pairs swap in a ring: A reviews B, B reviews C, C reviews A. Both directions run
at the same time, so nobody waits.

**Swapping the code.** Plan A: swap machines — the reviewers sit at the authors'
keyboard, the app is already installed and running. Plan B, if you prefer your
own setup: `git bundle create ../pair-a.bundle --all`, or just zip the folder
without `node_modules/`.

**The 45 minutes, in order — the order matters:**

| | |
|---|---|
| **20 min — run it** | Before reading a single line. `npm run review`, then walk the journeys in the Definition of Done above. Write down what you observe, not what you suspect. |
| **15 min — read it** | Only now. Their `HANDOVER.md` first, then their tests, then the two files it pointed you at. You will not read everything — pick with the grid below. |
| **10 min — write it** | Three findings, maximum. Plus one thing you are keeping for your own project. |

**Three findings is a cap, not a target.** If you found eleven, the exercise is
to choose the three that matter; the choice is what you are practising. If you
found none, say so and write down the two things you checked that convinced you.

### The grid

Six axes. You are not expected to cover all six — pick the ones their handover
note and their code point you at.

| # | Axis | What you actually check |
|---|------|------------------------|
| 1 | **Contract** | The given spec is green. Refresh twice fast: one winner, `loading` false. Kill the network mid-request: what does the user see? |
| 2 | **State** | Where does request state live? Is the collection indexed or scanned? Are the getters `computed`, or functions the template calls on every render? Does the list update after a status change and after a creation? |
| 3 | **Routing & security** | Signed-out deep link, hard refresh, role check. `?redirect=https://example.com`. Leaving a half-filled form. |
| 4 | **Failure** | Failure switch on: rollback, and is the user told? `/invoices/999`: boundary or blank page? Does the `Suspense` fallback flash on a fast response? |
| 5 | **Form & a11y** | Tab through it with the keyboard only. Is every field labelled? Does the summary take focus? Is the server error attached to the right field? Can you submit twice? |
| 6 | **Ship-ability** | `npm run build`: chunk count and entry size. `grep -rn TODO src`. `grep -r "sk_live" dist/`. Do the test names say what breaks? |

> The skeleton is not above suspicion. Some of the code you were handed is
> ordinary code with ordinary defects — and once you ship it, it is yours,
> including the parts you did not write. Reviewing "the provided code" is fair
> game and finding one of those counts.

### How to write a finding

Four lines. Evidence first, opinion last:

```
[major] src/views/InvoicesView.vue:18
Observed: with the filter on "All", changing a status to "paid" leaves the row
  showing "sent" until I touch the filter. Reproduced twice.
Why it matters: the user believes the write failed and clicks again.
Smallest fix: derive the visible list with a `computed`, not a `watch`.
```

Severities, and what they mean here:

- **blocker** — a journey in the Definition of Done does not work
- **major** — it works, but a user or a maintainer will be hurt by it
- **minor** — real, cheap to fix, no user impact today
- **nit** — say it out loud, do not write it down

Two rules, both about the reviewer:

1. **Reproduce before you write.** "I think this might re-render too much" is not
   a finding. "I clicked Refresh twice and got the first response" is.
2. **Do not rewrite their code.** Propose the smallest change that removes the
   problem, and let them write it. You are reviewing a decision, not replacing it.

Style, naming and formatting are **out of scope** for this round. Not because
they do not matter, but because they are the easiest thing to talk about and
they will eat your 45 minutes if you let them.

### Restitution — 20 minutes

Five minutes per pair, out loud, to the authors:

1. The thing you are stealing for your own project (start here — it is not
   politeness, it is the finding they are least likely to know about)
2. Your three findings, evidence first
3. The authors answer with **"agreed / disagreed and why / already knew"** —
   nothing else. No defending, no redesigning on the spot.

Then each pair picks **one** finding and fixes it, in the room, in ten minutes.
Rerun `npm run review`. A review that changes nothing was a conversation.

## Debrief — the questions worth asking

- Which finding did you receive that you would never have found yourself?
- Which of your findings turned out to be wrong once the authors explained?
- What did you change in your own code **while** reviewing someone else's?
- What would you have done differently in the first 30 minutes?

## Going further

- Put the review grid in your team's pull-request template, cut down to the three
  axes your project actually gets bitten by.
- Add the two Cypress journeys from chapter 8 — deep link and rollback — and make
  the review round start with `npm run e2e` instead of a manual walk-through.
- Run the same slice with the router's data-loaders API instead of
  `useAsyncData`, and compare who owns the loading state.
- Take the finding you disagreed with and write the test that settles it.
