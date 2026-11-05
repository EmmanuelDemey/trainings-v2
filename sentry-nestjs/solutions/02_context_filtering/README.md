# Workshop 02 — Context & filtering

> Sentry now sees the database errors — as two issues that are one, with no idea
> who they hit, and with the password of whoever crashed the login. Give each
> event its context, group by cause, and decide what never leaves the API.

## Goal

Chapter 02 — Make every event **useful**, and **safe**:

- **Who**: the user of the request — its id only — set in a guard, on the
  **isolation scope**: two concurrent requests never mix
- **What**: a tag `issue.id` on the events of `GET /issues/:id`
- **Why**: one issue per database failure mode — a **fingerprint** from the error
- **Not that**: SDK v11 collects request bodies, cookies and headers by default —
  `dataCollection` says what may leave

## Prerequisites

- Workshop 01 done (this starter is its solution)
- Chapter 02 of the deck: enrichment, grouping, filtering, PII

## Setup

```bash
nvm use              # Node.js 24, from .nvmrc
npm install
npm test             # vitest run — the given specs, red on the starter
npm run test:watch   # keep it open in a second terminal
npm run typecheck    # tsc --noEmit
cp .env.example .env
npm run start:dev    # the API on http://localhost:3000
```

To **see** what the API sends, start Spotlight in another terminal —
`npx @spotlightjs/spotlight` — and open http://localhost:8969. `.env` already
has `SENTRY_SPOTLIGHT=1`. A real project of sentry.io is optional: put its DSN in
`SENTRY_DSN`.

The specs are already written: **`src/tests/workshop.spec.ts`**. They start the SDK
with **your** `initSentry()` (`src/tests/setup.ts`, before the app is loaded — what
`node --import` does for the real server), with a fake transport that records the
envelopes; they drive the whole app with `supertest`, then read what would have
reached Sentry.

> `src/tests/shared/` is a **shared copy** of the test kit (the same for the
> React and NestJS editions of this training): do not edit it.

**What is wrong**, with Spotlight open:

- `curl localhost:3000/issues/13 -H 'x-user-id: u-1'`: the event has no user, no
  issue id.
- `/issues/13` then `/issues/14`: in sentry.io, two issues for one outage.
- `curl -X POST localhost:3000/auth/login -H 'content-type: application/json' -H
  'authorization: Bearer secret' -d '{"email":"crash@example.com","password":"hunter2"}'`:
  open the event — the **request body**, with `hunter2`, is in it.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The user of each request | `user.guard.ts` | `npm test` — step 1 green |
| 2 | A tag `issue.id` | `issues/issues.controller.ts` | `npm test` — step 2 green |
| 3 | A fingerprint per `DatabaseError` code | `sentry.ts` (`beforeSend`) | `npm test` — step 3 green |
| 4 | `dataCollection` | `sentry.ts` | `npm test` — all green |

## Steps

### 1. Who — `user.guard.ts`

`UserGuard` runs on every request (`APP_GUARD`). It reads `x-user-id`, set by the
API gateway. Call `Sentry.setUser({ id: userId })` when there is one.

- **The id only**: no email, no name. The id is enough to find the user; the rest
  is personal data you would have to justify.
- `Sentry.setUser` writes the **isolation scope** — forked for each request by the
  `http` instrumentation. The spec sends two failing requests **at the same time**,
  for two users: each event must carry its own.

→ **Done when** the step 1 specs are green.

### 2. What — `issues/issues.controller.ts`

In `findOne`, before calling the service: `Sentry.setTag('issue.id', id)`. A tag is
indexed: in sentry.io, "every error about issue 13" is one search.

→ **Done when** the step 2 spec is green.

### 3. One issue per cause — `sentry.ts`

Sentry groups by stack trace: the same `DatabaseError` thrown from two routes, or
with two messages, may become two issues. Group by **failure mode** instead:

```ts
beforeSend(event, hint) {
  const error = hint.originalException;
  if (error instanceof DatabaseError) {
    event.fingerprint = ['database-error', error.code];
  }
  return event;
},
```

- `hint.originalException` is the thrown value itself — its class, its `code`.
- Every other error keeps Sentry's grouping: the spec checks the login crash has no
  fingerprint.

→ **Done when** the step 3 specs are green.

### 4. What never leaves the API — `sentry.ts`

Since SDK v11, `dataCollection` replaces `sendDefaultPii` — and its default is
**permissive**. Add:

```ts
dataCollection: {
  userInfo: false,        // no IP address
  cookies: false,
  httpBodies: [],         // no request or response body
  httpHeaders: { request: { allow: ['content-type', 'user-agent', 'x-user-id'] }, response: false },
},
```

- An **allowlist** for headers: the header someone adds next year stays out.
- `authorization` is filtered even by default; **bodies are not**.

**Check it**: the login crash again — no body, the headers you did not allow show
`[Filtered]`, no IP address.

→ **Done when** `npm test` is fully green.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Each event carries the `user.id` of its own request, and nothing else about the user
- [ ] The events of `GET /issues/:id` carry the tag `issue.id`
- [ ] Every `DatabaseError` with the same code has the same fingerprint
- [ ] No request body, no cookie, no IP address, and only allowed headers reach Sentry

**You can explain**

- [ ] Why `Sentry.setUser` in a guard does not leak to another request
- [ ] When a fingerprint helps, and when it hurts
- [ ] What SDK v11 changed in the defaults, and why that matters for an API

## Going further

- Move the tag to an interceptor that tags **every** route with its params.
- `ignoreErrors` and `beforeSend` returning `null`: drop a `DatabaseError` with the
  code `EINVAL` — it is a configuration mistake, alert on it elsewhere.
- Look at the **server-side** scrubbing settings of your sentry.io project: what
  would they have caught, and what not?
