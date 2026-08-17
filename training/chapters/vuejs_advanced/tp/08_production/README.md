# TP 8 — Production & deployment

> This TP is **autonomous**: it does not depend on any other TP. The app works;
> it is just built the default way, which is *almost* right. Your job is to find
> and fix the gaps between "it builds" and "it is in production".

## Goal

Chapter 8 — Take a working Vue app all the way to a deployment you would defend:

- **Analyze** the bundle and find what does not belong in the entry chunk
- **Split** by route, defer a heavy library, group the framework
- **Prefetch** on intent
- **Configure** the environments, with typing and validation
- **Serve** the SPA correctly: fallback, cache headers, security headers
- **Automate**: lint → typecheck → build once → test the artifact → deploy
- **Observe**: error handler and web vitals

## Prerequisites

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`
- *(Optional)* A **Netlify** or **Vercel** account for the last step. Everything
  before it runs locally.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # ← run this FIRST and write the numbers down
npm run preview      # http://localhost:4173
```

## Step 0 — The baseline

Run `npm run build` and record, from the Vite output:

| | Size | Gzipped |
|---|---|---|
| Entry chunk | | |
| CSS | | |
| Number of chunks | | |

Everything below is measured against this table. A change you cannot measure is
a change you cannot justify.

## Steps

### 1. Analyze — `vite.config.ts`

Add `rollup-plugin-visualizer` behind an `ANALYZE=1` guard, run `npm run analyze`
and name the three biggest contributors to the entry chunk.

### 2. Split the code

1. Make every route except `HomeView` lazy. Rebuild and count the chunks.
2. Add a `prefetch(name)` helper in the router and call it on `@mouseenter` /
   `@focus` in `App.vue`. Confirm in the Network tab that the chunk arrives
   **before** the click.
3. Move the `heavyReport` import inside `exportReport()` as a dynamic import.
   Confirm the chunk is fetched on click.

Update the baseline table. The entry chunk should have dropped substantially.

### 3. `manualChunks`

Group `vue`, `vue-router` and `pinia` into one chunk. Rebuild and compare.

Then answer honestly: did the **total** size go up? Why? Is the trade-off worth
it here, and what would make it not worth it?

### 4. Environments — `src/config/index.ts` + `env.d.ts`

1. Type `ImportMetaEnv`.
2. Validate the required variables at startup and fail loudly. Test it by
   commenting out `VITE_API_URL`.
3. Read `VITE_FEATURE_REPORTS` correctly — env values are **strings**, and
   `'false'` is truthy.
4. Build with `npm run build:staging` and `grep` the staging URL out of
   `dist/assets/*.js`. Then answer, with that evidence in hand: can a `VITE_`
   variable hold a secret?

### 5. Serving — `netlify.toml` (or `vercel.json`)

1. Add the history-mode fallback.
2. Add the cache headers: immutable for `/assets/*`, `no-cache` for `index.html`.
3. Deploy, open a deep link, and **hard-refresh** it. That single test catches
   the most common production bug in this whole chapter.
4. *(Bonus)* Add the security headers and a CSP, in report-only first.

### 6. Observability — `src/main.ts`

Add `app.config.errorHandler`, and *(bonus)* report the web vitals.

### 7. The pipeline — `.github/workflows/ci.yml`

1. Build and upload `dist/` as an artifact.
2. Enforce the size budget with `npm run size` (adjust `.size-limit.json` to a
   limit your optimized build actually meets — then lower it).
3. Add an `e2e` job that downloads the artifact and tests it via `vite preview`.
4. Add a `deploy` job, on the default branch only, consuming the **same**
   artifact.
5. Write down your rollback procedure — and test it.

## Going further

- Add a `vite-plugin-compression` step and compare with what your host already
  does. Is it redundant?
- Set up the runtime-configuration pattern (`window.__CONFIG__` substituted at
  container startup) so the same artifact can be deployed to staging and
  production. Is it worth it for this app?
- Add `treosh/lighthouse-ci-action` with assertions on LCP, CLS and TBT, and make
  it fail the build.
