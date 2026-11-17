# Quiz — Question 1 / 3

**`type Shape = { kind: 'circle'; radius: number } | { kind: 'square'; side: number }`.
Inside `if (shape.kind === 'circle')`, what is `shape.side`?**

- **A.** `number`
- **B.** `number | undefined`
- **C.** ✘ Property 'side' does not exist
- **D.** `never`

<v-click>

> ✅ **C** — Checking the discriminant narrows `shape` to the circle member,
> which has no `side`. With a "bag of optionals", it would have been **B** —
> and nobody would know whether it is set.

</v-click>

---

# Quiz — Question 2 / 3

**Why does `default: return assertNever(value)` break the build when a member
is added to the union?**

- **A.** Because `assertNever` throws at run time
- **B.** Because the new member is not assignable to `never`
- **C.** Because `default` is forbidden on a union
- **D.** It does not: only a test can find it

<v-click>

> ✅ **B** — In `default`, `value` has the type of the members **not handled**.
> When there are none, it is `never` and the call compiles. Add a member,
> and it no longer fits in `never`.

</v-click>

---

# Quiz — Question 3 / 3

**What is the difference between `x is T` and `asserts x is T`?**

- **A.** None, they are synonyms
- **B.** `is` narrows inside an `if`; `asserts` narrows after the call, or throws
- **C.** `asserts` is checked at run time, `is` is not
- **D.** `is` works on classes only

<v-click>

> ✅ **B** — A type guard returns a `boolean`, used in a condition. An assertion
> function returns nothing: if it returns at all, the condition holds. Neither
> is checked by the compiler — both are **trusted**.

</v-click>
