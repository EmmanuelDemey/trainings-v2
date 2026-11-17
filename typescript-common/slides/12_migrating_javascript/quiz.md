# Quiz — Question 1 / 3

**A project has `"allowJs": true`, and `npx tsc --noEmit` is green. What does
that say about its `.js` files?**

- **A.** They are free of type errors
- **B.** Nothing: `allowJs` adds them to the program, it does not check them
- **C.** They have been converted to TypeScript
- **D.** They are only checked when `strict` is on

<v-click>

> ✅ **B** — `allowJs` lets `.ts` files import them, with their inferred types.
> **Checking** them takes `checkJs` — or a `// @ts-check` at the top of each file.

</v-click>

---

# Quiz — Question 2 / 3

**Why prefer `// @ts-expect-error` to `// @ts-ignore`?**

- **A.** `@ts-ignore` does not work in `.js` files
- **B.** `@ts-expect-error` is an error when the line below has **no** error
- **C.** `@ts-expect-error` also checks the type at run time
- **D.** `@ts-ignore` silences the whole file

<v-click>

> ✅ **B** — *Unused '@ts-expect-error' directive*. When the bug is fixed, the
> comment has to go: the debt cannot outlive its reason. `@ts-ignore` stays
> silent forever — even over the next error, the one nobody saw.

</v-click>

---

# Quiz — Question 3 / 3

**`src/format.js` becomes `src/format.ts`, in a `module: nodenext` project.
What happens to `import { formatPrice } from './format.js'` in the other files?**

- **A.** It must become `'./format.ts'`
- **B.** It must become `'./format'`
- **C.** Nothing: the import names the emitted file, `format.js`
- **D.** It must become `import type`

<v-click>

> ✅ **C** — `tsc` maps `./format.js` back to `format.ts`. Renaming one file does
> not ripple through the project: that is what makes a file-by-file migration
> possible.

</v-click>
