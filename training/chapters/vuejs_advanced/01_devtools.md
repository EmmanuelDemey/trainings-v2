---
layout: cover
---

# 1 - Vue Devtools

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
- **Explain** why the panel goes quiet on a production build, and what the
  Devtools can never tell you

---

# Why we start here

> "Before optimizing, **measure**."

That sentence comes back three times over the next three days:

- **Chapter 7** — is this `v-memo` worth it?
- **Chapter 9** — is this store really re-rendering the whole page?
- **Chapter 16** — what is actually in that entry chunk?

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
  - **Pinia** — actions and state mutations (chapter 9)
  - **router** — navigations (chapter 6)
  - performance markers, mouse and keyboard events
- Workflow: **start recording → do one thing → stop → read back**

<br />

- Answers the question you cannot answer by reading code: *what re-rendered when
  I clicked that button, and how many times?*
- One click producing twenty component updates is the classic signal of a store
  read that is too wide — exactly the problem chapter 9 attacks

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

> This is the number you write in the before/after table of workshops 6, 7 and 11.

---

# What the Devtools cannot tell you

- **Production builds have no Devtools hooks.** That is deliberate: the tree, the
  props and the whole store state would be readable by anyone

```ts
// vite.config.ts — chapter 16
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
- **B.** The app was built with the wrong `base` URL
- **C.** Nothing — production builds ship without the Devtools hooks by default
- **D.** `app.config.performance` was left to `false`

<v-click>

> ✅ **C** — The Devtools interface is stripped from production builds. You can
> re-enable it with `__VUE_PROD_DEVTOOLS__: 'true'`, which you only ever do on a
> **private** staging build: it exposes your component tree and your store state.

</v-click>

---

# Quiz — Question 2 / 3

**You want the duration of a single component's render, in milliseconds. Where do
you look?**

- **A.** `app.config.performance = true`, then the browser's Performance panel
- **B.** The Components tab, on the selected node
- **C.** The Graph tab
- **D.** The Assets tab

<v-click>

> ✅ **A** — `app.config.performance` emits init / compile / render / patch marks
> that the **browser's** Performance panel renders as a timeline. It works in
> development mode only. The Vue Timeline tells you *what* rendered; these marks
> tell you *how long* it took.

</v-click>

---

# Quiz — Question 3 / 3

**One click, and the Timeline shows twenty component updates. What is the most
likely cause?**

- **A.** The Devtools are double-counting because the panel is open
- **B.** Vue is missing a `key` on a `v-for`
- **C.** The build is not tree-shaking
- **D.** A component subscribed to more state than it displays

<v-click>

> ✅ **D** — Reading a whole collection where a single getter would do subscribes
> the component to every change in it. That is the exact problem chapter 9 attacks
> with `storeToRefs` and per-domain stores — and the Timeline is how you prove the
> fix worked.

</v-click>

---
layout: cover
---

# Hands-on

## Guided tour - 15 min
