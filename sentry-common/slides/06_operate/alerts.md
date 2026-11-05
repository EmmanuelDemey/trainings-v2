# Alerts — wake up for the right reasons

<div style="display: flex; gap: 2em;">
<div>

### Issue alerts

- **When**: a new issue is created, an issue regresses, an issue escalates, an
  issue has more than *N* events / *N* users in *T*
- **If**: environment, level, tag, assigned team, priority
- **Then**: Slack, e-mail, PagerDuty / Opsgenie, a Jira ticket, a webhook
- Per issue, throttled: *at most once every 30 min*

</div>
<div>

### Metric alerts

- **On a number**: error count, **crash-free session rate**, p95 of a span, a
  failure rate, the number of logs matching a query
- **Thresholds**: critical, warning, resolved — static, **percent change**, or
  **anomaly detection**
- What an **on-call** should be paged for — a trend, not one event

</div>
</div>

<br />

> **An alert nobody acts on is noise.** Start with three: *new issue in
> production, high priority*; *crash-free sessions below 99 %*; *p95 of the
> main endpoint above its budget*. Add one when an incident shows it was missing.

---

# Uptime and cron monitors

<div style="display: flex; gap: 2em;">
<div>

### Uptime

- Sentry **probes a URL** from its regions — every minute
- Down → an issue, an alert, and the **trace** of the failing check (the probe
  sends `sentry-trace`)
- The health endpoint you already have, not a new one

</div>
<div>

### Crons

- Your **scheduled jobs** tell Sentry when they start and end — a **check-in**
- Sentry knows the **schedule**: a run that does not come is **missed**, one that
  takes too long **timed out**, one that throws **failed**
- The only way to alert on something that **did not happen**

</div>
</div>
