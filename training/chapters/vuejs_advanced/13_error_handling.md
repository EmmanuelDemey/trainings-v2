---
layout: cover
---

# 13 - Error handling & observability

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** the path an error takes in Vue: `onErrorCaptured` up the parent
  chain, then `app.config.errorHandler`, then the console
- **Explain** why a component never catches *its own* errors, and why that forces
  a wrapper component
- **Build** a reusable `<ErrorBoundary>` that swaps a failing subtree for a
  fallback instead of blanking the page
- **List** what Vue's pipeline does **not** see — `setTimeout`, unawaited
  promises, DOM listeners — and the three ways out
- **Wire** `app.config.errorHandler` as the last-resort net, and put the
  **reporting** there rather than in the boundaries
- **Situate** the other channels — router, store, async components, `window` — on
  a single map of where errors can surface

---

# Vue's error pipeline

```
      throw in <InvoiceTotal>
              │
              ▼
  ┌───────────────────────────┐
  │ parent 1 · onErrorCaptured│──── returns false ──▶ stop
  └───────────────────────────┘
              │ (nothing returned)
              ▼
  ┌───────────────────────────┐
  │ parent 2 · onErrorCaptured│──── returns false ──▶ stop
  └───────────────────────────┘
              │  … up to the root
              ▼
  ┌───────────────────────────┐
  │  app.config.errorHandler  │  ── the last-resort net
  └───────────────────────────┘
              │  (only if no handler is set)
              ▼
       console — and in dev, rethrown
```

- The walk goes **child ➜ root**, hook by hook
- The **first** hook returning `false` ends the walk — `errorHandler` is *not*
  called either

---

# `onErrorCaptured`

```ts
import { onErrorCaptured } from 'vue';

onErrorCaptured((err: unknown, instance, info: string) => {
  console.log(err, info);
  return false;         // ⬅ stop the propagation here
});
```

| Argument | What it holds |
|---|---|
| `err` | Whatever was thrown — typed `unknown`, and it really can be anything |
| `instance` | The **component that threw**, or `null` |
| `info` | A Vue string: `'render function'`, `'setup function'`, `'watcher callback'`, `'native event handler'`… |

<br />

- `info` is the single most useful field in a report: it tells you **which phase**
  of the lifecycle blew up, which a minified stack trace rarely does
- Returning anything other than `false` — including `undefined` — lets the error
  keep climbing

---

# The trap: a component never catches itself

```ts
// InvoiceTotal.vue — this does NOT work
onErrorCaptured((err) => { /* never called for its own render */ });
```

Vue starts the walk at `instance.parent`, not at `instance`:

```js
// runtime-core, handleError()
let cur = instance.parent;
while (cur) {
  const hooks = cur.ec;                       // errorCaptured hooks
  if (hooks) for (const hook of hooks) {
    if (hook(err, exposedInstance, errorInfo) === false) return;
  }
  cur = cur.parent;
}
```

<br />

> This is the whole reason error boundaries are a **wrapper component** in Vue as
> in React: to catch a subtree, you have to be *outside* it.

---

# What Vue never sees

```ts
onMounted(() => {
  setTimeout(() => { throw new Error('boom'); }, 100);   // ❌ not caught
  fetch('/api/me').then((r) => r.json().then(use));      // ❌ if it rejects
  el.addEventListener('scroll', handler);                // ❌ handler throws
});
```

- Vue only wraps **the functions it calls itself**. Once you hand a callback to
  the platform, you have left the pipeline
- Same for `queueMicrotask`, `IntersectionObserver`, `EventSource`, a raw
  `WebSocket` handler, a worker message…

<br />

Three fixes, in order of preference:

1. `await` inside something Vue calls (a `watch` callback, an event handler)
2. `try/catch` and route it yourself to the same reporter
3. A global `window.onerror` / `unhandledrejection` net — two listeners in
   `main.ts`, outside Vue entirely

---

# `<ErrorBoundary>`

