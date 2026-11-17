# Running TypeScript

| | Checks the types? | How |
|---|---|---|
| `tsc` | ✔ | Checks, then writes `.js` files |
| `node file.ts` | ✘ | Node.js 22.18+ **strips** the types and runs what is left |
| `tsx file.ts` | ✘ | esbuild strips the types — and supports every syntax |
| Vite, Vitest, esbuild… | ✘ | Same: they **transpile**, they never check |

- Every runner **erases** the types — only `tsc` reads them
- So a project runs with one tool, and **checks** with `tsc --noEmit` — in the
  editor, in a pre-commit hook, in the CI
