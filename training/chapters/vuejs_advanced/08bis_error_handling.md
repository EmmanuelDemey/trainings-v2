---
layout: cover
---

# 8bis - Error handling & observability

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** the path an error takes in Vue: `onErrorCaptured` up the parent
  chain, then `app.config.errorHandler`, then the console
- **Explain** why a component never catches *its own* errors, and why that forces
  a wrapper component
- **Build** a reusable `<ErrorBoundary>` with a fallback slot and a working
  **reset**, and place boundaries at the right granularity
- **List** what Vue's pipeline does **not** see — `setTimeout`, unawaited
  promises, navigation failures — and plug those channels
- **Wire** `app.config.errorHandler` as a last-resort net without breaking the
  plugins that also want that single slot
- **Report** to Sentry with a usable **release**, readable **source maps** and
  enough **context** to reproduce
- **Filter** the noise and keep personal data out of your reports
- **Test** the whole thing: a boundary that renders its fallback, and a handler
  that actually receives the error

---

# What happens today

```vue
<!-- InvoiceTotal.vue -->
<script setup lang="ts">
const props = defineProps<{ invoice: Invoice }>();
const total = computed(() =>
  props.invoice.lines.reduce((sum, l) => sum + l.amount, 0),
);
</script>

<template>
  <p>Total: {{ total }} €</p>
</template>
```

- The API returns one invoice without `lines` — `reduce` of `undefined`
- The render throws, Vue unmounts the whole subtree, and the user gets a **blank
  page**
- Nobody is told. You will hear about it from a customer, three days later

> Two separate problems: what the **user** sees, and what **you** learn.
> `<ErrorBoundary>` answers the first, `errorHandler` + Sentry the second.

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

# What goes through the pipeline

Vue wraps the code it calls, and every one of these gets an `info` string:

| Category | `info` values |
|---|---|
| Rendering | `render function`, `component update`, `scheduler flush` |
| Setup & lifecycle | `setup function`, `mounted hook`, `beforeUnmount hook`… |
| Reactivity | `watcher getter`, `watcher callback`, `watcher cleanup function` |
| Events | `native event handler`, `component event handler` |
| Extensions | `directive hook`, `transition hook`, `vnode hook`, `ref function` |
| Async | `async component loader`, `serverPrefetch hook` |
| Meta | `app errorHandler`, `app warnHandler` |

<br />

- An event handler that **returns a rejected promise** is covered too: Vue
  attaches a `.catch()` to whatever a handler returns
- So `@click="async () => { await save() }"` *is* caught — the rejection is
  routed like a synchronous throw

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
3. A global `window.onerror` / `unhandledrejection` net — covered later

---

# Stop, or let it climb?

```ts
onErrorCaptured((err, instance, info) => {
  reporter.capture(err, { info });
  state.value = 'failed';
  return false;          // handled here — do not bother anyone above
});
```

- `return false` when your component has **actually handled** it: it shows a
  fallback, the user has a way out
- Return nothing when you only want to **observe** — log a breadcrumb, add a tag,
  and let a boundary higher up decide

<br />

> An `onErrorCaptured` that reports **and** returns `false` at every level is how
> you end up with the same error sent three times. Decide, per hook, whether you
> are the *handler* or a *witness*.

---

# `<ErrorBoundary>` — v1

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

# v2 — a fallback the caller controls

```vue
<script setup lang="ts">
import { onErrorCaptured, shallowRef } from 'vue';

const emit = defineEmits<{ error: [err: unknown, info: string] }>();
const error = shallowRef<unknown>(null);

onErrorCaptured((err, _instance, info) => {
  error.value = err;
  emit('error', err, info);
  return false;
});

function reset() { error.value = null; }
</script>

<template>
  <slot v-if="!error" />
  <slot v-else name="fallback" :error="error" :reset="reset">
    <p role="alert">Something went wrong.</p>
  </slot>
</template>
```

