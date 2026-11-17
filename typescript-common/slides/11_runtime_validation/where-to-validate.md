# Where to validate

- At the **edges** — once, where data enters:
  - HTTP responses, request bodies, query strings
  - `process.env`, at start-up: fail **before** serving anything
  - `JSON.parse`, `localStorage`, files, messages from a queue or a worker
  - form data
- **Inside** the app, trust the types: no `parse` deep in the domain
- Zod is not the only one: **Valibot** is tree-shakable (smaller bundles),
  **ArkType** uses TypeScript syntax in strings and is fast
- `z.toJSONSchema(schema)` documents the contract for other teams —
  `{ io: 'input' }` when the schema has a `transform`
