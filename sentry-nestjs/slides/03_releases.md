---
layout: cover
---

# 03 - Releases and source maps

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Name** every build with a release, and know what Sentry does with it
- **Emit** source maps from a NestJS build, and run Node with them
- **Inject** debug ids and **upload** the maps with `sentry-cli`, from the CI

---
src: ../../sentry-common/slides/03_releases/releases.md
---

---

# The release of an API

```ts
Sentry.init({
  release: process.env.SENTRY_RELEASE,   // issue-tracker-api@1.4.2, or a commit SHA
  environment: process.env.NODE_ENV,
});
```

- Left unset, `@sentry/node` looks for `SENTRY_RELEASE`, then a commit SHA in the
  usual CI and PaaS variables (`GITHUB_SHA`, `HEROKU_SLUG_COMMIT`…)
- Set it **at build time** in the image (`ENV SENTRY_RELEASE=…` in the
  Dockerfile): the same image, the same release, in every environment
- `environment` is not the release: one release goes `staging`, then `production`

---
src: ../../sentry-common/slides/03_releases/source-maps.md
---

---

# Source maps in a NestJS build

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSources": true      // the .ts inside the .map: no repository access needed
  }
}
```

```json
// package.json
"start:prod": "node --enable-source-maps --import ./dist/instrument.js dist/main.js"
```

- A server is **not minified** — but it runs `dist/**/*.js`: line numbers and
  file names are the compiled ones, and the TypeScript is gone
- `--enable-source-maps`: Node rewrites `error.stack` with the `.ts` positions —
  in your logs **and** in the events
- Upload them anyway: Sentry then shows the **source code** around each frame,
  and it works without the flag

---

# `sentry-cli`: inject, then upload

```json
"sentry:sourcemaps": "sentry-cli sourcemaps inject ./dist && sentry-cli sourcemaps upload --release \"$SENTRY_RELEASE\" ./dist"
```

```text
$ sentry-cli sourcemaps inject ./dist
  Modified: The following source files have been modified to have debug ids
    5890e90e-9f7b-59b6-adb2-7f226e16f80d - ./dist/main.js
```

- **`inject`** runs **offline**: it writes the same debug id at the end of each
  `.js` (`//# debugId=…`) and into its `.map`
- **`upload`** needs `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- Inject **before** you build the image, so the files you ship carry the ids
- Bundling with webpack or esbuild instead of `tsc`? Their Sentry plugin does both

---
src: ../../sentry-common/slides/03_releases/ci.md
---

---
layout: cover
---

# Workshop 03

## Readable stack traces
