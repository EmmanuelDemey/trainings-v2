---
layout: cover
---

# 00 - Introduction

---

# Learning objectives

At the end of this introduction, you will:

- **Know** the day: the chapters, the five workshops, how they are checked
- **Know** what Sentry is made of — organisations, projects, DSN — and where
  the React SDK fits in it
- **Have** Spotlight running: the events of your app on your laptop, without
  an account

---
src: ../../sentry-common/slides/00_intro/agenda.md
---

---
src: ../../sentry-common/slides/00_intro/platform.md
---

---

# Sentry for React

- **`@sentry/react`** — the browser SDK (`@sentry/browser`) plus what React needs:
  an `ErrorBoundary`, the root error hooks of React 19, router integrations, a
  Redux enhancer, a `Profiler`
- This training: **Sentry JavaScript SDK 11.11**, **React 19.3**, **Vite 8**,
  **Vitest 5**, **TypeScript 7**

```bash
npm install @sentry/react
npm install -D @sentry/vite-plugin     # chapter 03: releases and source maps
```

- A framework on top of React? Use **its** SDK — `@sentry/nextjs`,
  `@sentry/react-router`, `@sentry/tanstackstart-react`: they also instrument
  the server side
- `npx @sentry/wizard@latest -i react` sets it all up in an existing project —
  today, we write it by hand, to know what every line does

---
src: ../../sentry-common/slides/00_intro/spotlight.md
---

---

# Spotlight in a React app

```ts
// src/sentry.ts
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: import.meta.env.DEV ? [Sentry.spotlightBrowserIntegration()] : [],
});
```

- The browser SDK has **no** `spotlight` option: it is an **integration**, added in
  development only — it must never reach a production bundle
- It sends a copy of every envelope to `http://localhost:8969/stream`
- **Works without a DSN**: no account, no project — the integrations are still set
  up when a Spotlight one is there
- `npx @spotlightjs/spotlight` in a terminal, the UI at `http://localhost:8969`

---
src: ../../sentry-common/slides/00_intro/workshops.md
---

---

# The workshops, in React

```bash
cd workshops/01_first_errors
npm install
npm run dev                   # the app — http://localhost:5173
npx @spotlightjs/spotlight    # its events — http://localhost:8969
npm run test:watch            # the spec — red on the starter
```

- `src/tests/setup.ts` starts **your** `initSentry()`, with a fake transport:

```ts
initSentry({ dsn: TEST_DSN, transport: sentry.transport });
```

- The spec renders the app, clicks, then reads `sentry.errors()`,
  `sentry.spans()`, `sentry.feedbacks()`… — what your SDK **would** have sent
- The API is a fake too, served in the page: `src/api/fakeServer.ts`
