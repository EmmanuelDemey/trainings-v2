# TP 24 — Security & authentication

> This TP is **autonomous**: it does not depend on any other TP. A small Star Wars
> app with React Router, a fake API (MSW) that hands out **JWTs**, and pages that
> anybody can open. Your job: log users in, keep the token safely, refresh it,
> protect the routes and the roles — and stop the XSS hidden in the data.

## Goal

Chapter 24 — Secure a React single-page application:

- **JWT**: what is inside, why the browser decodes it but never trusts it
- **Where the token lives**: in memory, not in `localStorage`; the refresh token in an
  `HttpOnly` cookie
- **An auth context** on top of an external store (`useSyncExternalStore`)
- **Protected routes** with React Router loaders: redirect to login and back
- **Roles**: hide in the UI, refuse in the loader, enforce on the API
- **An authenticated `fetch`**: the `Authorization` header, one refresh for many 401s
- **XSS**: sanitising HTML with DOMPurify, `javascript:` URLs, `rel="noopener"`, open redirects

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- Chapter 12 (Context) and chapter 14 (React Router loaders and error routes)

## Setup

```bash
npm install
npm run dev          # http://localhost:5173 — the API answers after ~300 ms
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Two accounts exist: **luke / usetheforce** (role `user`) and **leia / rebellion**
(role `admin`).

The specs are written and red on the starter:

- **`src/auth/jwt.spec.ts`** — decoding a token and its expiry (step 1)
- **`src/auth/session.spec.ts`** — the in-memory session: green from the start, read it
- **`src/router.spec.tsx`** — the whole app: login, redirects, roles, untrusted content
  (steps 2 to 4, and 6)
- **`src/auth/guards.spec.ts`** — `safeRedirect` (step 4)
- **`src/api/http.spec.ts`** — the authenticated `fetch` and the refresh (step 5)
- **`src/security/safeUrl.spec.ts`** and **`SafeHtml.spec.tsx`** — XSS (step 6)

**Already done for you:**

- The fake API in `src/mocks/handlers.ts`: `/api/auth/login`, `/refresh`, `/logout`,
  and protected endpoints that answer **401** without a valid token and **403**
  without the right role. Read it: this is the part that *really* protects the data.
- `src/mocks/tokens.ts` — signs and verifies the tokens, **on the API side**.
- `src/auth/session.ts` — the session store: the access token in a module variable,
  `getSession` / `setSession` / `clearSession` / `subscribe`.
- `src/api/auth.ts` — the login, refresh and logout requests.
- The pages, the layout and the routes. **Darth Vader's** bio and homepage were
  "edited by a fan": open his page at the end of step 3, before step 6.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Decode a JWT | `src/auth/jwt.ts` | `jwt.spec.ts` is green |
| 2 | The auth context: `user`, `login`, `logout` | `src/auth/AuthContext.tsx` | You can log in and out in the browser |
| 3 | Protect the routes and the admin role | `src/auth/guards.ts`, the loaders, `RootLayout.tsx` | The "protected routes" and "roles" specs are green |
| 4 | No open redirect after login | `src/auth/guards.ts` | `guards.spec.ts` is green |
| 5 | The authenticated `fetch`, with refresh | `src/api/http.ts` | `http.spec.ts` is green; a reload keeps you logged in |
| 6 | Untrusted HTML and URLs | `src/security/`, `PersonPage.tsx` | Every spec is green |

## Steps

### 1. Decode a JWT — `src/auth/jwt.ts`

Log in with the API in the browser's devtools (Network tab), copy the
`accessToken`, and paste it in [jwt.io](https://jwt.io): three parts, separated by
dots — a header, a payload (the **claims**), a signature.

1. `decodeJwt` splits on `.`, and throws `Malformed token: …` unless there are three parts.
2. The payload is **base64url**: `-` and `_` instead of `+` and `/`, no `=` padding.
   Convert it back, `atob` it, decode the bytes as UTF-8 with `TextDecoder`, then
   `JSON.parse`.
3. `isExpired`: `exp` is in **seconds**, `Date.now()` in **milliseconds**. The leeway
   makes a token "expired" a little before it really is.

Anyone can decode a JWT: **it is signed, not encrypted**. Never put a secret in one.
The browser does not verify the signature — it has no key. It reads the claims to
render the UI, and the API verifies the signature on every request.

→ **Done when** `jwt.spec.ts` is green.

### 2. The auth context — `src/auth/AuthContext.tsx`

The session lives outside React, in `session.ts`: the route loaders and `authFetch`
run outside any component and need the token too.

1. Subscribe to it with `useSyncExternalStore(subscribe, getSession)`. `getSession`
   returns the **same** object until something changes — the spec checks it, and React
   needs it, or it would re-render forever.
2. `login` stores the token returned by `loginRequest`; `logout` clears the session
   **first** (an API that is down must not keep anyone logged in), then calls the API.
3. Memoise the value on `user`, as in chapter 12.

→ **Done when** you can log in at `/login` in the browser and see "Logged in as …".
The specs of step 3 need this too.

### 3. Protect the routes — `src/auth/guards.ts`

Right now `/`, `/people/1` and `/admin` open for anybody (and the API answers 401).

1. `requireUser(request)`: when the session has no user, try
   `refreshAccessToken()` once — after a reload, the token in memory is gone but the
   refresh session may still be alive (step 5 makes it work).
2. Still nobody: `throw redirect('/login?redirectTo=' + encodeURIComponent(path))`,
   with the path **and** the query string of `request.url`. `LoginPage` already reads
   `redirectTo` and navigates there after a successful login.
3. Call `await requireUser(request)` at the top of the three loaders. A loader runs
   **before** the page renders: no protected pixel, no protected request, for an
   anonymous visitor.
4. `requireRole(request, 'admin')` for the admin loader: a user with another role gets
   `throw data('This page is for administrators only.', { status: 403 })`. The
   `ErrorPage` already renders "Access denied".
5. In `RootLayout`, show the **Admin** link to admins only.

Then log in as **luke** and call `fetch('/api/admin/stats')` from the console, with
his token: the API answers 403. Hiding a link, or a loader guard, is **UX** — anyone
can edit the JavaScript running in their own browser. The server is the security.

→ **Done when** the "protected routes" and "roles" blocks of `router.spec.tsx` are green.

### 4. No open redirect — `safeRedirect`

Open `/login?redirectTo=https://evil.example`, log in: you land on another site. A
phishing email can now say "log in on **your-bank.com**" — truthfully — and send
the user, logged in and trusting, to a copy of it.

