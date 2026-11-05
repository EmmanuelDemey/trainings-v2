# Personal data — v11 collects more by default

> **v11 removed `sendDefaultPii`**, replaced by **`dataCollection`** — and the
> default is now **permissive**: without configuration, user info, cookies,
> headers and **request / response bodies** are collected.

| Category | v10 default (`sendDefaultPii` unset) | v11 default |
|---|---|---|
| `userInfo` (IP, user from the framework) | `false` | `true` |
| `cookies` | not collected | `true` |
| `httpHeaders` | collected, PII scrubbed | collected |
| `httpBodies` | not collected | **all** request and response bodies |
| `urlQueryParams` | `true` | `true` |
| `databaseQueryData`, `genAI`, `queues` | not collected | collected |

- Sentry still filters **obvious secrets** (keys named `password`, `token`,
  `authorization`…) — a body field called `pwd` or `iban` is **not** obvious
- GDPR: you are the **controller**; Sentry is your **processor** — what you send
  must have a purpose

<style>
table { font-size: 0.8em; }
</style>

---

# `dataCollection` — decide, category by category

```ts
Sentry.init({
  dataCollection: {
    userInfo: false,                                    // no IP, no framework user
    cookies: false,
    httpHeaders: { request: { deny: ['authorization', 'cookie', 'x-api-key'] }, response: false },
    httpBodies: [],                                     // no body, in any direction
    urlQueryParams: { deny: ['token', 'email'] },
  },
});
```

- `true` / `false`, or `{ allow: [...] }` / `{ deny: [...] }` for key-value data
- The **user** you set yourself is still sent: `setUser({ id })` — an id, not an
  email
- Last line of defence: `beforeSend` / `beforeBreadcrumb` to **scrub** what slipped
  through — and the project's **Data Scrubbing** and **Advanced Data Scrubbing**
  rules, server side, before storage
- **Never** put personal data in a **tag** or a **message**: they are indexed,
  shown in alerts, sent to Slack and Jira
