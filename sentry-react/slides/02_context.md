---
layout: cover
---

# 02 - Context, grouping, filtering and PII

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Enrich** events with the user, tags, contexts and breadcrumbs — from React
  components, and at the right scope
- **Group** errors so that one bug makes one issue
- **Filter** the noise before it costs anything
- **Decide** what personal data leaves the browser — SDK v11 collects more by
  default

---
src: ../../sentry-common/slides/02_context/enrich.md
---

---

# Context from React

```tsx {all|3-6|9-13|16-18}
// Who — when the session changes, not in every component
function login(user: CurrentUser | null) {
  setUser(user);
  Sentry.setUser(user ? { id: user.id } : null);
}

// Where — on the events of one part of the tree
<Sentry.ErrorBoundary
  beforeCapture={(scope) => {
    scope.setTag('issue.id', String(id));
    scope.setContext('issue', { id, status });
  }}
>

// What before — the user's intent, not only the click
Sentry.addBreadcrumb({ category: 'ui.filter', message: `filter: ${filter}`,
  data: { filter } });
```

- `Sentry.setUser` / `setTag` at the top level go to the **isolation scope** — in
  a browser, there is one: the page
- In a component body, every render would set it again: in an **event handler**
  or an **effect**

---
src: ../../sentry-common/slides/02_context/grouping.md
---

---
src: ../../sentry-common/slides/02_context/filtering.md
---

---

# The noise of a browser

```ts
Sentry.init({
  ignoreErrors: [/ResizeObserver loop/, 'Non-Error promise rejection captured'],
  denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
  allowUrls: [/https:\/\/app\.issue-tracker\.example/],
  integrations: [Sentry.thirdPartyErrorFilterIntegration({
    filterKeys: ['issue-tracker-web'], behaviour: 'drop-error-if-exclusively-contains-third-party-frames',
  })],
});
```

- Browser **extensions** inject code in your page: their errors are not yours —
  `denyUrls`, or `allowUrls` your own origin only
- `thirdPartyErrorFilterIntegration` needs the bundler plugin's
  `applicationKey`: it marks *your* code at build time (chapter 03)
- `Script error.` with no stack: a cross-origin script without
  `crossorigin="anonymous"` — fix the tag, not the filter

---
src: ../../sentry-common/slides/02_context/pii.md
---

---

# Personal data in a browser

- **What the user typed** shows up in breadcrumbs (`console.log(form)`), in
  messages, in URLs (`?email=…`) — and in **replays** (chapter 05)
- `dataCollection` controls what the SDK collects **on its own**: user info,
  cookies, headers, query params, bodies of `fetch` calls
- What **you** pass to `setUser`, `setContext`, `addBreadcrumb` is sent as is:
  an id, not an email

```ts
Sentry.init({
  dataCollection: { userInfo: false, httpBodies: [] },
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console') return null;   // logs may hold anything
    return breadcrumb;
  },
});
```

- The last line of defence is **server-side scrubbing** in the project's
  settings — it runs before the event is stored

---
layout: cover
---

# Workshop 02

## Context & filtering
