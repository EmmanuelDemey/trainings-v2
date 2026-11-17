---
layout: cover
---

# 4 - Unions & narrowing

---
src: ../../typescript-common/slides/04_unions_narrowing/learning-objectives.md
---

---

# Literal types

A type can be **one value**:

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error';
type Size = 'sm' | 'md' | 'lg';
type Yes = true;

const [status, setStatus] = useState<Status>('idle');

setStatus('loading');     // ✔
setStatus('pending');     // ✘ Argument of type '"pending"' is not assignable to parameter of type 'SetStateAction<Status>'
<Spinner size="xl" />     // ✘ Type '"xl"' is not assignable to type 'Size'
```

- Autocompletion, typos caught, refactoring safe
- The JavaScript-friendly replacement for `enum`

---

# Unions and intersections

```tsx
type Id = string | number;                       // one OR the other
type Timestamped = { createdAt: Date };
type PostProps = { title: string } & Timestamped;   // both at once

function UserLink({ id }: { id: Id }) {
  return <a href={`/users/${id.toUpperCase()}`}>{id}</a>;
  // ✘ Property 'toUpperCase' does not exist on type 'number'
}
```

- On a union, only what is **common to every member** is allowed
- To use the rest, **narrow** first

```tsx
type Impossible = string & number;   // never — no value is both
```

---

# Narrowing

The checker follows your **control flow**:

```tsx
function Cell({ value }: { value: string | number | Date | null }) {
  if (value === null) return <td />;                                 // equality
  if (typeof value === 'string') return <td>{value.trim()}</td>;          // string
  if (typeof value === 'number') return <td>{value.toFixed(2)}</td>;      // number
  return <td>{value.toLocaleDateString()}</td>;                      // only Date is left
}

function Shape({ shape }: { shape: Circle | Square }) {
  if ('radius' in shape) return <circle r={shape.radius} />;         // in
  return <rect width={shape.side} height={shape.side} />;
}

try { … } catch (error) {                                            // unknown
  if (error instanceof HttpError) error.status;                      // instanceof
}

function Greeting({ name }: { name?: string }) {
  if (name) return <p>Hello {name}</p>;                    // truthiness: not undefined, not ''
}
```

---

# Narrowing keeps getting smarter

```tsx
const ids = ['a1', undefined, 'b2'].filter((id) => id !== undefined);
// string[] — the predicate `id is string` is inferred (5.5)

function Tags({ value }: { value: string | number }) {
  if (typeof value === 'string') {
    return tags.map((tag) => <li key={tag}>{tag}:{value.toUpperCase()}</li>);   // still string in the closure (5.4)
  }
  return null;
}

function Field({ values, name }: { values: Record<string, unknown>; name: string }) {
  if (typeof values[name] === 'string') return <input defaultValue={values[name].trim()} />;   // obj[key], key constant (5.5)
}

if (/^\d+$/) { … }                    // ✘ This kind of expression is always truthy. (5.6)
if ((n: number) => n > 0) { … }       // ✘ the same: a function is never falsy
```

- Before 5.5, `.filter(x => x !== undefined)` kept `(string | undefined)[]`
- In a closure — an event handler, a `map` callback — the narrowing holds **if**
  the variable is not reassigned afterwards

---

# A bag of optional fields

```tsx
type AttachmentProps = {
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
- `props.duration` is `number | undefined` — even when you know it is a video
- `<Attachment type="imgae" … />` compiles

> The type allows far more states than the domain does.

---

# Discriminated unions

```tsx
type Image = { kind: 'image'; url: string; altText: string };
type Video = { kind: 'video'; url: string; thumbnailUrl: string; duration: number; autoplay: boolean };
type Audio = { kind: 'audio'; url: string; duration: number };

type Attachment = Image | Video | Audio;

function AttachmentView({ attachment }: { attachment: Attachment }) {
  switch (attachment.kind) {
    case 'image':
      return <img src={attachment.url} alt={attachment.altText} />;   // Image
    case 'video':
      return <video src={attachment.url} poster={attachment.thumbnailUrl} />;
    case 'audio':
      return <audio src={attachment.url} controls />;
  }
}
```

- One **literal** field common to every member: the **discriminant**
- Checking it narrows to **one** member — and its fields are all there

---

# Make impossible states unwritable

```tsx
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

const [upload, setUpload] = useState<Upload>({ status: 'idle' });   // narrow it to render it
const done: Upload = { status: 'done', progress: 1 };
// ✘ Object literal may only specify known properties, and 'progress' does not exist
```

- The same move for API responses, `useReducer` actions, form steps, props…

---

# Exhaustiveness with `never`

```tsx
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

function AttachmentView({ attachment }: { attachment: Attachment }) {
  switch (attachment.kind) {
    case 'image': return <img … />;
    case 'video': return <video … />;
    case 'audio': return <audio … />;
    default:
      return assertNever(attachment);   // attachment: never — every case is handled
  }
}
```

Add `| Gif` to `Attachment`:

```
✘ Argument of type 'Gif' is not assignable to parameter of type 'never'.
```

> The compiler lists every `switch` to update — every view, every reducer. No test needed to find them.

---

# Type guards

```tsx
function isPlayable(attachment: Attachment): attachment is Video | Audio {
  return 'duration' in attachment;
}

<ul>{attachments.filter(isPlayable).map((a) => <li key={a.url}>{a.duration}s</li>)}</ul>
// a: Video | Audio

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

```tsx
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('Not a string');
}

const input: unknown = await response.json();
assert(typeof input === 'object' && input !== null, 'Not an object');
// input: object — for the rest of the block

const name: unknown = Reflect.get(input, 'name');
assertIsString(name);
name.toUpperCase();           // name: string
```

- A guard that **throws** instead of returning `false`
- Must be declared with an **explicit** type annotation (`function`, or a typed `const`)
- Parsing `unknown` by hand gets long fast: that is what **Zod** is for — chapter 11

---
src: ../../typescript-common/slides/04_unions_narrowing/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 4 - Unions & narrowing
