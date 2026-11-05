---
layout: cover
---

# 24 - Security &amp; authentication

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what a JWT carries, and why the browser reads it but never trusts it
- **Choose** where tokens live: memory, `localStorage`, an `HttpOnly` cookie
- **Describe** OAuth 2 / OpenID Connect and the Authorization Code flow with **PKCE**
- **Build** an auth context, and **protect** routes and roles with React Router loaders
- **Write** an authenticated `fetch` that refreshes the token once for many 401s
- **Prevent** XSS: what React escapes, what it does not, DOMPurify, CSP
- **Avoid** the classic traps: open redirects, `javascript:` URLs, tabnabbing, secrets in the bundle

---

# The one rule

<br />

> **Everything that runs in the browser is under the user's control.**

<br />

- The JavaScript bundle is public: anyone can read it, change it, replay its requests
- A hidden button, a route guard, a disabled field: **UX**, not security
- The **server** authenticates every request and authorises every action

<br />

What the front end **does** own:

- Not leaking what it holds: tokens, personal data — **XSS** is the threat
- Not being turned against its users: **open redirects**, tabnabbing, CSRF
- A clear, honest UI for who is logged in and what they may do

---

# Authentication, authorisation

| | Question | Answered by |
|---|---|---|
| **Authentication** (authn) | *Who* are you? | a login: password, SSO, passkey → a **session** or a **token** |
| **Authorisation** (authz) | *What* may you do? | the server, on every request: roles, ownership, scopes |

<br />

Two ways to remember who is logged in:

- **Session cookie**: the server keeps the session, the browser an opaque id in a cookie.
  Simple, revocable. Best when the API and the app share a domain
- **Token (JWT)**: the server signs a token, the client sends it on each request.
  Stateless, works across domains and services

---

# JSON Web Token

```
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiJ1MSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc5Mzk… . 3q2-7w…
       header                          payload (claims)                       signature
```

```json
{ "sub": "u1", "name": "Leia Organa", "role": "admin", "iat": 1793903151, "exp": 1793903451 }
```

- Three **base64url** parts: anyone can decode them — a JWT is **signed, not encrypted**
- `sub` the subject, `exp` / `iat` expiry and issue time **in seconds**, plus your claims
- The signature proves the server issued it. Only the **server** can check it

```ts
// The browser decodes, for the UI only — it has no key, it verifies nothing
const claims = JSON.parse(new TextDecoder().decode(
  Uint8Array.from(atob(base64url(token.split('.')[1])), (c) => c.charCodeAt(0)),
));
```

- Or `jwt-decode` (tiny). Never put a secret in a JWT; keep it short-lived

---

# Where does the token live?

| | XSS can read it? | Sent automatically (CSRF)? | Survives a reload? |
|---|---|---|---|
| `localStorage` | **yes** | no | yes |
| Memory (a module variable) | harder | no | **no** |
| `HttpOnly; Secure; SameSite` cookie | **no** | yes — `SameSite` limits it | yes |

<br />

The usual combination:

- **Access token** — short-lived (minutes), in **memory**, sent as `Authorization: Bearer …`
- **Refresh token** — long-lived, in an **`HttpOnly` cookie** scoped to `/auth/refresh`;
  a reload calls the refresh endpoint to get a new access token
- Or a **BFF** (backend for frontend): the server keeps every token, the browser only a
  session cookie — the most robust option for sensitive apps

---

# OAuth 2 and OpenID Connect

- **OAuth 2**: delegated **authorisation** — an app gets an access token to call an API
  on the user's behalf
- **OpenID Connect** (OIDC): an identity layer on top — an **ID token** (a JWT) says
  *who* logged in. Keycloak, Auth0, Entra ID, Google, Okta…

<br />

**Authorization Code flow with PKCE** — the one for SPAs:

1. The app creates a random `code_verifier`, sends its hash (`code_challenge`)
2. It redirects to the provider's login page
3. The provider redirects back to `/callback?code=…`
4. The app exchanges `code` + `code_verifier` for the tokens

