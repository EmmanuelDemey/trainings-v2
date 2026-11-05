# What the SDK catches on its own — and what it cannot

<div style="display: flex; gap: 2em;">
<div>

### Caught automatically

- **Uncaught** exceptions and **unhandled** promise rejections — the runtime's
  global handlers
- Errors the **framework** reports through the hooks the SDK plugs into
  (React's root error callbacks, NestJS's exception filters)
- Marked `handled: false` — they **crash** a session

</div>
<div>

### Invisible to the SDK

- Anything **caught** by your code: a `try/catch`, a `.catch()`, a query
  library's error state, a toast
- A `fetch` that answers **500**: not an exception — `fetch` only rejects on a
  network failure
- An error your framework **turns into a response** without telling anyone

</div>
</div>

<br />

> The rule: **an error you handle, you capture** — when it means a bug. An error
> that is the user's doing (a 404, a validation error) is *not* captured: it is
> not something a developer must fix.

---

# Capturing by hand

```ts
// An exception — the stack trace is the one of `error`
Sentry.captureException(error);

// Not an Error? Wrap it — a string has no stack trace
Sentry.captureException(new Error(`Payment provider answered ${status}`));

// A message: no exception, still an issue — for "this should never happen"
Sentry.captureMessage('Cart total is negative', 'warning');

// The id of the event: show it to the user, put it in a support ticket
const eventId = Sentry.captureException(error);
```

- **Always capture an `Error`**: a thrown string or object loses the stack trace —
  Sentry groups it by message, and every variant becomes its own issue
- `cause` is kept: `new Error('Saving failed', { cause: error })` sends **both**
  exceptions, chained
- Levels: `fatal`, `error` (default), `warning`, `info`, `debug` — they filter the
  issue stream and the alerts
