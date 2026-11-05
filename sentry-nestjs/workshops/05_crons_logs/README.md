# Workshop 05 — Cron monitors & logs

> Every night at 03:00, `PurgeJob` removes old closed issues. Last month it failed
> for a week, and nobody noticed. Monitor it — failures and missed runs — and give
> the API structured logs attached to their traces.

## Goal

Chapter 05 — What happens outside a request, and what happens inside one:

- **A cron monitor**: check-ins at the start and the end of every run; Sentry knows
  the schedule and raises *missed* and *timed out* on its own
- **Structured logs**: a template, searchable attributes, the trace of the request

## Prerequisites

- Workshop 04 done (this starter is its solution, plus `PurgeJob`)
- Chapter 05 of the deck: cron monitors, logs

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

**What is wrong**: `PurgeJob` runs at 03:00 — the specs call `run()` directly. Set
`PURGE_RETENTION_DAYS=abc` in `.env`: the purge fails, a log line, nothing else.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | `@SentryCron` | `issues/purge.job.ts` | `npm test` — the first two specs green |
| 2 | A failing run | nothing to write | `npm test` — steps 1 and 2 green |
| 3 | A structured log | `issues/issues.service.ts` | `npm test` — all green |
| 4 | *(Bonus)* `console.warn` as logs | `sentry.ts` | Spotlight shows the warnings as logs |

## Steps

### 1. Monitor the purge — `issues/purge.job.ts`

Under `@Cron`, add:

```ts
@SentryCron('nightly-purge', {
  schedule: { type: 'crontab', value: '0 3 * * *' },
  timezone: 'Europe/Paris',
  checkinMargin: 5, // minutes late before "missed"
  maxRuntime: 10, // minutes before "timed out"
})
```

- A check-in `in_progress` when `run` starts, `ok` when it resolves.
- The **schedule** goes with the check-in: the monitor is created on the first one,
  and Sentry raises **missed** when a run does not start — the app cannot report
  that it did not run.

→ **Done when** the first two specs are green.

### 2. A failing run

Nothing to write: when `run` throws, the decorator sends a check-in `error`,
captures the error and rethrows it. The spec breaks the retention on purpose.

→ **Done when** the steps 1 and 2 specs are green.

### 3. A structured log — `issues/issues.service.ts`

In `create`, after the repository:

```ts
Sentry.logger.info(Sentry.logger.fmt`Issue ${issue.id} created`, {
  'issue.id': issue.id,
  'issue.priority': issue.priority,
});
```

- `logger.fmt` keeps the template (`Issue %s created`) apart from its values: the
  logs group by template, the values are searchable attributes.
- Inside a request, the log carries the **trace id** of the request.
- SDK v11 has no `enableLogs`: using `Sentry.logger` is enough.

→ **Done when** `npm test` is fully green.

### 4. *(Bonus)* The logs you already write — `sentry.ts`

`integrations: [Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] })]`:
`console.warn` and `console.error` — Nest's `Logger` among them — become Sentry
logs.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Every run of the purge sends `in_progress`, then `ok` or `error`
- [ ] The check-ins carry the schedule, the time zone, the margin and the max runtime
- [ ] Creating an issue sends an `info` log with `issue.id`, in the trace of the request

**You can explain**

- [ ] How Sentry detects a run that never started
- [ ] Why `logger.fmt` rather than a template string
- [ ] What `Sentry.close()` on `SIGTERM` saves (see `main.ts`)

## Going further

- A BullMQ or RabbitMQ consumer: `Sentry.withMonitor` for a job,
  `Sentry.withIsolationScope` so that each message has its own user and tags.
- Replace `console` with Pino (`nestjs-pino`) and `Sentry.pinoIntegration()`.
- `beforeSendLog`: drop the `debug` logs in production.
