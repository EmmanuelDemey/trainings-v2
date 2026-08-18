---
layout: cover
---

# Tooling - Vue Devtools

---

# Learning objectives

At the end of this sequence (**~30 min**), you will be able to:

- **Install** Vue Devtools in the flavour that fits your project — extension, Vite
  plugin or standalone app
- **Inspect** a component's props and state, and **edit** them live to reproduce a
  bug without touching the code
- **Record** a Timeline and read back component events, store mutations and route
  navigations
- **Measure** a render with `app.config.performance` and the browser's Performance
  panel, instead of guessing
- **Navigate** the Router and Pinia tabs you will live in during chapters 5 and 6
- **Explain** why the Devtools are absent from a production build — and why that is
  the right default

---

# Why we start here

> "Before optimizing, **measure**."

That sentence comes back three times over the next three days:

- **Chapter 2** — is this `v-memo` worth it?
- **Chapter 6** — is this store really re-rendering the whole page?
- **Chapter 9** — what is actually in that entry chunk?

<br />

- Thirty minutes now buys you an instrument for the remaining ~17 hours
- Every workshop assumes the Devtools panel is **open next to the app**
- House rule from here on: **no optimization without a before/after measurement**

---

# Three ways to install

| | What you get | When |
|---|---|---|
| **Browser extension** (Chrome / Firefox) | A "Vue" panel in the browser devtools | Default — works on any Vue 3 app, including one you do not build yourself |
| **`vite-plugin-vue-devtools`** | The same panel **inside the page**, plus Vite-only tabs (Assets, Inspect, Inspector, open-in-editor) | Your own Vite project — the richest experience |
| **Standalone app** (Electron) | The panel outside the browser | Mobile / webview / non-Chromium targets |

<br />

> Devtools **7** only supports **Vue 3**. A Vue 2 codebase needs the legacy v6 build.
> The workshops of this training run on the **browser extension** — nothing to install
> in the projects.

---

# The Vite plugin, if you want the full set

```bash
npm add -D vite-plugin-vue-devtools
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools({ launchEditor: 'code' }),   // click a component → opens the file
  ],
});
```

- Adds a floating button in the app; the panel opens **over the page**
- `componentInspector` (on by default): pick an element on screen, jump to its component
- Requires **Vite 6+**, and it is a `devDependency` — it never reaches the bundle

---

# Overview and Components

- **Overview** — Vue version actually running, number of pages and components.
  The fastest answer to "am I really on 3.5?"
- **Components** — the component tree, and for the selected node:
  - `props`, `setup` state, computed values, `provide` / `inject`
  - the **file path**, and with the Vite plugin, open-in-editor

<br />

- **Edit state live**: change a `ref` from the panel and watch the DOM update —
  the cheapest way to reproduce an edge case (empty list, 999 items, error flag)
- Filter the tree by name; `Ctrl/Cmd + K` opens the **command palette**
- Multiple `createApp()` instances? Switch between them from the app selector

> If a value you expect is missing, it is usually not exposed: `<script setup>` only
> shows what the component actually declares.

---

# The Timeline

- Records what happened, **in order**, as layers:
  - **component events** — mount, update, unmount
  - **Pinia** — actions and state mutations (chapter 6)
  - **router** — navigations (chapter 5)
  - performance markers, mouse and keyboard events
- Workflow: **start recording → do one thing → stop → read back**

<br />

- Answers the question you cannot answer by reading code: *what re-rendered when
  I clicked that button, and how many times?*
- One click producing twenty component updates is the classic signal of a store
  read that is too wide — exactly the problem chapter 6 attacks

> The Timeline is the tab that moved the most between Devtools 6 and 7. If yours
> looks different from the screen, check your version in the **Settings** tab.

---

# Measuring a render, precisely

```ts
// main.ts — development only
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.config.performance = true;   // init / compile / render / patch tracing
app.mount('#app');
```

- Emits `performance.mark()` entries read by the **browser's Performance panel**
  (not the Vue panel) — component **init**, template **compile**, **render**, **patch**
