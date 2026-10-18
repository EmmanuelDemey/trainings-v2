---
layout: cover
---

# 9 - Fetching data

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Call** an HTTP API with `fetch`, and **remember** that a 404 does not reject
- **Model** a request as a state machine — `loading`, `error`, `success` — instead
  of three independent booleans
- **Fetch** inside a component with `useEffect`, and **explain** why the effect
  needs a cleanup
- **Cancel** a request with `AbortController` to fix the race condition that appears
  when the input changes faster than the network answers
- **Configure** the API base URL per environment with Vite's `import.meta.env` and
  the `VITE_` prefix — and **know** why it must never hold a secret

---

# `fetch` — the native HTTP client

- Built into every browser and Node.js ≥ 18: **no dependency** to install
- Returns a `Promise<Response>`; the body is read with a second, async call

```ts
const response = await fetch('/api/people');      // 1. the headers have arrived

if (!response.ok) {                                // 2. 2xx? fetch won't check for you
  throw new Error(`HTTP ${response.status}`);
}

const people: Person[] = await response.json();    // 3. read and parse the body
```

<br />

| Body reader | Returns |
|---|---|
| `response.json()` | the parsed JSON (`Promise<any>` — type it yourself) |
| `response.text()` | a `string` |
| `response.blob()` / `response.formData()` | a file / form fields |

---

# The `fetch` trap: HTTP errors don't reject

```ts
try {
  const response = await fetch('/api/people/999');   // the server answers 404…
  const person = await response.json();             // …and we happily parse the error page
} catch (error) {
  // only reached on a NETWORK failure: offline, DNS, CORS, abort
}
```

<br />

| What happened | `fetch` promise | `response.ok` |
|---|---|---|
| 200 OK | resolves | `true` |
| 404 / 500 | **resolves** | `false` |
| offline, CORS, DNS | rejects (`TypeError`) | — |
| `controller.abort()` | rejects (`AbortError`) | — |

- Always check `response.ok` (or `response.status`) — wrap it **once** in a helper

---

# A small typed helper

```ts
// api/http.ts
export class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;   // no parameter property: create-vite enables erasableSyntaxOnly
  }
}

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new HttpError(response.status, `${init?.method ?? 'GET'} ${url} → ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// usage
const person = await getJson<Person>(`/api/people/${id}`, { signal });
```

- The generic `T` is a **promise**, not a check: the server may send anything
- To validate at runtime, parse with a schema (Zod, chapter 16)

---

# Sending data — `POST` with a JSON body

```ts
export async function createPerson(input: NewPerson): Promise<Person> {
  const response = await fetch('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new HttpError(response.status, 'Could not create the person');
  return response.json();
}
```

- `body` must be a string, `FormData`, `Blob` or `URLSearchParams` — never a raw object
- Forgetting `Content-Type` makes most back ends ignore the body
- With `FormData`, **do not** set `Content-Type`: the browser adds the multipart boundary

---

# A request is a state machine

```ts
// ❌ three booleans = 8 combinations, most of them impossible
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);
const [data, setData] = useState<Person[] | null>(null);
```

```ts
// ✅ one discriminated union = exactly the states that can happen
type RemoteData<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };
```

- `loading: true` **and** `error` set at the same time? Impossible by construction
- TypeScript narrows: `data` only exists once you checked `status === 'success'`

---

# Fetching in a component

```tsx
export function PeopleTableContainer() {
  const [state, setState] = useState<RemoteData<Person[]>>({ status: 'loading' });

  useEffect(() => {
    getJson<Person[]>('/api/people')
      .then((data) => setState({ status: 'success', data }))
      .catch((error: Error) => setState({ status: 'error', error }));
  }, []);  // [] — run once, after the first render

  if (state.status === 'loading') return <Loader />;
  if (state.status === 'error') return <ErrorMessage error={state.error} />;
  return <PeopleTable people={state.data} />;
}
```

- The effect runs **after** the paint: the first render always shows the loader
- The effect callback cannot be `async` — it must return nothing or a cleanup function

---

# Container and presentational components

```tsx
// presentational: props in, JSX out — trivial to test and to put in Storybook
export function PeopleTable({ people }: { people: Person[] }) { /* … */ }

export function Loader() {
  return <p role="status" aria-live="polite">Loading…</p>;
}

export function ErrorMessage({ error }: { error: Error }) {
  return <p role="alert">Something went wrong: {error.message}</p>;
}
```

- The **container** knows *where* the data comes from; the table only knows *how* to show it
- `role="status"` and `role="alert"` make the states visible to screen readers —
  and give your tests an accessible query: `findByRole('alert')`

---

# The race condition

The detail page fetches the selected person. The user clicks **Luke**, then **Leia**:

```
click Luke ──► GET /people/1 ─────────────────────────────► 200 (slow)  ──► shows Luke ❌
click Leia ──► GET /people/5 ──────► 200 (fast) ──► shows Leia
```

```tsx
useEffect(() => {
  getJson<Person>(`/api/people/${id}`).then((person) => setState({ status: 'success', data: person }));
}, [id]);
```

- Responses arrive **in any order**: the last one to land wins, not the last one asked
- The page says *Leia* in the title but shows *Luke*'s details
- The fix: when `id` changes, the previous request must be **ignored or cancelled**

---

# Fix 1 — ignore stale responses

```tsx
useEffect(() => {
  let ignore = false;                          // one flag per effect run

  setState({ status: 'loading' });
  getJson<Person>(`/api/people/${id}`)
    .then((data) => { if (!ignore) setState({ status: 'success', data }); })
    .catch((error: Error) => { if (!ignore) setState({ status: 'error', error }); });

  return () => { ignore = true; };            // runs before the next effect, or on unmount
}, [id]);
```

- Each run closes over **its own** `ignore` variable
- The cleanup flips the flag of the *previous* run before the new one starts
- Correct, but the stale request still downloads to the end

---

# Fix 2 — cancel with `AbortController`

```tsx
useEffect(() => {
  const controller = new AbortController();

  setState({ status: 'loading' });
  getJson<Person>(`/api/people/${id}`, { signal: controller.signal })
    .then((data) => setState({ status: 'success', data }))
    .catch((error: Error) => {
      if (error.name === 'AbortError') return;    // we asked for it: not an error
      setState({ status: 'error', error });
    });

  return () => controller.abort();               // cancels the HTTP request itself
}, [id]);
```

- The browser **closes the connection**: no wasted bandwidth, no stale `setState`
- Always filter `AbortError` out, or the UI flashes an error on every change

---

# Timeouts and StrictMode

```ts
// give up after 5 s — no setTimeout / clearTimeout bookkeeping
await fetch(url, { signal: AbortSignal.timeout(5_000) });   // rejects with TimeoutError

