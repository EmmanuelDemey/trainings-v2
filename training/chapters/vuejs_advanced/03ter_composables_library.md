---
layout: cover
---

# 3ter - Anatomy of a team composable library

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Decide** what deserves a place in a shared library — and what should stay in
  the app that needs it
- **Lay out** the repository so one composable is one folder: code, test, demo, doc
- **Write** the `package.json` that makes it importable, tree-shakeable and
  type-safe for its consumers
- **Enforce** a team contract on signatures, return values and cleanup
- **Share** state between callers without the module-scope singleton
- **Test** a composable with no component, and **check** it survives SSR
- **Version**, **release** and **deprecate** without breaking six applications at once

---

# The problem this solves

Six applications, six `useFetch`:

| App | Its version does | It forgets |
|---|---|---|
| checkout | retries 3× | to abort on URL change |
| back-office | aborts | the `loading` flag on error |
| portal | returns `reactive({})` | destructuring reactivity |
| mobile | reads the token from `localStorage` | SSR |
| admin | copy of *portal* from 8 months ago | everything fixed since |
| intranet | wraps `axios` | nothing — but nobody knows it exists |

<br />

- The bug found in one is fixed in one
- The convention agreed in a review is applied until the next hurry
- Onboarding means reading six variants of the same 30 lines

> A shared library is not about writing less code. It is about **having one place
> where the answer lives**.

---

# What goes in, what stays out

| Candidate | Where it belongs |
|---|---|
| `useDebounce`, `useLocalStorage`, `useMediaQuery` | **VueUse** — do not rewrite it |
| `useAcmeFetch` — your auth header, your error envelope, your tracing id | **the library** |
| `useMoney` — your currencies, your rounding rules | **the library** |
| `usePermissions` — your roles model | **the library** |
| `useCheckoutStep` — one screen, one app | **the app** |
| `useInvoiceFilters` — used twice, in the same app | **the app** |

<br />

Two rules that keep it honest:

- **Rule of three** — promote on the *third* real usage, not on the first
  speculation. Two call sites are a coincidence; three are a convention.
- **No orphan owner** — a composable nobody is accountable for is a composable
  nobody upgrades. Every folder has a `CODEOWNERS` line.

---

# The layers

```
   ┌────────────────────────────────────────────────────┐
   │  applications   checkout · back-office · portal    │  screens, business flows
   └────────────────────────────────────────────────────┘
                          │ import { useAcmeFetch }
                          ▼
   ┌────────────────────────────────────────────────────┐
   │  @acme/vue-composables                             │  ⬅ your house rules
   │  useAcmeFetch · useMoney · usePermissions          │     domain + glue
   └────────────────────────────────────────────────────┘
                          │ builds on
                          ▼
   ┌────────────────────────────────────────────────────┐
   │  @vueuse/core   useLocalStorage · useEventListener │  the plumbing, audited
   └────────────────────────────────────────────────────┘
                          │
                          ▼
   ┌────────────────────────────────────────────────────┐
   │  vue   ref · computed · watch · effectScope        │
   └────────────────────────────────────────────────────┘
```

- Each layer may only import **downwards** — an ESLint `no-restricted-imports`
  rule makes that non-negotiable
- The library **never** imports from an application. If it needs a value from one,
  the value is **injected** (chapter 3bis)

---

# Repository anatomy

```
packages/composables/
├── src/
│   ├── useAcmeFetch/
│   │   ├── index.ts          the composable + its exported types
│   │   ├── index.test.ts     colocated — the test moves with the code
│   │   ├── demo.vue          mounted by the docs site
│   │   └── README.md         one page, at least one @example
│   ├── usePermissions/
│   ├── useMoney/
│   ├── _internal/            helpers — never exported
│   └── index.ts              the barrel: re-exports, nothing else
├── package.json
├── vite.config.ts
└── tsconfig.json
```

- **One folder per composable** is the layout VueUse itself uses — it makes
  "delete this composable" a `rm -rf`, and code review a single directory diff
- `_internal/` is the escape hatch for shared helpers; the underscore is the
  reminder that it has **no public API guarantee**

---

# Monorepo or its own repository?

| | Own repository | Package in the monorepo |
|---|---|---|
| Release | `npm publish`, apps bump when they want | version is `workspace:*` |
| A breaking change | apps stay on the old major | you fix every call site in the same PR |
| Feedback loop | publish → install → test | instant, `pnpm --filter` |
| Requires | a registry, a release pipeline | every app in one repo |