- A **scoped slot** exposing `error` and `reset` — the caller decides what
  "degraded" looks like here
- The default fallback content keeps the simple case a one-liner

---

# Using it

```vue
<template>
  <ErrorBoundary @error="report">
    <InvoiceTotal :invoice="invoice" />

    <template #fallback="{ error, reset }">
      <div role="alert" class="card">
        <p>This total could not be computed.</p>
        <p v-if="isDev">{{ (error as Error).message }}</p>
        <button type="button" @click="reset">Retry</button>
      </div>
    </template>
  </ErrorBoundary>
</template>
```

- The rest of the page keeps working — that is the entire point
- `role="alert"` so assistive technology announces the failure; a silent visual
  swap is invisible to a screen-reader user

---

# The reset that does not reset

```ts
function reset() { error.value = null; }
```

- Clearing the flag re-renders the **same** child instances, with the **same**
  state that just threw. The render throws again, immediately
- The user clicks "Retry" and sees the fallback flash — a loop

<br />

Force a fresh subtree with a `key`:

```vue
<script setup lang="ts">
const attempt = shallowRef(0);
function reset() { error.value = null; attempt.value++; }
</script>

<template>
  <slot v-if="!error" :key="attempt" />
</template>
```

> Changing a `key` unmounts and remounts: new `setup()`, new refs, new fetch.
> That is what "retry" means to a user.

---

# Resetting on navigation

```vue
<script setup lang="ts">
const props = defineProps<{ resetKey?: unknown }>();

watch(() => props.resetKey, () => { error.value = null; });
</script>
```

```vue
<ErrorBoundary :reset-key="route.fullPath">
  <RouterView />
</ErrorBoundary>
```

- Without it, one broken route leaves the boundary stuck: the user navigates
  elsewhere and still faces the error screen
- `resetKey` is the generic escape hatch — a route path, a user id, a filter
  object

---

# Where to place boundaries

```
App
├── ErrorBoundary  ← app shell: "the app crashed", offers a reload
│   └── RouterView
│       └── DashboardView
│           ├── ErrorBoundary ← a widget: the rest of the dashboard survives
│           │   └── RevenueChart
│           └── ErrorBoundary
│               └── ActivityFeed
```

- **Too few**: one broken widget takes the page down
- **Too many**: a mesh of tiny "oops" boxes, and errors so contained you never
  notice them

<br />

A workable rule: a boundary wherever the **user has an alternative**. If a chart
fails but the table below still answers the question, that chart deserves a
boundary. If nothing works without it, let the error climb.

---

# Boundaries and `<Suspense>`

```vue
<ErrorBoundary>
  <Suspense>
    <DashboardView />
    <template #fallback><Spinner /></template>
  </Suspense>
</ErrorBoundary>
```

- A rejected top-level `await` inside `DashboardView` **does not** show the
  Suspense fallback — Suspense only knows *pending* and *resolved*
- The rejection is routed through the normal pipeline, so the boundary catches it

<br />

> Order matters: `ErrorBoundary` **outside** `Suspense`. The other way round, the
> boundary lives inside the suspended subtree — it gets torn down along with it.

---

# Async components have their own hooks

```ts
const Chart = defineAsyncComponent({
  loader: () => import('./RevenueChart.vue'),
  loadingComponent: Spinner,
  errorComponent: ChunkFailed,
  delay: 200,
  timeout: 8000,
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) { setTimeout(retry, attempts * 500); }
    else fail();
  },
});
```

- A failed `import()` is a **network** problem, not a logic one: a deploy
  invalidated the chunk, or the user is on a train
- `retry()` is worth an automatic attempt or two; `errorComponent` covers the
  rest — typically with "a new version is available, reload"
- Only when `fail()` is called does the error reach the boundary

---

# Errors the router owns