- **Development mode only**, and only in browsers supporting the `performance.mark` API
- Method: record a profile → find the Vue marks → look for the **widest render bar**,
  then ask why that component rendered at all

> This is the number you write in the before/after table of workshops 2, 5 and 7.

---

# Router and Pinia tabs

**Pages / Router** — used in chapter 5

- Every registered route, its `name`, `path` and matched components
- Which route matches **right now**, with `params` and `query`
- Type a path to navigate — a guard that redirects becomes visible immediately

<br />

**Pinia** — used in chapter 6

- Every registered store, its state, its getters and its plugin-added properties
- Edit the state live; actions and mutations land in the **Timeline**
- The first place to look when a getter "does not update": read whether it is even
  subscribed

---

# What the Devtools cannot tell you

- **Production builds have no Devtools hooks.** That is deliberate: the tree, the
  props and the whole store state would be readable by anyone

```ts
// vite.config.ts — chapter 9
define: {
  __VUE_PROD_DEVTOOLS__: 'false',   // keep it false for a public build
}
```

- **Observing costs.** With the panel open, renders are slower. Compare before and
  after **in the same conditions**, and confirm the win with the panel closed
- **`computed` is lazy** — opening the panel can be what forces an evaluation
- **`shallowRef` internals are not tracked**, so a deep mutation may simply not show
- A **stale extension** on a fresh Vue version yields empty tabs before it yields an
  error — check versions before you debug the app

---

# Quiz — Question 1 / 3

**Your app is deployed and the Vue panel says "Vue.js not detected" in production,
while it works locally. What happened?**

- **A.** The extension needs to be re-authorized for the domain
- **B.** Nothing — production builds ship without the Devtools hooks by default
- **C.** The app was built with the wrong `base` URL
- **D.** `app.config.performance` was left to `false`

<v-click>

> ✅ **B** — The Devtools interface is stripped from production builds. You can
> re-enable it with `__VUE_PROD_DEVTOOLS__: 'true'`, which you only ever do on a
> **private** staging build: it exposes your component tree and your store state.

</v-click>

---

# Quiz — Question 2 / 3

**You want the duration of a single component's render, in milliseconds. Where do
you look?**

- **A.** The Components tab, on the selected node
- **B.** The Graph tab
- **C.** `app.config.performance = true`, then the browser's Performance panel
- **D.** The Assets tab

<v-click>

> ✅ **C** — `app.config.performance` emits init / compile / render / patch marks
> that the **browser's** Performance panel renders as a timeline. It works in
> development mode only. The Vue Timeline tells you *what* rendered; these marks
> tell you *how long* it took.

</v-click>

---

# Quiz — Question 3 / 3

**One click, and the Timeline shows twenty component updates. What is the most
likely cause?**

- **A.** The Devtools are double-counting because the panel is open
- **B.** A component subscribed to more state than it displays
- **C.** Vue is missing a `key` on a `v-for`
- **D.** The build is not tree-shaking

<v-click>

> ✅ **B** — Reading a whole collection where a single getter would do subscribes
> the component to every change in it. That is the exact problem chapter 6 attacks
> with `storeToRefs` and per-domain stores — and the Timeline is how you prove the
> fix worked.

</v-click>

---
layout: cover
---

# Hands-on

## Guided tour - 15 min

Run any workshop app (`cd tp/02_advanced_components && npm install && npm run dev`),
open the Vue panel, and tick off:

1. **Overview** — which Vue version is really running?
2. **Components** — select a component, read its props, then **edit a state value**
   from the panel and watch the DOM change
3. **Timeline** — record, click one button, and name every component that updated
4. **Performance** — set `app.config.performance = true`, record a browser profile,
   read one render duration
5. **Pages** — navigate by typing a path (Router and Pinia tabs come back in
   chapters 5 and 6)

**Done when** you can answer in under 30 seconds: *who owns this state, and what
re-rendered when I clicked?*

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
