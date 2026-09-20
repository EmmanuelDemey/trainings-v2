---
layout: cover
---

# 5 - Anatomy of a team composable library

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why six variants of the same `useFetch` cost far more than the
  thirty lines they duplicate
- **Decide** what deserves a place in a shared library — and what should stay in
  the app that needs it
- **Design** a signature: `MaybeRefOrGetter` inputs first, one optional options
  object last, defaults resolved once
- **Return** an object of refs with an **exported** return type, and mark
  read-only what the caller has no business writing
- **Own** a composable's effects with `onScopeDispose`, so it cleans up inside a
  component, a store or a plugin alike

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
  keep working (chapter 2)
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

# Recap

- Six copies of the same composable means the bug is fixed in one of them — a
  library is **one place where the answer lives**
- Promote on the **third** real usage, with a named owner per folder — VueUse owns
  the plumbing you did not invent
- Convention 1 — reactive inputs as **`MaybeRefOrGetter`**, unwrapped with
  `toValue`; one optional options object, always last
- Convention 2 — an **object of refs** out, never a `reactive()`, with the return
  type **exported** and the untouchable refs marked `Readonly`
- Convention 3 — cleanup through **`onScopeDispose`**, plus an explicit `stop` /
  `abort` whenever the caller may need it early

> The workshop for this chapter is `tp/05_composables_library/`.

---

# Quiz — Question 1 / 2

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

# Quiz — Question 2 / 2

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