<br />

- With **two or three apps in one monorepo**, start there — the cost of publishing
  is not repaid yet
- With apps on different release trains, or a partner team consuming it, you need
  a **real package**: a version number is what lets them *not* upgrade today

> Either way, the code below is identical. Only the release step changes.

---

# `package.json` — the contract with consumers

```json
{
  "name": "@acme/vue-composables",
  "version": "2.4.0",
  "type": "module",
  "sideEffects": false,
  "files": ["dist"],
  "exports": {
    ".":            { "types": "./dist/index.d.ts",    "import": "./dist/index.js" },
    "./useMoney":   { "types": "./dist/useMoney.d.ts", "import": "./dist/useMoney.js" },
    "./package.json": "./package.json"
  },
  "peerDependencies": { "vue": "^3.5.0" },
  "dependencies": { "@vueuse/core": "^12.0.0" }
}
```

- `vue` in **`peerDependencies`**, never in `dependencies` — two copies of Vue is
  two reactivity systems, and injections that silently miss
- `exports` **closes** the package: `@acme/vue-composables/src/useMoney/index.ts`
  stops resolving, so you can refactor internals without breaking anyone
- `"sideEffects": false` is what lets a bundler drop the composables an app never
  imports — it is a **promise**, and the next slide is about keeping it

---

# The barrel, and the cost of getting it wrong

```ts
// src/index.ts — re-exports and nothing else
export { useAcmeFetch, type UseAcmeFetchReturn } from './useAcmeFetch';
export { useMoney,     type UseMoneyOptions }    from './useMoney';
export { usePermissions }                        from './usePermissions';
```

```ts
// ❌ never, at module scope
import './styles/tokens.css';                  // a side effect
const observer = new ResizeObserver(() => {}); // runs on import, crashes in SSR
console.info('[acme] composables 2.4.0');      // ships to production
```

- Anything that **runs on import** invalidates `"sideEffects": false` — and runs
  during SSR, in every unit test, and in apps that imported one unrelated function
- Everything happens **inside** the `useXxx` call. That is the whole discipline
- Ship CSS as a separate export (`"./style.css"`), never as an import in the entry

---

# Convention 1 — the signature

```ts
export interface UseAcmeFetchOptions {
  immediate?: boolean;
  retries?: number;
  signal?: AbortSignal;
}

export function useAcmeFetch<T>(
  url: MaybeRefOrGetter<string>,            // 1. reactive inputs first
  options: UseAcmeFetchOptions = {},        // 2. one optional options object, last
) { /* ... */ }
```

- **Reactive inputs accept `MaybeRefOrGetter`** and are unwrapped with `toValue` —
  a caller may pass a value, a ref or a getter, and never has to think about it
- **One options object**, always optional, always last: adding an option is then a
  **minor** version, not a breaking change
- Defaults are resolved **once**, at the top of the function — never re-read
  inside a watcher
- Non-reactive dependencies (a client, a logger) go in the options too, so tests
  can pass a fake without a module mock

---

# Convention 2 — the return value

```ts
export interface UseAcmeFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Readonly<Ref<boolean>>;   // the caller must not write it
  execute: () => Promise<void>;
  abort: () => void;
}
```

- Always return an **object of refs**, never a `reactive()` — destructuring must
  keep working (chapter 3)
- Always an **object**, even for one value: adding a key later stays backward
  compatible, changing a bare `Ref` return into an object does not
- Mark as `Readonly<Ref<…>>` what the caller has no business writing
- **Export the return type by name**. Consumers need it to type a wrapper, a
  prop, or a store field — and it is the type you will be held to by semver

---

# Convention 3 — own your effects

```ts
import { getCurrentScope, onScopeDispose } from 'vue';

export function useAcmeFetch<T>(url: MaybeRefOrGetter<string>) {
  const controller = new AbortController();

  // Works inside a component *and* inside a bare effectScope.
  // Vue 3.5: the second argument silences the "no active scope" warning.
  onScopeDispose(() => controller.abort(), true);

  if (!getCurrentScope()) {
    // No owner: say so, do not leak silently.
    console.warn('[acme] useAcmeFetch called outside a scope — call abort() yourself');
  }
}
```