// combine "the component went away" and "too slow"
const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5_000)]);
```

<br />

In development, `StrictMode` runs every effect **twice** (mount → cleanup → mount):

```
GET /api/people   (cancelled)
GET /api/people   200
```

- Seeing two requests in the Network tab is **expected** — and it proves your cleanup works
- Production runs the effect once

---

# Environment variables with Vite

```shell
.env                # loaded in every mode — committed
.env.local          # every mode, ignored by git — your machine only
.env.[mode]         # only in that mode: .env.development, .env.production
.env.[mode].local   # that mode, ignored by git
```

```shell
# .env
VITE_API_BASE_URL=http://localhost:3000/api
DB_PASSWORD=secret          # ⚠️ NOT exposed: no VITE_ prefix
```

```ts
const baseUrl = import.meta.env.VITE_API_BASE_URL;  // only VITE_* reach the client
import.meta.env.MODE;   // 'development' | 'production' | your --mode
import.meta.env.DEV;    // boolean — handy for dev-only code
```

---

# Typing `import.meta.env`

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- The `/// <reference>` line, or `"types": ["vite/client"]` in `tsconfig.json`, brings Vite's own types
- Now `import.meta.env.VITE_API_BASE_URL` is a `string`, and a typo is a compile error
- Every value is a **string**: `VITE_RETRIES=3` gives `'3'` — convert it yourself

---

# Build-time, not runtime

- Vite **replaces** `import.meta.env.VITE_*` by its value **when it builds**
- The value ends up as a plain string in `dist/assets/index-[hash].js`

```js
// what ships to the browser
const baseUrl = "https://api.example.com";
```

<br />

Consequences:

- **Never** put a secret in a `VITE_` variable: anyone can read it in DevTools
- One build = one environment: staging and production need **two builds**…
- …or a runtime configuration file read at startup — we do that in chapter 22 (Docker)

---

# Where this is going

The `useEffect` + `useState` pattern works, but every component re-implements:

- loading and error states
- cancellation and race conditions
- caching, deduplication, retries, refetch on focus

<br />

| Need | Chapter |
|---|---|
| Extract the pattern into `useFetch<T>()` | **11** — custom hooks |
| Suspend on a promise with `use()` | **13** — lazy & Suspense |
| Load data **before** rendering the route | **14** — router loaders |
| Cache, invalidate, mutate | **17** — TanStack Query |

> Fetching in an effect is the **fundamentals**. In a real app, prefer a router loader or
> a data library.

---

# Recap

- `fetch` resolves on **any** HTTP answer: check `response.ok`, once, in a helper
- Model a request as a **discriminated union** (`loading | error | success`) — no
  impossible states
- Fetch in `useEffect`; the effect body can't be `async`, call an async function inside
- Responses come back **in any order**: ignore or cancel the previous request in the
  effect's **cleanup**
- `AbortController` cancels the HTTP request; filter out `AbortError`;
  `AbortSignal.timeout()` gives you a timeout for free
- Only `VITE_*` variables reach the client, as **strings**, inlined **at build time** —
  never a secret

---

# Quiz — Question 1 / 3

**`fetch('/api/people/999')` gets a `404 Not Found`. What happens?**

- **A.** The promise rejects with an `HttpError`
- **B.** The promise rejects with a `TypeError`
- **C.** The promise resolves; `response.ok` is `false`
- **D.** The promise never settles

<v-click>

> ✅ **C** — `fetch` only rejects on network failures (offline, CORS, abort). Any HTTP
> answer, 404 and 500 included, resolves: you must check `response.ok` yourself.

</v-click>

---

# Quiz — Question 2 / 3

**The user switches quickly from person 1 to person 5. Sometimes person 1 is displayed. What is the best fix?**

- **A.** Add `id` to the dependency array
- **B.** Abort the previous request in the effect's cleanup with `AbortController`
- **C.** Wrap `setState` in `startTransition`
- **D.** Remove `StrictMode`

<v-click>

> ✅ **B** — The slow response for person 1 lands after the fast one for person 5. The
> cleanup runs before the next effect: aborting there cancels the stale request, and its
> `setState` never happens.

</v-click>

---

# Quiz — Question 3 / 3

**Which variable can your React code read with `import.meta.env`?**

- **A.** `API_KEY=abc` in `.env`
- **B.** `VITE_API_BASE_URL=/api` in `.env`
- **C.** `REACT_APP_API_URL=/api` in `.env`
- **D.** Any variable exported in the shell that runs `npm run build`

<v-click>

> ✅ **B** — Vite only exposes variables prefixed with `VITE_` (configurable with
> `envPrefix`). `REACT_APP_` was Create React App's convention. And whatever is exposed
> is public: it is written into the bundle.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 9 - Fetching data
