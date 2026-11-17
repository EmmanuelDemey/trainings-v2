# Quiz — Question 1 / 3

**`const book: Book = JSON.parse(text)`. What is checked at run time?**

- **A.** Every field of `Book`
- **B.** Only that `text` is valid JSON
- **C.** Only the required fields of `Book`
- **D.** Nothing at all — not even the JSON

<v-click>

> ✅ **B** — `JSON.parse` throws on invalid JSON, and returns `any`. The
> annotation is erased: the shape of the value is never checked. To check it,
> pass it through a schema.

</v-click>

---

# Quiz — Question 2 / 3

**`const S = z.object({ at: z.iso.date().transform((d) => new Date(d)) })`.
What are `z.input<typeof S>['at']` and `z.output<typeof S>['at']`?**

- **A.** `Date` and `Date`
- **B.** `string` and `string`
- **C.** `string` and `Date`
- **D.** `Date` and `string`

<v-click>

> ✅ **C** — The input is what the schema accepts, before the `transform`: a
> string. The output is what `parse` returns: a `Date`. `z.infer` is the output.

</v-click>

---

# Quiz — Question 3 / 3

**A form library accepts a Zod, a Valibot or an ArkType schema. How?**

- **A.** It depends on all three libraries
- **B.** It reads the `~standard` property every one of them implements
- **C.** It converts each schema to JSON Schema first
- **D.** It only checks the types, at compile time

<v-click>

> ✅ **B** — Standard Schema is one interface: `schema['~standard'].validate(value)`
> returns `{ value }` or `{ issues }`, and `InferOutput` gives the type. The
> library depends on a type-only package, not on any validator.

</v-click>
