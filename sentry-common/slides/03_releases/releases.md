# Releases — which version broke?

```ts
Sentry.init({
  release: 'issue-tracker-web@1.4.0',   // or injected by the build plugin / sentry-cli
  environment: 'production',
});
```

<div style="display: flex; gap: 2em;">
<div>

### What a release unlocks

- **First seen in** / **last seen in**: the version that introduced a bug
- **Regressions**: an issue *resolved in 1.4.0* that comes back in 1.4.1 reopens
  itself — and alerts
- **Release health**: crash-free sessions and users, adoption — per version
- **Suspect commits** and **suspect PRs**, with the repository integration
- Source maps are **matched** to the build (next slides)

</div>
<div>

### Naming

- **Unique per deployable**, stable across environments: the same build goes to
  staging then production
- `package@version` or a **git SHA** — `issue-tracker-api@1.4.0+3f2a9c1`
- Set **at build time**, not computed at runtime from the clock
- **Environment** ≠ release: one release, several environments

</div>
</div>

---

# Creating a release — `sentry-cli`

```bash
export SENTRY_AUTH_TOKEN=…  SENTRY_ORG=acme  SENTRY_PROJECT=issue-tracker-web
VERSION="issue-tracker-web@$(git rev-parse --short HEAD)"

sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto     # commits since the previous release
# … build, upload source maps …
sentry-cli releases finalize "$VERSION"
sentry-cli deploys new --release "$VERSION" -e production
```

- `set-commits --auto` needs the **GitHub / GitLab integration** (chapter 06):
  Sentry reads the commits, then blames the lines of the stack trace
- `finalize` marks the release as **released**: it drives "Resolved in next
  release"
- The bundler plugins (`@sentry/vite-plugin`, `@sentry/webpack-plugin`…) do all
  of it at build time — one plugin, no script
- The **auth token** is a **secret** — organisation token, CI only, never in the
  bundle, never in the repository