```vue
<!-- components/ErrorBoundary.vue -->
<script setup lang="ts">
import { onErrorCaptured, shallowRef } from 'vue';

const error = shallowRef<unknown>(null);

onErrorCaptured((err) => {
  error.value = err;
  return false;
});
</script>

<template>
  <slot v-if="!error" />
  <p v-else role="alert">Something went wrong.</p>
</template>
```

- `shallowRef`, not `ref`: an `Error` is not data, and making it deeply reactive
  costs for nothing — worse, it can trip on exotic error objects
- One `v-if` swap, and the failing subtree is gone from the DOM

---

# `app.config.errorHandler`

```ts
// main.ts
app.config.errorHandler = (err, instance, info) => {
  reporter.capture(err, {
    tags: { info },
    extra: { component: instance?.$options.__name },
  });
};
```

- The **last** stop before the console: everything not stopped by a boundary
  lands here
- It is where **reporting** belongs. Boundaries decide what the *user* sees,
  `errorHandler` decides what *you* see
- It receives the same triple as `onErrorCaptured`, with the same `info` strings

<br />

> Never let this function throw. Vue catches it (`info: 'app errorHandler'`), but
> you have just lost the original error.

---

# The complete net

A map, not a checklist — this chapter wires the first two, the six others are one
line each:

| Channel | Catches | Where |
|---|---|---|
| `onErrorCaptured` | Its subtree: render, setup, hooks, events | `<ErrorBoundary>` |
| `app.config.errorHandler` | Everything a boundary let climb | `main.ts` |
| `app.config.warnHandler` | Vue warnings — **dev only** | `main.ts`, tests |
| `defineAsyncComponent.onError` | A chunk that failed to load | The component |
| `router.onError` | Guards, lazy route components | `router/index.ts` |
| `$onAction`'s `onError` | Rejected store actions | A Pinia plugin |
| `window.onerror` | Timers, listeners, third-party scripts | `main.ts` |
| `unhandledrejection` | Promises nobody awaited | `main.ts` |

<br />

> Wire them on day one of a project — retro-fitting observability after the first
> incident is how you find out that nothing was recorded. The annex takes the six
> remaining channels, and the reporting behind them, one by one.

---

# Recap

| Tool | Answers | Watch out for |
|---|---|---|
| `onErrorCaptured` | What the **user** sees | Never catches its own component |
| `info` | Which lifecycle phase blew up | The most useful field in a report |
| `return false` | Stop the propagation | Also stops the reporting above |
| `<ErrorBoundary>` | A degraded subtree | Only as a **wrapper**, never from inside |
| `app.config.errorHandler` | What **you** see | Never let it throw |
| Timers, listeners, promises | Nothing, until you route them | `await`, `try/catch`, or a `window` net |
| The six other channels | Router, store, chunks, `window` | One line each — see the annex |

<br />

> The workshop for this chapter is `tp/13_error_handling/`.

---

# Quiz — Question 1 / 2

**A component has `onErrorCaptured` in its own `<script setup>`. Its render
function throws. What happens?**

- **A.** The hook is called, then the error stops
- **B.** The hook is called only if it returns `false`
- **C.** The hook is not called — the error goes straight to the parents
- **D.** The hook is called twice, once as author and once as observer

<v-click>

> ✅ **C** — Vue starts its walk at `instance.parent`. A component is never its own
> boundary, which is exactly why `<ErrorBoundary>` has to be a **wrapper**
> component: you cannot catch a subtree from inside it.

</v-click>

---

# Quiz — Question 2 / 2

**`onMounted(() => setTimeout(() => { throw new Error('boom') }, 100))`. Which
handler sees it?**

- **A.** The nearest `onErrorCaptured` — it was thrown from a lifecycle hook
- **B.** `app.config.errorHandler`
- **C.** Neither — only a `window.onerror` listener
- **D.** `router.onError`

<v-click>

> ✅ **C** — Vue wraps `onMounted` itself, but the callback runs 100 ms later, from
> the browser's timer queue, on a stack Vue knows nothing about. Everything you
> hand to the platform — timers, listeners, observers — leaves the pipeline. Hence
> the `window.onerror` / `unhandledrejection` net.

</v-click>