- Prefer **`onScopeDispose`** to `onUnmounted`: a component's `setup` is a scope,
  so it covers both cases — and it keeps working inside a store or a plugin
- A composable that subscribes to anything **unsubscribes by itself**. If the
  caller has to remember something, it belongs in the return value (`stop`, `abort`)

---

# Three flavours of state — pick deliberately

```ts
// 1. Per call — the default
export function useCounter() {
  const count = ref(0);
  return { count };
}

// 2. Per app — provided by a plugin, read through inject  (chapter 3bis)
export function useAcmeConfig() {
  const config = inject(acmeConfigKey);
  if (!config) throw new Error('[acme] install createAcme() with app.use()');
  return config;
}

// 3. Per module — one ref for the whole process
const theme = ref('light');            // ⚠️ shared with the next SSR request
export function useTheme() { return { theme }; }
```

| | Isolated per app | SSR-safe | Test-safe |
|---|---|---|---|
| Per call | ✅ | ✅ | ✅ |
| Per app (inject) | ✅ | ✅ | ✅ |
| Per module | ❌ | ❌ | ❌ |

> In a **library**, flavour 3 is banned. You do not know how many apps, or how
> many server requests, share your module.

---

# Sharing state without the singleton

```ts
import { createSharedComposable } from '@vueuse/core';

export const useSharedMouse = createSharedComposable(useMouse);
```

```ts
// What it does, in essence
function createSharedComposable(composable) {
  let subscribers = 0, state, scope;
  return (...args) => {
    if (subscribers++ === 0) {
      scope = effectScope(true);                 // detached: no parent owns it
      state = scope.run(() => composable(...args));
    }
    onScopeDispose(() => { if (--subscribers === 0) { scope.stop(); state = undefined; } });
    return state;
  };
}
```

- **One** `mousemove` listener for fifty components, and **zero** when the last
  one unmounts — the state is rebuilt on the next call
- Still module-scoped, so it stays a client-side tool: use it for browser
  resources (a socket, an observer), not for business state

---

# The provide/inject pair, generated

```ts
import { createInjectionState } from '@vueuse/core';

const [useProvideCart, useCartRaw] = createInjectionState((initial: number) => {
  const items = ref<Item[]>([]);
  const total = computed(() => items.value.reduce((s, i) => s + i.price, 0));
  return { items, total };
});

export { useProvideCart };

export function useCart() {
  const cart = useCartRaw();
  if (!cart) throw new Error('[acme] call useProvideCart() in a parent component');
  return cart;
}
```

- One instance **per provider component**, not per app and not per call — exactly
  what a wizard, a data table or a multi-step form needs
- Always re-export the injector wrapped in a **throwing** `useXxx`: `undefined`
  crashing three components later is the worst possible error message

---

# SSR safety — four rules

```ts
// ❌ evaluated at import time — the module is imported on the server too
const isTouch = 'ontouchstart' in window;

// ✅ evaluated when someone asks, guarded
export function useIsTouch() {
  const isTouch = ref(false);
  onMounted(() => { isTouch.value = 'ontouchstart' in window; });
  return { isTouch };
}
```

1. **No** `window` / `document` / `localStorage` outside a function body
2. Browser-only initialisation goes in `onMounted` — it never runs on the server
3. Guard with `import.meta.env.SSR` when you need a different value, not a
   different lifecycle
4. **No module-scope mutable state** — on a Node server the module is shared by
   every concurrent request, so user A's ref is user B's ref

> Even if your apps are client-only today: the day one goes Nuxt, the library
> should not be what blocks it.

---

# Composables that must work outside a component

```ts
// A composable used by a Pinia store, a router guard or a worker
export function useHeartbeat(intervalMs = 30_000) {
  const alive = ref(true);
  const id = setInterval(() => { alive.value = !alive.value; }, intervalMs);
  onScopeDispose(() => clearInterval(id), true);   // no warning if unowned
  return { alive, stop: () => clearInterval(id) };
}
```

```ts
const scope = effectScope();
const { alive } = scope.run(() => useHeartbeat())!;
scope.stop();                                       // the interval is cleared
```

- Never call `onMounted` / `onUnmounted` unconditionally in a library composable —
  outside a component they warn and **do nothing**
- If you genuinely need the component lifecycle, guard with `getCurrentInstance()`
  and document the restriction
- Give the caller an explicit `stop` too — it costs one line and unlocks every
  non-component usage

