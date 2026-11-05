# Sentry — the curriculum the two trainings share

One day, the same programme, two sides of the same product:

| Training | Folder | SDK |
|---|---|---|
| Sentry for React | [`../sentry-react`](../sentry-react) | `@sentry/react` |
| Sentry for NestJS | [`../sentry-nestjs`](../sentry-nestjs) | `@sentry/nestjs` |

This file is the contract between them: the chapters and the slide fragments they
import, the schedule, and what every workshop must do. Write a training against it;
change it here first.

The product being instrumented is the same in both: **an issue tracker**. The React
training instruments its web app, the NestJS training its API. Chapter 04 (tracing)
connects the two: a trace starts in the browser and continues in the API.

## What is shared, and how

| What | Single source | How a training gets it |
|---|---|---|
| The concepts: DSN, events and issues, scopes, enrichment, grouping, PII, releases, source maps, tracing, sampling, operating Sentry | `slides/<NN>_<chapter>/<fragment>.md` | its own `slides/NN_*.md` imports them with Slidev's `src:` |
| The end-of-day retro | `slides/retro.md` | imported at the end of its last chapter |
| The test kit — a fake transport that records every envelope the SDK sends | `testkit/sentryTestkit.ts` | `pnpm run sync` copies it to `src/tests/shared/sentryTestkit.ts` of every workshop and solution |

The copies are **gitignored** and rewritten by the sync. `pnpm install` (postinstall)
and `pnpm run build` run it; so does the CI before testing a workshop.

The workshop **specs are not shared**: a browser app and an HTTP API are not checked
the same way. Each training owns its specs; both are written against the test kit.

### Rules for the shared slide fragments

- **No SDK-specific setup code.** A fragment may show what `@sentry/react` and
  `@sentry/nestjs` have in common — they are both built on `@sentry/core`:
  `Sentry.init({ … })` options (`dsn`, `release`, `environment`, `beforeSend`,
  `tracesSampler`, `dataCollection`, `ignoreErrors`…), `captureException`,
  `setUser`, `setTag`, `setContext`, `withScope`, `startSpan`, `Sentry.logger`.
  Never `ErrorBoundary`, `SentryModule`, a decorator, a component or a module.
- When a sentence needs the SDK, say "the SDK of your platform"; the training slide
  right after shows its own code.
- A fragment is one or more slides separated by `---`. It starts with a slide (no
  frontmatter of its own) and is imported as:

  ```md
  ---
  src: ../../sentry-common/slides/02_context/enrich.md
  ---
  ```

## The schedule (7 hours)

| Time | Chapter | Workshop |
|---|---|---|
| 09:00 | 00 — Introduction · the Sentry platform · Spotlight | — |
| 09:20 | 01 — Capturing errors | 01 — First errors (40 min) |
| 10:30 | *break* | |
| 10:45 | 02 — Context, grouping, filtering and PII | 02 — Context & filtering (40 min) |
| 11:55 | 03 — Releases and source maps | 03 — Readable stack traces (25 min) |
| 12:30 | *lunch* | |
| 13:45 | 04 — Tracing and performance | 04 — Tracing (40 min) |
| 15:05 | *break* | |
| 15:20 | 05 — Beyond errors (React: Session Replay, User Feedback · NestJS: Cron monitors, Logs) | 05 — Replay & feedback / Crons & logs (35 min) |
| 16:30 | 06 — Operating Sentry: triage, alerts, integrations, costs · retro | — |
| 17:10 | *end* | |

## The chapters and their fragments

Each training has `slides/NN_<name>.md` for every chapter below, with these names:

| # | Training file | Shared fragments, in `slides/` here |
|---|---|---|
| 00 | `00_intro.md` | `00_intro/agenda.md`, `00_intro/platform.md`, `00_intro/spotlight.md`, `00_intro/workshops.md` |
| 01 | `01_errors.md` | `01_errors/events-issues.md`, `01_errors/sdk-anatomy.md`, `01_errors/scopes.md`, `01_errors/capturing.md` |
| 02 | `02_context.md` | `02_context/enrich.md`, `02_context/grouping.md`, `02_context/filtering.md`, `02_context/pii.md` |
| 03 | `03_releases.md` | `03_releases/releases.md`, `03_releases/source-maps.md`, `03_releases/ci.md` |
| 04 | `04_tracing.md` | `04_tracing/spans.md`, `04_tracing/sampling.md`, `04_tracing/distributed.md`, `04_tracing/custom-spans.md` |
| 05 | `05_beyond_errors.md` | `05_beyond_errors/logs.md` |
| 06 | `06_operate.md` | `06_operate/triage.md`, `06_operate/alerts.md`, `06_operate/integrations.md`, `06_operate/costs.md`, `06_operate/checklist.md` |
| — | (last slides of chapter 06) | `retro.md` |

