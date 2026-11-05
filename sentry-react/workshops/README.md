# Sentry for React — Workshops

Hands-on exercises for the **Sentry for React** training, based on the **Sentry
JavaScript SDK 11.11** (`@sentry/react`, `@sentry/vite-plugin`), **React 19.3**,
**Vite 8**, **Vitest 5**, **React Testing Library 16** and **TypeScript 7**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. Each starter is the solution of the
previous workshop plus what is new — so you can start any workshop with a clean
slate, even if you did not finish the previous one.

## Get the workshops

One part of every workshop is **not in the repository**: the test kit
(`src/tests/shared/`), a fake Sentry transport the specs read. Its single source
is `sentry-common/`, next to this training, and a script copies it into every
workshop. So **do not download a workshop folder on its own** (from GitHub's file
browser, for instance): clone the whole repository, then run the copy once, from
the training's folder:

```bash
git clone --depth 1 https://github.com/EmmanuelDemey/trainings-v2.git
cd trainings-v2/sentry-react
npm run sync         # copies src/tests/shared/ into every workshop and solution
```

`npm run sync` installs nothing: it is a plain Node.js script. Run it again after
a `git pull`. Without it, `npm test` fails on the missing `./shared/sentryTestkit`.

The starter and solution **ZIPs** of the workshops site, and its online editor
(StackBlitz), already contain it: nothing to run there.

Then, in each workshop:

```bash
cd 01_first_errors
npm install
npm run dev          # http://localhost:5173
npm test             # vitest run — the spec of the workshop, red on the starter
npm run test:watch   # the same, in watch mode: keep it open while you work
npm run typecheck    # tsc --noEmit
npm run build
```

## Before the day — check your machine

- **Node.js 24** (`.nvmrc` pins it; `nvm use` in a workshop folder picks it up).
  Every workshop accepts `^22.22.2 || ^24.15.0 || >=26.0.0`.
- Run `npm install` in **every** workshop folder at home: the room Wi-Fi on the
  day is the worst place to download five `node_modules`.
- Run `npx @spotlightjs/spotlight` once, so it is in the npm cache.
- A recent **Chrome** or **Firefox**.
- *Optional*: a free **sentry.io** account and a React project, for its DSN.
  Nothing in the workshops requires it.

## Where your events go

| When | Where | What you need |
|---|---|---|
| `npm test` | a fake transport, in memory | nothing |
| `npm run dev` | **Spotlight**, `http://localhost:8969` | `npx @spotlightjs/spotlight` in a terminal |
| `npm run dev` with `VITE_SENTRY_DSN` in `.env.local` | Spotlight **and** your sentry.io project | a free account |

Spotlight is Sentry for your laptop: the same errors, traces, logs and replays,
seconds after they happen, without an account. The SDK sends to it in
development only.

## How the workshops are checked

Every workshop comes with its spec already written, in
**`src/tests/workshop.spec.tsx`** (and `src/tests/build.spec.ts` from workshop 03).
It renders the whole app, clicks as a user would, then reads what your SDK sent:
`src/tests/setup.ts` starts **your** `initSentry()` once, replacing only the DSN
and the transport — so your `beforeSend`, your sampling and your integrations
apply in the specs too.

It is **red on the starter**. Each step of a README tells you which spec turns
green; the workshop is done when `npm test` is.

The **fake backend** (`src/api/fakeServer.ts`) is the issue tracker's API and its
avatars CDN, served in the page by replacing `fetch`. It writes down every
request, headers included, in `serverLog` — that is how workshop 04 checks what
your SDK propagates. Its bugs are on purpose: issue 7 has no assignee, issues 13
and 14 answer 500, an unknown issue answers 404.

> **`src/tests/shared/` is a shared copy — do not edit it.** It comes from
> `sentry-common/` at the root of the repository and is rewritten by `npm run sync`.
> Your code goes everywhere else.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with a
**Definition of Done**. Each step closes on a `→ **Done when**` line. Steps marked
*(Bonus)* and the "Going further" section are deliberately **outside** the DoD.

The worked answer to every workshop lives in `solutions/`, one runnable folder per
workshop, same names. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic |
|---|---|---|
| 1 | `01_first_errors/` | `Sentry.init`, Spotlight, `ErrorBoundary`, `reactErrorHandler`, `captureException` |
| 2 | `02_context_filtering/` | `setUser`, tags and contexts, breadcrumbs, `fingerprint`, `ignoreErrors`, `beforeSend` |
| 3 | `03_source_maps/` | `sourcemap: 'hidden'`, `@sentry/vite-plugin`, debug ids, releases |
| 4 | `04_tracing/` | `browserTracingIntegration`, `tracesSampleRate`, `tracePropagationTargets`, `startSpan`, `ignoreSpans` |
| 5 | `05_replay_feedback/` | `replayIntegration` and masking, `feedbackIntegration`, `captureFeedback` |

> Each starter folder is a working app with bugs you can see: implement the
> `// TODO (step N)` markers following the steps of its own `README.md`.
