# Triage — an issue stream the team reads

<div style="display: flex; gap: 2em;">
<div>

### The states of an issue

- **Unresolved** — new, ongoing, **regressed**, **escalating** (a spike vs its
  history)
- **Resolved** — *now*, *in the next release*, *in commit `3f2a9c1`* (from a
  commit message: `Fixes ISSUE-TRACKER-WEB-4A`)
- **Archived** — *until it escalates*, *for 24 h*, *until 100 more events*,
  *forever* — the honest word for "ignored"
- **Merged** — the grouping got it wrong

</div>
<div>

### Who looks at what

- **Ownership rules**: `path:src/checkout/** #payments`,
  `url:*/api/issues/* #platform`, `tag:tenant:acme owner@acme.com`
- **Code owners**: imported from `CODEOWNERS`
- **Suspect commits** → the author is suggested
- **Priority** (high / medium / low), computed, editable — sort by it

</div>
</div>

<br />

> A daily ritual beats any tool: **15 minutes**, new and escalating issues only,
> each one gets an owner, a resolution, or is archived with a reason.

---

# Searching

```text
is:unresolved is:for_review environment:production release:latest
issue.priority:[high, medium] assigned:#payments
user.id:42 has:replay
browser.name:Safari level:error firstSeen:-24h
```

- **Saved searches** per team, in the sidebar
- **Discover / Explore**: the same query language, over events, spans, logs — then
  **dashboards** with the charts that matter (errors per release, p95 of
  `GET /issues/:id`, crash-free sessions)
- **Seer** (AI, opt-in, per organisation): root cause suggestions and fix
  proposals from the stack trace and the code — read them as a hint, not a verdict