1. `safeRedirect(to)` returns `to` only if it is a path of this app: it starts with `/`,
   but not `//` nor `/\` — browsers read both as "another host".
2. Anything else falls back to `/`.

→ **Done when** `guards.spec.ts` and the `redirectTo` spec of `router.spec.tsx` are green.

### 5. The authenticated `fetch` — `src/api/http.ts`

1. `authFetch` sets `Authorization: Bearer <token>` when there is a token. Use
   `new Headers(init.headers)`: the caller's headers are kept, whatever their shape.
2. On a **401**, the token has expired (it lives 5 minutes): call
   `refreshAccessToken()`, and replay the request with the new token. No new token, or
   a second 401: `clearSession()` and throw `UnauthorizedError` — `ErrorPage` shows
   "Session expired".
3. `refreshAccessToken` keeps the running promise in a module variable: three requests
   failing together share **one** refresh. Without that, the refresh token is used three
   times — and an API that rotates refresh tokens logs the user out.

The refresh token is **not** in JavaScript at all: a real API sets it as an
`HttpOnly; Secure; SameSite=Strict` cookie, which `credentials: 'include'` sends.
XSS cannot read it. The fake API keeps it in memory to the same effect.

→ **Done when** `http.spec.ts` is green, and **reloading** the page keeps you logged
in (the access token is gone, `requireUser` refreshes it).

### 6. Untrusted content — `src/security/` and `PersonPage.tsx`

Open **Darth Vader**'s page, then type `window.__pwned` in the console: `true`.
Some HTML in the API's data ran in your page — and could have read the access token
from memory, or called the API as you.

1. `safeUrl(url)`: parse it with `new URL()`, keep it only if the protocol is
   `http:`, `https:` or `mailto:`. React 19 already blocks a `javascript:` URL in
   `href` (it renders a URL that throws, and warns in development) — but not a
   `data:` URL, and not the URLs you pass to `window.open` or `location.href`. Hand
   Vader's homepage to `window.open` and the script runs. Use an **allow** list: the
   specs try `JaVaScRiPt:`, a leading space, a tab inside the word…
2. `SafeHtml`: `dangerouslySetInnerHTML` renders what it gets. Pass the HTML through
   `DOMPurify.sanitize` first — it keeps `<p>` and `<strong>`, drops `onerror`,
   `<script>`, `javascript:` links. Memoise it on `html`.
3. The homepage link opens a new tab: add `rel="noopener noreferrer"`. Without it,
   the opened page gets `window.opener` and can send **this** tab to a fake login page
   ("tabnabbing"). Modern browsers imply `noopener` for `target="_blank"` — be explicit
   anyway, and `noreferrer` keeps the URL out of the `Referer` header.

→ **Done when** every spec is green, and `window.__pwned` stays `undefined` after a
reload on Vader's page.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] An anonymous visitor is sent to `/login`, and comes back to the page they asked for
- [ ] A reload keeps the user logged in; logging out closes the protected pages
- [ ] Luke cannot open `/admin` — nor call `/api/admin/stats`
- [ ] Vader's bio is shown, formatted, without running any script; his homepage is not a link
- [ ] `grep -rn localStorage src` finds no token

**You can explain**

- [ ] Why the browser decodes a JWT but never verifies it — and what would happen if
  it trusted a hand-made one
- [ ] The trade-offs of `localStorage`, memory and an `HttpOnly` cookie for a token
- [ ] Why hiding a link or guarding a loader is not security
- [ ] Why `safeUrl` uses an allow list, and what `noopener` prevents
- [ ] What an open redirect is, and how `redirectTo` could become one

## Going further

- **Refresh before it expires**: with `isExpired(decodeJwt(token))`, refresh **before**
  the request instead of after a 401. Then schedule the refresh with a timer, and
  cancel it on logout.
- **Log out in every tab**: post a message on a `BroadcastChannel('auth')` on logout,
  and clear the session when another tab sends it.
- **A Content Security Policy**: add
  `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">`
  to `index.html`, remove DOMPurify, and open Vader's page: the inline handler is
  blocked, and the console says why. In production, send the CSP as an HTTP header
  (the nginx config of chapter 22).
- **OpenID Connect**: replace the login form with a real identity provider (Keycloak in
  Docker, or Auth0) and `react-oidc-context`: Authorization Code flow with **PKCE**,
  the redirect to the provider, the `/callback` route, silent renew.
- **Lint for it**: `eslint-plugin-react`'s `no-danger` and `jsx-no-script-url` rules,
  `react/jsx-no-target-blank` — or React Doctor (chapter 23).