---

# ⚠️ The async trap

```ts
// ❌ every hook after the first await is silently dropped
export async function useUser(id: string) {
  const user = await fetchUser(id);      // ⬅ the instance context is lost here
  onUnmounted(() => cleanup());          // warns, never runs
  return { user };
}
```

```ts
// ✅ synchronous call, asynchronous result
export function useUser(id: MaybeRefOrGetter<string>) {
  const user = shallowRef<User | null>(null);
  const controller = new AbortController();
  onScopeDispose(() => controller.abort(), true);   // registered synchronously
  watchEffect(async () => {
    user.value = await fetchUser(toValue(id), { signal: controller.signal });
  });
  return { user };
}
```

- Lifecycle hooks and `onScopeDispose` resolve the **current instance / scope**,
  which only exists during the synchronous part of `setup`
- A composable is **never** `async`. It returns refs that fill in later — that is
  what `Suspense` (chapter 2) is for on the component side

---

# Testing — mounting nothing

```ts
// tests/withSetup.ts
import { createApp, type App } from 'vue';

export function withSetup<T>(composable: () => T): [T, App] {
  let result!: T;
  const app = createApp({
    setup() { result = composable(); return () => {}; },
  });
  app.mount(document.createElement('div'));
  return [result, app];
}
```

```ts
it('aborts the in-flight request when the URL changes', async () => {
  const url = ref('/a');
  const [{ loading }, app] = withSetup(() => useAcmeFetch(url));

  url.value = '/b';
  await nextTick();

  expect(fetchMock.signals[0].aborted).toBe(true);
  expect(loading.value).toBe(true);
  app.unmount();                 // ⬅ triggers the composable's own cleanup
});
```

- `app.unmount()` is what proves the cleanup exists — assert **after** it

---

# Testing — the four cases that matter

| Case | What it protects |
|---|---|
| Happy path | the return values |
| **Reactive input changes** | that you used `toValue` in a watcher, not once at call time |
| **Cleanup on unmount** | the listener, the observer, the interval, the request |
| **Called twice** | that two callers do not share state by accident |

```ts
it('gives two callers independent state', () => {
  const [a] = withSetup(() => useCounter());
  const [b] = withSetup(() => useCounter());
  a.increment();
  expect(b.count.value).toBe(0);
});
```

- Add an **SSR smoke test**: `import { renderToString } from 'vue/server-renderer'`
  on a component using the composable. It catches every stray `window` in one run
- Chapter 4 covers the tooling; here the point is that these four are the
  **library's** contract, and they belong in CI

---

# Documenting — the part that decides adoption

````md
# useMoney

Formats an amount in the user's locale, with the rounding rules of the
`acme-billing` service.

```ts
const { formatted } = useMoney(() => invoice.value.total, { currency: 'EUR' });
```

| Option | Type | Default | |
|---|---|---|---|
| `currency` | `string` | `'EUR'` | ISO 4217 code |
| `locale` | `MaybeRefOrGetter<string>` | app locale | |
````

- A `README.md` next to the code, a JSDoc `@example` on the exported function, and
  a **runnable demo** — VitePress or Histoire mounting `demo.vue`
- Documentation that lives in another repository is documentation that is wrong
- The honest test: can someone use it **without opening `index.ts`**?

---

# Versioning — what "breaking" means here

| Change | Semver |
|---|---|
| Add an optional option | **minor** |
| Add a key to the returned object | **minor** |
| Widen a parameter type (`string` → `MaybeRefOrGetter<string>`) | **minor** |
| Rename or remove a returned key | **major** |
| Add a required parameter | **major** |
| Turn a writable `Ref` into a `Readonly<Ref>` | **major** |
| Change a watcher's `flush` from `'pre'` to `'sync'` | **major** |
| Move cleanup from automatic to manual | **major** |
| Bump the `vue` peer range | **major** |

<br />

> The last four are the ones teams get wrong: **timing and ownership are part of
> the API**, even though TypeScript will not fail on them.

---

# Releasing — changesets

```bash
pnpm changeset            # pick packages, pick the bump, write the note
pnpm changeset version    # bumps package.json + writes CHANGELOG.md
pnpm publish -r
```

```md
---
'@acme/vue-composables': minor
---

useAcmeFetch: add a `retries` option (default 0 — no behaviour change).
```

