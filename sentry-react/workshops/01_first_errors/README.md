# Workshop 01 — First errors

> The issue tracker works — until you open issue **7**: the whole page goes blank,
> and nobody but the user ever knows. Open issue **13**: the API answers 500, the
> panel says so, and the error is forgotten. Start the Sentry SDK, catch what
> React throws, and report what the UI swallows.

## Goal

Chapter 01 — Capture errors with **`@sentry/react`**:

- **Start the SDK once**, before React renders, with the DSN and the environment
- **An error boundary** that shows a fallback, reports the crash and gives the
  user the id of the event
- **React 19's root error hooks**, for what no boundary catches
- **`captureException`** for the errors the UI handles — the ones nobody else
  will ever see

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 01 of the deck: events and issues, the anatomy of the SDK, the scopes

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the spec of the workshop
npm run test:watch   # keep it open in a second terminal
npm run typecheck    # tsc --noEmit
```

In a third terminal, start **Spotlight** — Sentry for your laptop:

```bash
npx @spotlightjs/spotlight    # http://localhost:8969
```

Every event the app sends in `npm run dev` shows up there, seconds later. No
account needed. Got a sentry.io project? Copy `.env.example` to `.env.local` and
fill in `VITE_SENTRY_DSN`: the events go there too.

The spec is already written: **`src/tests/workshop.spec.tsx`**. It renders the
whole app, clicks as a user would, then reads the envelopes your SDK sent — to a
fake transport (`src/tests/shared/sentryTestkit.ts`) that records them in memory.
Nothing leaves your machine. It is red on the starter.

> `src/tests/shared/` is a **shared copy** (the same for the React and NestJS
> editions of this training): do not edit it. Your code goes in `src/sentry.ts`,
> `src/App.tsx` and `src/components/`.

**The bugs you are about to see**, all on purpose:

- Issue **7** has no assignee, though the API promises it always has one: the
  detail panel throws while rendering, and React unmounts the **whole** app.
- `GET /issues/13` answers **500**. The panel shows the error; nothing else
  happens.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Start the SDK | `sentry.ts` | `npm test` — step 1 green |
| 2 | An error boundary around the detail panel | `App.tsx` | `npm test` — step 2 green: a fallback, one event, its id shown |
| 3 | React 19's root error hooks | `sentry.ts` | `npm test` — step 3 green |
| 4 | Report the API error the UI handles | `components/IssueDetail.tsx` | `npm test` — all green |

## Steps

### 1. Start the SDK — `sentry.ts`

1. In `initSentry()`, call `Sentry.init({ … })` (`import * as Sentry from '@sentry/react'`):
   - `dsn: import.meta.env.VITE_SENTRY_DSN` — empty is fine: the SDK then sends
     nothing to sentry.io
   - `environment: import.meta.env.MODE` — `development`, `production`, and
     `test` under Vitest
   - `integrations`: `[Sentry.spotlightBrowserIntegration()]` when
     `import.meta.env.MODE === 'development'`, `[]` otherwise
2. Spread `...overrides` **last**: the specs replace the DSN and the transport,
   and keep everything else you wrote.

`main.tsx` already calls `initSentry()` **before** `createRoot` — and after
`installFakeServer()`, so the SDK wraps the fake `fetch` as it wraps the real one.

**Check it**: in the browser console, `__SENTRY__` exists. Open issue 7 — the page
still goes blank, but Spotlight shows an error: the SDK's global handlers caught
what React rethrew.

→ **Done when** the step 1 spec is green.

### 2. An error boundary — `App.tsx`

1. Wrap `<IssueDetail id={selectedId} />` in `<Sentry.ErrorBoundary>`.
2. Its `fallback` is a function: `({ eventId, resetError }) => <ErrorFallback
   eventId={eventId} resetError={resetError} />` (`./components/ErrorFallback`).
3. Give the boundary `key={selectedId}`: opening another issue starts from a
   fresh boundary, not from the fallback of the previous one.

**Check it**: open issue 7. The fallback replaces the detail panel only — the list
is still there — and shows the event id. Search for it in Spotlight: same id.

→ **Done when** the step 2 specs are green.

### 3. React 19's root error hooks — `sentry.ts`

A boundary only catches what happens **below** it. For the rest, React 19 calls
the error hooks of the root:

```ts
export const rootOptions: RootOptions = {
  onUncaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
};
```

`main.tsx` already passes `rootOptions` to `createRoot`. Leave `onCaughtError`
out: what a `Sentry.ErrorBoundary` catches, it already reports — twice would be
once too many.

→ **Done when** the step 3 spec is green.

### 4. The error nobody sees — `components/IssueDetail.tsx`

The `.catch` of the detail fetch turns the 500 into a message on screen: neither
React nor the browser ever sees an error. Report it there, before `setState`:
`Sentry.captureException(error)`.

**Check it**: open issue 13. Spotlight shows `ApiError: GET /issues/13 → 500`,
with a stack trace that starts in `client.ts`.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Opening issue 7 shows the fallback, and the list stays on screen
- [ ] The id in the fallback is the id of the event in Spotlight
- [ ] Opening issue 13 sends one event; opening issue 1 sends none
- [ ] `Sentry.init` is called once, before `createRoot`

**You can explain**

- [ ] What a DSN is, and why it is not a secret
- [ ] What the boundary reports, what the root hooks report, and why
      `onCaughtError` is left out
- [ ] Why the 500 of issue 13 needs a `captureException`, when the crash of
      issue 7 does not

## Going further

- Throw in an event handler (`onClick={() => { throw new Error('click') }}`): who
  reports it — the boundary, the root hooks, or the SDK's global handlers? Why?
- Add `debug: true` to `Sentry.init`, reload: the console tells you every step of
  the SDK, from integrations set up to envelopes sent.
- Remove `key={selectedId}`, open issue 7 then issue 1: what does the panel show?
