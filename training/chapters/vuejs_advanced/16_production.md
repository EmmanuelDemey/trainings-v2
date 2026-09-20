---
layout: cover
---

# 16 - Production & deployment

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Read** a `vite build` output and **analyze** the bundle with the visualizer
- **Split** code by route, and **group** stable vendors with `manualChunks`
  without over-splitting
- **Configure** Vite's modes and `.env` files, and **keep** secrets out of `VITE_*`
- **Serve** an SPA correctly: history fallback, immutable assets, uncached
  `index.html`
- **Deploy** to Netlify from a `netlify.toml`, and **build** a CI pipeline that
  lints, typechecks, tests, builds and uploads the artifact

---

# What `vite build` actually does

```bash
npm run build          # vue-tsc --noEmit && vite build
```

```
dist/
├── index.html                       ← references the hashed assets
└── assets/
    ├── index-B7xK2p.js              ← entry chunk
    ├── vendor-Dq1z8m.js             ← shared dependencies
    ├── InvoiceView-Ck9wLp.js        ← a lazy route
    └── index-Ax3jQr.css
```

- Rollup bundles, tree-shakes, minifies (esbuild) and **hashes** every file name
- Vue's dev-only warnings and the compiler are stripped in production
- `index.html` is the only file that must **not** be cached long-term

---

# Analyzing the bundle

```bash
npm install -D rollup-plugin-visualizer
```

```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [vue(), visualizer({ open: true, gzipSize: true, brotliSize: true })],
  build: { reportCompressedSize: true },
});
```

- Look for: duplicated dependencies, a date library shipped whole, an icon set,
  a chart library in the entry chunk
- Budget: aim for an **entry chunk under 150 kB gzipped**

---

# Code splitting by route

```ts
const routes: RouteRecordRaw[] = [
  { path: '/', component: HomeView },                          // eager: the landing page
  { path: '/invoices', component: () => import('@/views/InvoicesView.vue') },
  { path: '/admin', component: () => import('@/views/AdminView.vue') },
];
```

- One `import()` ➜ one chunk, fetched on navigation
- The **most valuable** optimization in a typical SPA
- Vite names the chunk after the source module — nothing to declare:

```bash
dist/assets/AdminView-B1cD2e3f.js      12.40 kB │ gzip: 4.12 kB
```

- Rename the files with `build.rollupOptions.output.chunkFileNames`

---

# `manualChunks`

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          charts: ['echarts'],
        },
      },
    },
  },
});
```

- Keeps the framework in a chunk that **rarely changes** ➜ stays in the user's cache
- ⚠️ Over-splitting hurts: each chunk is an extra request and lost compression
- Never split a dependency that is only used by one lazy route

---

# Environments and modes

```
.env                  # loaded in every mode, committed
.env.local            # every mode, git-ignored
.env.development      # vite dev
.env.staging          # vite build --mode staging
.env.production       # vite build
```

```bash
VITE_API_URL=https://api.example.com
VITE_SENTRY_DSN=https://...
DATABASE_PASSWORD=secret          # NOT exposed — no VITE_ prefix
```

```ts
const apiUrl: string = import.meta.env.VITE_API_URL;
if (import.meta.env.PROD) initAnalytics();
```

> ⚠️ Anything prefixed `VITE_` is **inlined into the JavaScript** and readable by
> anyone. A frontend bundle can never hold a secret.

---

# Serving the SPA

```nginx
server {
  root /usr/share/nginx/html;

  # Hashed assets: immutable, cache for a year
  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # index.html: never cache
  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  # History-mode fallback
  location / { try_files $uri $uri/ /index.html; }

  gzip on; gzip_types text/css application/javascript application/json;
}
```

- Getting these three rules right removes most "why is my deploy not live" tickets

---

# Deploying to Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

- **Deploy previews** on every pull request — review the UI, not the diff
- Set `VITE_*` variables per context (production / deploy-preview / branch)

---

# A CI/CD pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck          # vue-tsc --noEmit
      - run: npm run test:unit -- --coverage
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

- Every step must be runnable **locally** with the same command
- Cache `node_modules` via `setup-node`, not a hand-rolled cache step

---

# Recap

- Route-level `import()` is the highest-value optimization; measure with the visualizer
- `manualChunks` keeps the framework in a chunk that stays cached — over-splitting
  costs more than it saves
- `VITE_*` is inlined into the JavaScript: a frontend bundle can never hold a secret
- Three server rules: SPA fallback, immutable assets, uncached `index.html`
- One `netlify.toml` carries the build, the redirect and the headers — plus a
  **deploy preview** per pull request
- Pipeline: lint ➜ typecheck ➜ unit ➜ build ➜ upload the artifact, every step
  runnable locally

---

# Quiz — Question 1 / 3

**You add `VITE_API_TOKEN=abc123` to `.env.production`. Who can read it?**

- **A.** Only the build server
- **B.** Only code guarded by `import.meta.env.PROD`
- **C.** Anyone — `VITE_*` values are inlined into the shipped JavaScript
- **D.** Nobody, Vite encrypts the value at build time

<v-click>

> ✅ **C** — Drop the prefix and the variable simply never reaches the bundle. A
> frontend build can never hold a secret: it belongs on the server, behind an
> endpoint.

</v-click>

---

# Quiz — Question 2 / 3

**Which caching policy is correct for a Vite SPA build?**

- **A.** Cache everything for a year, `index.html` included
- **B.** `no-cache` on everything, to always serve the latest version
- **C.** `/assets/*` immutable for a year, `index.html` never cached
- **D.** `index.html` immutable, `/assets/*` revalidated on every request

<v-click>

> ✅ **C** — Asset file names are content-hashed, so they can be cached forever.
> `index.html` is the manifest pointing at them: cache it and users keep loading the
> previous deployment.

</v-click>

---

# Quiz — Question 3 / 3

**Which optimization pays the most in a typical SPA?**

- **A.** `manualChunks` splitting every dependency into its own file
- **B.** Route-level `import()`, so each route ships its own chunk
- **C.** Pre-compressing the assets with brotli
- **D.** Setting `build.target` to `es2022`

<v-click>

> ✅ **B** — Users pay for what they render. The others are real but marginal, and
> over-splitting with `manualChunks` actively hurts: more requests, worse
> compression.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 16 - Production & deployment