<br />

- PKCE proves the app that started the login is the one finishing it — no client secret
  needed in a public SPA
- The **implicit flow** (token in the URL) is deprecated: never use it

---

# OIDC in React

```shell
npm install oidc-client-ts react-oidc-context
```

```tsx
<AuthProvider
  authority="https://auth.example.com/realms/starwars"
  client_id="people-app"
  redirect_uri={`${window.location.origin}/callback`}
  onSigninCallback={() => window.history.replaceState({}, '', '/')}   // drop ?code= from the URL
>
  <App />
</AuthProvider>
```

```tsx
function LoginButton() {
  const auth = useAuth();
  if (auth.isLoading) return <p>Loading…</p>;
  if (auth.isAuthenticated) return <button onClick={() => auth.signoutRedirect()}>Log out {auth.user?.profile.name}</button>;
  return <button onClick={() => auth.signinRedirect()}>Log in</button>;
}
```

- The library does PKCE, the callback, the silent renew and the storage
- Your API reads `auth.user?.access_token` — and **validates** it on its side

---

# An auth context

```tsx {*}{maxHeight:'380px'}
// session.ts — OUTSIDE React: loaders and fetch helpers need the token too
let session: Session = { accessToken: null, user: null };
const listeners = new Set<() => void>();

export const getSession = () => session;
export function setSession(accessToken: string) {
  const { sub, name, role } = decodeJwt(accessToken);
  session = { accessToken, user: { id: sub, name, role } };
  listeners.forEach((listener) => listener());
}
export const subscribe = (listener: () => void) => (listeners.add(listener), () => listeners.delete(listener));

// AuthContext.tsx — the components subscribe to it
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user } = useSyncExternalStore(subscribe, getSession);
  const value = useMemo(() => ({
    user,
    login: async (username: string, password: string) => setSession(await loginRequest(username, password)),
    logout: async () => { clearSession(); await logoutRequest(); },
  }), [user]);
  return <AuthContext value={value}>{children}</AuthContext>;
}
```

- `useAuth()` throws outside its provider — the pattern of chapter 12

---

# Protected routes: in the loader

```ts
export async function requireUser(request: Request): Promise<User> {
  if (!getSession().user) await refreshAccessToken();     // after a reload
  const { user } = getSession();
  if (!user) {
    const { pathname, search } = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(pathname + search)}`);
  }
  return user;
}

