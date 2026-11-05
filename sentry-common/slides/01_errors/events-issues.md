# Events and issues

<div style="display: flex; gap: 2em;">
<div>

### An event

- **One occurrence**: an exception thrown, a message captured, at one moment, for
  one user
- A JSON document with an `event_id`: the exception and its **stack trace**, the
  **tags**, the **user**, the **contexts** (browser, OS, runtime), the
  **breadcrumbs**, the **release**, the **environment**
- Sampled and **filtered** before it leaves the app (chapter 02)

</div>
<div>

### An issue

- **A group of events** that Sentry considers the same bug
- Grouped **on the server**, by a **fingerprint** — by default: the stack trace
  of the exception, else its type and message
- What you **triage**, **assign**, **resolve** — and what alerts fire on
- *First seen*, *last seen*, events count, **users affected**

</div>
</div>

```text
Issue  TypeError: Cannot read properties of null (reading 'name')   IssueDetail.tsx
 ├── event 3f2a…  user 42  Chrome 141  release web@1.4.0   09:12
 ├── event 91bc…  user 17  Safari 19   release web@1.4.0   09:14
 └── event c07d…  user 42  Chrome 141  release web@1.4.1   10:02   ← regressed?
```

---

# What travels: the envelope

The SDK sends **envelopes**: one header, then one or several **items**

```text
POST https://o123.ingest.de.sentry.io/api/456/envelope/
{"event_id":"3f2a…","sent_at":"…","sdk":{"name":"sentry.javascript.react","version":"11.11.0"},"trace":{…}}
{"type":"event"}
{"exception":{"values":[{"type":"TypeError","value":"Cannot read…","stacktrace":{…}}]},"tags":{…},"user":{…}}
```

| Item type | What it carries |
|---|---|
| `event` | An error — becomes (part of) an **issue** |
| `span` | A batch of finished spans — **tracing** (SDK v11: streamed by default) |
| `log` | A batch of structured logs |
| `session` / `sessions` | Release health: crash-free sessions and users |
| `replay_event`, `replay_recording` | Session Replay |
| `feedback`, `check_in`, `client_report` | User Feedback, Crons, what the SDK dropped and why |

<style>
table { font-size: 0.85em; }
</style>
