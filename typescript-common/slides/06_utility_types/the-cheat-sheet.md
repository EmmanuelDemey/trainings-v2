# The cheat sheet

| Utility | Gives |
|---|---|
| `Partial<T>` / `Required<T>` / `Readonly<T>` | every property optional / required / readonly |
| `Pick<T, K>` / `Omit<T, K>` | only the keys `K` / every key but `K` |
| `Record<K, V>` | one `V` per key of `K` |
| `Exclude<U, X>` / `Extract<U, X>` | the members of `U` not assignable / assignable to `X` |
| `NonNullable<T>` | `T` without `null` and `undefined` |
| `ReturnType<F>` / `Parameters<F>` | the return type / the parameter tuple of a function type |
| `Awaited<T>` | what a promise resolves to |
| `InstanceType<C>` / `ConstructorParameters<C>` | what a constructor builds / takes |

All of them live in `lib.es5.d.ts` — and are written in plain TypeScript.
The same file also has `NoInfer` (chapter 5), `ThisParameterType`,
`OmitThisParameter`, and the string ones — `Uppercase`, `Capitalize`… (chapter
7) — declared `intrinsic`: built into the compiler.

<!--
Checked against lib.es5.d.ts of TypeScript 7.0.2: the 14 utilities of the
table + NoInfer, ThisParameterType, OmitThisParameter and the 4 intrinsic
string types. Nothing new since 5.4 (NoInfer).
-->
