# Workshop 02 — Context & filtering

> Errors reach Sentry now — naked: no user, no issue id, no idea what happened
> before. The 500s of issues 13 and 14 are two issues in Sentry, though they are
> one bug. A browser warning floods the project, and a 404 on a stale link is
> reported as if it were a bug. Give the events their context, group them right,
> and keep the noise out.

## Goal

Chapter 02 — Make every event **useful**, and only useful events:

- **Who**: `setUser` with an id — never an email
- **Where**: a tag and a context on the events of the detail panel
- **What before**: a breadcrumb for what the user did
- **One bug, one issue**: a `fingerprint` by route template
- **No noise**: `ignoreErrors` and `beforeSend`

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Workshop 01 done, or start from this folder: its starter is workshop 01's solution
- Chapter 02 of the deck: enrichment, grouping, filtering, PII

## Setup

```bash
npm install
npm run dev                   # http://localhost:5173
npx @spotlightjs/spotlight    # http://localhost:8969, in another terminal
npm run test:watch
```

The spec, **`src/tests/workshop.spec.tsx`**, is red on the starter.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | The user, by id | `App.tsx` | `npm test` — step 1 green |
| 2 | The issue, as a tag and a context | `App.tsx`, `components/IssueDetail.tsx` | `npm test` — step 2 green |
| 3 | A breadcrumb when the filter changes | `components/IssueList.tsx` | `npm test` — step 3 green |
| 4 | Group the API errors by route | `sentry.ts` | `npm test` — step 4 green |
| 5 | Drop the noise | `sentry.ts` | `npm test` — all green |

## Steps

### 1. Who was it? — `App.tsx`

1. Write a `login(next: CurrentUser | null)` function: it sets the React state
   **and** calls `Sentry.setUser(next ? { id: next.id } : null)`.
2. Use it for both buttons of the `Header`.

The id only. An email is personal data: it does not belong in an error tracker,
and the id is enough to find the user in your own back office.

**Check it**: log in, open issue 13. In Spotlight, the event has a **User**
section with `u-42`. Log out, open 14: no user.

→ **Done when** the step 1 specs are green.

### 2. Which issue? — `App.tsx`, `components/IssueDetail.tsx`

Tags are indexed: you search and filter on them. Contexts are not: they are
structured data shown on the event.

1. On the boundary, `beforeCapture={(scope) => { … }}`:
   `scope.setTag('issue.id', String(selectedId))` and
   `scope.setContext('issue', { id: selectedId })`.
2. In `IssueDetail`, the same on the reported API error — in a scope of its own,
   so it does not leak to the next event:

   ```ts
   Sentry.withScope((scope) => {
     scope.setTag('issue.id', String(id));
     scope.setContext('issue', { id });
     Sentry.captureException(error);
   });
   ```

→ **Done when** the step 2 specs are green.

### 3. What did the user do before? — `components/IssueList.tsx`

The SDK already records clicks, navigations, `fetch` calls and `console` output
as **breadcrumbs**. Add one that says what the click meant:

```ts
Sentry.addBreadcrumb({ category: 'ui.filter', message: `filter: ${next}`, data: { filter: next } });
```

Call it in a `changeFilter(next)` function, used by the filter buttons.

**Check it**: click **all**, then open issue 13. In Spotlight, the breadcrumbs of
the event end with your `ui.filter`, then the `fetch` that failed.

→ **Done when** the step 3 spec is green.

### 4. One bug, one issue — `sentry.ts`

By default, Sentry groups by stack trace and message. The message of an `ApiError`
contains the URL — `GET /issues/13 → 500`, `GET /issues/14 → 500`: two issues for
one bug. `ApiError` also knows its route **template**, `error.route`.

Add a `beforeSend(event, hint)` to `Sentry.init`. When `hint.originalException`
is an `ApiError`, set

```ts
event.fingerprint = ['api-error', error.method, error.route, String(error.status)];
```

and return the event.

→ **Done when** the step 4 spec is green.

### 5. Keep the noise out — `sentry.ts`

1. `ignoreErrors: [/ResizeObserver loop/]` — a harmless browser warning, which
   thousands of browsers would report every day.
2. In `beforeSend`, return `null` for an `ApiError` whose status is a 4xx: a stale
   link to a deleted issue is not a bug in your code.

Return `null` drops the event before it is sent: it costs nothing in your quota.

→ **Done when** `npm test` is fully green.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] The events carry the user's id, and no email
- [ ] The events of the detail panel carry `issue.id`, searchable in Sentry
- [ ] The 500s of two issues share one fingerprint
- [ ] A 404 and the `ResizeObserver` warning send nothing

**You can explain**

- [ ] Tag, context, extra, breadcrumb: which is searchable, which is for reading
- [ ] Why `withScope` rather than `setTag` on the global SDK
- [ ] What `{{ default }}` would add to the fingerprint, and why it is not wanted here
- [ ] `ignoreErrors` vs `beforeSend`: when each one runs

## Going further

- Try `fingerprint: ['{{ default }}', String(error.status)]`: how many issues now?
- SDK v11 collects more personal data by default than v10 did: read the
  `dataCollection` option, and set `userInfo: false`. What disappears from the event?
- Add `Sentry.setTag('feature', 'issue-detail')` at the top of `IssueDetail`'s
  module. Why is that a bad idea?