export async function peopleLoader({ request }: LoaderFunctionArgs) {
  await requireUser(request);                 // before ANY protected request
  return getJson<Person[]>('/api/people', request.signal);
}
```

- The loader runs **before** the render: no flash of protected content
- Without loaders: a `<RequireAuth>` component rendering `<Navigate to="/login" replace />`
- React Router **middleware** can guard a whole branch of routes at once

---

# Roles

```ts
export async function requireRole(request: Request, role: Role) {
  const user = await requireUser(request);
  if (user.role !== role) throw data('Administrators only.', { status: 403 });
  return user;
}
```

```tsx
{user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
```

<br />

Three layers, one of them is security:

| Layer | Purpose |
|---|---|
| Hide the link | UX: do not show what you cannot use |
| Guard the loader | UX: a clean 403 page instead of a broken one |
| **Check on the API** | **Security**: the only one an attacker cannot edit |

- Prefer **permissions** (`can('people:delete')`) over role names scattered in the UI

---

# An authenticated `fetch`

```ts {*}{maxHeight:'360px'}
let refreshing: Promise<string | null> | null = null;

export function refreshAccessToken() {
  refreshing ??= refreshRequest()                         // POST /auth/refresh, credentials: 'include'
    .then((token) => { if (token) setSession(token); else clearSession(); return token; })
    .finally(() => { refreshing = null; });
  return refreshing;                                      // 10 failing requests, ONE refresh
}

export async function authFetch(path: string, init: RequestInit = {}) {
  const send = (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(path, { ...init, headers });
  };

  const response = await send(getSession().accessToken);
  if (response.status !== 401) return response;

  const token = await refreshAccessToken();
  if (!token) throw new UnauthorizedError();
  return send(token);                                     // replay, once
}
```

- With axios: the same logic in a response **interceptor**; with TanStack Query, in the `queryFn`

---

# Login, logout: the details

- Same error for unknown user and wrong password: do not reveal which accounts exist
- `autoComplete="username"` / `"current-password"`: password managers work, and passkeys
- After login, `navigate(to, { replace: true })`: "Back" does not return to the form
- On logout: clear the token **first**, then call the API; clear the caches
  (`queryClient.clear()`, stores) — the next user of the machine sees nothing
- Several tabs: a `BroadcastChannel('auth')` logs them all out together
- Never log tokens, never put them in URLs (history, server logs, `Referer`)

---

# XSS: what React does for you

```tsx
const name = '<img src=x onerror="steal(document.cookie)">';

<p>{name}</p>                  // ✅ rendered as TEXT: React escapes it
<input value={name} />         // ✅ an attribute value, escaped too
```

What it does **not** protect:

```tsx
<div dangerouslySetInnerHTML={{ __html: bio }} />   // ❌ runs the onerror
ref.current.innerHTML = html;                       // ❌ bypasses React entirely
window.location.href = user.website;                // ❌ "javascript:…" runs: not a React prop
window.open(url); eval(code); new Function(code);   // ❌
<a href={user.website}>Site</a>                     // ⚠️ see below
```

- React 19 **blocks** `javascript:` URLs in `href` / `src`: it renders a URL that throws
  instead. A safety net, not a filter — `data:` URLs, broken links and every non-React
  sink above still need yours
- Also: server-side rendering that inlines JSON in a `<script>` without escaping `</script>`

---

# Sanitising HTML and URLs

```shell
npm install dompurify
```

```tsx
import DOMPurify from 'dompurify';

export function SafeHtml({ html }: { html: string }) {
  const clean = useMemo(() => DOMPurify.sanitize(html), [html]);   // keeps <p>, drops onerror
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

```ts
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function safeUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url, window.location.origin);   // normalises JaVaScRiPt:, tabs…
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}
```

- An **allow list**, never a regex against `javascript:`
- Use it for every URL from users — `href`, `window.open`, `location`, redirects
- Better still: render **Markdown** to React elements (`react-markdown`), no HTML at all

---

# Content Security Policy

An HTTP header that tells the browser what may run — the safety net when a bug slips through.

```nginx
add_header Content-Security-Policy
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
   img-src 'self' data: https:; connect-src 'self' https://api.example.com;
   frame-ancestors 'none'; base-uri 'self'; object-src 'none'" always;
```

- `script-src 'self'`: no inline script, no `onerror=` handler, no `eval` — the XSS above is blocked
- `frame-ancestors 'none'`: no clickjacking in an `<iframe>`
- Start with `Content-Security-Policy-Report-Only` and a `report-to` endpoint
- Vite builds CSP-friendly bundles; watch out for CSS-in-JS and analytics snippets
- Also: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`

---

# The other classic traps

**Open redirect**: `/login?redirectTo=https://evil.example`

```ts
export function safeRedirect(to: string | null, fallback = '/') {
  if (!to || !to.startsWith('/') || to.startsWith('//') || to.startsWith('/\\')) return fallback;
  return to;
}
```

**Tabnabbing**: `<a target="_blank" rel="noopener noreferrer">` — the opened page gets no
`window.opener`

**CSRF**: only for cookie-based auth — `SameSite=Lax/Strict` cookies, and a CSRF token
for state-changing requests

**Secrets in the bundle**: every `VITE_*` variable is **public** (chapter 9). API keys
belong on a server

**Dependencies**: `npm audit`, Dependabot / Renovate, a lockfile, `npm ci` in CI

---

# Errors and exceptions

- **401** → the session is gone: refresh once, then send to login, keep `redirectTo`
- **403** → logged in, not allowed: an "Access denied" page, not a login loop
- Route error boundaries (chapter 14) catch what the loaders throw:

```tsx
export function ErrorPage() {
  const error = useRouteError();
  if (error instanceof UnauthorizedError) return <SessionExpired />;
  if (isRouteErrorResponse(error) && error.status === 403) return <AccessDenied />;
  return <p role="alert">Something went wrong.</p>;      // no stack trace for users
}
```

- Show users a message, send the details to monitoring (Sentry…) — **without** tokens
  or personal data in the report
- Error boundaries for render errors (chapter 10)

---

# Testing security

```ts
it('sends an anonymous visitor to the login page', async () => {
  const router = renderAt('/people/1');

  expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  expect(router.state.location.search).toBe('?redirectTo=%2Fpeople%2F1');
});

it.each(['javascript:alert(1)', 'JaVaScRiPt:alert(1)', '\tjava\nscript:alert(1)'])(
  'refuses %j', (url) => expect(safeUrl(url)).toBeUndefined(),
);
```

- MSW plays the API: 401 without a token, 403 without the role, an expired token
- Test with **hostile data**: an `onerror` in a bio, a `javascript:` URL, a `//` redirect
- Lint: `react/no-danger`, `react/jsx-no-script-url`, `react/jsx-no-target-blank`

---

# Recap

- The browser is the user's: **the server** authenticates and authorises every request
- A JWT is **signed, not encrypted**: decode it for the UI, verify it on the server
- Access token **in memory**, refresh token in an **`HttpOnly`** cookie — or a BFF
- SPA + identity provider: OIDC, **Authorization Code + PKCE**, `react-oidc-context`
- Guard routes in **loaders**; hide links for UX; enforce roles on the **API**
- One `authFetch`: Bearer header, **one** refresh for many 401s, replay once
- React escapes text and blocks `javascript:` in `href` — not `dangerouslySetInnerHTML`,
  nor `window.open` / `location`: **DOMPurify**, an allow list of protocols, a **CSP**
- No open redirect, `rel="noopener"`, no secret in `VITE_*`

---

# Quiz — Question 1 / 3

**The SPA decodes the access token and reads `"role": "admin"`. What does that prove?**

- **A.** That the user is an admin — the token is signed
- **B.** Nothing the browser can rely on: it cannot check the signature, the API must
- **C.** That the token is encrypted with the server's key
- **D.** That the token has not expired

<v-click>

> ✅ **B** — The browser has no key: a token edited by hand decodes just as well.
> Reading the claims is fine to render the UI; the API verifies the signature, the
> expiry and the role on every request.

</v-click>

---

# Quiz — Question 2 / 3

**`bio = '<img src=x onerror=alert(1)>'`. Which line runs the script, in a React 19 app?**

- **A.** `<p>{bio}</p>`
- **B.** `<input value={bio} />`
- **C.** `<div dangerouslySetInnerHTML={{ __html: bio }} />`
- **D.** `<p title={bio}>`

<v-click>

> ✅ **C** — React escapes text and attribute values, so A, B and D render a harmless
> string. `dangerouslySetInnerHTML` hands the HTML to the browser as is: sanitise it
> with DOMPurify first.

</v-click>

---

# Quiz — Question 3 / 3

**Three requests fail with 401 at the same time. What should `authFetch` do?**

- **A.** Send the user to the login page at once
- **B.** Refresh the token three times, one per request
- **C.** Share **one** refresh between the three, then replay each request once
- **D.** Retry each request until it succeeds

<v-click>

> ✅ **C** — Keep the refresh promise while it runs, so concurrent callers await the
> same one. Three refreshes waste calls — and with refresh-token rotation, the second
> one is rejected and logs the user out. Retrying without limit hides a dead session.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 24 - Security &amp; authentication
