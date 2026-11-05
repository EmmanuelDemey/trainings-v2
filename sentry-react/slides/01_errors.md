---
layout: cover
---

# 01 - Capturing errors

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** an event from an issue, and read what an envelope carries
- **Start** the SDK in a React app — once, before the first render
- **Catch** rendering errors with `Sentry.ErrorBoundary`, and show the user the
  id of the event
- **Plug** the SDK into React 19's root error hooks
- **Report** the errors your UI handles, which nobody else will

---
src: ../../sentry-common/slides/01_errors/events-issues.md
---

---
src: ../../sentry-common/slides/01_errors/sdk-anatomy.md
---

---

# `Sentry.init` in a React app

```tsx {all|6-13|16-17}
// src/main.tsx
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';

// FIRST — before React renders anything.
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    // chapters 04 and 05 add tracing, replay, feedback here
    ...(import.meta.env.DEV ? [Sentry.spotlightBrowserIntegration()] : []),
  ],
});

createRoot(document.getElementById('root')!, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(<App />);
```

- The DSN is **public**: it ends up in the bundle, it only allows sending events
- `import.meta.env.VITE_*`: Vite inlines it at build time — one bundle per
  environment, or a runtime config

---
src: ../../sentry-common/slides/01_errors/scopes.md
---

---
src: ../../sentry-common/slides/01_errors/capturing.md
---

---

# What React does with an error

- An error **while rendering** (or in a lifecycle, or an effect) unmounts the
  tree up to the nearest **error boundary** — none? **The whole app** goes blank
- An error in an **event handler** or a `setTimeout` is not React's business:
  it reaches `window.onerror` — the SDK's global handlers report it
- A boundary is a **class** component: `getDerivedStateFromError` +
  `componentDidCatch`. `Sentry.ErrorBoundary` is that class, already written

```tsx
<Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <IssueDetail id={id} />
</Sentry.ErrorBoundary>
```

- In development, React **logs** the error even when a boundary catches it —
  that is not a second report

---

# `Sentry.ErrorBoundary`

```tsx {all|2|3-5|6-8|10-11}
<Sentry.ErrorBoundary
  key={selectedId}
  fallback={({ error, eventId, resetError }) => (
    <ErrorFallback eventId={eventId} onRetry={resetError} />
  )}
  beforeCapture={(scope) => {
    scope.setTag('issue.id', String(selectedId));     // chapter 02
  }}
  onError={(error, componentStack, eventId) => { /* your own logging */ }}
  showDialog          // the Sentry crash-report dialog — or your own form, chapter 05
>
  <IssueDetail id={selectedId} />
</Sentry.ErrorBoundary>
```

- `fallback` as a **function**: it receives the `eventId` — show it, support can
  search for it
- `key`: a new key, a fresh boundary — opening another issue leaves the fallback
- The event carries the **component stack** as a linked error: *which* component
  threw, not only which function
- `withErrorBoundary(Component, options)` — the same, as a HOC

---

# React 19 — the root error hooks

```tsx
createRoot(container, {
  onUncaughtError: Sentry.reactErrorHandler(),      // no boundary caught it
  onCaughtError: Sentry.reactErrorHandler(),        // a boundary caught it
  onRecoverableError: Sentry.reactErrorHandler(),   // React recovered (hydration…)
});
```

- React 19 no longer rethrows caught errors to `window.onerror`: these three
  callbacks are **where errors go**
- `onCaughtError` and `Sentry.ErrorBoundary` both report: pick **one** — keep the
  boundaries (they give you `beforeCapture`, `fallback`), leave `onCaughtError` out
- With a callback — `reactErrorHandler((error, info, eventId) => …)` — the error
  is marked `handled: true`
- `hydrateRoot` takes the same three options

---

# The errors nobody sees

```tsx
fetchIssue(id)
  .then((issue) => setState({ status: 'success', issue }))
  .catch((error) => {
    Sentry.captureException(error);              // nobody else will
    setState({ status: 'error', error });
  });
```

- A `catch` that shows a message **swallows** the error: React never sees it, the
  browser never sees it
- `captureException` returns the **event id** — and marks the event
  `handled: true`: it does not crash the session
- TanStack Query? One place for all of them:
  `new QueryCache({ onError: (error) => Sentry.captureException(error) })`
- Throw `Error`s, not strings: no stack trace without an `Error`

---
layout: cover
---

# Workshop 01

## First errors
