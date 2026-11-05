---
layout: cover
---

# 06 - Operating Sentry

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Triage** an issue stream: assign, resolve, ignore, search
- **Alert** on what matters, without waking anyone for noise
- **Connect** Sentry to the team's tools
- **Control** what you pay for
- **Review** a React app's Sentry setup before production

---
src: ../../sentry-common/slides/06_operate/triage.md
---

---
src: ../../sentry-common/slides/06_operate/alerts.md
---

---
src: ../../sentry-common/slides/06_operate/integrations.md
---

---
src: ../../sentry-common/slides/06_operate/costs.md
---

---

# The cost of a React app

| What | Where it grows | The lever |
|---|---|---|
| Errors | every user, every browser, every extension | `ignoreErrors`, `denyUrls`, `thirdPartyErrorFilterIntegration` |
| Spans | every page load, every `fetch` | `tracesSampleRate` / `tracesSampler`, `ignoreSpans` |
| Replays | every session sampled | `replaysSessionSampleRate` low, `replaysOnErrorSampleRate` high |
| Logs | every `Sentry.logger` call, every `console` with the integration | `levels`, `beforeSendLog` |

- One error in a loop, on 10,000 browsers: one bad deploy can burn a month of
  quota — set **spike protection** and per-project rate limits
- `Sentry.close()` / not calling `init` at all: no SDK for bots and preview
  deployments

---
src: ../../sentry-common/slides/06_operate/checklist.md
---

---

# Production checklist — React

- `Sentry.init` runs **before** `createRoot`, once
- Boundaries around the parts of the page that can fail on their own, each with a
  useful fallback — and the root hooks for the rest
- Source maps **hidden**, uploaded, deleted; the release injected by the build
- `tracePropagationTargets` lists **your** APIs; their CORS allows the headers
- Replay masks everything by default; consent is honoured
- Spotlight in development only; `debug: false`
- A tunnel if your users run ad blockers

---
src: ../../sentry-common/slides/retro.md
---
