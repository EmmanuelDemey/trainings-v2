# Quiz — Question 1 / 3

**Under `verbatimModuleSyntax`, `Article` is an interface. Which import compiles?**

- **A.** `import { Article } from './articles.ts';`
- **B.** `import { type Article } from './articles.ts';`
- **C.** `import Article from './articles.ts';`
- **D.** All three

<v-click>

> ✅ **B** — Under `verbatimModuleSyntax`, an import not marked `type` is kept in
> the JavaScript — and `Article` does not exist at run time. `import type { Article }`
> works as well.

</v-click>

---

# Quiz — Question 2 / 3

**A package ships no types and has no `@types`. What does
`declare module 'legacy-lib';` give you?**

- **A.** Types generated from the package's JavaScript
- **B.** An error until you list every export
- **C.** An import that compiles — with everything it exports typed `any`
- **D.** A type check at run time

<v-click>

> ✅ **C** — A **shorthand** ambient module silences the error, and switches the
> checker off for that package. A first step — then describe what you use, with a
> `declare module 'legacy-lib' { … }` block.

</v-click>

---

# Quiz — Question 3 / 3

**A library declares `export interface Theme {}`. How do you add a `brand`
color to it, from your code?**

- **A.** `type Theme = Theme & { brand: string }`
- **B.** `declare module 'the-lib' { interface Theme { brand: string } }`
- **C.** Fork the library
- **D.** `declare global { interface Theme { brand: string } }`

<v-click>

> ✅ **B** — **Module augmentation**: the two `interface Theme` declarations merge.
> **A** creates a new type nobody else uses; **D** declares a different, global
> `Theme`.

</v-click>