A training chapter is: a cover slide, the learning objectives, then the shared
fragments interleaved with its own SDK slides, and, for chapters 01 to 05, a last
slide `# Workshop NN` / `## <name>`.

## Where the events go during the day

- **In the workshops' tests: nowhere.** The test kit's fake transport records the
  envelopes in memory; the specs read them. No account, no network: the CI runs
  them as is.
- **In `npm run dev` / `npm run start:dev`: Spotlight**, Sentry for development —
  `npx @spotlightjs/spotlight` starts it on `http://localhost:8969`. Errors, traces
  and logs show up there seconds after they happen. Never in the tests, never in
  production.
- **Optionally, a free sentry.io account**: a `VITE_SENTRY_DSN` / `SENTRY_DSN` in
  `.env.local` sends the same events to a real project — needed only to see the
  source maps resolved (chapter 03) and to try alerts and dashboards (chapter 06).
  The workshops never require it.

## The SDK, in version 11

Both trainings target **Sentry JavaScript SDK 11**. What v11 changed — the slides
say it where it applies, learners will meet v10 code everywhere:

- **`sendDefaultPii` is gone**, replaced by **`dataCollection`** — and the default is
  now **permissive**: user info, cookies, request headers and **request/response
  bodies** are collected unless you say otherwise (chapter 02, `pii.md`).
- **`enableLogs` is gone**: logs are sent as soon as `Sentry.logger.*` or a logging
  integration is used (chapter 05).
- **Span streaming is the default** (`traceLifecycle: 'stream'`): spans are sent as
  they finish, in `span` envelope items, not nested in a `transaction` event.
  `beforeSendSpan` receives `StreamedSpanJSON` (`name`, `attributes['sentry.op']`,
  `status: 'ok' | 'error'`). `beforeSendTransaction` and `ignoreTransactions` only
  work with `traceLifecycle: 'static'`; use **`ignoreSpans`** (chapter 04).
- `inboundFiltersIntegration` is now `eventFiltersIntegration`.

## The test kit — `testkit/sentryTestkit.ts`

Plain TypeScript, no SDK import: the same file works under `@sentry/react` and
`@sentry/nestjs`.

```ts
const sentry = createSentryTestkit();
initSentry({ dsn: TEST_DSN, transport: sentry.transport }); // the workshop's own init
// … exercise the app …
await Sentry.flush(2000);
sentry.errors();         // the error events
sentry.spans();          // every streamed span, flattened
sentry.logs();           // every log item, flattened
sentry.checkIns();       // cron check-ins
sentry.feedbacks();      // user feedback events
sentry.items('session'); // any other item type
sentry.reset();          // between tests
```

Every workshop exposes **one** function the specs call to start the SDK, as the
TanStack trainings expose `createQueryClient()`:

- React — `src/sentry.ts`: `export function initSentry(overrides?: Partial<BrowserOptions>): void`
- NestJS — `src/sentry.ts`: `export function initSentry(overrides?: Partial<NodeOptions>): void`,
  called by `src/instrument.ts` (loaded with `node --import`)

The learner writes the options in it; the specs pass only `dsn`, `transport` and
`defaultIntegrations` **without `Dedupe`** (it would drop the same error sent by
two tests in a row) as overrides, so **the learner's
`beforeSend`, sampling, integrations and `dataCollection` apply in the specs**.
Both trainings call `initSentry` **once** per test file (in the Vitest setup
file), then `sentry.reset()` and clear the user and the breadcrumbs of the scopes
before each test.

## The workshops — React (`sentry-react`)

Each is a **standalone** Vite + React 19 project — its own `package.json`,
`package-lock.json`, `.nvmrc`, `README.md` — and runs `npm install`, `npm run dev`,
`npm test`, `npm run test:watch`, `npm run typecheck`, `npm run build`.

