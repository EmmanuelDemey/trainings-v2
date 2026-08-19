---
layout: cover
---

# 9 - Production & deployment

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Read** a `vite build` output and **analyze** the bundle with the visualizer
- **Split** code by route and by feature, and **group** vendors with `manualChunks`
- **Drive** loading with prefetch and preload hints
- **Configure** typed, validated environments, and **keep** secrets out of `VITE_*`
- **Serve** an SPA correctly: fallback, immutable assets, uncached `index.html`,
  security headers
- **Build** a CI/CD pipeline with a size budget, **deploy** to Netlify or Vercel,
  and **wire** error reporting

---

# What "production" means for a Vue app

1. A **build** that is small, cached and split sensibly
2. **Environment configuration** that never leaks a secret into the bundle
3. A **server** that serves the SPA correctly (fallback, headers, compression)
4. A **pipeline** that tests, builds and deploys automatically
5. **Observability**: errors and web vitals coming back from real users

<br />

> Every one of these has a default that is *almost* right. The failures are
> always in the details.

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

# Code splitting inside a view

```ts
// Heavy, conditionally rendered
const Chart = defineAsyncComponent(() => import('@/components/Chart.vue'));

// Heavy, needed only after an interaction
async function exportPdf(): Promise<void> {
  const { jsPDF } = await import('jspdf');       // 300 kB, loaded on click
  new jsPDF().save('invoice.pdf');
}
```

- Same idea one level down: **defer what is not on the critical path**
- Editors, PDF generators, chart libraries, date pickers, map SDKs

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

# Prefetch and preload

```html
<!-- Vite injects modulepreload for the entry's static imports -->
<link rel="modulepreload" href="/assets/vendor-Dq1z8m.js" />
```

```ts
// Warm up a lazy route on intent, before the click
function prefetchInvoices(): void {
  import('@/views/InvoicesView.vue');
}
```

```vue
<RouterLink to="/invoices" @mouseenter="prefetchInvoices">Invoices</RouterLink>
```

- `preload` = needed **now**, `prefetch` = probably needed **next**
- Prefetch on hover/focus is a cheap, big perceived-performance win

---

# Other build-level wins

```ts
export default defineConfig({
  build: {
    target: 'es2022',              // smaller output, no legacy transforms
    cssCodeSplit: true,            // one CSS file per async chunk (default)
    sourcemap: 'hidden',           // uploaded to Sentry, not served publicly
  },
  define: {
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
});
```

- Pre-compress at build time (`vite-plugin-compression`) if your host doesn't do it
- Self-host fonts with `font-display: swap` and `preload` the critical one
- Use `<img loading="lazy" width height>` — layout shift is a Core Web Vital

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

# Typing the environment

```ts
// env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Validate at startup — fail loudly, not at 3am:

```ts
// config.ts
const required = ['VITE_API_URL'] as const;
for (const key of required) {
  if (!import.meta.env[key]) throw new Error(`Missing env variable: ${key}`);
}
```

---

# Runtime configuration

Env variables are **baked in at build time**. To deploy the *same artifact* to
staging and production:

```html
<!-- index.html -->
<script>window.__CONFIG__ = { apiUrl: '__API_URL__' };</script>
```

```ts
const apiUrl: string = window.__CONFIG__.apiUrl;
```

- The container/entrypoint substitutes the placeholder at **startup**
- Alternative: fetch `/config.json` before mounting the app

> Build once, deploy everywhere — the twelve-factor rule. Worth it when you have
> more than two environments.

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

# Security headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';
  img-src 'self' data: https:; connect-src 'self' https://api.example.com
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

- A Vue build needs **no `unsafe-eval`** — templates are precompiled
- Inline styles from `<style scoped>` are extracted, so `style-src 'self'` works
- Test with `Content-Security-Policy-Report-Only` first

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

# Deploying to Vercel

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

- Same model: preview deployments, per-environment variables, instant rollback
- Both hosts serve from a CDN — you get compression and HTTP/2 for free

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

# The e2e and deploy stages

```yaml
  e2e:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - uses: cypress-io/github-action@v6
        with:
          start: npx vite preview --port 4173
          wait-on: 'http://localhost:4173'

  deploy:
    needs: e2e
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - run: npx netlify-cli deploy --dir=dist --prod
        env: { NETLIFY_AUTH_TOKEN: '${{ secrets.NETLIFY_AUTH_TOKEN }}' }
```

- **Build once**, test and deploy the *same* artifact — never rebuild before deploy

---

# Guarding the bundle size

```yaml
      - run: npx size-limit
```

```json
// .size-limit.json
[
  { "path": "dist/assets/index-*.js", "limit": "150 kB" },
  { "path": "dist/assets/*.css", "limit": "30 kB" }
]
```

<br />

- A budget that fails the build is the only budget that survives
- Same idea for Lighthouse: `treosh/lighthouse-ci-action` with assertions on
  LCP, CLS and TBT

---

# Observability

```ts
import * as Sentry from '@sentry/vue';

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__,                    // injected via define
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: 0.1,
});
```

```ts
// Vue's own last-resort handler — wired in chapter 8bis
app.config.errorHandler = (err, instance, info) => { /* log it */ };
```

- Upload **source maps** in CI so stack traces are readable
- Send **web vitals** too: `onLCP`, `onCLS`, `onINP` from the `web-vitals` package

---

# The pre-flight checklist

- [ ] `vue-tsc --noEmit` and `eslint` pass in CI
- [ ] Unit + e2e suites green on the **built** app
- [ ] Entry chunk within budget, routes lazily loaded
- [ ] `index.html` not cached, `/assets/*` cached forever
- [ ] History-mode fallback configured
- [ ] No secret in any `VITE_*` variable
- [ ] Security headers + CSP in report-only, then enforced
- [ ] Sourcemaps uploaded, errors and web vitals reported
- [ ] A **rollback** path you have actually tested

---

# Recap

- Route-level `import()` is the highest-value optimization; measure with the visualizer
- Split the framework into a stable chunk, prefetch on intent, defer heavy libraries
- `VITE_*` is public — secrets stay server-side; use runtime config to build once
- Three server rules: SPA fallback, immutable assets, uncached `index.html`
- Pipeline: lint ➜ typecheck ➜ unit ➜ build ➜ e2e on the artifact ➜ deploy
- Add a **size budget** and **error reporting**, or you will find out from users

---

# Quiz — Question 1 / 4

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

# Quiz — Question 2 / 4

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

# Quiz — Question 3 / 4

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

# Quiz — Question 4 / 4

**Why do the `e2e` and `deploy` jobs download the `dist` artifact instead of
rebuilding it?**

- **A.** To save CI minutes, and nothing else
- **B.** Because `vite build` cannot run twice in the same workflow
- **C.** So that the tests and production run the exact same artifact
- **D.** Because Cypress cannot run a build step

<v-click>

> ✅ **C** — Build once, test that build, deploy that build. Rebuilding before deploy
> means shipping something no test ever ran against.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 9 - Production & deployment
- Analyze the bundle with `rollup-plugin-visualizer` and note the entry size
- Make every route lazy, move a heavy library behind a dynamic `import()`, and
  group `vue`/`vue-router`/`pinia` with `manualChunks` — compare before/after
- Add prefetch-on-hover to the main navigation links
- Add a typed, validated `import.meta.env` configuration with a `.env.staging` mode
- Write the GitHub Actions pipeline: lint, typecheck, unit, build, Cypress on
  `vite preview`, then deploy
- Deploy the app to **Netlify or Vercel** with the fallback and cache headers,
  and verify a hard refresh on a deep link

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
