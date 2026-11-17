# Quiz — Question 1 / 3

**`node src/cli.ts` prints the right output, but `npx tsc --noEmit` reports
three errors. How is that possible?**

- **A.** Node.js uses an older version of TypeScript
- **B.** Node.js strips the types without checking them
- **C.** `tsc --noEmit` only checks, so its errors do not count
- **D.** Node.js fixes the errors before running the file

<v-click>

> ✅ **B** — Running and checking are two different jobs. Node.js, tsx, Vite and
> Vitest all **erase** the types; only `tsc` (and the editor) **reads** them.
> A green run says nothing about the types.

</v-click>

---

# Quiz — Question 2 / 3

**With `strict` off, what is the type of `title` in
`function createTodo(title) {}`?**

- **A.** `string`
- **B.** `unknown`
- **C.** `any`
- **D.** It is a compile error

<v-click>

> ✅ **C** — An **implicit `any`**: anything is accepted, nothing is checked.
> With `strict` (precisely `noImplicitAny`), it becomes the error
> *Parameter 'title' implicitly has an 'any' type* — which is the point.

</v-click>

---

# Quiz — Question 3 / 3

**Why does `node file.ts` refuse an `enum`, when it accepts an interface?**

- **A.** Node.js does not support TypeScript 5 syntax
- **B.** An `enum` generates JavaScript code; an interface is erased entirely
- **C.** An `enum` needs `"strict": true`
- **D.** Interfaces are part of JavaScript

<v-click>

> ✅ **B** — Type stripping can only **remove** text. An `enum` becomes an
> object at run time: it is not erasable syntax. `"erasableSyntaxOnly": true`
> makes `tsc` report it before Node.js does.

</v-click>
