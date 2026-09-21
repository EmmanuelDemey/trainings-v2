# TP 2 — Composables & custom directives

> This TP is **autonomous**: it does not depend on any other TP. The UI, the fake
> backend, the panels, `useLocalStorage` and the directives plugin are provided
> and working; your job is to write the composables and the directive behind them.

## Goal

Chapter 2 — Build the two reuse mechanisms of Vue 3 from scratch, and understand
when each one is the right tool:

- **`useFetch`** — reactive URL, abort-on-change, real error handling
- **`useFavorites`** — composing composables (on top of the provided
  `useLocalStorage`), and the per-instance vs shared state decision
- **`v-lazy-img`** — a custom directive with `IntersectionObserver`, value
  updates and proper cleanup

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

Step 1 comes with its spec already written: **`tests/useFetch.spec.ts`** describes
the whole contract of `useFetch` — abort on change, error handling, `ref` **and**
getter URLs. It is red on the skeleton. Keep `npm run test:watch` running in a
second terminal and make it go green; the other steps are checked in the browser.

**Already done for you** — read them, you build on both:

- `src/composables/useLocalStorage.ts`: a ref synced with `localStorage`, which
  survives a corrupted entry and follows the other tabs through the `storage` event.
- `src/directives/index.ts`: `directivesPlugin`, already installed in `main.ts`,
  registers `v-lazy-img` (and a small `v-autofocus`) app-wide.

There is **no backend to start**: `installFakeBackend()` patches `window.fetch`
for `/api/*` with a 700 ms artificial latency that honours `AbortSignal`.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | A fetch composable that follows a reactive URL and cancels itself | `src/composables/useFetch.ts` | `npm test` — the ten given specs are green |
| 2 | Compose `useLocalStorage`, and decide per-instance vs shared state | `src/composables/useFavorites.ts` | The counter and the catalog agree on the same number |
| 3 | A directive that loads images only when they are seen | `src/directives/lazyImg.ts` | The "images actually loaded" counter stays low on first paint |

Only step 1 is graded by `npm test`. Steps 2 and 3 are graded in the browser —
the panels are instrumented for exactly that.

## Steps

### 1. `useFetch` — `src/composables/useFetch.ts`

1. Wrap the request in a `watchEffect` and read the URL with `toValue()` **inside**
   the effect, so a `ref` or a getter re-triggers it.
2. Create an `AbortController` per run and abort it from the effect's `onCleanup`.
3. Handle `loading`, reset `error` at the start, and throw on `!response.ok`.
   Trigger a 500 with `failureSwitch.products = true` in `src/api/fakeApi.ts`.
4. Swallow `AbortError` — a cancelled request is not a failure the user should see.

**Check it**: `npm test` — the ten specs in `tests/useFetch.spec.ts` are the
contract above, and the trickiest one is `loading` during an abort: the cancelled
run must **not** hand `loading` back while its replacement is still in flight.
Then switch categories quickly in the browser: exactly one request must resolve,
the others show as cancelled in the Network tab.

→ **Done when** the ten specs are green and a cancelled request shows no error
to the user.

### 2. `useFavorites` — `src/composables/useFavorites.ts`

1. Implement `isFavorite`, `toggle` and `clear`.
2. The counter panel and the catalog disagree, because each caller gets its own
   state. Move the state to **module scope** to make it a singleton — then write
   down what that costs you under SSR and in tests.
3. Build a `Set` index in a `computed` for `isFavorite`, and explain at what
   scale it starts to matter.

→ **Done when** the favourites counter and the catalog show the same number, and
`isFavorite` goes through the `Set` and not an array scan.

### 3. `v-lazy-img` — `src/directives/lazyImg.ts` (used by `GalleryPanel.vue`)

The placeholder, the `error` fallback and the no-`IntersectionObserver` branch of
`mounted` are already written.

1. `mounted`: call `observe()`, with a `400px` root margin under `.eager`.
2. Implement `observe()`: one `IntersectionObserver` per element, swap the `src`
   on intersection, then disconnect.
3. `updated`: re-observe when the value changed (test with "Shuffle photos").
4. `unmounted`: disconnect and forget the observer.

Then swap the static `:src` in `GalleryPanel.vue` for the directive and watch the
"images actually loaded" counter as you scroll.

→ **Done when** images load as they enter the viewport, "Shuffle photos"
re-observes, and unmounting stops everything.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the ten `useFetch` specs pass
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No Vue warning or error in the browser console while you exercise the panels

**The behaviour is there**

- [ ] Switching category three times fast: exactly **one** request resolves, the
      others are `cancelled` in the Network tab
- [ ] A cancelled request shows **no** error to the user
- [ ] With `failureSwitch.products = true`: the error state is displayed, and it clears
      when you switch to a working category
- [ ] `useFetch` re-runs when the URL is a `ref` **and** when it is a getter
- [ ] The favourites counter and the catalog agree — one shared state, not one per caller
- [ ] `isFavorite` goes through the `computed` `Set`, not an array scan
- [ ] Images load only as they enter the viewport: the "images actually loaded"
      counter stays well below the number of items on first paint
- [ ] "Shuffle photos" re-observes the changed elements (new images do load)
- [ ] Navigating away disconnects the observers — nothing keeps firing after unmount
- [ ] `GalleryPanel` uses `v-lazy-img` — no static `:src` left on its images

**You can explain**

- [ ] Why `toValue()` must be called **inside** the effect and not around it
- [ ] What module-scope state costs you under SSR and between two tests
- [ ] At roughly what catalog size the `Set` index starts to pay for itself
- [ ] When you would reach for a composable rather than a directive

## Going further

- Compare your directive with `<img loading="lazy">`. Which one would you ship,
  and what would make you change your mind?
- Rewrite the lazy loading as a **composable** (`useLazyImage`) using a template
  ref, and list what you gained and what you lost versus the directive.
- Read the source of `useLocalStorage` and `useIntersectionObserver` in VueUse —
  compare their edge-case handling with this project's.

## Later in the training

2 later chapters come back to this same project, each with its own session and its own *Done when*. Follow the training order — each one builds on the state the previous left behind.

### Chapter 4 — From directives to a real plugin (30 min)

Continue in this project, on top of the provided `directivesPlugin`:

1. Turn `directivesPlugin` into a **factory** `createDirectivesPlugin(options)`
   taking `{ rootMargin, fallbackSrc }`, with defaults resolved once
2. `provide` the resolved options under a typed `InjectionKey`, and read them from
   a `useLazyImgConfig()` that **throws** when the plugin is missing
3. Register `lazyStats` as an app-level injection instead of a module export —
   then explain what that fixes
4. Add `app.onUnmount()` and verify, in the Devtools, that nothing survives an
   `app.unmount()`
5. *(Bonus)* Add `$notify` to `globalProperties` and type it with
   `declare module 'vue'` — `vue-tsc` must stay green

**Done when** you can install the plugin twice, on two apps, and each one keeps
its own configuration and its own stats.

### Chapter 5 — Extracting the library (45 min)

Continue in this project, on top of steps 1–3:

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
