# Quiz — Question 1 / 3

**A field is declared `private secret: string`. Which line gives its value at
run time?**

- **A.** None: the field does not exist at run time
- **B.** `JSON.stringify(instance)`
- **C.** Only a method of the class
- **D.** It throws a `TypeError`

<v-click>

> ✅ **B** — `private` is checked by the compiler, then **erased**: the field is
> a plain property. `#secret` would be invisible to `JSON.stringify`,
> `Object.keys` — and to any code outside the class.

</v-click>

---

# Quiz — Question 2 / 3

**`class Cat implements Pet` compiles. What does `implements` give `Cat`?**

- **A.** The methods of `Pet`, with their implementation
- **B.** Nothing: it checks `Cat` against `Pet`, that's all
- **C.** The ability to be passed where a `Pet` is expected
- **D.** The types of the parameters of its methods

<v-click>

> ✅ **B** — **C** is true without `implements` too: types are **structural**, any
> object with the right shape is a `Pet`. `implements` only moves the error to
> the class, where it is easy to read. Even parameter types are **not** inferred from it.

</v-click>

---

# Quiz — Question 3 / 3

**With `erasableSyntaxOnly`, which line compiles?**

- **A.** `enum Role { Admin, User }`
- **B.** `constructor(private readonly repo: Repo) {}`
- **C.** `const Role = { Admin: 'admin', User: 'user' } as const;`
- **D.** `namespace Utils { export const pi = 3.14; }`

<v-click>

> ✅ **C** — **A**, **B** and **D** all generate JavaScript that is not in the
> source. Node.js only **removes** the types: it cannot run them. An `as const`
> object is plain JavaScript, with a type derived from it.

</v-click>
