# Workshop 03 — Readable stack traces

> In production, the stack trace of the crash of issue 7 reads
> `at e (index-Bhh_QhS_.js:1:48213)`. A first attempt at fixing it is in
> `vite.config.ts`: `sourcemap: true` — which **publishes** the source maps next to
> the bundle, every line of the source code with them. Generate the maps, give them
> to Sentry, and to nobody else.

## Goal

Chapter 03 — Releases and source maps with **`@sentry/vite-plugin`**:

- **Hidden** source maps: generated, not referenced by the bundle
- **Debug ids**: the bundle and its maps carry the same id — Sentry matches them,
  whatever the URL the bundle is served from
- **A release**, injected in the bundle at build time
- **Uploaded, then deleted**: the maps never reach the web server

## Prerequisites

- **Node.js 24** — run `nvm use` to pick up the version from `.nvmrc`
- Workshop 02 done, or start from this folder: its starter is workshop 02's solution
- Chapter 03 of the deck: releases, source maps, the CI

**A Sentry account is optional.** Without an auth token, the plugin injects the
debug ids and the release, then warns that it uploads nothing: everything the
spec checks still happens. With a sentry.io project, set `SENTRY_AUTH_TOKEN`,
`SENTRY_ORG`, `SENTRY_PROJECT` and `VITE_SENTRY_DSN` to see the stack trace
resolved.

## Setup

```bash
npm install
npm run build        # the production build, into dist/
npm run test:watch   # src/tests/build.spec.ts runs the build too
```

`@sentry/vite-plugin` is already installed. The new spec,
**`src/tests/build.spec.ts`**, runs **your** `vite.config.ts` into `dist/`, with
`SENTRY_RELEASE=issue-tracker-web@test`, and reads what would be deployed. It is
red on the starter. The spec of workshop 02 is still there, and still green.

**See the problem first**: `npm run build`, then `ls dist/assets`. There is a
`.js.map` next to the bundle, and the bundle ends with
`//# sourceMappingURL=index-….js.map`. Anyone can download your source code.

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | Hidden source maps | `vite.config.ts` | `npm test` — "nothing for the public" still red: the maps are still in `dist/` |
| 2 | The Sentry plugin | `vite.config.ts` | `npm test` — all green |
| 3 | No `release` in `initSentry` | `sentry.ts` | nothing to add: read why |
| 4 | The CI | `.github/workflows/…` of your project | the snippet below |

## Steps

### 1. Hidden source maps — `vite.config.ts`

`build.sourcemap: 'hidden'`: Vite still writes the `.map` files, but the bundle no
longer points to them — no `sourceMappingURL` comment.

**Check it**: `npm run build`. The `.map` is still in `dist/assets/` — step 2
deletes it — but the bundle does not mention it any more.

→ **Done when** the "no sourceMappingURL comment" spec is green.

### 2. The Sentry plugin — `vite.config.ts`

1. Import `sentryVitePlugin` from `@sentry/vite-plugin`, and read the version of
   `package.json`:

   ```ts
   const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };
   ```

2. Add the plugin **last** in `plugins` — it reads what the others produced:

   ```ts
   sentryVitePlugin({
     org: process.env.SENTRY_ORG,
     project: process.env.SENTRY_PROJECT,
     authToken: process.env.SENTRY_AUTH_TOKEN,
     release: { name: process.env.SENTRY_RELEASE ?? `issue-tracker-web@${version}` },
     sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
     telemetry: false,
   }),
   ```

**Check it**: `npm run build`. Two warnings — no auth token, no release created, no
upload — and no `.map` left in `dist/`. Open the bundle: its first line sets
`SENTRY_RELEASE` and a `sentry-dbid-…` debug id.

→ **Done when** `npm test` is fully green.

### 3. No `release` in `initSentry` — `sentry.ts`

Nothing to write. The plugin injected `SENTRY_RELEASE` in the bundle, and
`Sentry.init` reads it when you set no `release` yourself. One source of truth: the
build that produced the bundle names it. Hard-coding a release in `initSentry`
would drift from the one the maps were uploaded with.

### 4. The CI

The upload belongs to the pipeline that deploys, with the token as a secret:

```yaml
- run: npm ci && npm run build
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: my-org
    SENTRY_PROJECT: issue-tracker-web
    SENTRY_RELEASE: issue-tracker-web@${{ github.sha }}
```

A token with the `project:releases` scope only — an organization token from
**Settings → Developer Settings → Organization Tokens**.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part of
this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src vite.config.ts` returns nothing

**The behaviour is there**

- [ ] `dist/` holds no `.map` file after a build
- [ ] The bundle has no `sourceMappingURL` comment, and a `sentry-dbid-…` debug id
- [ ] The release comes from the build, not from `initSentry`
- [ ] No token in the repository

**You can explain**

- [ ] `sourcemap: true` vs `'hidden'`: who can read the source code
- [ ] What a debug id is, and why it beats matching by URL
- [ ] Why the plugin goes last
- [ ] Where the release name comes from, and why it should be unique per build

## Going further

- With a sentry.io project and a token: build, deploy `dist/` anywhere
  (`npx serve dist`), open issue 7, and compare the stack trace in Sentry with the
  one of workshop 01.
- `npx @sentry/cli sourcemaps explain <event-id>` tells you why a stack trace
  was **not** resolved.
- `release.setCommits: { auto: true }` links the release to its commits: Sentry
  then suggests the commit that introduced an issue.