```ts
router.onError((error, to, from) => {
  if (isChunkLoadError(error)) { location.assign(to.fullPath); return; }
  reporter.capture(error, { route: to.fullPath, from: from.fullPath });
});
```

- Errors thrown **in a guard** or in a lazy route component do not pass through
  the component tree — the component was never mounted
- `router.isNavigationFailure(failure, NavigationFailureType.aborted)` — a guard
  returning `false` is a **decision**, not an error. Do not report it

```ts
const failure = await router.push('/checkout');
if (isNavigationFailure(failure, NavigationFailureType.aborted)) {
  toast('Save your changes first');
}
```

---

# Errors the store owns

```ts
// stores/plugins/reporting.ts
export function reporting({ store }: PiniaPluginContext) {
  store.$onAction(({ name, args, onError }) => {
    onError((error) => {
      reporter.capture(error, {
        tags: { store: store.$id, action: name },
        extra: { args: redact(args) },
      });
    });
  });
}
```

- `$onAction`'s `onError` fires for a **rejected** action too — the natural place
  to catch failed API calls
- One plugin instruments every store: no `try/catch` scattered across actions
- `redact(args)` — an action often receives a form payload. See the privacy slide

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

# What setting it changes

```js
// runtime-core, handleError()
if (errorHandler) {
  callWithErrorHandling(errorHandler, null, 10, [err, exposedInstance, errorInfo]);
  return;                       // ⬅ logError() is never reached
}
logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
```

- Setting a handler **silences the default console output**. In development that
  is a real loss — the browser no longer shows you the stack

```ts
app.config.errorHandler = (err, instance, info) => {
  if (import.meta.env.DEV) console.error(`[${info}]`, err);
  reporter.capture(err, { tags: { info } });
};
```

- Vue 3.5 also exposes `app.config.throwUnhandledErrorInProduction`, to rethrow
  instead of logging when **no** handler is set — useful to make a global
  `window.onerror` net see everything

---

# `warnHandler` — development only

```ts
app.config.warnHandler = (msg, instance, trace) => {
  if (msg.includes('Extraneous non-props attributes')) return;   // known, accepted
  console.warn(msg, trace);
};
```

- Vue warnings are **stripped from production builds**: this handler only ever
  runs in dev. Do not wire it to Sentry
- Genuinely useful for one thing: **failing the build on a warning**

```ts
// vitest.setup.ts — make warnings unignorable in CI
config.global.config.warnHandler = (msg) => { throw new Error(msg); };
```

> "Invalid prop type" and "missing required prop" are bugs found for free. A test
> suite that lets them scroll by is throwing away the warning.

---

# One slot, several claimants

```ts
app.use(sentryPlugin);     // sets app.config.errorHandler
app.use(myLoggerPlugin);   // sets app.config.errorHandler ← the previous one is gone
```

- `errorHandler` is a **single property**, not a list of listeners. The last
  write wins, silently

```ts
// A defensive plugin chains instead of overwriting
const previous = app.config.errorHandler;
app.config.errorHandler = (err, instance, info) => {
  reporter.capture(err, { tags: { info } });
  previous?.(err, instance, info);
};
```

- Order matters: install the reporting plugin **first**, then set your own
  handler, then chain
- Sentry's Vue integration does exactly this — it keeps and calls the handler
  that was already there

---

# The channels outside Vue

```ts
// main.ts — before app.mount()
window.addEventListener('error', (event) => {
  reporter.capture(event.error ?? event.message, { tags: { source: 'window' } });
});

window.addEventListener('unhandledrejection', (event) => {
  reporter.capture(event.reason, { tags: { source: 'promise' } });
});
```

- `window.onerror` catches the `setTimeout` throw, the listener added by hand,
  the third-party script
- `unhandledrejection` catches the promise nobody awaited — in practice the
  largest single source of production errors

<br />

- A `<script>` from another origin reports the useless `"Script error."` unless it
  is served with `crossorigin="anonymous"` **and** a permissive CORS header

