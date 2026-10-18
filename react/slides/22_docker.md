---
layout: cover
---

# 22 - Docker & Kubernetes

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what `vite build` produces, and why a React SPA needs nothing but
  a static file server in production
- **Write** a multi-stage `Dockerfile`: a Node build stage, a small nginx runtime
  stage, running as **non-root**
- **Configure** nginx for an SPA: history fallback, long-lived caching for
  hashed assets, no cache for `index.html`
- **Inject** configuration at **container start**, so one image runs in every
  environment
- **Publish** the image from GitHub Actions, and **deploy** it to Kubernetes with
  a Deployment, a Service and an Ingress

---

# What we ship

```bash
npm run build          # tsc -b && vite build
```

```
dist/
├── index.html                    ← the only HTML page
├── env.js                        ← runtime configuration (see later)
└── assets/
    ├── index-B4x9kQ2a.js         ← content-hashed: the name changes when the code does
    ├── PersonPage-Cz81mDfE.js    ← a lazy chunk (chapter 13)
    └── index-D2pLwq0e.css
```

- A React SPA is **static files**: no Node.js process in production
- `import.meta.env.VITE_*` values are **inlined at build time** — strings baked
  into the JS bundle
- So "build once, deploy everywhere" needs another way to configure the API URL
  per environment

---

# A multi-stage Dockerfile

```docker
# ---- build stage: Node, the whole toolchain ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage: nginx and the static files only ----
FROM nginxinc/nginx-unprivileged:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chmod=755 docker/40-runtime-env.sh /docker-entrypoint.d/
EXPOSE 8080
```

- **Stage 1** has Node, `node_modules`, the sources — none of it ends up in the image
- **Stage 2** copies only `dist/`: ~20 MB instead of ~500 MB, a smaller attack surface
- **`nginx-unprivileged`** runs as user `101` and listens on **8080** — no root,
  no privileged port
- Copy `package*.json` **before** the sources: the `npm ci` layer is cached until
  the dependencies change

---

# `.dockerignore`

```
node_modules
dist
.git
coverage
cypress/videos
cypress/screenshots
*.log
.env.local
```

- The **build context** is sent to the Docker daemon: without this file,
  `node_modules` (hundreds of MB) is copied for nothing
- `COPY . .` would also overwrite the Linux `node_modules` installed by `npm ci`
  with your local one — native binaries for the wrong OS
- Never put **secrets** in the image: a layer keeps everything it ever contained

```bash
docker build -t star-wars-people:dev .
docker run --rm -p 8080:8080 star-wars-people:dev
```

---

# nginx for an SPA

```nginx
# nginx.conf
server {
  listen 8080;
  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.html;                  # SPA fallback
  }

  location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location ~* ^/(index\.html|env\.js)$ {
    add_header Cache-Control "no-cache";               # always revalidate
  }

  gzip on;
  gzip_types text/css application/javascript application/json image/svg+xml;
}
```

- **`try_files … /index.html`** — `/people/1` is not a file: serve `index.html`
  and let React Router (chapter 14) render the route. Without it, every
  **refresh** on a deep link is a 404
- Hashed **assets** never change under the same name: cache them for a year
- **`index.html`** must always be fresh — it points to the new hashes

---

# Runtime configuration — the problem

```ts
const apiUrl = import.meta.env.VITE_API_BASE_URL;   // replaced by a string at build time
```

- One image per environment (dev, staging, prod) = rebuilding, and not testing
  what you deploy
- We want: **one image**, configured by **environment variables** when the
  container **starts** — like any back-end service

<br />

### The idea

1. `index.html` loads a small `/env.js` **before** the app
2. `env.js` is **generated at container start** from the environment
3. The app reads `window.__ENV__`, and falls back to `import.meta.env` in dev and tests

```html
<!-- index.html -->
<script src="/env.js"></script>
<script type="module" src="/src/main.tsx"></script>
```

---

# Runtime configuration — the script

```sh
#!/bin/sh
# docker/40-runtime-env.sh — run by the nginx image before nginx starts
set -eu

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = {
  API_BASE_URL: "${API_BASE_URL:-/api}",
  APP_ENV: "${APP_ENV:-production}"
};
EOF
```

- Every executable script in **`/docker-entrypoint.d/`** runs at container start,
  then nginx starts — no custom `ENTRYPOINT` needed
- Only **public** values: `env.js` is downloaded by every visitor
- `public/env.js` in the repo holds the **dev** defaults (an empty object); copied
  with `--chown=101:101`, the non-root user may overwrite it

```bash
docker run --rm -p 8080:8080 -e API_BASE_URL=https://api.example.com star-wars-people:dev
```

---

# Runtime configuration — reading it

```ts
// src/config.ts
interface AppConfig {
  apiBaseUrl: string;
  appEnv: string;
}

declare global {
  interface Window {
    __ENV__?: Partial<Record<'API_BASE_URL' | 'APP_ENV', string>>;
  }
}

export function getConfig(): AppConfig {
  const runtime = window.__ENV__ ?? {};
  return {
    apiBaseUrl: runtime.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api',
    appEnv: runtime.APP_ENV || import.meta.env.MODE,
  };
}
```

