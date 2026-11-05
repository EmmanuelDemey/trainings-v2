# Workshop 05 — Session Replay & User Feedback

> The crash of issue 7 is in Sentry, with its stack trace, its user and its
> breadcrumbs. What is missing is what the user **saw**, and what they wanted to
> do. Record the minute before every error — with every text masked — and let the
> user tell you, from the fallback, linked to the crash.

## Goal

Chapter 05 — Beyond errors, on the browser side:

- **Session Replay**: a recording of the DOM, not a video — privacy first:
  `maskAllText`, `blockAllMedia`
- **Sampling**: no session recorded on its own, every session with an error
- **User Feedback**: a form in the fallback, sent with `captureFeedback`, linked
  to the event of the crash

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Workshop 04 done, or start from this folder: its starter is workshop 04's solution
- Chapter 05 of the deck: Session Replay, User Feedback

## Setup

```bash
npm install
npm run dev                   # http://localhost:5173
npx @spotlightjs/spotlight    # http://localhost:8969, in another terminal
npm run test:watch
```

The spec, **`src/tests/workshop.spec.tsx`**, is red on the starter. jsdom has no
rendering engine: the spec checks how Replay is **configured**, not the recording.
Watch the recording itself in Spotlight, or in Sentry.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Session Replay, masked, on error | `sentry.ts` | `npm test` — step 1 green |
| 2 | A feedback form in the fallback | `sentry.ts`, `components/ErrorFallback.tsx` | the form sends |
| 3 | Thank the user | `components/ErrorFallback.tsx` | `npm test` — all green |

## Steps

### 1. Session Replay — `sentry.ts`

1. Add `Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })`.
   Every text becomes `****`, every image and video a grey box: what the user
   typed or read never leaves the browser. Unmask what you know is safe with the
   `sentry-unmask` class, never the other way round.
2. `replaysSessionSampleRate: 0` and `replaysOnErrorSampleRate: 1`. With 0, no
   session is sent on its own; with 1 on error, the SDK keeps the last 60 seconds
   in memory and sends them when an error happens. In production, 0.1 and 1.

**Check it**: open issue 7. In Spotlight, the error has a **Replay**: the clicks
that led to it, every text masked.

→ **Done when** the step 1 specs are green.

### 2. A feedback form — `sentry.ts`, `components/ErrorFallback.tsx`

1. Add `Sentry.feedbackIntegration({ autoInject: false })`: the API of the
   feedback, without the floating "Report a bug" button — the fallback shows its
   own form.
2. In `ErrorFallback`, a form `report-feedback`: a `textarea` `feedback-message`
   and a submit button `feedback-submit`.
3. On submit: `Sentry.captureFeedback({ message, associatedEventId: eventId })`.
   The feedback lands **on the issue of the crash**, next to its replay.

→ **Done when** the form sends, and a `feedback` envelope shows in Spotlight.

### 3. Thank the user — `components/ErrorFallback.tsx`

Once sent, replace the form with `feedback-sent`: "Thank you — your message was
sent with the report."

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box. The "Going further" section is **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] A replay attached to the crash of issue 7, every text masked
- [ ] No replay sent for a session without an error
- [ ] The feedback is linked to the event the fallback shows

**You can explain**

- [ ] Why a replay is not a video, and what that means for its size
- [ ] `replaysSessionSampleRate` vs `replaysOnErrorSampleRate`
- [ ] What `maskAllText` protects, and what it does not (network bodies, URLs)
- [ ] Why the feedback carries `associatedEventId`

## Going further

- Remove `autoInject: false`: the floating button appears. `Sentry.getFeedback()`
  gives you its API, to open it from your own "Help" menu.
- The Replay bundle weighs about 50 kB gzipped: `Sentry.lazyLoadIntegration('replayIntegration')`
  loads it after the page.
- Ad blockers block requests to `*.ingest.sentry.io`. The `tunnel` option sends
  the envelopes to your own server, which forwards them.