---

# The complete net

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

> Six of these are one line each. Wire them on day one of a project — retro-fitting
> observability after the first incident is how you find out that nothing was
> recorded.

---

# Enter Sentry

```bash
npm install @sentry/vue
```

```ts
// main.ts
import * as Sentry from '@sentry/vue';

const app = createApp(App);

Sentry.init({
  app,                                  // ⬅ wires app.config.errorHandler
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__,
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: 0.1,
});

app.use(router).use(createPinia()).mount('#app');
```

- `Sentry.init` **before** `mount()`, so the very first render is covered
- The DSN is a public write-only key: it is meant to ship in the bundle

---

# What the Vue integration actually does

- Attaches to `app.config.errorHandler` (`attachErrorHandler`, on by default) and
  **calls the previous handler** afterwards
- Adds the failing component's name and the Vue lifecycle hook to the event —
  this is the `info` string, surfaced as searchable metadata
- With `browserTracingIntegration({ router })`, names transactions after the
  **route** (`/invoices/:id`) instead of the URL — otherwise every invoice is its
  own transaction

<br />

```ts
Sentry.init({
  app,
  trackComponents: ['DashboardView', 'RevenueChart'],   // opt-in, it costs
  hooks: ['mount', 'update'],
});
```

- `trackComponents` instruments mount/update timings. Useful during an
  investigation, expensive as a permanent setting

---

# Source maps and releases

```ts
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: { sourcemap: 'hidden' },        // generated, not referenced in the bundle
  plugins: [
    vue(),
    sentryVitePlugin({
      org: 'acme', project: 'web',
      authToken: process.env.SENTRY_AUTH_TOKEN,   // CI secret, never a VITE_ var
      release: { name: process.env.GITHUB_SHA },
    }),
  ],
});
```

- `sourcemap: 'hidden'` — the `.map` files are produced and uploaded, but no
  `//# sourceMappingURL` ships, so they are not served to the public
- The `release` in `Sentry.init` and the one uploaded must be the **same string**,
  or the stack traces stay minified
- Uploading also lets Sentry mark issues "resolved in the next release"

---

# Context is what makes a report actionable

```ts
Sentry.setUser({ id: user.id });                    // never the email, see privacy
Sentry.setTag('tenant', tenant.slug);               // indexed, searchable, filterable
Sentry.setContext('feature-flags', activeFlags);    // displayed, not indexed
```

```ts
Sentry.addBreadcrumb({
  category: 'invoice',
  message: `opened ${invoice.id}`,
  level: 'info',
});
```

- **Tags**: low cardinality, you will search on them (`tenant`, `plan`, `locale`)
- **Contexts**: arbitrary objects, shown on the issue page
- **Breadcrumbs**: the trail leading to the crash — clicks, navigations, HTTP
  calls are collected automatically; add the ones that carry *your* domain

> A stack trace tells you *where*. Breadcrumbs tell you *how they got there*, which
> is the part you cannot guess.

---

# Reporting from the boundary

```ts
function report(err: unknown, info: string) {
  Sentry.captureException(err, {
    tags: { boundary: 'dashboard-widget', vueInfo: info },
    contexts: { widget: { id: props.widgetId, filters: props.filters } },
  });
}
```

```vue
<ErrorBoundary @error="report">
  <RevenueChart :widget-id="id" :filters="filters" />
</ErrorBoundary>
```

- A boundary returning `false` **stops** the error before `errorHandler` — so
  Sentry never sees it unless the boundary reports it itself
- Tagging by boundary tells you, on the issue page, whether the user was actually
  blocked or just saw a degraded widget

---

# Sampling, and filtering the noise

