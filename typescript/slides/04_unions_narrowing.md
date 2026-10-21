---
layout: cover
---

# 4 - Unions & narrowing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Describe** a set of values with **literal types** and **unions**
- **Combine** types with an **intersection**
- **Narrow** a union with `typeof`, `in`, `instanceof`, equality and truthiness
- **Model** variants with a **discriminated union** — and make impossible states unwritable
- **Write** type guards (`is`) and assertion functions (`asserts`)
- **Turn** a forgotten case into a compile error, with `never`

---

# Literal types

A type can be **one value**:

```ts
type Status = 'idle' | 'loading' | 'success' | 'error';
type Rating = 1 | 2 | 3 | 4 | 5;
type Yes = true;

function setStatus(status: Status) {}

setStatus('loading');     // ✔
setStatus('pending');     // ✘ Argument of type '"pending"' is not assignable to parameter of type 'Status'
```

- Autocompletion, typos caught, refactoring safe
- The JavaScript-friendly replacement for `enum`

---

# Unions and intersections

```ts
type Id = string | number;                 // one OR the other
type Timestamped = { createdAt: Date };
type Post = { title: string } & Timestamped;   // both at once

function format(id: Id) {
  id.toUpperCase();   // ✘ Property 'toUpperCase' does not exist on type 'number'
}
```

- On a union, only what is **common to every member** is allowed
- To use the rest, **narrow** first

```ts
type Impossible = string & number;   // never — no value is both
```

---

# Narrowing

The checker follows your **control flow**:

```ts
function format(value: string | number | Date | null) {
  if (value === null) return '';                     // equality
  if (typeof value === 'string') return value.trim();      // string
  if (typeof value === 'number') return value.toFixed(2);  // number
  return value.toISOString();                        // only Date is left
}

function area(shape: Circle | Square) {
  if ('radius' in shape) return Math.PI * shape.radius ** 2;   // in
  return shape.side ** 2;
}

try { … } catch (error) {                            // unknown
  if (error instanceof HttpError) error.status;      // instanceof
}

function greet(name?: string) {
  if (name) return `Hello ${name}`;                  // truthiness: not undefined, not ''
}
```

---

# A bag of optional fields

```ts
type PostAttachment = {
  type: string;            // "image", "video" or "audio"
  url: string;
  altText?: string;        // images only
  thumbnailUrl?: string;   // videos only
  duration?: number;       // videos and sounds
  autoplay?: boolean;      // videos only
};
```

- An image **without** `altText` compiles
- A sound **with** an `autoplay` compiles
- `attachment.duration` is `number | undefined` — even when you know it is a video
- `type: 'imgae'` compiles

> The type allows far more states than the domain does.

---

# Discriminated unions

```ts
type Image = { kind: 'image'; url: string; altText: string };
type Video = { kind: 'video'; url: string; thumbnailUrl: string; duration: number; autoplay: boolean };
type Audio = { kind: 'audio'; url: string; duration: number };

type Attachment = Image | Video | Audio;

function render(attachment: Attachment): string {
  switch (attachment.kind) {
    case 'image':
      return `<img src="${attachment.url}" alt="${attachment.altText}">`;   // Image
    case 'video':
      return `<video src="${attachment.url}" poster="${attachment.thumbnailUrl}">`;
    case 'audio':
      return `<audio src="${attachment.url}" controls>`;
  }
}
```

- One **literal** field common to every member: the **discriminant**
- Checking it narrows to **one** member — and its fields are all there

---

# Make impossible states unwritable

```ts
type Upload = {                                     // 16 combinations, 4 make sense
  status: 'idle' | 'uploading' | 'done' | 'failed';
  progress?: number;
  error?: string;
};

type Upload =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'done'; url: string }
  | { status: 'failed'; error: string };

const upload: Upload = { status: 'done', progress: 1 };
// ✘ Object literal may only specify known properties, and 'progress' does not exist
```

- The same move for API responses, Redux actions, form steps, events…

---

# Exhaustiveness with `never`

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function render(attachment: Attachment): string {
  switch (attachment.kind) {
    case 'image': return …;
    case 'video': return …;
    case 'audio': return …;
    default:
      return assertNever(attachment);   // attachment: never — every case is handled
  }
}
```

Add `| Gif` to `Attachment`:

```
✘ Argument of type 'Gif' is not assignable to parameter of type 'never'.
```

> The compiler lists every `switch` to update. No test needed to find them.

---

# Type guards

```ts
function isPlayable(attachment: Attachment): attachment is Video | Audio {
  return 'duration' in attachment;
}

attachments.filter(isPlayable).map((a) => a.duration);   // (Video | Audio)[]

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}
```

- A function returning `boolean` that **teaches** the checker what `true` means
- Since TypeScript 5.5, simple guards are **inferred**:
  `attachments.filter((a) => a.kind === 'image')` is already `Image[]`
- ⚠️ The checker **trusts** you: a wrong guard is a lie it will believe

---

# Assertion functions

```ts
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('Not a string');
}

const input: unknown = JSON.parse(body);
assert(typeof input === 'object' && input !== null, 'Not an object');
// input: object — for the rest of the block

const name: unknown = Reflect.get(input, 'name');
assertIsString(name);
name.toUpperCase();           // name: string
```

- A guard that **throws** instead of returning `false`
- Must be declared with an **explicit** type annotation (`function`, or a typed `const`)
- Parsing `unknown` by hand gets long fast: that is what **Zod** is for

---

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

---
layout: cover
---

# Hands-on

## Workshop 4 - Unions & narrowing
