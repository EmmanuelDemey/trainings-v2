---
layout: cover
---

# 03 - Releases and source maps

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Name** every build with a release, and tell which one broke
- **Explain** why a minified stack trace is unreadable, and how a source map and
  a debug id fix it
- **Configure** `@sentry/vite-plugin`: hidden maps, debug ids, upload, deletion
- **Run** the upload in the CI, with the token as a secret

---
src: ../../sentry-common/slides/03_releases/releases.md
---

---
src: ../../sentry-common/slides/03_releases/source-maps.md
---

---

# Source maps in a Vite build

```ts {all|5|10-17}
// vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: { sourcemap: 'hidden' },
  plugins: [
    react(),
    sentryVitePlugin({               // LAST: it reads what the others produced
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.SENTRY_RELEASE },
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
    }),
  ],
});
```

- `sourcemap: true` **publishes** the maps — your source code, comments included
- `'hidden'`: the maps are written, the bundle does not point to them
- Without `authToken`: a warning, no upload — the build still succeeds

---

# What the plugin injects

```js
// the first line of dist/assets/index-Bhh_QhS_.js — formatted
var e = globalThis;
e.SENTRY_RELEASE = { id: 'issue-tracker-web@1.4.0' };
var t = new e.Error().stack;
e._sentryDebugIds[t] = '730416af-ef34-475c-bed0-a045260b17fb';
```

- **The release**: `Sentry.init` reads `SENTRY_RELEASE` when you set no `release` —
  one source of truth, the build
- **The debug id**: the same UUID is written in the `.map` and uploaded with it.
  Sentry matches the bundle and its map by **id**, not by URL — CDN, hashes,
  `/assets/` vs `/static/`: it does not matter
- `applicationKey: 'issue-tracker-web'`: also marks **your** code — what
  `thirdPartyErrorFilterIntegration` (chapter 02) uses to tell it from an extension's

---
src: ../../sentry-common/slides/03_releases/ci.md
---

---
layout: cover
---

# Workshop 03

## Readable stack traces
