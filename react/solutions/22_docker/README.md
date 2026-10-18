# TP 22 — Docker & Kubernetes

> This TP is **autonomous**: it does not depend on any other TP. The app works
> in `npm run dev`; its Dockerfile, nginx config and Kubernetes manifests are
> naive or incomplete. You turn them into one image that is configured at
> startup, served correctly, and deployable to a cluster.

## Goal

Chapter 22 — Ship a React SPA as a container you would defend in a review:

- **Runtime configuration**: one image for every environment, configured by the
  container's variables through `/env.js` — not rebuilt per environment
- **A multi-stage Dockerfile**: built with Node.js, served by a non-root nginx
- **nginx for a SPA**: the history fallback, cache headers, a real 404 for a
  missing asset, a health endpoint
- **Kubernetes**: a Deployment, a Service and an Ingress that actually connect
- **CI**: a GitHub Actions workflow publishing the image on every version tag

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- **Docker** (Docker Desktop, Colima, OrbStack, Podman…) for steps 3 and 4. The
  specs do not need it: they read the files.
- **A POSIX `sh`** for `src/deploy/env-script.spec.ts`, which runs the startup
  script. Linux and macOS have one; on Windows, run the specs from Git Bash or WSL.
- *(Optional)* `kubectl` and a local cluster (kind, minikube, k3d, Docker
  Desktop's Kubernetes) to apply the manifests of step 5.

## Setup

```bash
npm install
npm run dev            # http://localhost:5173
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run test:watch     # vitest, in watch mode
npm run docker:build   # docker build -t react-22-docker .
npm run docker:run     # the image on http://localhost:8080, as "staging"
```

Every step comes with its specs, red on the starter:

- **`src/config.spec.ts`** and **`src/App.spec.tsx`** — `getConfig()`: runtime
  values first, build-time fallback, a loud failure when nothing is set.
- **`src/deploy/env-script.spec.ts`** — runs `docker/40-env-js.sh` with `sh`, then
  evaluates the `env.js` it wrote, as a browser would.
- **`src/deploy/dockerfile.spec.ts`**, **`nginx.spec.ts`**, **`kubernetes.spec.ts`** —
  read the `Dockerfile`, `.dockerignore`, `nginx.conf` and `k8s/*.yaml`. A text
  check proves the rule is *written*, not that the server *obeys* it: steps 3 and
  4 end with the `curl` checks against the running container that prove the rest.

**Already done for you:**

- `index.html` loads `/env.js` with a classic `<script>` **before** the bundle, and
  `public/env.js` is an empty `window.__ENV__ = {}` for `npm run dev` / `preview`.
- `src/App.tsx` — the people list, a person page on `/people/:id` (plain links:
  every click is a deep link the server must answer), and a "Deployment" panel
  showing what `getConfig()` returned.
- `.github/workflows/docker-publish.yml` — the publish workflow of step 6.
- `.env` — the build-time defaults, `VITE_API_BASE_URL` and `VITE_APP_ENVIRONMENT`.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Read the runtime configuration first, the build-time one as fallback | `src/config.ts` | `config.spec.ts` and `App.spec.tsx` are green |
| 2 | Generate `env.js` from the container's variables, safely | `docker/40-env-js.sh` | `env-script.spec.ts` is green |
| 3 | A multi-stage, non-root image | `Dockerfile`, `.dockerignore` | `dockerfile.spec.ts` is green, the image is ~90 MB |
| 4 | Serve the SPA properly | `nginx.conf` | `nginx.spec.ts` is green and the `curl` checks pass |
| 5 | Deployment, Service, Ingress that connect | `k8s/` | `kubernetes.spec.ts` is green |
| 6 | Publish the image from CI | `.github/workflows/docker-publish.yml` | You can explain every step, and what triggers it |

## Steps

### 1. Runtime configuration — `src/config.ts`

`import.meta.env.VITE_API_BASE_URL` is not read at runtime: `vite build` replaces
it with its value. Once the image is built, the URL is frozen inside
`dist/assets/*.js` (check: `npm run build && grep -o 'localhost:5173/api' dist/assets/*.js`).
One image per environment is exactly what we want to avoid.

1. `TODO 1.1`: read `window.__ENV__` first; fall back to `import.meta.env` when a
   runtime value is missing **or empty**.
2. `TODO 1.2`: drop the trailing slash of the URL; default the environment to
   `'development'`.
3. `TODO 1.3`: throw an `Error` naming `API_BASE_URL` and `VITE_API_BASE_URL` when
   neither is set.

→ **Done when** `config.spec.ts` and `App.spec.tsx` are green, and `npm run dev`
still shows `http://localhost:5173/api` in the Deployment panel.

### 2. Generate `env.js` at startup — `docker/40-env-js.sh`

The nginx image runs every script of `/docker-entrypoint.d/` before starting
nginx. This one writes `/usr/share/nginx/html/env.js` from the container's
environment (or `$ENV_JS_PATH`, which the spec uses).

1. `TODO 2.1`: write `window.__ENV__ = { API_BASE_URL: "…", APP_ENVIRONMENT: "…" };`
   — `${API_BASE_URL:-}` gives an empty string for an unset variable.
2. `TODO 2.2`: escape `\` then `"` before putting a value in the string. Read the
   last spec: without the escaping, the hostile value *runs*.
3. Try it by hand:

   ```bash
   ENV_JS_PATH=/tmp/env.js API_BASE_URL=https://swapi.example.com/api sh docker/40-env-js.sh
   cat /tmp/env.js
   ```

→ **Done when** `env-script.spec.ts` is green.

### 3. The image — `Dockerfile` + `.dockerignore`

First, build the naive image and write its size down:

```bash
npm run docker:build && docker image ls react-22-docker
```

1. `TODO 3.1`: `.dockerignore` — add `node_modules`, `dist` and `.git`.
2. `TODO 3.2`: the build stage. Manifests, `npm ci`, sources, `npm run build`, in
   that order: change a component and rebuild — the `npm ci` step says `CACHED`.
3. `TODO 3.3`: the serving stage on `nginxinc/nginx-unprivileged:stable-alpine`: the
   nginx config, the script in `/docker-entrypoint.d/` (`--chmod=755`), `dist/`
   from the build stage with `--chown=101:101`, `USER 101`, `EXPOSE 8080`.
4. Rebuild, compare the size (~460 MB → ~90 MB), and check the user:

   ```bash
   npm run docker:build && docker image ls react-22-docker
   docker run --rm react-22-docker id     # uid=101(nginx)
   ```

→ **Done when** `dockerfile.spec.ts` is green and `id` in the container is not root.

### 4. nginx for a SPA — `nginx.conf`

1. `TODO 4.1`: `listen 8080;` — the nginx user cannot bind port 80.
2. `TODO 4.2`: the fallback, `try_files $uri $uri/ /index.html;`.
3. `TODO 4.3`: `location /assets/` — immutable for a year, and `try_files $uri =404;`.
4. `TODO 4.4`: `no-cache` on `= /index.html`, `no-store` on `= /env.js`.
5. `TODO 4.5`: `location = /healthz`, for the probes of step 5.
6. Rebuild, run (`npm run docker:run`), and check what the specs cannot:

   ```bash
   curl -i http://localhost:8080/people/leia-organa      # 200, the app, Cache-Control: no-cache
   curl -s http://localhost:8080/env.js                   # API_BASE_URL: "https://swapi.example.com/api"
   curl -I http://localhost:8080/assets/missing-0000.js   # 404, not 200 text/html
   curl -i http://localhost:8080/healthz                  # 200 ok
   ```

   Then open <http://localhost:8080/people/leia-organa> and press
   <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>: the Deployment panel says
   `staging`. Stop it and run it again with `-e APP_ENVIRONMENT=production`: same
   image, new configuration, nothing rebuilt.

→ **Done when** `nginx.spec.ts` is green and all four `curl` checks answer as above.

### 5. Kubernetes — `k8s/`

1. `TODO 5.1`–`5.3`, `deployment.yaml`: `runAsNonRoot: true` on the pod,
   `allowPrivilegeEscalation: false` on the container, a readiness and a liveness
   probe on `/healthz:8080`.
2. `TODO 5.4`, `service.yaml`: a selector that matches the pod labels, and a
   `targetPort` that matches the container port.
3. `TODO 5.5`, `ingress.yaml`: write the Ingress — without `rewrite-target`.
4. *(Bonus)* With a local cluster: load the image (`kind load docker-image
   react-22-docker`, and use that name in the Deployment), `kubectl apply -f k8s/`,
   then `kubectl get endpoints star-wars-people` — an empty list means the selector
   matches nobody.

→ **Done when** `kubernetes.spec.ts` is green and `npm test` is entirely green.

### 6. Publish from CI — `.github/workflows/docker-publish.yml`

Read the workflow (it is given), then answer: what triggers it? Which image tags
does `git tag v1.4.2` produce? Why does it need no Node.js setup, and no secret?
Why two platforms? Copy it to the root of a repository of yours, push a tag, and
watch the image appear under *Packages*.

→ **Done when** you can explain every step of the workflow.

## Definition of Done

Tick every box before moving on. Steps marked *(Bonus)* and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the configuration, the script, the Dockerfile, nginx, the manifests
- [ ] `npm run build` succeeds, and `npm run docker:build` too
- [ ] `grep -rn TODO src docker k8s Dockerfile nginx.conf .dockerignore` returns nothing

**The behaviour is there**

- [ ] The same image shows `staging` or `production` depending only on `-e APP_ENVIRONMENT`
- [ ] A hard refresh on `/people/leia-organa` returns the app, not a 404
- [ ] A missing asset is a **404**; a hashed asset is `immutable`; `index.html` is `no-cache`; `env.js` is `no-store`
- [ ] The container runs as uid 101, and the image is a fraction of the naive one
- [ ] The Service selects the pods of the Deployment, and the Ingress reaches the Service

**You can explain**

- [ ] Why a `VITE_` variable cannot hold a secret, nor change after the build
- [ ] Why `package-lock.json` is copied and `npm ci` run *before* `COPY . .`
- [ ] What the `rewrite-target: /` annotation does to a deep link
- [ ] The difference between a readiness and a liveness probe

## Going further

- Add the security headers (`X-Content-Type-Options`, `Referrer-Policy`, a
  `Content-Security-Policy`) to `nginx.conf` — and mind nginx's rule: a `location`
  with its own `add_header` drops every header inherited from `server`.
- Replace `docker/40-env-js.sh` by `envsubst` on a template, as the nginx image
  does for its own `/etc/nginx/templates/`. What does the escaping become?
- Add a `test` job to the workflow that runs `npm ci && npm test` before the image
  job (`needs: test`).
- Move the manifests to Kustomize: one `base/`, one overlay per environment that
  only patches `env`.