**The app.** A list of issues, one row `issue-<id>` per issue with a button
`open-<id>`; the detail panel `issue-detail` with `detail-title`, or `detail-error`
when the API answers an error; a header with `login` / `logout` and `current-user`.
The data comes from `https://api.issue-tracker.test` — served in the browser by
`src/api/fakeServer.ts` (committed in every workshop, identical copies; it logs
every request and its headers in `serverLog`), which `main.tsx` installs
**before** `initSentry()` so that the SDK's `fetch` instrumentation wraps it.
20 issues, every third one closed; `GET /health` is polled every 30 s by
`useHealthCheck`. The avatars come from a third party,
`https://avatars.issue-tracker-cdn.test/v1/<login>`. The login button signs in
`u-42` / `ada@example.com`. Known bugs, on purpose: issue **7** has
`assignee: null` and the detail crashes on it (`TypeError` during render);
`GET /issues/13` and `GET /issues/14` answer **500**; `GET /issues/99` answers
**404**.

### 01 — First errors

**Starter.** No Sentry. `src/sentry.ts` exports an empty `initSentry()`. A crash in
the detail panel blanks the whole page; a failing request is shown and forgotten.

**Steps.** 1. `initSentry()`: `Sentry.init` with the DSN from
`import.meta.env.VITE_SENTRY_DSN`, `environment: import.meta.env.MODE`, and
`spotlightBrowserIntegration()` in development only. Called in `main.tsx` before
`createRoot`. 2. `Sentry.ErrorBoundary` in `App.tsx` around the detail panel, with a
fallback `error-fallback` that shows `error-event-id` (the `eventId`). 3. React 19's
root error hooks: `src/sentry.ts` exports `rootOptions` (`onUncaughtError`,
`onRecoverableError` from `Sentry.reactErrorHandler()`), passed by `main.tsx` to
`createRoot` — the spec only checks they are functions: jsdom cannot raise an
uncaught React error reliably. 4. An API error the
UI handles is **not** an exception React sees: `captureException` it where the detail
fetch fails.

**Spec.** Opening issue 7 shows `error-fallback`, and exactly one error event is sent,
whose `event_id` is the one shown in `error-event-id`. Opening issue 13 shows
`detail-error` and sends one event whose exception message contains `/issues/13`.
Opening issue 1 sends nothing.

### 02 — Context & filtering

**Starter.** Workshop 01's solution.

**Steps.** 1. `Sentry.setUser({ id })` on login, `setUser(null)` on logout — the id
only, never the email. 2. The tag `issue.id` and the context `issue` on the events of
the detail panel (`beforeCapture` of the boundary, `withScope` around
`captureException`). 3. A breadcrumb `ui.filter` when the filter changes. 4. The API
errors group by **route template**, not by URL: `fingerprint: ['api-error', method,
'/issues/:id', status]`, so `/issues/13` and `/issues/14` are one issue.
5. `ignoreErrors` drops the `ResizeObserver loop` noise; `beforeSend` drops an
`ApiError` with a 4xx status.

**Spec.** After login, an error carries `user.id` and no `user.email`; after logout,
no user. The detail error carries `tags['issue.id']` and `contexts.issue`. The 500s
on `/issues/13` and `/issues/14` have the same `fingerprint`. A `ResizeObserver loop`
error and the 404 on `/issues/99` send nothing. The filter breadcrumb is on the next
event.

### 03 — Readable stack traces

**Starter.** Workshop 02's solution; production builds ship minified with
`build.sourcemap: true` — the source maps are **published** next to the bundle. The
plugin is already installed.

**Steps.** 1. `build.sourcemap: 'hidden'`. 2. `sentryVitePlugin` (last plugin) with
`org`, `project`, `authToken` from the environment, `release.name` from
`SENTRY_RELEASE`, and `sourcemaps.filesToDeleteAfterUpload`. 3. `initSentry` sets no
`release` itself: the plugin injects it. 4. A CI snippet in the README
(`SENTRY_AUTH_TOKEN` as a secret).

**Spec.** `src/tests/build.spec.ts` runs the production build (Vite's JS API, into
`dist/` — `filesToDeleteAfterUpload` targets `./dist/**/*.map`) with
`SENTRY_RELEASE=issue-tracker-web@test`: the bundle carries a debug id
(`sentry-dbid-<uuid>` — the SDK itself contains `_sentryDebugIds` either way) and
the release id; **no** `.map` file and **no**
`sourceMappingURL` comment remain in the output. Without an auth token the plugin
warns and uploads nothing — that is expected.

### 04 — Tracing

**Starter.** Workshop 03's solution.

