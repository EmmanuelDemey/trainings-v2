# Workshop 01 — First errors

> The API works — until the database shard of issues 13 and 14 goes down. Then
> it answers a clean 500, logs a stack trace nobody reads, and nobody knows.
> Plug Sentry in, and make sure it reports the bugs — only the bugs.

## Goal

Chapter 01 — Start **`@sentry/nestjs`** the way production needs it:

- **`Sentry.init` before anything else**, in a file loaded with `node --import`
- **`SentryModule.forRoot()`**: events named after their route
- **An exception filter that reports**: the app already has a catch-all filter —
  decorate it instead of adding `SentryGlobalFilter`
- **A 500 is a bug, a 404 is not**: `HttpException`s are never reported

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 01 of the deck: events and issues, the SDK, capturing

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

**The bugs you are about to see**, with the API running:

- `curl localhost:3000/issues/13` answers `{"statusCode":500,…}` — the terminal
  shows a stack trace, Spotlight shows **nothing**.
- `curl localhost:3000/issues/999` answers 404, and `curl -X POST
  localhost:3000/issues -H 'content-type: application/json' -d '{}'` answers 400:
  the caller's mistakes — they must **stay** out of Sentry.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Write `initSentry()` | `sentry.ts` | The SDK starts: `npm run start:dev` prints no error, Spotlight lists the API |
| 2 | Understand `--import` | `package.json`, `instrument.ts` | You can say why `Sentry.init` in `main.ts` is too late |
| 3 | `SentryModule.forRoot()` | `app.module.ts` | Nothing visible yet — the events will be named after their route |
| 4 | Report from the catch-all filter | `all-exceptions.filter.ts` | `npm test` — all green |

## Steps

### 1. Start the SDK — `sentry.ts`

`initSentry(overrides)` is the one function the app (through `instrument.ts`) and
the specs call. Write it:

```ts
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  spotlight: process.env.NODE_ENV === 'development' && Boolean(process.env.SENTRY_SPOTLIGHT),
  ...overrides, // last: the specs replace dsn and transport
});
```

- An empty DSN is fine: the SDK sends nothing to sentry.io, Spotlight still works.
- `environment`: `development` with `npm run start:dev`, `test` under Vitest,
  `production` in production — every event says where it comes from.

→ **Done when** the spec "reports the environment it runs in" no longer fails on
`environment` (it still needs step 4 to send an event at all).

### 2. Why `--import` — `package.json`, `instrument.ts`

Nothing to write: read. `start:dev` runs `node --import ./dist/instrument.js`, and
`instrument.ts` only calls `initSentry()`.

The SDK is built on OpenTelemetry: it patches `http`, Express and the database
drivers **as they are loaded**. In ESM, the `import`s of `main.ts` are evaluated
before its first line — `Sentry.init` at the top of `main.ts` would come after
Express is loaded, unpatched: no per-request isolation, no spans, no route names.

→ **Done when** you can explain it to your neighbour — and find where the specs do
the same thing (`setupFiles` in `vitest.config.ts`).

### 3. `SentryModule.forRoot()` — `app.module.ts`

Import `SentryModule` from `@sentry/nestjs/setup` and put `SentryModule.forRoot()`
**first** in `imports`. Its interceptor names the events of each request after
its route template: `GET /issues/:id`, not `GET /issues/13`.

→ **Done when** the app still starts.

### 4. Report from the catch-all filter — `all-exceptions.filter.ts`

`AllExceptionsFilter` is a `@Catch()` filter: it catches **every** error and turns
it into JSON. Nest's exception handling never sees an error again — and neither
would `SentryGlobalFilter`.

1. Decorate its `catch` method with `@SentryExceptionCaptured()` from
   `@sentry/nestjs`. It reports the exception, then runs your `catch`.
2. Do not touch the response: the spec checks the JSON is unchanged.

**Check it**: with Spotlight open, `curl localhost:3000/issues/13`: one error,
`Database connection lost`, transaction `GET /issues/:id`. Then the 404 and the
400 from above: nothing new in Spotlight.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds, and `npm run start:dev` starts the API
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] `GET /issues/13` sends **one** event, named `GET /issues/:id`
- [ ] A 404 and a 400 send **nothing**
- [ ] The error response of the API is unchanged
- [ ] `Sentry.init` is called in exactly one place: `initSentry()`

**You can explain**

- [ ] Why the SDK must be loaded with `--import`, before the app
- [ ] Why `SentryGlobalFilter` would not work in this app
- [ ] Why an `HttpException` is never reported, and when that would be wrong

## Going further

- Remove `SentryModule.forRoot()` and run the specs: which assertion fails, and why?
- Throw an error from `onModuleInit` of a provider: no request, no filter — what
  reports it?
- `throw new InternalServerErrorException()` in a handler: a 500, and not
  reported. Should it be? How would you capture its cause?
