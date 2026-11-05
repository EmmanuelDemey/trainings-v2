---
layout: cover
---

# 05 - Beyond errors: cron monitors and logs

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Monitor** a scheduled job: failed, late, too long — or never run at all
- **Send** structured logs, attached to their trace
- **Forward** the logs you already write — `console`, Pino, Winston
- **Shut down** without losing what the SDK still buffers

---

# The silent job

```ts
@Injectable()
export class PurgeJob {
  @Cron('0 3 * * *', { timeZone: 'Europe/Paris' })
  async run() {
    await this.repository.purgeClosed(this.retentionDays);
  }
}
```

- It **fails** at 03:00: the error is logged — in a log nobody reads at 03:00
- It **never runs**: the pod restarted at 02:59, the lock is stuck, someone
  removed `ScheduleModule` — and nothing is logged at all
- An error tracker sees the first case at best; the second needs something that
  **knows the schedule**

---

# Cron monitors — check-ins

```text
03:00:00   check-in  in_progress   ┐
03:00:04   check-in  ok            ┘ duration 4 s
--------------------------------------------------------
03:00:00   check-in  in_progress   ┐
03:00:01   check-in  error         ┘ → an issue
--------------------------------------------------------
03:05:00   (nothing)                 → "missed" — after the margin
03:00:00   check-in  in_progress
03:10:00   (nothing)                 → "timed out" — after the max runtime
```

- The app sends **check-ins**; **Sentry** keeps the schedule and raises
  *missed* and *timed out* itself — the app cannot report that it did not run
- A monitor is created on the **first check-in** that carries its config: no
  setup in the UI

---

# `@SentryCron`

```ts
import { Cron } from '@nestjs/schedule';
import { SentryCron } from '@sentry/nestjs';

@Cron('0 3 * * *', { timeZone: 'Europe/Paris' })
@SentryCron('nightly-purge', {
  schedule: { type: 'crontab', value: '0 3 * * *' },
  timezone: 'Europe/Paris',
  checkinMargin: 5,     // minutes late before "missed"
  maxRuntime: 10,       // minutes running before "timed out"
  failureIssueThreshold: 2,   // consecutive failures before an issue
})
async run() { … }
```

- `in_progress` when the method starts, `ok` or `error` when it settles — the
  error is **rethrown**, and captured
- No `schedule`? The decorator reads it from `@Cron` — when it can: say it
  explicitly, a monitor without a schedule detects nothing
- Anything else — a BullMQ worker, a k8s `CronJob`: `Sentry.withMonitor(slug,
  callback, config)`

---
src: ../../sentry-common/slides/05_beyond_errors/logs.md
---

---

# Logs in a NestJS service

```ts
@Injectable()
export class IssuesService {
  async create(input: NewIssue): Promise<Issue> {
    const issue = await this.repository.create(input);
    Sentry.logger.info(Sentry.logger.fmt`Issue ${issue.id} created`, {
      'issue.id': issue.id,
      'issue.priority': issue.priority,
    });
    return issue;
  }
}
```

- The **template** is kept apart (`sentry.message.template`: `Issue {} created`) —
  Sentry groups the logs by it, the values are attributes
- Inside a request: the log carries its **trace id** — from a slow trace to the
  logs it wrote, from a log line to the request it belongs to
- Nest's own `Logger`? Forward `console.warn` / `console.error` with
  `consoleLoggingIntegration`, or plug the SDK into **Pino** (`pinoIntegration()`,
  e.g. with `nestjs-pino`) or **Winston** (`createSentryWinstonTransport`)

---

# Queues, workers, and shutting down

<div style="display: flex; gap: 2em;">
<div>

### Outside a request

- A queue consumer, a cron, a `@OnEvent` handler: **no** request, so no isolation
  scope is forked for you
- `Sentry.withIsolationScope(() => …)` around each job — or
  `Sentry.startNewTrace(() => …)` for a trace per job
- `amqplib`, `kafkajs`, BullMQ: queue spans and trace propagation through the
  message headers

</div>
<div>

### Graceful shutdown

```ts
process.once('SIGTERM', async () => {
  await app.close();          // finish the requests in flight
  await Sentry.close(2000);   // send what is buffered
  process.exit(0);
});
```

- Events, spans and logs are **batched**: a `SIGTERM` without `close`/`flush`
  loses the last seconds — the error that made the pod crash, often
- Serverless, CLI scripts: `await Sentry.flush(2000)` before returning

</div>
</div>

<style>
.slidev-code { --slidev-code-font-size: 11px; --slidev-code-line-height: 16px; }
</style>

---
layout: cover
---

# Workshop 05

## Cron monitors & logs