**Steps.** 1. `browserTracingIntegration()` and `tracesSampleRate` — 1 in development,
0.2 in production. 2. `tracePropagationTargets: [API_URL]`: `sentry-trace` and
`baggage` go to the API, **never** to the avatars CDN. 3. A custom span `issue.open`
(op `ui.action`, attribute `issue.id`) around `fetchIssue(id)` in `IssueDetail`.
4. *(Bonus, not checked)* `ignoreSpans: [{ op: 'http.client', name: /\/health$/ }]`
for the polling request.

**Spec.** Requests to the API carry `sentry-trace`; requests to the avatars CDN do
not (already true on the starter — tracing off propagates nothing: a guard, not a
step). Opening issue 1 produces a span `issue.open` with `attributes['issue.id']` = 1
and an `http.client` span in the **same trace** (its parent is the active pageload
span, not `issue.open`).

### 05 — Session Replay & User Feedback

**Starter.** Workshop 04's solution.

**Steps.** 1. `replayIntegration({ maskAllText: true, blockAllMedia: true })`,
`replaysSessionSampleRate: 0` (0.1 in production), `replaysOnErrorSampleRate: 1`.
2. `feedbackIntegration({ autoInject: false })`, and a form `report-feedback` in
`error-fallback` (`feedback-message`, `feedback-submit`) calling `Sentry.captureFeedback` with
`associatedEventId`. 3. `feedback-sent` once it is sent.

**Spec.** The `Replay` integration is installed, the client's
`replaysOnErrorSampleRate` is 1 and `replaysSessionSampleRate` is 0. After the crash
on issue 7, sending the form sends one `feedback` item whose
`contexts.feedback.associated_event_id` is the crash's `event_id`, and shows
`feedback-sent`.

## The workshops — NestJS (`sentry-nestjs`)

Each is a **standalone** NestJS 12 project (ESM, `"type": "module"`) — its own
`package.json`, `package-lock.json`, `.nvmrc`, `README.md` — and runs `npm install`,
`npm run start:dev` (`node --import ./dist/instrument.js`), `npm test` (Vitest + SWC
+ supertest), `npm run test:watch`, `npm run typecheck`, `npm run build`.
TypeScript **6.0**: the Nest CLI 12 needs the compiler API that TypeScript 7.0 does
not ship. Every `package.json` declares `allowScripts` (`@swc/core: false`, and
`@sentry/cli: true` from workshop 03): npm 11 warns about install scripts otherwise.

**The app.** An issue tracker API: `GET /health`, `GET /issues`, `GET /issues/:id`,
`POST /issues`, `POST /auth/login`. An in-memory repository with the same issues as
the React app. A catch-all `AllExceptionsFilter` formats every error as JSON. Known
bugs, on purpose: the repository throws `DatabaseError('Database connection lost',
'ECONNRESET')` for issue **13**; an unknown id is a `NotFoundException`; a
`POST /issues` without a title is a `BadRequestException`; `POST /auth/login` with
the email `crash@example.com` throws.

### 01 — First errors

**Starter.** No Sentry. `src/sentry.ts` exports an empty `initSentry()`;
`src/instrument.ts` calls it; `start:dev` already loads it with `--import`.

**Steps.** 1. `initSentry()`: `Sentry.init` with `SENTRY_DSN`, `environment` from
`NODE_ENV`, `spotlight: NODE_ENV === 'development' && Boolean(SENTRY_SPOTLIGHT)`
(`.env` loaded with `node --env-file-if-exists=.env`). 2. Why `--import`, and why first:
OpenTelemetry must patch `http` and Express before they are loaded.
3. `SentryModule.forRoot()` in `AppModule`. 4. The app already has a catch-all filter:
decorate its `catch` with `@SentryExceptionCaptured()` — `SentryGlobalFilter` is for
apps without one.

**Spec.** `GET /issues/13` answers 500 and sends one error event, message `Database
connection lost`, `transaction` `GET /issues/:id`. `GET /issues/999` (404) and an
invalid `POST /issues` (400) send nothing. `GET /issues/1` sends nothing.

### 02 — Context & filtering

**Starter.** Workshop 01's solution.

**Steps.** 1. An `AuthGuard` reads `x-user-id` and calls `Sentry.setUser({ id })` —
the **isolation scope** keeps two concurrent requests apart. 2. The tag `issue.id`
on the events of `GET /issues/:id`. 3. Group the `DatabaseError`s by their code:
`fingerprint: ['database-error', code]` in `beforeSend`. 4. v11 collects request
bodies and headers by default: `dataCollection` with `userInfo: false`,
`cookies: false`, `httpBodies: []` and an **allowlist** of request headers
(`content-type`, `user-agent`, `x-user-id`).

