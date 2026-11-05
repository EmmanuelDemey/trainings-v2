# Sampling — you cannot keep every trace

```ts
Sentry.init({
  tracesSampleRate: 0.2,     // 20 % of the traces that START here
});
```

- Decided **once**, at the **root** of the trace, then **propagated**: a trace is
  kept whole or dropped whole — never half
- A downstream service **inherits** the decision of its caller
- Errors are **not** sampled by it: `sampleRate` (default `1`) is for errors
- `tracesSampleRate` unset and no `tracesSampler`: **tracing off** — no spans

<br />

| Environment | Typical rate |
|---|---|
| Development, Spotlight, tests | `1` |
| Low traffic production | `0.2` – `1` |
| High traffic | `0.01` – `0.1`, and a **`tracesSampler`** for what matters |

<style>
table { font-size: 0.85em; }
</style>

---

# `tracesSampler` — sample by what the trace is

```ts
Sentry.init({
  tracesSampler: ({ name, attributes, inheritOrSampleWith }) => {
    if (name === 'GET /health') return 0;              // never — it runs every 5 s
    if (String(attributes?.['url.path']).startsWith('/checkout')) return 1;  // always
    return inheritOrSampleWith(0.1);                   // the caller decided? obey; else 10 %
  },
  // drop spans, not traces — works with span streaming
  ignoreSpans: [{ name: /^GET \/assets\// }, { name: /.*/, op: 'resource.img' }],
});
```

- `tracesSampler` **replaces** `tracesSampleRate` when both are set
- `inheritOrSampleWith(rate)`: respects the **parent's** decision (from the
  `sentry-trace` / `baggage` headers), applies `rate` otherwise — return a bare
  number and you **break** traces that started elsewhere
- `ignoreSpans`: strings, RegExps (on the name), or `{ name, op, attributes }` —
  the trace stays, those spans are not sent
