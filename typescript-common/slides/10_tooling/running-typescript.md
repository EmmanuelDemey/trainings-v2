# Running TypeScript

| | Checks types | Runs | Notes |
|---|---|---|---|
| `tsc` | ✅ | — | emits `.js` and `.d.ts` |
| `node file.ts` | ❌ | ✅ | type stripping: **erasable syntax only** |
| `tsx file.ts` | ❌ | ✅ | esbuild: `enum`, decorators… |
| Vite, esbuild, swc | ❌ | bundles | one file at a time |
| Deno, Bun | ❌ | ✅ | TypeScript built in |

- Only `tsc` **checks**: everything else **strips** and runs
- So the type check is a **step of its own**: `tsc --noEmit` in CI and in a
  pre-commit hook, next to the tests
