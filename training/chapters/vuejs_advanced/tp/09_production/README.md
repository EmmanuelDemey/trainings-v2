# TP 9 — Production & deployment

> This TP is **autonomous**: it does not depend on any other TP. The app works;
> it is just built the default way, which is *almost* right. Your job is to find
> and fix the gaps between "it builds" and "it is in production".

## Goal

Chapter 9 — Take a working Vue app all the way to a deployment you would defend:

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

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list. The deployment boxes assume you took the
optional Netlify/Vercel account — if you did not, the configuration files still have
to be complete and reviewable.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` succeeds
- [ ] `npm run size` passes against a `.size-limit.json` you **lowered** to fit your
      optimized build
- [ ] `grep -rn TODO src vite.config.ts env.d.ts netlify.toml vercel.json .github |
      grep -v bonus` returns nothing

**The numbers moved, and you have them**

- [ ] The step 0 baseline table is filled in, and updated again after steps 2 and 3
- [ ] `npm run analyze` produces the treemap, and you can name the three biggest
      contributors to the entry chunk
- [ ] Every route except `HomeView` is lazy: the chunk count went up and the entry chunk
      went down — you can state the drop as a percentage
- [ ] Hovering a nav link fetches its chunk **before** the click, verified in the
      Network tab
- [ ] `heavyReport` is fetched on the export click, not at startup
- [ ] `vue` / `vue-router` / `pinia` sit in one chunk, and you answered whether the
      **total** size went up and whether the trade is worth it here

**The configuration is production-grade**

- [ ] `ImportMetaEnv` declares every `VITE_` variable the app reads, so
      `import.meta.env.VITE_API_URL` is `string` and not `any` (hover it, or assign it to
      a `number` and watch `vue-tsc` complain)
- [ ] Commenting out `VITE_API_URL` makes the app fail **loudly** at startup, not
      silently call `undefined/api`
- [ ] `VITE_FEATURE_REPORTS=false` actually disables the feature (the string `'false'`
      is handled)
- [ ] You grepped the staging URL out of `dist/assets/*.js` and answered, with that
      evidence, whether a `VITE_` variable can hold a secret
- [ ] The host config has the history-mode fallback, `immutable` caching for
      `/assets/*` and `no-cache` for `index.html`
- [ ] A **hard refresh** on a deep link returns the app, not a 404
- [ ] `app.config.errorHandler` is wired and catches an error thrown from a component

**The pipeline is real**

- [ ] The `quality` job builds and uploads `dist/` as an artifact
- [ ] The `e2e` job `needs: quality`, **downloads** the artifact and serves it with
      `vite preview` — it never rebuilds
- [ ] The `deploy` job `needs: e2e`, consumes the **same** artifact and runs on the
      default branch only
- [ ] Your rollback procedure is written down **and** you have run it once

**You can explain**

- [ ] Why the artifact is built once and passed along, rather than rebuilt per job
- [ ] Why a size budget that does not fail the build is not a budget
- [ ] What the `no-cache` on `index.html` protects you from

## Going further

- Add a `vite-plugin-compression` step and compare with what your host already
  does. Is it redundant?
- Set up the runtime-configuration pattern (`window.__CONFIG__` substituted at
  container startup) so the same artifact can be deployed to staging and
  production. Is it worth it for this app?
- Add `treosh/lighthouse-ci-action` with assertions on LCP, CLS and TBT, and make
  it fail the build.
