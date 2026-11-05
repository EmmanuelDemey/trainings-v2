# Filtering — noise is not free

Every event you send **costs quota**, **wakes alerts** and **buries** the issues that
matter. Drop it **in the SDK**, as early as possible:

```ts
Sentry.init({
  // By message (string = "contains", or a RegExp)
  ignoreErrors: [/ResizeObserver loop/, 'Non-Error promise rejection captured'],

  // Browser: by the URL of the script that threw — extensions, third parties
  denyUrls: [/extensions\//i, /^chrome-extension:\/\//i],

  // Anything else: the last word
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error instanceof ApiError && error.status < 500) return null;  // the user's doing
    return event;
  },
});
```

- `beforeSend` returns the event (maybe modified) or **`null`** to drop it
- `hint.originalException` is **the thrown value** — test its class, not
  `event.message`
- `ignoreErrors` and `denyUrls` are applied by `eventFiltersIntegration`
  (**v11** name — it was `inboundFiltersIntegration`)

---

# What to drop, what to keep

| Drop — not a bug to fix | Keep — even if it looks like noise |
|---|---|
| **4xx** caused by the user: not found, validation, unauthenticated | A **401** storm after a deploy: the session cookie changed |
| Browser **extensions**, third-party scripts | A **chunk load error** after a deploy: old tabs, new assets |
| `ResizeObserver loop…`, `AbortError` of a cancelled request | A **timeout** to your own API |
| Health checks, bots | An error that happens **once a week** — it is still a bug |

- In the product, too: **Inbound Filters** (legacy browsers, web crawlers,
  localhost) and **Spike Protection** — server side, applied **after** the
  network, but **before** the quota
- Dropping in `beforeSend` saves the **bandwidth** too — and the user's battery

<style>
table { font-size: 0.85em; }
</style>