- The changeset is written **in the PR**, by the person who knows why — not by
  whoever runs the release
- The generated `CHANGELOG.md` is what consumers read before upgrading; write the
  note for **them**, not for git
- A PR that changes `src/` without a changeset fails CI. It is a one-line check
  and it is the reason the changelog stays true

---

# CI — five gates

```yaml
- run: pnpm vue-tsc --noEmit              # 1. types, including the .vue demos
- run: pnpm vitest run --coverage         # 2. behaviour, incl. cleanup + SSR
- run: pnpm build && pnpm publint         # 3. is the package resolvable?
- run: pnpm attw --pack                   # 4. do the types resolve, in every mode?
- run: pnpm size-limit                    # 5. did the bundle just double?
```

- **`publint`** catches the `exports` map that works in your Vite app and breaks in
  a Node ESM one — the classic "works on my machine" of published packages
- **`@arethetypeswrong/cli`** catches types that resolve under `node10` and not
  under `bundler`, the reason consumers see `any` and stop trusting the library
- **`size-limit`** with a per-entry budget: a shared library is the easiest place
  to accidentally ship `date-fns` to six apps

---

# Deprecating without breaking

```ts
/**
 * @deprecated since 2.4 — use `useAcmeFetch` instead, which aborts on change.
 *   Removed in 3.0.
 */
export function useFetchLegacy<T>(url: string) {
  if (import.meta.env.DEV) {
    console.warn('[acme] useFetchLegacy is deprecated — use useAcmeFetch (removed in 3.0)');
  }
  return useAcmeFetch<T>(url);
}
```

- The `@deprecated` tag strikes the symbol through **in the editor** — that is where
  people actually read it
- The runtime warning is **DEV-only**, names the replacement and the removal version
- Keep it for at least one major. A deprecation nobody had time to act on is
  just a breaking change with extra steps

---

# The definition of done for a new composable

1. Named `useXxx`, in its own folder, exported from the barrel
2. Every reactive input is `MaybeRefOrGetter`, unwrapped with **`toValue`** inside
   the effect
3. Returns an **object of refs**, with an **exported** return type
4. Cleans up through **`onScopeDispose`**, and exposes an explicit `stop` / `abort`
5. Runs with **no component instance** — proven by an `effectScope` test
6. No `window` at import time; the **SSR smoke test** passes
7. No module-scope mutable state (or `createSharedComposable`, argued in the PR)
8. Tests: happy path, reactive input change, cleanup, two independent callers
9. `README.md` + one `@example` + a demo
10. A **changeset**

> Ten lines in `CONTRIBUTING.md` and in the PR template. This is the artefact the
> chapter is really about.

---

# Anti-patterns

- **`useApi()` returning twenty things** — nobody can tree-shake it, nobody can
  test it, and every change is a breaking change for someone
- **Hidden app coupling** — `useRouter()` or `useI18n()` called deep inside a
  library composable. Take it as an option, or inject it
- **`async` composables** — the lifecycle context is gone after the first `await`
- **Returning `reactive({})`** — destructuring dies at the call site
- **A `utils/` folder that grew a `vue` import** — that is a composable library
  without conventions, a release process, or an owner
- **Versioning the library with the app** — the moment they share a version
  number, "do not upgrade yet" stops being an option for anybody

---

# Recap

- Promote on the **third** usage, and only what carries your rules — VueUse owns
  the plumbing
- **One folder per composable**: code, colocated test, demo, README
- `package.json` is the API: `exports` closes it, `peerDependencies` protects it,
  `"sideEffects": false` makes it tree-shakeable — so **nothing runs at import**
- The team contract: `MaybeRefOrGetter` in, an **object of refs** out, an exported
  return type, cleanup via `onScopeDispose`
- Never a module-scope singleton: `createSharedComposable` for browser resources,
  `createInjectionState` for per-subtree state
- Timing and ownership are part of semver, even when TypeScript stays green
- The deliverable is the **checklist**, applied in review, enforced by CI

---

# Quiz — Question 1 / 5

**Your library's entry point contains `import './tokens.css'` and
`"sideEffects": false`. What is the consequence?**

- **A.** None — CSS is handled separately by the bundler
- **B.** The stylesheet may be dropped from the build: you promised there were no
  side effects, and the bundler took you at your word
- **C.** The build fails
- **D.** The CSS is duplicated in every chunk

<v-click>

