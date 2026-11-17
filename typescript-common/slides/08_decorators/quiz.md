# Quiz — Question 2 / 3

**A method decorator returns an arrow function that calls `target(...args)`.
What breaks?**

- **A.** Nothing
- **B.** The return value is lost
- **C.** `this` inside the method is no longer the instance
- **D.** The decorator is applied twice

<v-click>

> ✅ **C** — An arrow has no `this` of its own, and `target(...args)` calls the
> method without one. Return a `function`, and call `target.call(this, ...args)`.

</v-click>

---

# Quiz — Question 3 / 3

**`node cart.ts` fails with a `SyntaxError` on `@logged`, while `tsc --noEmit`
is happy. Why?**

- **A.** Node.js needs `experimentalDecorators`
- **B.** Type stripping only removes types: a decorator is code that must be
  compiled, and no engine runs it natively yet
- **C.** `tsc --noEmit` does not check decorators
- **D.** The file must be named `.mts`

<v-click>

> ✅ **B** — Decorators are not **erasable** syntax. Run the file through a tool
> that compiles them — `tsc`, `tsx`, esbuild — and add `erasableSyntaxOnly` to the
> projects meant to run on bare Node.js.

</v-click>
