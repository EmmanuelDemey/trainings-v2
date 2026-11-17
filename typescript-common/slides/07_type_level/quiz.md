# Quiz — Question 1 / 3

**What is `{ [K in keyof T as Exclude<K, 'password'>]: T[K] }`?**

- **A.** `T` with every key renamed to `'password'`
- **B.** `T` without its `password` key
- **C.** `T` with `password` made optional
- **D.** A compile error: `as` only accepts template literal types

<v-click>

> ✅ **B** — `as` remaps each key; `Exclude` turns `'password'` into `never`,
> and a key remapped to `never` is **dropped**. That is `Omit`, written by hand.

</v-click>

---

# Quiz — Question 2 / 3

**`type Box<T> = T extends unknown ? { value: T } : never;` — what is
`Box<string | number>`?**

- **A.** `{ value: string | number }`
- **B.** `{ value: string } | { value: number }`
- **C.** `never`
- **D.** `{ value: unknown }`

<v-click>

> ✅ **B** — A conditional type on a naked type parameter **distributes** over
> the union: one `Box` per member. `[T] extends [unknown]` would give **A**.

</v-click>

---

# Quiz — Question 3 / 3

**`type UserId = Brand<string, 'UserId'>`. What does it cost at run time?**

- **A.** One extra property on every id
- **B.** A wrapper object around every id
- **C.** Nothing: the brand only exists for the compiler
- **D.** A `Symbol` per id

<v-click>

> ✅ **C** — A `UserId` **is** a string at run time. The brand is a property
> declared on the type, never set on the value: it only stops a plain `string`
> — or an `OrderId` — from being passed where a `UserId` is expected.

</v-click>