> ✅ **B** — `"sideEffects": false` tells the bundler that importing the module and
> not using its exports is safe to elide. Ship CSS as its own export
> (`"./style.css"`) and let the app import it, or list the file in a
> `"sideEffects": ["*.css"]` array.

</v-click>

---

# Quiz — Question 2 / 5

**Why is `onScopeDispose` preferred to `onUnmounted` in a library composable?**

- **A.** It runs earlier, before the DOM is removed
- **B.** It is the only one that works in production builds
- **C.** It works in a component *and* in any `effectScope` — a store, a plugin, a
  guard — where `onUnmounted` only warns
- **D.** `onUnmounted` is deprecated since Vue 3.5

<v-click>

> ✅ **C** — A component's `setup` is itself an effect scope, so `onScopeDispose`
> covers the component case for free and keeps working everywhere else. Since Vue
> 3.5 its second argument silences the "no active scope" warning when there is
> legitimately no owner.

</v-click>

---

# Quiz — Question 3 / 5

**`export const theme = ref('light')` at module scope, in a published library.
What breaks first?**

- **A.** Nothing — it is the documented way to share state
- **B.** Tree-shaking
- **C.** TypeScript inference for consumers
- **D.** SSR (the ref is shared by every concurrent request) and tests (state
  leaks between them)

<v-click>

> ✅ **D** — On a Node server the module is instantiated once for the whole
> process. User A's theme becomes user B's. In a library you do not control the
> number of apps, tests or requests sharing your module — use `createInjectionState`
> or a plugin-provided instance.

</v-click>

---

# Quiz — Question 4 / 5

**You change `useAcmeFetch`'s internal `watch` from `flush: 'pre'` to
`flush: 'sync'`. TypeScript is green. Which release is it?**

- **A.** Patch — an internal refactor
- **B.** Minor — no signature changed
- **C.** Major — the observable timing of the returned refs changed
- **D.** It does not need a release

<v-click>

> ✅ **C** — Consumers wrote tests and components against *when* `loading` flips.
> Timing and cleanup ownership are part of a composable's contract even though no
> type changed; that is exactly the class of change a type-checker cannot catch
> for you.

</v-click>

---

# Quiz — Question 5 / 5

**A composable is needed by exactly two components, in one application. Where
does it go?**

- **A.** In the shared library, so the next app can reuse it
- **B.** In the application, until a third real usage justifies promoting it
- **C.** In the shared library, marked `@experimental`
- **D.** In `_internal/`, exported from the barrel

<v-click>

> ✅ **B** — Promoting on speculation buys a permanent maintenance cost against a
> hypothetical reuse, and freezes an API before you have seen a second real use
> case. Move it up on the third call site — that is when you can see what is
> actually generic.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3ter - Extracting the library — 45 min

Continue in `tp/03_composables_directives`, on top of steps 1–5:

1. Move `useFetch`, `useLocalStorage` and `vLazyImg` into
   `src/lib/composables/`, **one folder each** (`index.ts`, `index.test.ts`,
   `README.md`), with a barrel that only re-exports
2. Write the library's `package.json`: `exports` map, `sideEffects: false`,
   `vue` in `peerDependencies`. Import it from the app through its **package
   name**, not a relative path
3. Apply the contract: `MaybeRefOrGetter` inputs, an **exported** return
   interface, `loading` as `Readonly<Ref<boolean>>`, cleanup via
   `onScopeDispose`
4. Prove it works with **no component**: `effectScope().run(() => useFetch(...))`
   then `scope.stop()` — the in-flight request must abort. Add it as a test
5. Add the `withSetup` helper and a test asserting **two callers keep independent
   state**
6. Add an **SSR smoke test** with `renderToString`, then break it on purpose by
   reading `localStorage` at module scope — and read the error
7. Turn `useLocalStorage` into a shared instance with `createSharedComposable`,
   and show in the Devtools that the second caller does **not** add a second
   `storage` listener
8. Write `CONTRIBUTING.md` with your team's checklist, and a PR template that
   references it
9. *(Bonus)* `npm pack`, install the tarball in a scratch Vite app, run
   `npx publint` and `npx @arethetypeswrong/cli --pack` — fix whatever they report

**Done when** the app imports everything through `@acme/composables`, `vue-tsc` is
green, the cleanup and SSR tests pass, and nothing in the library runs at import
time.

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