```ts
Sentry.init({
  tracesSampleRate: 0.1,              // 10 % of transactions — performance data
  sampleRate: 1.0,                    // 100 % of errors — you want them all
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',      // browser noise, harmless
    'Non-Error promise rejection captured',
    /^Network request failed$/,                // offline users
  ],
  denyUrls: [/extensions\//, /^chrome:\/\//],  // browser extensions, not your code
  beforeSend(event, hint) {
    if (hint.originalException instanceof AbortError) return null;   // dropped
    return event;
  },
});
```

- `tracesSampleRate` and `sampleRate` are **different budgets**: traces are
  expensive and statistical, errors are cheap and individual
- An issue tracker nobody reads because it is 90 % extension noise is worse than
  no tracker at all

---

# Privacy

```ts
Sentry.init({
  sendDefaultPii: false,                        // the default — keep it
  beforeSend(event) {
    delete event.request?.cookies;
    if (event.user) event.user = { id: event.user.id };   // drop email / ip
    return event;
  },
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
});
```

- An error report is a **personal data processing operation**: a URL carries
  identifiers, a form payload carries whatever the user typed
- Redact **before** sending, not with a server-side scrubbing rule you cannot audit
- Session Replay records the DOM — masked by default, and it must stay that way on
  any screen showing customer data

> Get this reviewed with whoever owns your GDPR register, and write the retention
> down. "The frontend sends errors somewhere" is not an answer.

---

# It does not have to be Sentry

| Tool | Note |
|---|---|
| **Sentry** | The reference; SaaS or self-hosted (heavy: Kafka, ClickHouse) |
| **GlitchTip** | Sentry-SDK compatible, self-hosted, small footprint |
| **Grafana Faro** | If you already run Grafana / Loki / Tempo — same backend as the rest |
| **Rollbar, Bugsnag** | Comparable SaaS, different pricing models |
| **Your own endpoint** | `navigator.sendBeacon('/api/errors', body)` |

<br />

- The SDK-compatible option matters: `@sentry/vue` pointed at a GlitchTip DSN
  works unchanged, and the migration cost is one environment variable
- A homemade endpoint is defensible for a small internal app — but you are then
  writing the grouping, the deduplication and the source-map resolution yourself

---

# Testing the boundary

```ts
import { mount, flushPromises } from '@vue/test-utils';

const Boom = defineComponent({ setup() { throw new Error('boom'); } });

it('renders the fallback instead of the failing child', () => {
  const wrapper = mount(ErrorBoundary, {
    slots: {
      default: Boom,
      fallback: '<p data-test="fallback">degraded</p>',
    },
  });

  expect(wrapper.get('[data-test="fallback"]').text()).toBe('degraded');
});
```

- Test the **behaviour the user gets** — the fallback is on screen — not that some
  internal flag flipped
- `data-test` rather than a class: the fallback's styling will change, its
  contract will not

---

# Testing the reporting

```ts
it('reports the error once, with the vue phase', async () => {
  using capture = vi.spyOn(Sentry, 'captureException');

  const wrapper = mount(ErrorBoundary, { slots: { default: Boom } });
  await flushPromises();

  expect(capture).toHaveBeenCalledOnce();
  expect(capture.mock.calls[0][1]).toMatchObject({ tags: { vueInfo: 'setup function' } });
});
```

```ts
// A component under test that throws must not fail the suite by accident
mount(Comp, { global: { config: { errorHandler: (e) => { thrown = e; } } } });
```

- `using` disposes the spy at the end of the scope — no `afterEach` to forget
- Asserting **"once"** is the assertion that catches the classic double-report:
  a boundary that captures *and* lets the error climb to `errorHandler`

---

# Recap

