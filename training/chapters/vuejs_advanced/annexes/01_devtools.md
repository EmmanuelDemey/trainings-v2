---
layout: cover
---

# Annexe — Vue Devtools

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

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

# Router and Pinia tabs

**Pages / Router** — used in chapter 6

- Every registered route, its `name`, `path` and matched components
- Which route matches **right now**, with `params` and `query`
- Type a path to navigate — a guard that redirects becomes visible immediately

<br />

**Pinia** — used in chapter 9

- Every registered store, its state, its getters and its plugin-added properties
- Edit the state live; actions and mutations land in the **Timeline**
- The first place to look when a getter "does not update": read whether it is even
  subscribed