**Spec.** Two concurrent failing requests with `x-user-id: u-1` and `u-2` each carry
their own `user.id`. The event carries `tags['issue.id']` = `13`. The
`DatabaseError`s of `/issues/13` and `/issues/14` share the fingerprint
`['database-error', 'ECONNRESET']`. The crash of `POST /auth/login` (body with a
`password`, header `authorization`) carries no body, no IP address, and only
`content-type` keeps its value — headers outside the allowlist are still listed,
with the value `[Filtered]`.

### 03 — Readable stack traces

**Starter.** Workshop 02's solution; `tsconfig` emits no source maps.

**Steps.** 1. `sourceMap: true`, `inlineSources: true`; `node --enable-source-maps`.
2. `release` from `SENTRY_RELEASE`, falling back to `issue-tracker-api@<version of
package.json>`. 3. `npm run sentry:sourcemaps`: `sentry-cli sourcemaps inject
./dist`, then `upload` — inject runs offline, upload needs `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, `SENTRY_PROJECT`. 4. A CI snippet in the README.

**Spec.** An error event carries the fallback release `issue-tracker-api@<version>`
(the Vitest config clears `SENTRY_RELEASE`, `GITHUB_SHA` and `CI_COMMIT_SHA`, which
the SDK would read on its own). The spec builds with `tsc` into a temporary folder
and runs `sentry-cli sourcemaps inject` (offline): every `.js` ends with a
`//# debugId=` comment matching its `.map`, which has `sourcesContent`; `start:prod`
runs Node with `--enable-source-maps`.

### 04 — Tracing

**Starter.** Workshop 03's solution.

**Steps.** 1. `tracesSampler`: 0 for `attributes['url.path'] === '/health'` (when
the decision is taken, the span name is only `GET`), `inheritOrSampleWith(1)`
otherwise — and why it respects the caller's decision. 2. The incoming
`sentry-trace` header is continued: the API's spans join the browser's trace.
3. `@SentryTraced('issues.score')` on the scoring method of `IssuesService` — the
span is named after the method (`score`), the argument is its **op**. 4. A manual
`Sentry.startSpan({ name: 'issues.repository.findOne', op: 'db.query' })` with the
attribute `issue.id`.

**Spec.** `GET /health` sends no span. `GET /issues/1` with a `sentry-trace` header
of trace id `0123456789abcdef0123456789abcdef` sends a segment span
`GET /issues/:id` in that trace, with a span of op `issues.score` and the span
`issues.repository.findOne` (op `db.query`, `attributes['issue.id']` = 1). A
caller that did not sample (`-0`) gets no span. On `/issues/13` the db span ends
with status `error`.

### 05 — Cron monitors & logs

**Starter.** Workshop 04's solution, plus a nightly purge job (`@nestjs/schedule`,
`@Cron('0 3 * * *')`) that sometimes fails, silently.

**Steps.** 1. `@SentryCron('nightly-purge', { schedule: { type: 'crontab', value:
'0 3 * * *' }, timezone: 'Europe/Paris', checkinMargin: 5, maxRuntime: 10 })` on
the job. 2. A failing run sends a check-in `error`; a **missed** run is detected by
Sentry, not by the app. 3. `Sentry.logger.info(Sentry.logger.fmt…)` in
`IssuesService.create` with the attribute `issue.id` — structured, searchable,
attached to the trace. 4. *(Bonus, not checked)*
`consoleLoggingIntegration({ levels: ['warn', 'error'] })`.

**Spec.** Running the purge sends a check-in `in_progress` then `ok` for
`nightly-purge` with its `monitor_config`; making it fail (a retention of `NaN`)
sends `in_progress` then `error`. `POST /issues` sends a log `info` (template
`Issue %s created`) whose attributes carry `issue.id`, and whose `trace_id` is the
trace of the request.

## Versions

Refreshed on 2026-11-05: Sentry JavaScript SDK 11.11, `@sentry/vite-plugin` 11.11,
`@sentry/cli` 3.8, Spotlight 4.12, React 19.3, Vite 8.3, NestJS 12.3, Vitest 5.1,
TypeScript 7.0 (React) / 6.0 (NestJS), Node.js 24.
