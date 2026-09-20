# TP 13 — Error handling & observability

> This TP is **autonomous**: it does not depend on any other TP. The ops console
> works, and one broken panel takes the whole page with it. By the end, a failure
> costs exactly one panel — and you can see it in the incident log.

## Goal

Chapter 13 — Build the net, from the inside out:

- A reusable **`<ErrorBoundary>`**, and the reason it has to be a **wrapper**
- `info`, Vue's phase string — the most useful field in a report
- `return false`, and what it also stops
- **`app.config.errorHandler`** as the last-resort net, where the **reporting**
  belongs
- The three channels Vue never sees — timers, listeners, unawaited promises —
  and the `window` net that catches them

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

`tests/errors.spec.ts` is given and **nine of its thirteen specs are red**.

The app ships a **reporter** (`src/observability/reporter.ts`) standing in for
Sentry, and an **incident log** panel that renders it. That is what turns "did
that error get reported?" into a question with an answer — on screen, and in a
spec.

Two buttons at the top break a panel on purpose. Use them constantly.

## The workshop at a glance

The four layers below are cumulative: each one catches what the previous cannot.
Step 3 writes no code — it is the five minutes that explain why step 1 had to be
a wrapper component.

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write the boundary that catches a subtree's error | `src/components/ErrorBoundary.vue` | A broken panel shows a fallback instead of blanking the page |
| 2 | Choose the granularity, panel by panel | `src/App.vue` | Breaking one panel leaves its neighbour working |
| 3 | See why a component cannot catch **itself** | `SelfHealingPanel.vue` (read only) | You can quote the line of `runtime-core` that decides it |
| 4 | The app-level net, for everything no boundary wraps | `src/createOpsApp.ts` | A report lands with `source: 'app'` |
| 5 | The `window` net, for what left Vue's pipeline entirely | `src/observability/windowNet.ts` | "Throw from a timer" and "Reject a promise" both get reported |

The incident-log panel is the scoreboard: every step above is a question about
what shows up in it, which is also what the specs assert.

## Steps

### 1. The boundary — `src/components/ErrorBoundary.vue`

1. Hold the error in a **`shallowRef`**. An `Error` is not data: deep reactivity
   buys nothing and trips on exotic error objects.
2. `onErrorCaptured((err, instance, info) => …)` — keep the error **and** `info`,
   report both with `capture(err, { info, source: 'boundary' })`, and
   `return false`.
3. Render the fallback instead of the slot: the message, the phase, and a
   **Retry** that clears the error.

> Report **before** you return `false`. Stopping the walk also stops
> `app.config.errorHandler` from ever hearing about it — the boundary decides
> what the *user* sees, `errorHandler` what *you* see.

→ **Done when** a broken child renders the fallback with its phase, Retry clears
it, and the incident log shows the report with `source: 'boundary'`.

### 2. Wrap the panels — `src/App.vue`

One boundary **per panel**, each with its own `label`. Then break the totals and
check that the self-healing panel next to it is untouched.

> The granularity of a boundary is a product decision, not a technical one: what
> is the smallest thing this user can afford to lose?

→ **Done when** breaking the totals leaves every other panel usable, and each
report carries its own `label`.

### 3. Watch a component fail to catch itself — `SelfHealingPanel.vue` (nothing to write)

`SelfHealingPanel.vue` registers `onErrorCaptured` **and** throws. Break it and
read the incident log: its own hook never ran.

```js
// runtime-core, handleError()
let cur = instance.parent;     // ⬅ not `instance`
while (cur) { /* … */ }
```

That line is the entire reason boundaries are a wrapper component. Write it down.

→ **Done when** you have seen its own hook *not* run, and can say why in one
sentence.

### 4. The last-resort net — `src/createOpsApp.ts`

Wire `app.config.errorHandler` to `capture(err, { info, source: 'app' })`. Then
break a panel **outside** any boundary and watch the report land with
`source: 'app'` instead of `'boundary'`.

> Never let this function throw. Vue catches it — `info: 'app errorHandler'` —
> and the original error is gone.

→ **Done when** an error outside every boundary lands in the log with
`source: 'app'`.

### 5. Outside the pipeline — `src/observability/windowNet.ts`

Click "Throw from a timer" and "Reject a promise" before you start: nothing is
reported. Vue only wraps the functions **it** calls; a callback handed to
`setTimeout` or a promise nobody awaited has left the pipeline.

Install two listeners on `window`:

- `'error'` — the thrown value is `event.error`, with `event.message` as fallback
- `'unhandledrejection'` — the rejected value is `event.reason`

Return an **uninstaller**: a net that cannot be removed is a leak in a test suite
and a duplicate after a hot reload.

→ **Done when** both buttons report something, and calling the uninstaller stops
them reporting again.

### 6. *(Bonus)* The rest of the map

One line each, and worth doing now rather than after the first incident:

- `app.config.warnHandler` — Vue warnings, dev only. Make a warning fail a test.
- `defineAsyncComponent({ onError })` — a chunk that failed to load.
- `router.onError`, and a Pinia plugin on `$onAction`'s `onError`, if you add
  either library to this project.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the thirteen specs
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Breaking the totals swaps that panel for a fallback and leaves its neighbour alone
- [ ] The fallback shows the message **and** the phase Vue named
- [ ] The boundary reports with `source: 'boundary'` before returning `false`
- [ ] Retry re-renders the subtree once the cause is fixed
- [ ] `app.config.errorHandler` is wired, reports with `source: 'app'`, and cannot throw
- [ ] The `window` net reports a throw from a timer and a promise nobody awaited
- [ ] `installWindowNet()` returns an uninstaller that really uninstalls
- [ ] The reporter survives a thrown string and a thrown `undefined`

**You can explain**

- [ ] Why a component never catches its own errors, and the line of `runtime-core`
      that says so
- [ ] What `return false` stops, besides the propagation
- [ ] Why `info` is more useful than a minified stack trace
- [ ] Which of the eight channels on the chapter's map this app still does not wire

## Going further

- Give the boundary a `fallback` slot, so each panel can degrade in its own way,
  and a `@error` event so a parent can react.
- Add a retry **budget**: after three failures, stop offering the button and say
  so. What does the user see on the fourth?
- Wire `app.config.warnHandler` in `tests/setup.ts` to fail the suite on any Vue
  warning, then break a prop type on purpose.
- Replace the reporter with a real Sentry SDK behind the same `capture()`
  signature. How much of this app has to change?
