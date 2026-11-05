---
layout: cover
---

# 00 - Introduction

---

# Learning objectives

At the end of this introduction, you will:

- **Know** the day: the chapters, the five workshops, how they are checked
- **Know** what Sentry is for on a server — and what it is not
- **Have** Spotlight running, ready to show what your API sends

---
src: ../../sentry-common/slides/00_intro/agenda.md
---

---
src: ../../sentry-common/slides/00_intro/platform.md
---

---

# Sentry for NestJS

- **`@sentry/nestjs`** — `@sentry/node` (OpenTelemetry inside) plus what Nest
  needs: a module, an exception filter, decorators for spans and crons
- This training: **Sentry JavaScript SDK 11.11**, **NestJS 12.3** (ESM),
  **Node.js 24**, **Vitest 5**, **TypeScript 6.0**
- NestJS 8 to 12 are supported; the workshops run 12

```bash
npm install @sentry/nestjs
npm install -D @sentry/cli                 # chapter 03 — source maps
npm install @sentry/profiling-node         # optional — CPU profiles
```

- Or the wizard, on an existing project: `npx @sentry/wizard@latest -i nestjs` —
  it writes the same three files you will write by hand today

---
src: ../../sentry-common/slides/00_intro/spotlight.md
---

---

# Spotlight, in NestJS

```ts
// src/sentry.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,                       // empty: nothing goes to sentry.io
  environment: process.env.NODE_ENV ?? 'development',
  spotlight: process.env.NODE_ENV === 'development' && Boolean(process.env.SENTRY_SPOTLIGHT),
});
```

```bash
# .env — read by `node --env-file-if-exists=.env`
SENTRY_SPOTLIGHT=1          # or the sidecar's URL: http://localhost:8969/stream
NODE_ENV=development
```

- On Node, `spotlight` is an **option** of `Sentry.init`: `true`, or the
  sidecar's URL — `true` also reads the URL from `SENTRY_SPOTLIGHT`
- It works **without a DSN**: the SDK still runs its integrations and sends a copy
  of every envelope to the sidecar
- Two terminals: `npx @spotlightjs/spotlight`, then `npm run start:dev`

---
src: ../../sentry-common/slides/00_intro/workshops.md
---

---

# The workshops, in NestJS

```bash
cd workshops/01_first_errors
npm install
npm run test:watch      # the given specs — red on the starter
npm run start:dev       # the API on http://localhost:3000, Spotlight on :8969
```

```text
src/
  instrument.ts        loaded first, with `node --import` — calls initSentry()
  sentry.ts            initSentry(overrides) — YOUR Sentry.init options
  main.ts              NestFactory.create(AppModule)
  app.module.ts        SentryModule.forRoot() · the catch-all filter · the guard
  issues/              controller · service · repository (in memory, with bugs)
  tests/setup.ts       YOUR initSentry(), with a fake transport — before the app loads
  tests/shared/        the test kit, a copy — never edit it
```

- The specs drive the **whole app** with `supertest`, then read what would have
  reached Sentry
