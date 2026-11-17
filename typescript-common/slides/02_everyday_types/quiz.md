# Quiz — Question 1 / 3

**`const SHIPPING = { EUR: 490 } satisfies Record<string, number>`. What is
the type of `SHIPPING`?**

- **A.** `Record<string, number>`
- **B.** `{ EUR: number }`
- **C.** `{ readonly EUR: 490 }`
- **D.** `any`

<v-click>

> ✅ **B** — `satisfies` **checks** the value, it does not change its type. An
> annotation would have given **A**, and lost the key. **C** needs `as const`.

</v-click>

---

# Quiz — Question 2 / 3

**`function parse(input: unknown) { return input.trim(); }` — what happens?**

- **A.** It compiles: `unknown` accepts anything
- **B.** It compiles, and throws if `input` is not a string
- **C.** ✘ `'input' is of type 'unknown'` — narrow it first
- **D.** It compiles in non-strict mode only

<v-click>

> ✅ **C** — `unknown` **accepts** anything but **allows** nothing. With `any`,
> **B** would happen: it compiles, then crashes at run time.

</v-click>

---

# Quiz — Question 3 / 3

**Which declaration gives `type Currency = 'EUR' | 'USD'` with
`(typeof CURRENCIES)[number]`?**

- **A.** `const CURRENCIES = ['EUR', 'USD'];`
- **B.** `const CURRENCIES: string[] = ['EUR', 'USD'];`
- **C.** `const CURRENCIES = ['EUR', 'USD'] as const;`
- **D.** `let CURRENCIES = ['EUR', 'USD'] as string[];`

<v-click>

> ✅ **C** — Without `as const`, an array literal is widened to `string[]`, and
> `(typeof …)[number]` is `string`. `as const` keeps each element's literal type.

</v-click>
