# Production checklist — the SDK

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Setup

- [ ] `Sentry.init` **once**, **first**, in a function the app and the tests call
- [ ] `dsn`, `environment`, `release` from the **build / environment** — never
  hard-coded
- [ ] Spotlight in development only; `debug: false` in production
- [ ] The framework's error hooks wired: nothing the framework catches is lost
- [ ] Errors you handle **and** that mean a bug are **captured**

</div>
<div>

### Data

- [ ] `setUser({ id })` on login, `setUser(null)` on logout — no e-mail
- [ ] Tags for the low-cardinality dimensions you will search by
- [ ] **`dataCollection`** decided — bodies, headers, cookies, query params
- [ ] Data scrubbing rules in the project for what slipped through
- [ ] Constant messages, variables in tags / contexts; fingerprints where the
  stack lies

</div>
</div>

---

# Production checklist — shipping and operating

<div style="display: flex; gap: 2em; font-size: 0.9em;">
<div>

### Shipping

- [ ] Source maps **uploaded** with debug ids, **not published**
- [ ] One release per build, created in the **CI** with its commits
- [ ] A **deploy** recorded per environment
- [ ] `tracesSampler` with `inheritOrSampleWith`; health checks at 0
- [ ] `tracePropagationTargets`: your origins only

</div>
<div>

### Operating

- [ ] **Ownership rules** / code owners: every issue has a team
- [ ] **Three alerts** to start — new high-priority issue, crash-free rate, p95
- [ ] The repository and the chat integrations installed
- [ ] A **daily triage**, 15 minutes
- [ ] Budgets per category, spike protection on, **Stats** checked monthly

</div>
</div>
