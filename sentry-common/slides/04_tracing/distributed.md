# Distributed tracing — one trace, two services

```http
GET /issues/7 HTTP/1.1
Host: api.issue-tracker.example
sentry-trace: 0123456789abcdef0123456789abcdef-89abcdef01234567-1
baggage: sentry-trace_id=0123456789abcdef0123456789abcdef,sentry-sample_rate=0.2,sentry-sampled=true,sentry-release=web%401.4.0,sentry-environment=production
```

<div style="display: flex; gap: 2em;">
<div>

### The caller

- Adds `sentry-trace` (`traceId-spanId-sampled`) and `baggage` (the **dynamic
  sampling context**) to its outgoing requests
- Browser: **only** to the origins of `tracePropagationTargets` — same origin by
  default

</div>
<div>

### The callee

- Reads them, **continues** the trace: same trace id, its segment is a child of
  the caller's span
- **Inherits** the sampling decision
- W3C `traceparent` is supported too — for OpenTelemetry services

</div>
</div>

---

# Propagation targets — whose business is your trace?

```ts
Sentry.init({
  tracePropagationTargets: ['https://api.issue-tracker.example', /^\/api\//],
});
```

- **Never** to a third party (a CDN, an analytics endpoint, a payment provider):
  - it would receive your **trace ids** and your **release** name
  - a cross-origin request with custom headers needs a **CORS preflight** — and the
    third party will refuse `sentry-trace` and `baggage`
- **Your** API must allow them: `Access-Control-Allow-Headers: sentry-trace, baggage`
- A string matches **anywhere** in the URL, a RegExp is tested on the full URL
- Server side: the HTTP client instrumentation propagates to **every** host by
  default — `tracePropagationTargets` limits it there too
