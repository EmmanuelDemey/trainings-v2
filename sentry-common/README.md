# Sentry — what the two trainings share

Not a training: the material that the two one-day Sentry trainings have in
common, written once.

| Training | Folder |
|---|---|
| Sentry for React | [`../sentry-react`](../sentry-react) |
| Sentry for NestJS | [`../sentry-nestjs`](../sentry-nestjs) |

```
CURRICULUM.md      the contract: schedule, chapters, fragments, and what every workshop does
slides/            the SDK-agnostic slide fragments, one folder per chapter, and the retro
testkit/           the fake transport the workshop specs read — plain TypeScript, no SDK import
scripts/sync.mjs   copies testkit/ into every workshop of a training
```

## How a training uses it

**Slides.** A training's chapter (`slides/04_tracing.md`) imports the fragments
it needs with Slidev's `src:`, between its own slides:

```md
---
src: ../../sentry-common/slides/04_tracing/sampling.md
---
```

A fragment never shows platform setup code (`ErrorBoundary`, `SentryModule`, a
decorator…): the slide that follows it, in the training, does. What
`@sentry/react` and `@sentry/nestjs` share — `Sentry.init` options,
`captureException`, scopes, `startSpan`, `Sentry.logger` — is fair game.

**Workshops.** Every workshop must stand alone — its starter ZIP and its online
editor only see the workshop folder — so it cannot import from here. The sync
copies what it needs into it instead:

```
testkit/*.ts    →  <workshop>/src/tests/shared/
```

The copies are **gitignored** and carry a "generated, do not edit" header. A
training's `pnpm install` (postinstall) and `pnpm run build` run the sync; so
does the CI, before testing a workshop. After editing a file here:

```bash
cd ../sentry-react && pnpm run sync     # or: node sentry-common/scripts/sync.mjs sentry-react sentry-nestjs
```

The workshop **specs** are not shared — a browser app and an HTTP API are not
checked the same way — but both are written against the test kit.

## Deploying

Each training is its own Netlify site, built from its own folder. A change here
redeploys both: `scripts/trainings-to-deploy.mjs` follows the `../sentry-common`
of their `package.json` scripts.
