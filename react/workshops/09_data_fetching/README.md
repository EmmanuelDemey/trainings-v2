# TP 9 — Fetching data

> This TP is **autonomous**: it does not depend on any other TP. The table, the
> detail card, the layout and a fake Star Wars API (MSW) are provided and working;
> your job is to fetch the data, show the loading and error states, and fix the
> race condition hiding in the detail panel.

## Goal

Chapter 9 — Turn a static page into one that talks to an HTTP API:

- **Environment variables**: the API base URL comes from `import.meta.env.VITE_API_BASE_URL`, typed
- **`fetch` done right**: `response.ok` checked, a typed result, an `AbortSignal` passed along
- **Three states** for every request: loading, error (with a Retry), success
- **Race conditions**: a slow, out-of-date response must never overwrite a newer one —
  `AbortController` in the effect cleanup
- **Container / presentational** split: the containers fetch, the table and the card only render

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the fake API runs in a Service Worker
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs that grade this TP are already written, next to the code they test:
**`src/api/config.spec.ts`**, **`src/api/people.spec.ts`**,
**`src/components/feedback.spec.tsx`**, **`src/people/PeopleTableContainer.spec.tsx`**,
**`src/people/PersonContainer.spec.tsx`** and **`src/App.spec.tsx`**. They are red on
the starter; keep `npm run test:watch` open in a second terminal and turn them green
one step at a time.

**Already done for you:**

