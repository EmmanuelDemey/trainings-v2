---
layout: cover
---

# 05 - Beyond errors: Session Replay and User Feedback

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Record** what the user saw before an error — without recording what they typed
- **Sample** replays: the sessions with an error, a fraction of the others
- **Collect** feedback from the user, linked to the error they hit
- **Send** logs from the browser, attached to the trace

---

# Session Replay — what the user saw

```ts
Sentry.init({
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  replaysSessionSampleRate: 0.1,   // 10 % of all sessions, from the start
  replaysOnErrorSampleRate: 1,     // every session with an error: the minute before it
});
```

- Not a video: a recording of the **DOM** and its mutations (rrweb) — a few
  hundred kB, replayed in Sentry's player, with the console and the network
- **On error**: the SDK keeps the last 60 seconds **in memory**, and sends them only
  if an error happens — the replays you actually watch
- About **50 kB gzipped**: `Sentry.lazyLoadIntegration('replayIntegration')` and
  `Sentry.addIntegration(…)` load it after the page

---

# Replay and privacy

- Defaults: **every text masked** (`****`), **every input masked**, **every media
  blocked** — keep them, unmask what you know is safe

```html
<span class="sentry-unmask">{issue.title}</span>      <!-- shown as is -->
<div class="sentry-block"><CreditCardForm /></div>    <!-- a grey box -->
<input class="sentry-ignore" />                       <!-- no input events -->
```

- `networkDetailAllowUrls: [API_URL]` records request and response **bodies** of
  your API — off by default, and for a reason
- A replay is **personal data**: say so in your privacy policy, mind your
  retention, and honour consent before `replayIntegration` starts
- Check it **in Sentry**, on a real replay, before you ship: what the player
  shows is what you collected

---

# User Feedback

```tsx
Sentry.init({ integrations: [Sentry.feedbackIntegration({ autoInject: false })] });

function ErrorFallback({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState('');
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      Sentry.captureFeedback({ message, associatedEventId: eventId });
    }}>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button>Send</button>
    </form>
  );
}
```

- `associatedEventId`: the feedback lands **on the issue**, next to its replay
- Without `autoInject: false`: a floating "Report a bug" button, with a
  screenshot tool — `Sentry.getFeedback()?.attachTo(button)` for your own

---
src: ../../sentry-common/slides/05_beyond_errors/logs.md
---

---

# Logs from the browser

```ts
Sentry.logger.info(Sentry.logger.fmt`Issue ${id} opened from ${source}`, { 'issue.id': id });

Sentry.init({
  integrations: [Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] })],
});
```

- No `enableLogs` in v11: the first `Sentry.logger.*` call, or a logging
  integration, turns them on
- Every log carries the **trace id** and the user: from a log to its trace to its
  replay
- A browser has many users: log **what you would search for**, not every render

---

# Getting the events out — ad blockers and CSP

```ts
Sentry.init({ tunnel: '/monitoring' });   // POST /monitoring → your server → Sentry
```

- Ad blockers block `*.ingest.sentry.io`: **10 to 30 %** of your errors never
  arrive. A **tunnel** on your own domain forwards the envelopes — check the DSN
  in it, or anyone can send to your project
- **Content Security Policy**: allow the ingest URL, and Replay's worker

```http
Content-Security-Policy: connect-src 'self' https://*.ingest.sentry.io; worker-src 'self' blob:
```

- Sentry can **receive** CSP violation reports too: `report-uri` with the
  project's security endpoint

---
layout: cover
---

# Workshop 05

## Session Replay & User Feedback
