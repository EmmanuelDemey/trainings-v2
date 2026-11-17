# Quiz — Question 1 / 3

**`function wrap<T>(value: T) { return [value]; }` — what is the type of
`wrap('a')`?**

- **A.** `any[]`
- **B.** `unknown[]`
- **C.** `string[]`
- **D.** `'a'[]`

<v-click>

> ✅ **C** — `T` is inferred from the argument. A string literal passed to a
> plain `T` is **widened** to `string`. With `<const T>`, it would be `'a'[]`.

</v-click>
