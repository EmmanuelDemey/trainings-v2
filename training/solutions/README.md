# Solutions — the worked answers to every workshop

One folder per workshop, mirroring `chapters/javascript/tp/`, `chapters/node/tp/`
and `chapters/vuejs_advanced/tp/`. Each folder is a **complete, runnable copy**
of the starter with every `// TODO` implemented: `npm install` and it runs.

```
solutions/
  javascript/         ← chapters/javascript/tp/      (JavaScript, 11 workshops)
  node/               ← chapters/node/tp/            (Advanced Node.js, 12 workshops)
  vuejs_advanced/     ← chapters/vuejs_advanced/tp/  (Advanced Vue.js, 8 workshops)
```

The JavaScript ones are the exception to the `npm install`: they are plain
HTML/CSS/JS with no build step. Open the `index.html` of a folder, or serve it
with `npx serve solutions/javascript/05_dom`.

## Using them

```bash
open solutions/javascript/08_countdown/index.html   # JavaScript: nothing to install

cd solutions/vuejs_advanced/06_pinia
npm install
npm run dev            # or npm test / npm run build, per workshop
```

To diff a solution against the starter a learner is working from:

```bash
diff -ru chapters/vuejs_advanced/tp/06_pinia/src solutions/vuejs_advanced/06_pinia/src
```

The `package.json`, `tsconfig.json` and configuration files are identical to the
starter's unless a step asked for them to change (`vite.config.ts` in workshop 9,
`eslint.config.js` in Node workshop 10, `vitest.browser.config.ts` in Vue
workshop 4). So a diff shows the exercise, and nothing else.

## What is in the comments

The code is commented for a **trainer**, not for a linter. Where a step had a
defensible alternative, the comment says which one was picked and what the other
one costs — the `v-memo` trap, `shallowRef` vs `ref`, `Suspense` vs
`useAsyncData`, a discriminated union vs a `.refine()`, `manualChunks` and the
total-size question. Those are the paragraphs to read out loud during a
correction; the implementations themselves are rarely the interesting part.

Deliberate "wrong" versions are kept next to the right ones where a workshop
measures something: `/slow-blocking` beside `/slow`, `/hash-inline` beside
`/hash`, the naïve back-pressure loop beside `pipeline()`. Running both is the
whole demonstration.

## Verification

Every solution was run, not just written:

| Suite | Verified with |
|---|---|
| JavaScript 01–11 | `npm run verify:javascript` — 91 assertions in a real Chromium, plus the in-page `check.js` of workshops 2, 3, 4, 5, 7 and 10 |
| Node 01–12 | `npm run typecheck`, plus each workshop's own entry point |
| Node 04 | the API driven end to end with `curl` (401 / 403 / 404 / 201, helmet + rate-limit headers) |
| Node 06 | `npm test` — 4 tests |
| Node 07 / 08 | latency measured under load, sliced vs blocking and worker vs inline |
| Node 09 | RabbitMQ + Redis via `docker compose`, ack/nack and fan-out observed |
| Node 10 | `npm run lint` clean, request-id propagation checked in the logs |
| Node 12 | addon compiled with `node-gyp`, benchmarked against the TS version |
| Vue 02–10 | `npm run typecheck` + `npm run build` |
| Vue 03 | `npm test` — the 10 given `useFetch` specs |
| Vue 04 | `npm test` — 21 tests — and `npx cypress run` — 5 e2e tests |
| Vue 09 | `npm run verify:serving` green on nginx **and** Caddy, in Docker |
| Vue 10 | `npm test` — 14 tests, including the 8 given `useAsyncData` specs |

Two things could not be run on the machine that produced these and are marked as
such in the report: Vitest **browser mode** (Vue 04, `npm run test:browser` — no
system Chrome available) and a real Netlify/Vercel **deploy** (Vue 09 step 5,
replaced by the local Docker plan B, which is verified).

## Re-running the JavaScript checks

```bash
npx playwright install chromium     # once
npm run verify:javascript
```

It drives the 11 pages: the countdown really counts down and stops, the password
generator really produces a digit-only password when only digits are ticked, the
`<img src=x onerror=...>` posted in the social feed is really displayed as text
and not executed. Set `PW_CHROME=/path/to/chrome` to reuse a Chromium you
already have.

The same suite runs against a **learner's** folder, which is how a workshop is
corrected without reading it line by line:

```bash
npm run verify:javascript -- --dir chapters/javascript/tp --tp 09
```

It runs in CI on every push touching these folders
(`.github/workflows/javascript-workshops.yml`), so a solution cannot regress
quietly when a starter is edited.

## Do not hand these out on day 1

The workshops are written so the starters fail in instructive ways — a red test
suite, a `verify-serving.sh` that comes back with two failures, a modal clipped
by its own panel. A learner who reads the answer first never sees the problem the
answer is for.
