# Quiz — Question 1 / 3

**What is `Partial<Omit<User, 'id'>>`?**

- **A.** A user whose `id` is optional
- **B.** Every field of a user but `id`, each optional
- **C.** Every field of a user, each optional, `id` included
- **D.** A compile error: utility types cannot be nested

<v-click>

> ✅ **B** — Read inside out: `Omit` removes `id`, then `Partial` makes what
> is left optional. That is the body of a PATCH: it can never carry an `id`.

</v-click>

---

# Quiz — Question 2 / 3

**`const SIZES = ['S', 'M', 'L'];` — what is `(typeof SIZES)[number]`?**

- **A.** `'S' | 'M' | 'L'`
- **B.** `string`
- **C.** `number`
- **D.** A compile error

<v-click>

> ✅ **B** — Without `as const`, the array is widened to `string[]`, and its
> elements to `string`. `const SIZES = ['S', 'M', 'L'] as const` gives **A**.

</v-click>

---

# Quiz — Question 3 / 3

**`async function load(): Promise<Config>` — which gives `Config`?**

- **A.** `ReturnType<load>`
- **B.** `ReturnType<typeof load>`
- **C.** `Awaited<ReturnType<typeof load>>`
- **D.** `Awaited<typeof load>`

<v-click>

> ✅ **C** — `load` is a value: its type is `typeof load`. `ReturnType` of it
> is `Promise<Config>`, and `Awaited` unwraps it. **A** does not compile; **B**
> is the promise; **D** leaves the function type as it is.

</v-click>
