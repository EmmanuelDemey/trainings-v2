---
layout: cover
---

# Annexe — Production & deployment

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

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

# CSR / SSR / SSG — choosing a rendering strategy

| | **CSR** (this course) | **SSR** | **SSG** |
|---|---|---|---|
| HTML built | in the browser, after the JS | per request, on a server | once, at build time |
| First paint | after the bundle loads | immediate, then hydration | immediate, then hydration |
| Indexable | only if the crawler runs JS | yes, full markup | yes, full markup |
| Runtime | a static file server | a Node / edge process | a static file server |
| Freshness | free — fetched live | one render per request | a rebuild (or ISR) |
| **Choose when** | it sits behind a login | it is public **and** minute-fresh | it is public, deploy-cadenced |

> Nobody crawls a back-office, and its first paint is not the product.

---

# Nuxt — the three modes, one per route

Most real apps want **two or three of them at once** — which is what Nuxt is for:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/':           { prerender: true },   // SSG, at build time
    '/blog/**':    { isr: 3600 },         // rendered once, revalidated hourly
    '/product/**': { ssr: true },         // rendered per request
    '/admin/**':   { ssr: false },        // pure CSR, behind the login
  },
});
```

- Nuxt is **not a fourth strategy**: it makes the choice a per-route setting on top of
  Vue — file-based routing, auto-imports (chapter 8), layouts, and **Nitro**, a server
  that deploys to Node, an edge runtime or a static host
- `useFetch` / `useAsyncData` run **on the server**, and the payload travels with the
  HTML — the client does not refetch during hydration
- The price: a server to run, `window` / `document` behind `import.meta.client`, and
  hydration mismatches as a new class of bug — `useId()` (ch. 1), `getSSRProps` (ch. 3),
  the Pinia payload (ch. 6)

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

# `vite preview` is not your production

```bash
npm run build && npm run preview                  # :4173
curl -i http://localhost:4173/assets/nope.js      # a chunk that does not exist
```

```http
HTTP/1.1 200 OK
Content-Type: text/html
Cache-Control: no-cache
```

- Its SPA fallback is **hard-coded** — it passes whether or not your host config has one
- `no-cache` on everything — it can never validate your caching policy
- A missing chunk comes back as HTML: `Uncaught SyntaxError: Unexpected token '<'`

> Perfect for testing the *app*. It proves nothing about the *deployment*.

---

# Plan B — no account, same three rules

```yaml
# docker/compose.yml — dist/ mounted, so edit the config and `restart`
services:
  nginx:
    image: nginx:1.27-alpine
    ports: ['8080:80']
    volumes:
      - ../dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
```

```bash
curl -o /dev/null -w '%{http_code}\n' localhost:8080/invoices          # 200, not 404
curl -sI localhost:8080/index.html          | grep -i cache-control     # no-cache
curl -sI localhost:8080/assets/index-C1a.js | grep -i cache-control     # immutable
curl -o /dev/null -w '%{http_code}\n' localhost:8080/assets/nope.js    # 404, NOT 200
```

- Netlify and Vercel are convenient; they are not a prerequisite to learning this
- Same trap on all three: a catch-all rewrite serves `index.html` for a **missing asset**

---

# The image you would actually ship

```dockerfile
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
```

- No `npm ci`, no `vite build`: the artifact was built **once**, upstream
- The popular multi-stage variant (`FROM node AS build` … `COPY --from=build`)
  quietly rebuilds at deploy time — know which trade-off you are making
- Runtime config (`window.__CONFIG__` substituted by the entrypoint) is what lets
  the **same image** go to staging and to production

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
// Vue's own last-resort handler — wired in chapter 13
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

# Quiz — Question 1 / 2

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

# Quiz — Question 2 / 2

**`npm run preview` serves your deep links fine. What does that prove about
production?**

- **A.** The history-mode fallback is correctly configured
- **B.** Nothing — `vite preview` has its own fallback built in
- **C.** That the app has no dynamic routes
- **D.** That the cache headers are right too

<v-click>

> ✅ **B** — `vite preview` is a dev convenience with the SPA fallback hard-coded and
> `no-cache` on everything. It even answers a **missing** chunk with `index.html`.
> Test the config you deploy: a local nginx/Caddy container, or the host itself.

</v-click>