| Tool | Answers | Watch out for |
|---|---|---|
| `onErrorCaptured` | What the **user** sees | Never catches its own component |
| `return false` | Stop the propagation | Also stops the reporting above |
| `<ErrorBoundary>` | A degraded subtree | A reset without `key` re-throws |
| `resetKey` | Leaving a broken route | Forgetting it strands the user |
| `app.config.errorHandler` | What **you** see | A single slot — chain it |
| `warnHandler` | Warnings as CI failures | Dev only, never in production |
| `router.onError` | Guards, lazy routes | Navigation failures are not errors |
| `window.onerror` + `unhandledrejection` | Everything outside Vue | `"Script error."` without CORS |
| `Sentry.init({ app })` | Grouping, releases, context | Source maps, or nothing is readable |
| `beforeSend` | Noise, and personal data | Redact before sending |

---

# Quiz — Question 1 / 5

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

# Quiz — Question 2 / 5

**An `<ErrorBoundary>` catches, reports to Sentry and returns `false`. The
`app.config.errorHandler` also reports. How many events reach Sentry?**

- **A.** Two — the boundary and the handler
- **B.** One — the boundary's, `errorHandler` is never called
- **C.** One — Sentry deduplicates identical errors
- **D.** None — `return false` cancels the reporting

<v-click>

> ✅ **B** — `return false` ends the walk **immediately**: the remaining
> `onErrorCaptured` hooks and `errorHandler` are all skipped. Which is why a
> boundary that stops an error has to report it itself — nobody else will.

</v-click>

---

# Quiz — Question 3 / 5

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

---

# Quiz — Question 4 / 5

**A user clicks "Retry" in a fallback. `reset()` sets `error` back to `null`, the
fallback flashes and comes straight back. Why?**

- **A.** The error object is still referenced somewhere
- **B.** `shallowRef` does not trigger a re-render
- **C.** The same child instances re-render with the same state, and throw again
- **D.** `onErrorCaptured` only fires once per component

<v-click>

> ✅ **C** — Clearing the flag re-renders, it does not recreate. The child keeps the
> exact state that made it throw. A real retry needs a **new subtree**: bump a
> counter used as `key`, so `setup()` runs again from scratch.

</v-click>

---

# Quiz — Question 5 / 5

**Production stack traces in Sentry are minified, despite `build.sourcemap:
'hidden'` and a successful upload. What is the most likely cause?**

- **A.** `sourcemap: 'hidden'` does not generate the maps
- **B.** The `release` in `Sentry.init` differs from the uploaded one
- **C.** Source maps only work with `tracesSampleRate: 1.0`
- **D.** `@sentry/vue` does not support source maps, only `@sentry/browser`

<v-click>

> ✅ **B** — Sentry resolves a trace by matching the event's `release` with the
> artifacts uploaded for that release. A commit SHA on one side and a `package.json`
> version on the other, and nothing lines up. Inject one value and use it in both
> places. **A** is false: `hidden` generates the maps, it only omits the
> `sourceMappingURL` comment.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 8bis - Error handling & observability — 45 min

Continue in `tp/05_router`, on the invoices application:

1. Make `InvoiceView` throw on one specific invoice, and watch the current
   behaviour: what does the user see, and what is left in the DOM?
2. Write `<ErrorBoundary>` with a **fallback scoped slot** exposing `error` and
   `reset`, and wrap the widget. Check the rest of the page still works
3. Make "Retry" actually retry — prove that a `reset()` alone loops, then fix it
   with a `key`
4. Wrap `<RouterView>` in a second boundary with a `resetKey`, and verify that
   navigating away clears the error screen
5. Wire `app.config.errorHandler` to a `reporter` module logging `{ err, info }`,
   and check the boundary's error **does not** appear there — then make the
   boundary report it itself
6. Add the `window.onerror` and `unhandledrejection` listeners, then trigger each
   one from the console
7. Add `router.onError`, and make a guard throw. Confirm that a guard returning
   `false` does **not** reach it
8. *(Bonus)* Swap `reporter` for `@sentry/vue` pointed at a free-tier or
   GlitchTip DSN, build with `sourcemap: 'hidden'`, and read one real stack trace

**Done when** no failure can produce a blank page, and every one of them shows up
in the reporter — exactly once.

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
