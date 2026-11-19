# Faster builds — `--noCheck`, parallelism, stable output

```bash
npx tsc --noEmit            # CI step 1: the type check, once
npx tsc --noCheck           # CI step 2: emit .js and .d.ts, no type check (5.6)
npx tsc -b --builders 4     # TypeScript 7: build 4 referenced projects at once
npx tsc --checkers 8        # … and split the checking of one project
```

- **`--noCheck`** skips the checker: emit only — fast, but only **after** a
  separate type check. Declarations need `isolatedDeclarations` to be right
- TypeScript 7 checks in **parallel**: the order types are created in can change
  from run to run
- **`--stableTypeOrdering`** (6.0) makes 6.0 order types like 7.0: turn it on
  before upgrading, so the `.d.ts` and error messages diff cleanly between the two