- `src/mocks/handlers.ts` — the fake API, built with [MSW](https://mswjs.io):
  `GET /api/people` and `GET /api/people/:id` (404 for an unknown id). In the browser
  it answers after 100–400 ms, so you can **see** your loading states.
- `src/mocks/browser.ts` + `public/mockServiceWorker.js` — the Service Worker started
  by `src/main.tsx` in dev only. Open the Network tab: your requests are there, marked
  as served by the Service Worker.
- `src/mocks/server.ts` + `src/tests/setup.ts` — the same handlers for Vitest, with
  `onUnhandledFrame: 'error'`: a request no handler knows fails the test.
- `src/people/PeopleTable.tsx` and `src/people/Person.tsx` — the presentational
  components. They receive data through props and never fetch.
- `.env` — `VITE_API_BASE_URL=/api`, committed: it is the default for every mode.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Type `VITE_API_BASE_URL` and build URLs from it | `src/env.d.ts`, `src/api/config.ts` | `config.spec.ts` is green |
| 2 | Make `fetch` reject on HTTP errors, and pass the signal | `src/api/people.ts` | `people.spec.ts` is green |
| 3 | `Loader` and `ErrorMessage` | `src/components/` | `feedback.spec.tsx` is green |
| 4 | Load the table: loading, error, Retry | `src/people/PeopleTableContainer.tsx` | The table fills in after a loader |
| 5 | Load the detail, and fix the race | `src/people/PersonContainer.tsx` | Clicking fast never shows the wrong character |

## Steps

### 1. The API base URL — `src/env.d.ts` + `src/api/config.ts`

1. In `src/env.d.ts`, declare `VITE_API_BASE_URL: string` in an `ImportMetaEnv`
   interface (and `ImportMeta.env` of that type). Hover `import.meta.env.VITE_API_BASE_URL`
   before and after: `any` becomes `string`, and a typo becomes a compile error.
2. In `apiUrl(path)`, replace the hard-coded `/api` with `import.meta.env.VITE_API_BASE_URL`.
   Read it **inside** the function, not in a module-level constant: the spec changes it
   with `vi.stubEnv()` after the module was imported.
3. Strip a trailing `/` from the base, so `https://host/api/` + `/people` does not
   become `//people`.
4. Try it: create a `.env.local` (git-ignored) with `VITE_API_BASE_URL=/nope`, restart
   `npm run dev` — env files are read at startup only — and watch the requests fail.
   Delete it afterwards.

→ **Done when** `config.spec.ts` is green, and you can say why a variable named
`API_KEY` (without `VITE_`) would be `undefined` in the browser.

### 2. `fetch` that tells the truth — `src/api/people.ts`

1. `fetch` resolves for **any** response, 404 and 500 included: it only rejects when
   there is no response at all. In `getJson`, throw a `new HttpError(response.status)`
   when `response.ok` is false.
2. Pass the `signal` to `fetch(url, { signal })`, so a caller can abort the request.

→ **Done when** `people.spec.ts` is green: a 404 and a 500 reject, and an aborted
request rejects with an `AbortError`.

### 3. The feedback components — `src/components/Loader.tsx` + `ErrorMessage.tsx`

1. `Loader` renders an element with `role="status"` containing its `label`
   (default `Loading…`). A `<progress>` without a value is an indeterminate bar.
2. `ErrorMessage` renders `role="alert"` with the `message`, plus a **Retry** button
   only when an `onRetry` prop is given.

→ **Done when** `feedback.spec.tsx` is green.

### 4. Load the list — `src/people/PeopleTableContainer.tsx`

1. Hold three pieces of state: `people`, `loading` (starts `true`), `error`.
2. In a `useEffect`, call `fetchPeople()`, then set the data or the error, and end the
   loading state. Keep the dependency array honest.
3. Render `<Loader>` while loading, `<ErrorMessage>` on error, the table otherwise.
4. **Retry**: add an `attempt` counter to the state and to the effect's dependencies;
   `onRetry` increments it. Simulate a failure to check: in `src/mocks/handlers.ts`,
   temporarily return `new HttpResponse(null, { status: 500 })`.
5. Give the effect a cleanup that aborts the request (`AbortController`), and ignore the
   rejection of a request **you** aborted. Open the Network tab: in dev, `StrictMode`
   runs the effect twice — the first request now shows as cancelled.

→ **Done when** `PeopleTableContainer.spec.tsx` is green and the page shows a loader,
then the six characters.

### 5. Load the detail, without races — `src/people/PersonContainer.tsx`

The starter version works… most of the time. Throttle the network to *Slow 4G* in the
DevTools, click **Luke Skywalker** then immediately **Leia Organa**: depending on which
response arrives last, the card may show Luke while Leia is selected.

1. Add the loading and error states, like in step 4 (no Retry needed here).
2. Fix the race: create an `AbortController` in the effect, pass its `signal` to
   `fetchPerson`, and abort it in the cleanup. React runs the cleanup **before** the
   next effect, i.e. every time `id` changes, and on unmount.
3. Ignore the `AbortError` of the request you aborted: it is not an error for the user.

→ **Done when** `PersonContainer.spec.tsx` and `App.spec.tsx` are green: the late
response of a previous id is ignored, and the pending request is aborted when the id
changes or the component unmounts.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] `npm run dev`: the loader, then the table; clicking a name shows its details

**The behaviour is there**

- [ ] `import.meta.env.VITE_API_BASE_URL` is typed `string`, and every URL goes through `apiUrl()`
- [ ] A 404 or a 500 shows an `ErrorMessage`, never a blank table or a broken card
- [ ] Retry on the list re-sends the request
- [ ] Clicking two names quickly always ends on the **last** one clicked
- [ ] In dev, the Network tab shows the StrictMode duplicate request as cancelled

**You can explain**

- [ ] Why `fetch` does not reject on a 404, and where that check belongs
- [ ] What the effect cleanup is for, and **when** React runs it
- [ ] The difference between an `ignore` flag and `AbortController` — which one saves bandwidth?
- [ ] Why only `VITE_`-prefixed variables reach the browser, and why a secret must never be one

## Going further

- Extract the loading / error / data triplet into a `useFetch<T>(url)` hook: that is
  the next chapter (custom hooks).
- Replace the three `useState` calls with **one** discriminated union
  (`{ status: 'loading' } | { status: 'error'; error } | { status: 'success'; data }`):
  which impossible states disappear?
- Add a `.env.production` with another base URL, run `npm run build`, and search the
  `dist/` bundle for it: env variables are **inlined** at build time.
- Read how TanStack Query (chapter 17) removes all of this boilerplate — and what it
  adds: caching, deduplication, background refetch.
