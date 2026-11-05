# Workshop 03 — Readable stack traces

> The events say `dist/issues/issues.repository.js:39`. Which build? Which line
> of TypeScript? Name the build, ship the source maps, and stamp them so that
> Sentry finds the right one.

## Goal

Chapter 03 — Every event says **which build** sent it, and shows **your**
TypeScript:

- **Source maps** from `tsc`, with the sources inside them; Node runs with them
- **A release** on every event, from the environment — or the version of the app
- **Debug ids** injected into the build, then the maps uploaded by `sentry-cli`

## Prerequisites

- Workshop 02 done (this starter is its solution)
- Chapter 03 of the deck: releases, source maps, debug ids, the CI

## Setup

```bash
nvm use              # Node.js 24, from .nvmrc
npm install
npm test             # vitest run — the given specs, red on the starter
npm run test:watch   # keep it open in a second terminal
npm run typecheck    # tsc --noEmit
cp .env.example .env
npm run start:dev    # the API on http://localhost:3000
```

To **see** what the API sends, start Spotlight in another terminal —
`npx @spotlightjs/spotlight` — and open http://localhost:8969. `.env` already
has `SENTRY_SPOTLIGHT=1`. A real project of sentry.io is optional: put its DSN in
`SENTRY_DSN`.

The upload needs a sentry.io project and an auth token (`SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, `SENTRY_PROJECT` in `.env`). **The specs do not**: they check what
runs offline — the build and `sentry-cli sourcemaps inject`.

The specs are already written: **`src/tests/workshop.spec.ts`**. They start the SDK
with **your** `initSentry()` (`src/tests/setup.ts`, before the app is loaded — what
`node --import` does for the real server), with a fake transport that records the
envelopes; they drive the whole app with `supertest`, then read what would have
reached Sentry.

> `src/tests/shared/` is a **shared copy** of the test kit (the same for the
> React and NestJS editions of this training): do not edit it.

**What is wrong**: `npm run build`, then `ls dist` — no `.map` file.
`npm run start:prod` and `curl localhost:3000/issues/13`: the stack trace in the
terminal points at `.js` files.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Source maps, run with them | `tsconfig.json`, `package.json` | `npm test` — step 1 green |
| 2 | The release | `sentry.ts` | `npm test` — step 2 green |
| 3 | Inject, then upload | `package.json` (`sentry:sourcemaps`) | `npm test` — all green |
| 4 | In the CI | your pipeline | You can read the snippet below and adapt it |

## Steps

### 1. Source maps — `tsconfig.json`, `package.json`

1. In `tsconfig.json`: `"sourceMap": true` and `"inlineSources": true` — the
   TypeScript travels **inside** the map: Sentry shows it without access to your
   repository.
2. In `start:prod`: `node --enable-source-maps --import ./dist/instrument.js
   dist/main.js`. Node rewrites `error.stack` with the `.ts` positions — in the
   logs and in the events.

**Check it**: `npm run build && npm run start:prod`, then `/issues/13`: the stack
trace says `src/issues/issues.repository.ts`.

→ **Done when** the step 1 specs are green.

### 2. The release — `sentry.ts`

``release: process.env.SENTRY_RELEASE || `issue-tracker-api@${appVersion()}` `` —
with a small `appVersion()` that reads `version` from `package.json`
(`readFileSync(new URL('../package.json', import.meta.url))`: one level up from
`src/` and from `dist/` alike).

- The CI sets `SENTRY_RELEASE` (a version, or the commit SHA); the same name is used
  for the upload of step 3.
- Releases make **regressions** and **suspect commits** possible: "this issue is new
  in 1.4.2".

→ **Done when** the step 2 spec is green.

### 3. Inject, then upload — `package.json`

Replace the `sentry:sourcemaps` script with:

```bash
sentry-cli sourcemaps inject ./dist && sentry-cli sourcemaps upload --release "$SENTRY_RELEASE" ./dist
```

- `inject` runs **offline**: it writes the same debug id at the end of every `.js`
  (`//# debugId=…`) and in its `.map`. Sentry matches a frame to its map by this id —
  not by a URL, not by a file name.
- `upload` sends the maps; it needs `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`,
  `SENTRY_PROJECT`.

**Check it**: `npm run build && npx sentry-cli sourcemaps inject ./dist`, then
`tail -1 dist/main.js`.

→ **Done when** `npm test` is fully green.

### 4. In the CI

```yaml
- run: npm ci && npm run build
- run: npm run sentry:sourcemaps
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}   # a secret, never in the repo
    SENTRY_ORG: my-org
    SENTRY_PROJECT: issue-tracker-api
    SENTRY_RELEASE: issue-tracker-api@${{ github.sha }}
- run: docker build --build-arg SENTRY_RELEASE=issue-tracker-api@${{ github.sha }} .
```

Inject **before** the image is built: the files you ship must carry the ids.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` emits a `.map` next to every `.js`
- [ ] `grep -rn TODO src package.json` returns nothing

**The behaviour is there**

- [ ] `npm run start:prod` prints stack traces with `.ts` positions
- [ ] Every event carries a `release`
- [ ] `sentry-cli sourcemaps inject` stamps the build with debug ids

**You can explain**

- [ ] Why a server that is not minified still needs source maps
- [ ] What a debug id is, and why it beats matching by file name
- [ ] Where the auth token lives, and why never in the repository

## Going further

- With a real project: run the full script, then trigger `/issues/13` from
  `start:prod` — open the event: TypeScript, with the lines around each frame.
- `sentry-cli releases new`, `set-commits --auto`, `finalize`, `deploys new`: what
  each one adds in sentry.io.
