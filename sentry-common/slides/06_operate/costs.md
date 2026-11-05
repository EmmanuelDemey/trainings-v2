# Quotas and costs — you pay for what you send

<div style="display: flex; gap: 2em;">
<div>

### Billed by volume, per category

- **Errors**, **spans**, **replays**, **attachments**, **logs** (GB), **cron
  monitors**, **uptime monitors**, **profile hours**
- A **reserved** volume per month, then **pay-as-you-go** up to a budget
- Over budget: events are **dropped** — at the worst moment, the incident

</div>
<div>

### Where the volume comes from

- **One noisy issue**: a loop that captures, a bot, a browser extension — the
  top 10 issues are usually most of the volume
- **Traces** at `tracesSampleRate: 1` in production
- **Replays** of every session
- **Logs** of every `console.log`

</div>
</div>

---

# Keeping the bill under control

| Where | Lever |
|---|---|
| **SDK** — before the network | `ignoreErrors`, `denyUrls`, `beforeSend` → `null`; `tracesSampler`; `ignoreSpans`; `replaysSessionSampleRate`; `beforeSendLog` |
| **Project settings** — before the quota | Inbound filters (legacy browsers, crawlers, localhost, error messages); **rate limits per DSN** (key) |
| **Organisation** | **Spike protection**; per-category budgets; **dynamic sampling** for spans (server side) |
| **Issue** | *Archive until escalating* does **not** stop the events — fix or filter the source |

<style>
table { font-size: 0.8em; }
</style>

<br />

- **Stats** (Settings → Stats & Usage): accepted, filtered, rate limited, dropped
  — per category, per project, per reason
- `client_report` items tell Sentry what the **SDK** dropped and why — visible in
  the same page
