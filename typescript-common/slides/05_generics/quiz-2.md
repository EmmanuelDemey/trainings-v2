# Quiz — Question 3 / 3

**`pick<T extends string>(options: T[], initial: T)` accepts
`pick(['low', 'high'], 'none')` — `T` becomes `'low' | 'high' | 'none'`. What fixes it?**

- **A.** `initial: NoInfer<T>`
- **B.** `<const T extends string>`
- **C.** `initial: string`
- **D.** `options: readonly T[]`

<v-click>

> ✅ **A** — `'none'` takes part in the inference of `T`. `NoInfer<T>` makes
> `T` come from `options` only; `'none'` is then **checked** against
> `'low' | 'high'`, and refused. **B** keeps literals, but `'none'` is one too.
> **C** accepts any string: the very bug.

</v-click>
