# TP 3 — Composables & custom directives

> This TP is **autonomous**: it does not depend on any other TP. The UI, the fake
> backend and the panels are provided and working; your job is to write the
> composables and the directive behind them.

## Goal

Chapter 3 — Build the two reuse mechanisms of Vue 3 from scratch, and understand
when each one is the right tool:

- **`useFetch`** — reactive URL, abort-on-change, real error handling
- **`useLocalStorage`** — a ref synced with storage, resilient to corrupted data
- **`useFavorites`** — composing composables, and the per-instance vs shared
  state decision
- **`v-lazy-img`** — a custom directive with `IntersectionObserver`, an error
  fallback, value updates and proper cleanup
- **A directives plugin** — registering them app-wide

## Prerequisites

- **Node.js >= 22** — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # vue-tsc --noEmit
```

There is **no backend to start**: `installFakeBackend()` patches `window.fetch`
for `/api/*` with a 700 ms artificial latency that honours `AbortSignal`.

## Steps

### 1. `useFetch` — `src/composables/useFetch.ts`

1. Wrap the request in a `watchEffect` and read the URL with `toValue()` **inside**
   the effect, so a `ref` or a getter re-triggers it.
2. Create an `AbortController` per run and abort it from the effect's `onCleanup`.
3. Handle `loading`, reset `error` at the start, and throw on `!response.ok`.
   Trigger a 500 with `failureSwitch.products = true` in `src/api/fakeApi.ts`.
4. Swallow `AbortError` — a cancelled request is not a failure the user should see.

**Check it**: switch categories quickly. Exactly one request must resolve; the
others show as cancelled in the Network tab.

### 2. `useLocalStorage` — `src/composables/useLocalStorage.ts`

1. Read and `JSON.parse` the stored value in a `try` / `catch`; on a parse error,
   drop the corrupted entry and keep the initial value.
2. Watch the ref **deeply** and write it back.
3. *(Bonus)* Sync across tabs with the `storage` event, and remove the listener
   on unmount.

**Check it**: write `{{{` into the `tp3:favorites` key from the devtools
Application tab and reload. The app must survive.

### 3. `useFavorites` — `src/composables/useFavorites.ts`

1. Implement `isFavorite`, `toggle` and `clear`.
2. The counter panel and the catalog disagree, because each caller gets its own
   state. Move the state to **module scope** to make it a singleton — then write
   down what that costs you under SSR and in tests.
3. Build a `Set` index in a `computed` for `isFavorite`, and explain at what
   scale it starts to matter.

### 4. `v-lazy-img` — `src/directives/lazyImg.ts`

1. `mounted`: set the placeholder and a one-shot `error` listener swapping in the
   fallback image.
2. Implement `observe()`: one `IntersectionObserver` per element, swap the `src`
   on intersection, then disconnect.
3. `updated`: re-observe when the value changed (test with "Shuffle photos").
4. `unmounted`: disconnect and forget the observer.
5. Degrade gracefully when `IntersectionObserver` is unavailable.

Then swap the static `:src` in `GalleryPanel.vue` for the directive and watch the
"images actually loaded" counter as you scroll.

### 5. The plugin — `src/directives/index.ts`

1. Register `vLazyImg` globally as `lazy-img`.
2. *(Bonus)* Add a `v-autofocus` directive and use it on the catalog filter.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src | grep -v bonus` returns nothing
- [ ] No Vue warning or error in the browser console while you exercise the panels

**The behaviour is there**

- [ ] Switching category three times fast: exactly **one** request resolves, the
      others are `cancelled` in the Network tab
- [ ] A cancelled request shows **no** error to the user
- [ ] With `failureSwitch.products = true`: the error state is displayed, and it clears
      when you switch to a working category
- [ ] `useFetch` re-runs when the URL is a `ref` **and** when it is a getter
- [ ] Writing `{{{` into the `tp3:favorites` key then reloading: the app starts
      normally and the corrupted entry is gone
- [ ] The favourites counter and the catalog agree — one shared state, not one per caller
- [ ] `isFavorite` goes through the `computed` `Set`, not an array scan
- [ ] Images load only as they enter the viewport: the "images actually loaded"
      counter stays well below the number of items on first paint
- [ ] A broken image URL swaps in the fallback image
- [ ] "Shuffle photos" re-observes the changed elements (new images do load)
- [ ] Navigating away disconnects the observers — nothing keeps firing after unmount
- [ ] With `IntersectionObserver` stubbed out (`delete window.IntersectionObserver`
      before mount), the images still display
- [ ] `GalleryPanel` uses `v-lazy-img` through the globally registered plugin, with no
      local `directives` option left

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
  compare their edge-case handling with yours.
