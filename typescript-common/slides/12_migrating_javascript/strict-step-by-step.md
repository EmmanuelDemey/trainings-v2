# `strict`, step by step

- **TypeScript 7** turns `strict` on **by default**: an old project that never
  set it gets every check at once. Say `"strict": false` explicitly while you migrate
- Then flag by flag — the order of the most value for the least work:

| Step | Flag | What it finds |
|---|---|---|
| 1 | `noImplicitAny` | Every untyped parameter — the bulk of the work |
| 2 | `strictNullChecks` | Every `null` / `undefined` not handled — the bugs |
| 3 | `strict: true` | The rest of the family: `strictFunctionTypes`, `useUnknownInCatchVariables`… |
| 4 | Beyond | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (chapter 10) |

- Per **folder** instead of per flag: one `tsconfig.json` per package, wired with
  **project references** — the new packages strict from day one
