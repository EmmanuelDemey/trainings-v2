# Sentry for NestJS — Workshops

Hands-on exercises for the **Sentry for NestJS** training, based on **Sentry
JavaScript SDK 11.11**, **NestJS 12.3** (ESM), **Vitest 5**, **supertest 7**,
**TypeScript 6.0** and **Node.js 24**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. Each starter is the solution of the
previous workshop plus what is new — start any workshop with a clean slate, even
if you did not finish the previous one.

## Get the workshops

One part of every workshop is **not in the repository**: the test kit
(`src/tests/shared/`). Its single source is `sentry-common/`, next to this
training, and a script copies it into every workshop. So **do not download a
workshop folder on its own**: clone the whole repository, then run the copy once,
from the training's folder:

```bash
git clone --depth 1 https://github.com/EmmanuelDemey/trainings-v2.git
cd trainings-v2/sentry-nestjs
npm run sync         # copies src/tests/shared/ into every workshop and solution
```

The ZIPs of the workshops site, and its online editor (StackBlitz), already
contain it.

Then, in each workshop:

```bash
cd 01_first_errors
npm install
npm test             # vitest run — the specs of the workshop, red on the starter
npm run test:watch   # the same, in watch mode: keep it open while you work
npm run typecheck    # tsc --noEmit
cp .env.example .env
npm run start:dev    # the API on http://localhost:3000
```

## Before the day — check your machine

- **Node.js 24** (`.nvmrc` pins it; `nvm use` picks it up). Every workshop accepts
  `^22.22.2 || ^24.15.0 || >=26.0.0`.
- Run `npm install` in **every** workshop folder at home.
- `npx @spotlightjs/spotlight` once, to download it: on the day, it shows what the
  API sends, on http://localhost:8969.
- Optional: a free **sentry.io** account and a Node.js project — for chapter 03
  (source maps resolved by Sentry) and chapter 06 (alerts, dashboards). No
  workshop requires it.

## Toolchain versions

Dependencies were last refreshed on **2026-11-05**. **TypeScript 6.0** (`~6.0.3`),
not 7: the Nest CLI 12 needs the compiler API that TypeScript 7.0 does not ship.
The specs run on **Vitest** with **SWC** (`unplugin-swc`): Vite's own transform
does not emit the decorator metadata Nest needs to inject dependencies.

## How the workshops are checked: the specs and the test kit

Every workshop comes with its specs already written, in
**`src/tests/workshop.spec.ts`**. They start the SDK with **your** `initSentry()`
(`src/sentry.ts`), from `src/tests/setup.ts` — before the app is loaded, as
`node --import ./dist/instrument.js` does for the real server — overriding only
the DSN and the transport. The transport is the **test kit's**: it records every
envelope the SDK would have sent to Sentry. The specs then drive the whole app with
`supertest`, and read what would have reached Sentry: error events, their user,
tags and fingerprint, spans, check-ins, logs.

They are **red on the starter**. Each step of a README tells you which spec turns
green; the workshop is done when `npm test` is.

> **`src/tests/shared/` is a shared copy — do not edit it.** It comes from
> `sentry-common/testkit/` and is rewritten by `npm run sync`. Your code goes
> everywhere else.

Every workshop README opens with **The workshop at a glance** and ends with a
**Definition of Done**. Each step closes on a `→ **Done when**` line. Steps marked
*(Bonus)* and the "Going further" section are **outside** the DoD.

The worked answer to every workshop lives in `solutions/`, one runnable folder per
workshop, same names. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic |
|---|---|---|
| 1 | `01_first_errors/` | `Sentry.init` with `--import`, `SentryModule.forRoot()`, `@SentryExceptionCaptured()`, 500 vs 4xx |
| 2 | `02_context_filtering/` | `setUser` in a guard (isolation scope), tags, fingerprints in `beforeSend`, `dataCollection` |
| 3 | `03_source_maps/` | `sourceMap` + `inlineSources`, `--enable-source-maps`, `release`, `sentry-cli sourcemaps inject` / `upload` |
| 4 | `04_tracing/` | `tracesSampler` + `inheritOrSampleWith`, distributed tracing, `@SentryTraced`, `Sentry.startSpan` |
| 5 | `05_crons_logs/` | `@SentryCron` with `@nestjs/schedule`, `Sentry.logger` + `logger.fmt`, `consoleLoggingIntegration` |

> Each starter folder is a working API with bugs you can see: implement the
> `// TODO (step N)` markers following the steps of its own `README.md`.
