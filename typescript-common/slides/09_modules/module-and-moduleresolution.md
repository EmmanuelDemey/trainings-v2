# `module` and `moduleResolution`

| Target | `module` | Imports look like |
|---|---|---|
| **Node.js** (code that runs as is, libraries) | `nodenext` | `'./articles.ts'`, `'./articles.js'` — the extension is **required** |
| **A bundler** (Vite, webpack, esbuild) | `preserve` (+ `moduleResolution: bundler`) | `'./articles'` — no extension needed |

- `nodenext` follows Node.js's rules: ESM or CommonJS from `"type"` in
  `package.json` and the extension (`.mts`, `.cts`)
- `bundler` is more lenient — and lets through imports Node.js would refuse
- Pick the one that matches **what runs the code**, not the most lenient one
- `node20` pins Node.js 20+ behaviour; `nodenext` follows the latest Node.js