- **One** module reads the configuration; the rest of the app calls `getConfig()`
- Easy to test: set `window.__ENV__` in a spec, or `vi.stubEnv('VITE_API_BASE_URL', …)`
- Libraries do it for you: `vite-envs`, `@import-meta-env/unplugin`

---

# Publishing the image — GitHub Actions

```yaml
# .github/workflows/docker.yml
on:
  push:
    tags: ['v*']
jobs:
  image:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v7
      - uses: docker/setup-buildx-action@v4
      - uses: docker/login-action@v4
        with: { registry: ghcr.io, username: '${{ github.actor }}', password: '${{ secrets.GITHUB_TOKEN }}' }
      - id: meta
        uses: docker/metadata-action@v6
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=raw,value=latest
      - uses: docker/build-push-action@v7
        with: { push: true, tags: '${{ steps.meta.outputs.tags }}', cache-from: type=gha, cache-to: 'type=gha,mode=max' }
```

- A **tag** `v1.2.0` → images `1.2.0` and `latest` on the GitHub registry
- `GITHUB_TOKEN` + `packages: write` — no personal secret to store
- `type=gha` cache: the `npm ci` layer is reused across runs

<style>
.slidev-layout {
  --slidev-code-font-size: 10.5px;
  --slidev-code-line-height: 1.3;
}
</style>

---

# Kubernetes — the Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: star-wars-people
spec:
  replicas: 2
  selector:
    matchLabels: { app: star-wars-people }
  template:
    metadata:
      labels: { app: star-wars-people }
    spec:
      securityContext: { runAsNonRoot: true }
      containers:
        - name: web
          image: ghcr.io/acme/star-wars-people:1.2.0      # a version, never :latest
          ports: [{ containerPort: 8080 }]
          env:
            - { name: API_BASE_URL, value: https://api.example.com }
          readinessProbe:
            httpGet: { path: /, port: 8080 }
          resources:
            requests: { cpu: 10m, memory: 32Mi }
            limits: { memory: 64Mi }
```

- **Replicas** of the same image; the `env` block feeds `env.js`
- `readinessProbe` — no traffic until nginx answers; `resources` — nginx needs little

---

# Kubernetes — Service and Ingress

```yaml
apiVersion: v1
kind: Service
metadata:
  name: star-wars-people
spec:
  selector: { app: star-wars-people }
  ports: [{ port: 80, targetPort: 8080 }]   # ClusterIP: reachable inside the cluster
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: star-wars-people
spec:
  ingressClassName: nginx
  rules:
    - host: people.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: star-wars-people, port: { number: 80 } } }
```

- **Service** — a stable name and a load balancer in front of the pods
- **Ingress** — HTTP routing from the outside world (host, path, TLS)
- The newer **Gateway API** (`Gateway` + `HTTPRoute`) is the successor of Ingress
- Per-environment values: a `ConfigMap` + `envFrom`, Kustomize overlays, or Helm

---

# Recap

- A React SPA is **static files**: build with Node, serve with nginx
- **Multi-stage** build: the runtime image holds only `dist/` + nginx, runs as
  **non-root** on 8080; `.dockerignore` keeps the context small
- nginx: **`try_files $uri /index.html`** for client-side routes; `immutable`
  cache for hashed assets, `no-cache` for `index.html` and `env.js`
- `VITE_*` is **build-time**; runtime config = an `env.js` written at container
  start, read through **one** `getConfig()` with a fallback
- GitHub Actions: buildx + login + metadata + build-push, to **GHCR**, on tags
- Kubernetes: **Deployment** (replicas, env, probes) → **Service** → **Ingress**

---

# Quiz — Question 1 / 3

**The app works on `/`, but refreshing `/people/1` returns nginx's 404 page. What
is missing?**

- **A.** A `<base href>` in `index.html`
- **B.** `try_files $uri $uri/ /index.html;` in the nginx `location /`
- **C.** `createHashRouter` instead of `createBrowserRouter`
- **D.** A Kubernetes Ingress rule for `/people`

<v-click>

> ✅ **B** — There is no `people/1` file on disk: nginx must fall back to
> `index.html` and let the router handle the path. A hash router (**C**) also
> "works", at the cost of `#` URLs.

</v-click>

---

# Quiz — Question 2 / 3

**The same image runs in staging and production. Why does
`import.meta.env.VITE_API_BASE_URL` point to the same API in both?**

- **A.** Docker does not pass environment variables to nginx
- **B.** Vite **replaces** `import.meta.env.*` with string literals at **build
  time** — the container's environment is never read
- **C.** The variable must be prefixed with `REACT_APP_`
- **D.** Kubernetes caches environment variables

<v-click>

> ✅ **B** — The bundle is static. Configuration that changes per environment
> must be read at **runtime**: an `env.js` generated when the container starts,
> exposed as `window.__ENV__`.

</v-click>

---

# Quiz — Question 3 / 3

**What is the main benefit of the multi-stage build?**

- **A.** The build runs faster because both stages run in parallel
- **B.** The final image contains only the built files and nginx — no Node.js,
  no `node_modules`, no sources: smaller and safer
- **C.** It lets the container run `npm run dev` in production
- **D.** It is required by Kubernetes

<v-click>

> ✅ **B** — `COPY --from=build` takes only `dist/` from the first stage. The
> toolchain stays in a throw-away layer.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 22 - Docker &amp; Kubernetes
