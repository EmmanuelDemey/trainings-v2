# Why source maps?

What runs is **not** what you wrote — TypeScript compiled, JSX transformed,
bundled, minified:

```text
TypeError: Cannot read properties of null (reading 'name')
  at Xe (assets/index-BRpgjg8f.js:1:48211)
  at Ro (assets/index-BRpgjg8f.js:1:91877)
```

```text
TypeError: Cannot read properties of null (reading 'name')
  at IssueDetail (src/components/IssueDetail.tsx:23:34)
      21 |   return (
      22 |     <section data-testid="issue-detail">
    > 23 |       <p>Assigned to {issue.assignee.name}</p>
```

- A **source map** maps every position of the output back to the source
- Sentry applies it **on the server**, when the event arrives — **not** in the
  browser, **not** in the SDK
- Without it: unreadable frames, **unstable grouping** — a new bundle hash at
  every deploy changes the frames

---

# Debug IDs — how Sentry finds the right map

```js
// Injected at the top of every bundle by the plugin / `sentry-cli sourcemaps inject`
e._sentryDebugIds[new Error().stack] = '730416af-ef34-475c-bed0-a045260b17fb';
//# debugId=730416af-ef34-475c-bed0-a045260b17fb
```

<div style="display: flex; gap: 2em;">
<div>

### The old way: by URL

- Upload `index-BRpgjg8f.js.map` with its URL `~/assets/…`
- Breaks with a CDN, a base path, a query string — and with **two releases**
  serving the same file name

</div>
<div>

### Debug IDs

- A **UUID per file**, in the file **and** in its map
- The event carries the debug ids of its frames; Sentry looks the map up **by
  id** — no URL, no release needed
- The default with the bundler plugins and `sentry-cli` 2+

</div>
</div>

<br />

> **Do not publish the maps.** Generate them (`hidden`: no `sourceMappingURL`
> comment), **upload** them to Sentry, **delete** them from the output before
> deploying. A public map is your source code, with its comments.
