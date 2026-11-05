# Logs — attached to the trace

```ts
Sentry.logger.info('Issue created', { 'issue.id': issue.id, 'issue.priority': issue.priority });
Sentry.logger.warn(Sentry.logger.fmt`Slow query on ${table}: ${ms} ms`);
Sentry.logger.error('Payment refused', { 'order.id': order.id, provider: 'stripe' });
```

<div style="display: flex; gap: 2em;">
<div>

- **Structured**: a message and **attributes** — searchable, filterable, chartable
  in **Logs Explorer**
- `logger.fmt` keeps the **template** apart from its values: the message stays
  groupable, the values become attributes
- Levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

</div>
<div>

- Each log carries the **trace id** and the **span** it was written in: from a
  slow span to its logs, from an error to what was logged just before
- Plus `release`, `environment`, `user.id` — from the scopes
- Batched, sent in `log` envelope items

</div>
</div>

<br />

> **v11 removed `enableLogs`**: logs are sent as soon as you call `Sentry.logger.*`
> or add a logging integration. Filter or scrub them in **`beforeSendLog`**.

---

# Logs you already write

```ts
Sentry.init({
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] }),  // console.warn / console.error
  ],
  beforeSendLog(log) {
    if (log.level === 'debug') return null;      // drop
    return log;
  },
});
```

- `consoleLoggingIntegration` forwards `console.*` calls — choose the **levels**,
  `console.log` everywhere is a bill
- Server side: integrations for **Pino** and **Winston** forward the logger you
  already have
- Logs are **not** errors: a `logger.error` does **not** create an issue — capture
  the exception when it is a bug
- Logs cost **by volume** (chapter 06): log what you would search for during an
  incident, not every function call
