# Integrations — Sentry where the team already is

| Integration | What it adds |
|---|---|
| **GitHub / GitLab / Bitbucket / Azure DevOps** | Commits per release, **suspect commits**, *resolve via commit*, links from frames to the code, **PR comments** on issues a PR caused |
| **Slack / Microsoft Teams** | Alert notifications — **resolve, archive, assign** from the message |
| **Jira / Linear / GitHub Issues** | Create or link a ticket from an issue — **two-way sync** of status and assignee |
| **PagerDuty / Opsgenie** | On-call routing from alerts |
| **Vercel, Netlify, Heroku…** | Releases and source maps on every deploy |
| **IDE (VS Code, JetBrains)** | Open the frame in your editor |
| **MCP server** | Ask an AI assistant about your issues, with your Sentry permissions |

<style>
table { font-size: 0.85em; }
</style>

<br />

- Installed **per organisation**, by an owner or manager — once
- **Code mappings** (repository + path) make stack frames clickable — and suspect
  commits work

---

# The ticket loop

```text
issue created ─► alert in #team-web ─► "Create Jira ticket" ─► WEB-1234
       ▲                                                          │
       │                 developer: "Fixes ISSUE-TRACKER-WEB-4A"  │
       │                          commit ─► release 1.4.1 ─► deploy
       └──── regressed? reopens, alerts again ◄── resolved in 1.4.1
```

- The **short id** (`ISSUE-TRACKER-WEB-4A`) in a commit message resolves the
  issue **in the release** that contains it
- The ticket follows: closed when the issue is resolved, reopened when it regresses
- One source of truth for the bug: the issue. The ticket is the **work**
