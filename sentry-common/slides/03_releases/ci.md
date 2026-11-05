# In the CI

```yaml
# .github/workflows/deploy.yml
- run: npm ci
- run: npm run build                 # the plugin / sentry-cli: inject, upload, delete
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: acme
    SENTRY_PROJECT: issue-tracker-web
    SENTRY_RELEASE: issue-tracker-web@${{ github.sha }}
- run: ./deploy.sh
- run: npx @sentry/cli deploys new --release "issue-tracker-web@${{ github.sha }}" -e production
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

- **Build once**, upload once, deploy the **same** artefact everywhere — a rebuild
  per environment produces different debug ids
- No token on a developer's machine, on a fork's PR: the plugin **warns** and
  uploads nothing — the build still passes
- Check it: **Settings → Source Maps** lists the uploaded artefacts; an event's
  **"Unminify"** panel says why a frame was not resolved

---

# When stack traces stay unreadable

| Symptom | Cause |
|---|---|
| Frames still minified, *"missing source map"* | Upload skipped (no token), or the deployed bundle is not the uploaded one (rebuilt after) |
| *"Debug id not found"* | `inject` ran **after** the upload, or a CDN / post-processor rewrote the file |
| Right file, wrong line | The map was generated **before** a second minification step |
| Server frames resolved, but no source lines | Maps uploaded without `sourcesContent` — `inlineSources` |
| Node: local stack traces wrong too | `node --enable-source-maps` missing — the runtime's own traces |

<style>
table { font-size: 0.85em; }
</style>

<br />

- `sentry-cli sourcemaps explain <event id>` — Sentry says, step by step, why an
  event's frames were or were not resolved
